"""
Configuration module for AGR-24 Agricultural FAQ Assistant.
Loads environment variables and provides configuration parameters for the RAG pipeline.
"""

import os
from pathlib import Path

# Base directory paths
BASE_DIR = Path(__file__).resolve().parent.parent

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=BASE_DIR / ".env")
except ImportError:
    pass


class Config:
    """Central configuration class for AGR-24 Agricultural FAQ RAG Builder."""
    GOOGLE_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
    CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200"))
    MODEL_NAME = os.getenv("MODEL_NAME", "gemini-1.5-flash")
    EMBEDDING_MODEL = os.getenv(
        "EMBEDDING_MODEL",
        "sentence-transformers/all-MiniLM-L6-v2"
    )
    TOP_K = int(os.getenv("TOP_K", "4"))
    LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.7"))
    MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2048"))

    DATA_DIR = BASE_DIR / "data"
    VECTORSTORE_DIR = BASE_DIR / "vectorstore"


# Module-level aliases for backwards and direct compatibility
GOOGLE_API_KEY = Config.GOOGLE_API_KEY
GEMINI_API_KEY = Config.GOOGLE_API_KEY
CHUNK_SIZE = Config.CHUNK_SIZE
CHUNK_OVERLAP = Config.CHUNK_OVERLAP
MODEL_NAME = Config.MODEL_NAME
EMBEDDING_MODEL = Config.EMBEDDING_MODEL
TOP_K = Config.TOP_K
LLM_TEMPERATURE = Config.LLM_TEMPERATURE
MAX_TOKENS = Config.MAX_TOKENS
DATA_DIR = Config.DATA_DIR
VECTORSTORE_DIR = Config.VECTORSTORE_DIR

# Ensure directories exist
Config.DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)


def is_api_key_set() -> bool:
    """Check if a valid, non-placeholder Gemini API key is configured."""
    key = Config.GOOGLE_API_KEY
    return bool(key and key.strip() and key not in ("your_api_key_here", "your_gemini_api_key_here"))
