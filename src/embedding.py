"""
Vector embedding generation and FAISS vector store management.
Uses sentence-transformers/all-MiniLM-L6-v2 for semantic embeddings
and FAISS for fast similarity retrieval over agricultural document chunks.
"""

import os
import logging
from typing import List, Optional, Tuple
from pathlib import Path

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document

from src.config import Config, EMBEDDING_MODEL, TOP_K, VECTORSTORE_DIR

logger = logging.getLogger(__name__)


class EmbeddingManager:
    """Manages HuggingFace embeddings model and FAISS vector index."""

    def __init__(self, model_name: str = None):
        self.model_name = model_name or Config.EMBEDDING_MODEL
        self._embeddings: Optional[HuggingFaceEmbeddings] = None
        self.vector_store: Optional[FAISS] = None

    @property
    def embeddings(self) -> HuggingFaceEmbeddings:
        """Lazy-loads and caches the HuggingFace sentence transformer embedding model."""
        if self._embeddings is None:
            logger.info(f"Loading Sentence Transformers model: {self.model_name}...")
            encode_kwargs = {'normalize_embeddings': True}
            model_kwargs = {'device': 'cpu'}
            self._embeddings = HuggingFaceEmbeddings(
                model_name=self.model_name,
                model_kwargs=model_kwargs,
                encode_kwargs=encode_kwargs
            )
            logger.info("Sentence Transformers model loaded successfully.")
        return self._embeddings

    def create_vector_store(self, documents: List[Document]) -> FAISS:
        """Create a new FAISS vector store from a list of Document chunks."""
        if not documents:
            raise ValueError("Cannot create vector store from an empty list of documents.")

        logger.info(f"Building FAISS vector index for {len(documents)} document chunks...")
        self.vector_store = FAISS.from_documents(documents, self.embeddings)
        return self.vector_store

    def add_documents(self, documents: List[Document]) -> None:
        """Add new documents into the current FAISS vector store or initialize it if None."""
        if not documents:
            return

        if self.vector_store is None:
            self.create_vector_store(documents)
        else:
            logger.info(f"Adding {len(documents)} new document chunks to existing FAISS index...")
            self.vector_store.add_documents(documents)

    def retrieve_relevant_chunks(
        self, query: str, top_k: int = None
    ) -> List[Tuple[Document, float]]:
        """
        Retrieve top-K most similar document chunks with similarity scores.
        """
        k = top_k or Config.TOP_K
        if self.vector_store is None:
            raise ValueError(
                "Knowledge Base is empty. Please upload and process agricultural PDF documents first."
            )

        return self.vector_store.similarity_search_with_score(query, k=k)

    def similarity_search(self, query: str, k: int = None) -> List[Document]:
        """
        Perform similarity search returning top-K relevant Document objects.
        """
        top_k = k or Config.TOP_K
        if self.vector_store is None:
            raise ValueError(
                "Knowledge Base is empty. Please upload and process agricultural PDF documents first."
            )
        return self.vector_store.similarity_search(query, k=top_k)

    def get_retriever(self, top_k: int = None):
        """Expose a standard LangChain retriever interface for chains."""
        k = top_k or Config.TOP_K
        if self.vector_store is None:
            raise ValueError("Knowledge Base is empty. Cannot generate retriever.")
        return self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )

    def save_local(self, folder_path: Optional[Path] = None) -> None:
        """Save FAISS index and docstore to disk."""
        if self.vector_store is None:
            return
        target_dir = str(folder_path or Config.VECTORSTORE_DIR)
        self.vector_store.save_local(target_dir)
        logger.info(f"FAISS vector store saved to {target_dir}")

    def load_local(self, folder_path: Optional[Path] = None) -> bool:
        """Load an existing FAISS vector store from disk."""
        target_dir = str(folder_path or Config.VECTORSTORE_DIR)
        index_file = os.path.join(target_dir, "index.faiss")
        if not os.path.exists(index_file):
            return False

        try:
            self.vector_store = FAISS.load_local(
                target_dir,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
            logger.info(f"FAISS vector store loaded from {target_dir}")
            return True
        except Exception as e:
            logger.warning(f"Could not load local FAISS index: {str(e)}")
            return False

    def clear(self) -> None:
        """Reset and clear the current in-memory vector store."""
        self.vector_store = None
        logger.info("Knowledge Base vector store cleared.")

    def reset(self) -> None:
        """Alias for clear(). Resets the vector store."""
        self.clear()

    @property
    def total_chunks(self) -> int:
        """Return the number of vectors stored in the FAISS index."""
        if self.vector_store is None or self.vector_store.index is None:
            return 0
        return self.vector_store.index.ntotal
