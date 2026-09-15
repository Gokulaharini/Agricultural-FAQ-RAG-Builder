# 🌾 Agricultural FAQ Assistant
### AGR-24 — Agricultural FAQ RAG Builder

An end-to-end, production-grade **Retrieval-Augmented Generation (RAG)** system tailored for agricultural extension services, farmers, agronomists, and agricultural students. The system ingests agricultural PDF documents (crop manuals, pest management protocols, fertilizer guides), extracts digital text with **Tesseract OCR fallback** for scanned pages, builds high-density vector representations using **Sentence Transformers**, indexes them into **FAISS**, and generates strictly grounded, safe answers using **Google Gemini** with precise document and page-level source citations.

---

## 👥 Team Information

- **Project ID**: AGR-24
- **Project Name**: Agricultural FAQ Assistant (RAG Builder)
- **Domain**: AI for Agriculture & Smart Farming
- **Target Audience**: Extension Officers, Agronomists, Farming Communities, and Agricultural Researchers

---

## 🎯 Problem Statement

Agricultural manuals, research bulletins, and extension guides often span hundreds of dense, technical PDF pages. Many existing documents from government agencies or university extension services are scanned physical printouts or lack searchable text layers. Farmers and extension workers struggle to quickly locate specific pest control recommendations, fertilizer dosage timings, or irrigation intervals. Furthermore, standard generic LLMs frequently hallucinate critical agricultural data (such as pesticide application rates or chemical dosages), posing significant risks to crop yield and environmental safety.

---

## 💡 Proposed Solution

The **AGR-24 Agricultural FAQ Assistant** resolves these challenges by combining:
1. **PyMuPDF + Tesseract OCR Engine**: Reliable extraction of both native digital text and image-scanned legacy extension circulars.
2. **Deterministic Chunking & Metadata Binding**: Every text chunk retains its original filename and exact page number.
3. **Local Dense Vector Search (FAISS)**: Fast semantic retrieval via `sentence-transformers/all-MiniLM-L6-v2`.
4. **Strictly Grounded Gemini Generation**: A specialized agricultural system prompt that forbids hallucinated chemical or dosage recommendations and explicitly states when information is missing.
5. **Conversational Memory**: Query reformulation enables natural multi-turn follow-ups (e.g., "When should it be applied?").

---

## ✨ Features

- **Multi-PDF Document Ingestion**: Upload multiple manuals simultaneously (Rice, Wheat, Cotton, Soil, Pest guides).
- **Hybrid Text Extraction & OCR Fallback**: Automatically senses pages with insufficient digital text and triggers 144+ DPI rendering with Tesseract OCR.
- **Accurate Source Attribution**: Every answer highlights the source document filename, page number, and a direct textual excerpt snippet.
- **Agricultural Safety Guardrails**: Zero tolerance for fabricated chemical dosages, pesticide mixtures, or safety-critical data.
- **Conversational Memory**: Context-aware query re-writing maintains conversational coherence across follow-up queries.
- **Live Knowledge Base Status**: Real-time tracking of processed documents, chunk counts, and vector store status.
- **One-Click Example Questions**: Fast access to representative agricultural questions.

---

## 📐 Architecture & RAG Pipeline

```text
              ┌─────────────────┐
              │   PDF Upload    │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ PDF Text        │
              │ Extraction      │  (PyMuPDF - fitz)
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ OCR Fallback    │
              │ for Scanned PDF │  (pytesseract + PIL)
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Text Cleaning   │  (Hyphen fix, whitespace normalize)
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Text Chunking   │  (RecursiveCharacterTextSplitter)
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ Embeddings      │  (sentence-transformers/
              │ Sentence        │   all-MiniLM-L6-v2)
              │ Transformers    │
              └────────┬────────┘
                       ↓
              ┌─────────────────┐
              │ FAISS Vector DB │  (In-Memory / Local Index)
              └────────┬────────┘
                       ↓
User Question ───► Query Reformulation (Chat Memory)
                       ↓
              Semantic Retrieval (Top-K = 4)
                       ↓
              Relevant Text Chunks + Page Metadata
                       ↓
              Gemini LLM (Grounded System Prompt)
                       ↓
              Grounded Answer + Source References
```

