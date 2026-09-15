"""
🌾 Agricultural Knowledge Assistant
AGR-24 — Agricultural FAQ RAG Builder
Upload agricultural documents → Ask questions/doubts → Get answers from the uploaded documents with sources.
"""

import os
import time
import streamlit as st
from typing import List

# Setup Streamlit page configuration
st.set_page_config(
    page_title="🌾 Agricultural Knowledge Assistant",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

from src.config import (
    Config,
    GEMINI_API_KEY,
    MODEL_NAME,
    EMBEDDING_MODEL,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    TOP_K,
    is_api_key_set,
)
from src.processor import PDFProcessor
from src.embedding import EmbeddingManager
from src.chat import AgriculturalChatAssistant

# Custom CSS for polished typography, cards, and styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1b4332;
        margin-bottom: 0.15rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #2d6a4f;
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    .desc-header {
        font-size: 0.95rem;
        color: #495057;
        margin-bottom: 1.5rem;
        line-height: 1.5;
    }
    .metric-badge {
        display: inline-block;
        padding: 0.4rem 0.85rem;
        border-radius: 9999px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-right: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .metric-badge-ready {
        background-color: #e8f5e9;
        color: #1b4332;
        border: 1px solid #b7e4c7;
    }
    .metric-badge-not-ready {
        background-color: #f8f9fa;
        color: #6c757d;
        border: 1px solid #dee2e6;
    }
    .source-card {
        background-color: #f8f9fa;
        border-left: 4px solid #2d6a4f;
        padding: 0.75rem 1rem;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        border-radius: 4px;
        font-size: 0.88rem;
    }
    .source-title {
        font-weight: 600;
        color: #1b4332;
    }
    .source-snippet {
        color: #495057;
        font-style: italic;
        margin-top: 0.25rem;
    }
    .file-card {
        background-color: #ffffff;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
</style>
""", unsafe_allow_html=True)


# Cache the embedding manager so the transformer weights load only once
@st.cache_resource(show_spinner="Loading semantic embedding model...")
def get_embedding_manager() -> EmbeddingManager:
    """Initializes and caches the HuggingFace Sentence Transformers embedding engine."""
    return EmbeddingManager(model_name=Config.EMBEDDING_MODEL)


# Initialize Session State variables
if "rag_chat_history" not in st.session_state:
    st.session_state.rag_chat_history = []

if "uploaded_file_names" not in st.session_state:
    st.session_state.uploaded_file_names = []

if "processed_docs_count" not in st.session_state:
    st.session_state.processed_docs_count = 0

if "processed_pages_count" not in st.session_state:
    st.session_state.processed_pages_count = 0

if "total_chunks_count" not in st.session_state:
    st.session_state.total_chunks_count = 0

if "kb_ready" not in st.session_state:
    st.session_state.kb_ready = False

if "selected_example" not in st.session_state:
    st.session_state.selected_example = None

embedding_mgr = get_embedding_manager()


# -------------------------------------------------------------
# MINIMAL SIDEBAR
# -------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🌾 Knowledge Base")

    # Status: Ready / Not Ready
    if st.session_state.kb_ready and st.session_state.total_chunks_count > 0:
        st.markdown(
            '<div class="metric-badge metric-badge-ready">● Status: Ready</div>',
            unsafe_allow_html=True
        )
    else:
        st.markdown(
            '<div class="metric-badge metric-badge-not-ready">○ Status: Not Ready</div>',
            unsafe_allow_html=True
        )

    st.write(f"**Documents:** {st.session_state.processed_docs_count}")
    st.write(f"**Chunks:** {st.session_state.total_chunks_count}")

    st.divider()

    # Buttons: Build Knowledge Base, Clear Knowledge Base, Clear Chat
    if st.button("🚀 Build Knowledge Base", use_container_width=True, type="primary"):
        st.session_state.trigger_build = True

    if st.button("🗑️ Clear Knowledge Base", use_container_width=True):
        embedding_mgr.clear()
        st.session_state.processed_docs_count = 0
        st.session_state.processed_pages_count = 0
        st.session_state.total_chunks_count = 0
        st.session_state.uploaded_file_names = []
        st.session_state.kb_ready = False
        st.session_state.rag_chat_history = []
        st.rerun()

    if st.button("🧹 Clear Chat", use_container_width=True):
        st.session_state.rag_chat_history = []
        st.rerun()

    st.divider()

    # API Key check
    api_key_to_use = Config.GOOGLE_API_KEY
    if not is_api_key_set():
        api_key_input = st.text_input(
            "Gemini API Key",
            type="password",
            placeholder="Enter GEMINI_API_KEY",
            help="Set in .env or provide here"
        )
        if api_key_input:
            api_key_to_use = api_key_input.strip()


# -------------------------------------------------------------
# MAIN HEADER
# -------------------------------------------------------------
st.markdown('<div class="main-header">🌾 Agricultural Knowledge Assistant</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">AGR-24 — Smart Farming &amp; Extension Knowledge Base</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="desc-header">'
    'Upload crop manuals, farming guides, or research notes to get instant, reliable answers backed by page citations.'
    '</div>',
    unsafe_allow_html=True
)


# -------------------------------------------------------------
# UI STATES
# State 1 — No Documents
# State 2 — Documents Uploaded
# State 3 — Knowledge Base Ready
# -------------------------------------------------------------

# File uploader widget
uploaded_files = st.file_uploader(
    "Upload Agricultural Documents",
    type=["pdf"],
    accept_multiple_files=True,
    help="Add agricultural FAQs, manuals, and extension notes to build your knowledge base."
)

# Sync uploaded filenames into session state
if uploaded_files:
    current_names = [f.name for f in uploaded_files]
    if current_names != st.session_state.uploaded_file_names:
        st.session_state.uploaded_file_names = current_names
        # When new files uploaded, reset kb_ready until user clicks Build Knowledge Base
        st.session_state.kb_ready = False

has_uploaded_docs = bool(uploaded_files and len(uploaded_files) > 0)
is_ready = st.session_state.kb_ready and st.session_state.total_chunks_count > 0


# STATE 1 — NO DOCUMENTS
if not has_uploaded_docs and not is_ready:
    st.markdown("---")
    st.markdown("### 📄 Build your agricultural knowledge base")
    st.info("Upload agricultural documents to start asking questions.")
    st.caption("Upload agricultural PDFs (e.g., Rice cultivation guide, Wheat guide, fertilizer charts) using the file uploader above.")


# STATE 2 — DOCUMENTS UPLOADED (Pending Processing)
elif has_uploaded_docs and not is_ready:
    st.markdown("---")
    st.markdown("### 📋 Documents Ready to Process")
    st.write(f"The following **{len(uploaded_files)} document(s)** are ready to be indexed:")

    for f in uploaded_files:
        st.markdown(f"📄 **{f.name}** ({f.size // 1024} KB)")

    col1, _ = st.columns([1, 2])
    with col1:
        build_btn = st.button("🚀 Build Knowledge Base", type="primary", use_container_width=True, key="main_build_btn")

    if build_btn or st.session_state.get("trigger_build", False):
        st.session_state.trigger_build = False
        with st.spinner("Processing agricultural documents..."):
            processor = PDFProcessor(chunk_size=Config.CHUNK_SIZE, chunk_overlap=Config.CHUNK_OVERLAP)
            all_chunks = []
            total_pages = 0
            success_count = 0
            error_log = []

            prog_bar = st.progress(0)
            for idx, uf in enumerate(uploaded_files):
                try:
                    chunks = processor.process_pdf(uf, filename=uf.name)
                    all_chunks.extend(chunks)
                    success_count += 1
                    pages_in_doc = max([c.metadata.get("page", 1) for c in chunks], default=1)
                    total_pages += pages_in_doc
                except Exception as e:
                    error_log.append(f"**{uf.name}**: {str(e)}")
                prog_bar.progress((idx + 1) / len(uploaded_files))

            if all_chunks:
                try:
                    embedding_mgr.create_vector_store(all_chunks)
                    st.session_state.processed_docs_count = success_count
                    st.session_state.processed_pages_count = max(total_pages, success_count)
                    st.session_state.total_chunks_count = len(all_chunks)
                    st.session_state.kb_ready = True
                    st.success(f"✓ Knowledge Base Ready! Indexed {len(all_chunks)} chunks across {success_count} documents.")
                    time.sleep(0.5)
                    st.rerun()
                except Exception as e:
                    st.error(f"Failed to build FAISS index: {str(e)}")
            else:
                st.error("Could not extract readable text from the uploaded PDFs.")


# STATE 3 — KNOWLEDGE BASE READY (Chatbot Displayed)
elif is_ready:
    st.markdown("---")
    st.markdown(
        f"""
        <div style="display: flex; align-items: center; justify-content: space-between; background: #e8f5e9; border: 1px solid #b7e4c7; padding: 0.85rem 1.25rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <div style="font-weight: 700; color: #1b4332; font-size: 1.05rem;">
                🟢 Knowledge Base Ready
            </div>
            <div style="font-size: 0.9rem; color: #2d6a4f; font-weight: 600;">
                Documents: {st.session_state.processed_docs_count} &nbsp;•&nbsp; 
                Pages: {st.session_state.processed_pages_count} &nbsp;•&nbsp; 
                Chunks: {st.session_state.total_chunks_count}
            </div>
        </div>
        """,
        unsafe_allow_html=True
    )

    st.markdown("## 💬 Ask about your agricultural documents")
    st.caption("Answers are strictly grounded in your uploaded documents. If information is not present, it will decline to answer.")

    # Suggested Example Questions
    st.markdown("##### 💡 Example Questions")
    example_questions = [
        "What are the recommended practices for rice cultivation?",
        "What fertilizer is recommended for rice?",
        "How can stem borer in paddy be managed?",
        "What are the symptoms of nitrogen deficiency?",
        "What irrigation practices are recommended for wheat?"
    ]

    cols = st.columns(len(example_questions))
    for i, ex_q in enumerate(example_questions):
        if cols[i].button(f"🌱 {ex_q[:35]}...", key=f"ex_{i}", help=ex_q, use_container_width=True):
            st.session_state.selected_example = ex_q

    # Display Conversation History
    for message in st.session_state.rag_chat_history:
        with st.chat_message(message["role"], avatar="👨‍🌾" if message["role"] == "user" else "🌾"):
            st.markdown(message["content"])

            if message.get("sources"):
                with st.expander("📚 View Retrieved Sources", expanded=False):
                    for s_idx, src in enumerate(message["sources"], 1):
                        st.markdown(
                            f"""
                            <div class="source-card">
                                <div class="source-title">📄 Source {s_idx}: {src.get('source', 'Unknown')} (Page {src.get('page', 'N/A')})</div>
                                <div class="source-snippet">"{src.get('snippet', '')}"</div>
                            </div>
                            """,
                            unsafe_allow_html=True
                        )

    # Chat Input
    chat_prompt = st.chat_input("Ask a question about your uploaded agricultural documents...")
    if st.session_state.selected_example:
        chat_prompt = st.session_state.selected_example
        st.session_state.selected_example = None

    if chat_prompt:
        if not api_key_to_use or api_key_to_use in ("your_api_key_here", "your_gemini_api_key_here"):
            st.error("⚠️ Gemini API Key is missing. Please configure GEMINI_API_KEY in .env or the sidebar.")
        else:
            # 1. User message
            st.session_state.rag_chat_history.append({"role": "user", "content": chat_prompt})
            with st.chat_message("user", avatar="👨‍🌾"):
                st.markdown(chat_prompt)

            # 2. Assistant RAG message
            with st.chat_message("assistant", avatar="🌾"):
                with st.spinner("Searching uploaded documents and formulating response..."):
                    try:
                        assistant = AgriculturalChatAssistant(
                            embedding_manager=embedding_mgr,
                            model_name=Config.MODEL_NAME,
                            api_key=api_key_to_use
                        )

                        rag_result = assistant.ask(
                            question=chat_prompt,
                            chat_history=st.session_state.rag_chat_history[:-1],
                            top_k=Config.TOP_K
                        )

                        answer = rag_result["answer"]
                        sources = rag_result["sources"]

                        st.markdown(answer)

                        if sources:
                            with st.expander("📚 View Retrieved Sources", expanded=True):
                                for s_idx, src in enumerate(sources, 1):
                                    st.markdown(
                                        f"""
                                        <div class="source-card">
                                            <div class="source-title">📄 Source {s_idx}: {src.get('source', 'Unknown')} (Page {src.get('page', 'N/A')})</div>
                                            <div class="source-snippet">"{src.get('snippet', '')}"</div>
                                        </div>
                                        """,
                                        unsafe_allow_html=True
                                    )

                        st.session_state.rag_chat_history.append({
                            "role": "assistant",
                            "content": answer,
                            "sources": sources
                        })

                    except Exception as err:
                        err_text = f"⚠️ An error occurred: {str(err)}"
                        st.error(err_text)
                        st.session_state.rag_chat_history.append({
                            "role": "assistant",
                            "content": err_text,
                            "sources": []
                        })
