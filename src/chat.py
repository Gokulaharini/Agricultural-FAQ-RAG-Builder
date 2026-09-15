"""
Gemini LLM Integration and Conversational RAG Engine.
Connects FAISS retrieved context with Google Gemini using LangChain,
enforces strict agricultural grounding, safety guardrails, and citation tracking.
"""

import logging
from typing import List, Dict, Any, Optional

from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.docstore.document import Document

from src.config import (
    Config,
    GEMINI_API_KEY,
    MODEL_NAME,
    LLM_TEMPERATURE,
    MAX_TOKENS,
    TOP_K,
)
from src.embedding import EmbeddingManager
from src.utils import format_source_reference

logger = logging.getLogger(__name__)

# Agricultural RAG System Prompt strictly grounded on retrieved context
AGRICULTURAL_RAG_SYSTEM_PROMPT = """You are an agricultural document-based question answering assistant.

Answer only using the provided retrieved agricultural context.

Do not use unsupported outside knowledge.

Do not fabricate fertilizer recommendations, pesticide recommendations, chemical dosages, disease treatments, or agricultural practices.

If the retrieved context does not contain enough information to answer the question reliably, say:
"I couldn't find enough relevant information in the uploaded documents to answer this question reliably."

Always cite the source document name and page number when available."""


class AgriculturalChatAssistant:
    """Orchestrates single conversational RAG using FAISS embeddings and Google Gemini."""

    def __init__(
        self,
        embedding_manager: EmbeddingManager,
        model_name: str = None,
        temperature: float = None,
        max_tokens: int = None,
        api_key: Optional[str] = None
    ):
        self.embedding_manager = embedding_manager
        self.model_name = model_name or Config.MODEL_NAME
        self.temperature = temperature if temperature is not None else Config.LLM_TEMPERATURE
        self.max_tokens = max_tokens or Config.MAX_TOKENS
        self.api_key = api_key or Config.GOOGLE_API_KEY
        self._llm: Optional[ChatGoogleGenerativeAI] = None

    @property
    def llm(self) -> ChatGoogleGenerativeAI:
        """Initializes and returns the ChatGoogleGenerativeAI instance."""
        if not self.api_key or self.api_key in ("your_api_key_here", "your_gemini_api_key_here"):
            raise ValueError(
                "Gemini API Key is missing or not configured. "
                "Please set GEMINI_API_KEY in your .env file or enter it in the sidebar."
            )

        if self._llm is None:
            logger.info(f"Initializing Gemini model: {self.model_name}")
            try:
                self._llm = ChatGoogleGenerativeAI(
                    model=self.model_name,
                    google_api_key=self.api_key,
                    temperature=self.temperature,
                    max_output_tokens=self.max_tokens,
                )
            except Exception as e:
                logger.warning(f"Error initializing {self.model_name}: {e}. Falling back to gemini-1.5-flash...")
                self._llm = ChatGoogleGenerativeAI(
                    model="gemini-1.5-flash",
                    google_api_key=self.api_key,
                    temperature=self.temperature,
                    max_output_tokens=self.max_tokens,
                )
        return self._llm

    def _reformulate_query(self, user_question: str, history: List[Dict[str, str]]) -> str:
        """
        Reformulates conversational follow-up questions into standalone queries
        based on prior chat history.
        """
        if not history:
            return user_question

        recent_history = history[-6:]
        context_str = "\n".join(
            f"{msg['role'].capitalize()}: {msg['content']}" for msg in recent_history
        )

        reformulation_prompt = (
            f"Given the following agricultural discussion and a follow-up question, "
            f"rephrase the follow-up question to be an independent, standalone search query "
            f"for an agricultural knowledge base. Do NOT answer the question, just return the standalone rephrased query.\n\n"
            f"Chat History:\n{context_str}\n\n"
            f"Follow-up Question: {user_question}\n"
            f"Standalone Query:"
        )

        try:
            response = self.llm.invoke([HumanMessage(content=reformulation_prompt)])
            rephrased = response.content.strip()
            if rephrased:
                logger.info(f"Rephrased query: '{user_question}' -> '{rephrased}'")
                return rephrased
        except Exception as e:
            logger.warning(f"Query reformulation failed: {e}. Using original question.")

        return user_question

    def ask(
        self,
        question: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        top_k: int = None
    ) -> Dict[str, Any]:
        """
        Process user question through RAG pipeline:
        1. Contextual query reformulation
        2. FAISS vector similarity search
        3. Strict agricultural context prompt construction
        4. Gemini LLM generation
        5. Source citation extraction
        """
        if chat_history is None:
            chat_history = []

        k = top_k or Config.TOP_K

        # Step 1: Query Reformulation
        search_query = self._reformulate_query(question, chat_history)

        # Step 2: Vector Retrieval from FAISS
        try:
            retrieval_results = self.embedding_manager.retrieve_relevant_chunks(
                search_query, top_k=k
            )
        except ValueError as ve:
            raise ve
        except Exception as e:
            raise RuntimeError(f"Error retrieving from FAISS vector store: {str(e)}")

        if not retrieval_results:
            return {
                "answer": "I couldn't find enough relevant information in the uploaded documents to answer this question reliably.",
                "sources": [],
                "query_used": search_query,
                "retrieved_chunks_count": 0
            }

        # Step 3: Format Retrieved Chunks as Context
        context_blocks = []
        sources = []
        for idx, (doc, score) in enumerate(retrieval_results, 1):
            source_ref = format_source_reference(doc)
            source_ref["score"] = float(score)
            sources.append(source_ref)

            context_blocks.append(
                f"[Source {idx} | Document: {source_ref['source']} | Page: {source_ref['page']}]\n"
                f"{doc.page_content.strip()}"
            )

        formatted_context = "\n\n---\n\n".join(context_blocks)

        # Step 4: Construct Conversation Messages for Gemini
        messages = [
            SystemMessage(content=AGRICULTURAL_RAG_SYSTEM_PROMPT),
        ]

        for msg in chat_history[-4:]:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

        user_prompt_with_context = (
            f"Retrieved Document Context:\n"
            f"----------------------------------------\n"
            f"{formatted_context}\n"
            f"----------------------------------------\n\n"
            f"User Question: {question}\n\n"
            f"Please answer using only the retrieved context above. State clearly if the information is missing."
        )
        messages.append(HumanMessage(content=user_prompt_with_context))

        # Step 5: Invoke Gemini LLM
        try:
            ai_response = self.llm.invoke(messages)
            answer_text = ai_response.content.strip()
        except Exception as e:
            logger.error(f"Gemini API invocation failed: {str(e)}")
            raise RuntimeError(f"Gemini API call failed: {str(e)}")

        return {
            "answer": answer_text,
            "sources": sources,
            "query_used": search_query,
            "retrieved_chunks_count": len(retrieval_results)
        }