---

## 🛠️ Technologies

| Component | Library / Framework | Version / Details |
| :--- | :--- | :--- |
| **Runtime** | Python | 3.10 / 3.11+ |
| **Web Interface** | Streamlit | `>=1.35.0` |
| **Orchestration** | LangChain & LangChain Core | `>=0.2.6` |
| **LLM Provider** | Google Gemini (`ChatGoogleGenerativeAI`) | `gemini-1.5-flash` / `gemini-2.5-flash` |
| **Embeddings** | Sentence Transformers | `all-MiniLM-L6-v2` (384-dim dense vectors) |
| **Vector Index** | FAISS CPU (`faiss-cpu`) | `>=1.8.0` |
| **PDF Extraction** | PyMuPDF (`fitz`) | `>=1.24.5` |
| **OCR Fallback** | `pytesseract` & `Pillow` | Tesseract OCR engine |
| **Environment** | `python-dotenv` | Clean secret separation |

---

## 📁 Project Structure

```text
AGR-24/
│
├── src/
│   ├── __init__.py            # Python package initialization
│   ├── config.py              # Configuration values & environment validation
│   ├── processor.py           # PyMuPDF extraction, OCR fallback & chunking
│   ├── embedding.py           # Sentence Transformers & FAISS vector management
│   ├── chat.py                # Gemini LLM grounding, memory & RAG prompt logic
│   └── utils.py               # Text cleaning, snippet extraction & formatting
│
├── app.py                     # Streamlit frontend & application orchestration
├── requirements.txt           # Python dependencies
├── .env.example               # Template for environment variables
├── .gitignore                 # Excluded files, virtual environments, indices
├── Dockerfile                 # Containerized deployment with Tesseract OCR
├── README.md                  # Complete documentation
└── data/
    └── .gitkeep               # Directory for staging input PDF documents
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.10 or 3.11 installed
- Tesseract OCR installed on your OS:
  - **Ubuntu/Debian**: `sudo apt-get install -y tesseract-ocr tesseract-ocr-eng`
  - **macOS**: `brew install tesseract`
  - **Windows**: Download installer from [UB-Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki) and add to PATH.

### 1. Clone or Extract the Project
```bash
cd AGR-24
```

### 2. Create and Activate Virtual Environment
- **On Linux / macOS**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
- **On Windows (PowerShell)**:
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` in any text editor and supply your Gemini API key:
```ini
GEMINI_API_KEY=your_actual_api_key_here
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
MODEL_NAME=gemini-1.5-flash
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
TOP_K=4
LLM_TEMPERATURE=0.7
MAX_TOKENS=2048
```

---

## 🚀 How to Run

Launch the Streamlit application:
```bash
python -m streamlit run app.py
```
Open your browser at `http://localhost:8501`.

### Docker Deployment
```bash
docker build -t agr24-faq-assistant .
docker run -p 8501:8501 --env-file .env agr24-faq-assistant
```

---

## ❓ Example Questions

- *"What fertilizer is recommended for rice?"*
- *"How can stem borer in paddy be managed?"*
- *"What are the symptoms of nitrogen deficiency?"*
- *"What irrigation practices are recommended for wheat?"*
- *"How can I manage tomato leaf disease?"*
- *"What are the common pests affecting cotton?"*

---

## ⚠️ Limitations

- **OCR Speed**: High-resolution image OCR on scanned pages takes 1–3 seconds per page depending on CPU hardware.
- **Table Structure**: Complex multi-row merged tables in PDFs may lose column alignment when converted to plain text chunks.
- **Language**: Default Sentence Transformers and prompt are optimized for English agricultural literature.

---

## 🔮 Future Enhancements

- Multilingual support for vernacular languages (Hindi, Tamil, Telugu, Spanish) to assist non-English speaking farmers.
- Multi-modal chart and disease image diagnosis using Gemini Vision.
- Integration with local weather APIs for real-time localized advisory synchronization.
