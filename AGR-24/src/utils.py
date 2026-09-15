"""
Utility functions for text cleaning, snippet extraction, and document citation formatting.
"""

import re
from typing import Dict, Any


def clean_text(text: str) -> str:
    """
    Clean extracted PDF text by fixing hyphenated line breaks,
    normalizing excessive whitespace, and removing non-printable characters.
    """
    if not text:
        return ""
    # Fix hyphenated words broken across lines: e.g. "cultiva-\ntion" -> "cultivation"
    text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
    # Replace multiple newlines with standard paragraph break
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Replace horizontal whitespace with a single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Clean leading/trailing spaces per line
    lines = [line.strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line)


def get_relevant_snippet(text: str, query: str = "", max_chars: int = 250) -> str:
    """
    Extract a concise, readable snippet around query terms or from the start of the chunk.
    """
    clean = " ".join(text.split())
    if not clean:
        return "No text available."

    if query:
        query_words = [w.lower() for w in re.findall(r'\w+', query) if len(w) > 3]
        for word in query_words:
            idx = clean.lower().find(word)
            if idx != -1:
                start = max(0, idx - 60)
                end = min(len(clean), idx + max_chars - 60)
                snippet = clean[start:end].strip()
                prefix = "..." if start > 0 else ""
                suffix = "..." if end < len(clean) else ""
                return f"{prefix}{snippet}{suffix}"

    if len(clean) > max_chars:
        return clean[:max_chars].rsplit(" ", 1)[0] + "..."
    return clean


def format_source_reference(doc: Any) -> Dict[str, Any]:
    """
    Extract structured source reference information from a retrieved LangChain Document.
    Safely handles missing metadata.
    """
    metadata = getattr(doc, "metadata", {}) or {}
    source = metadata.get("source", "Unknown Document")
    page = metadata.get("page", "N/A")
    chunk_id = metadata.get("chunk_id", "chunk-0")
    content = getattr(doc, "page_content", "")

    return {
        "source": source,
        "page": page,
        "chunk_id": chunk_id,
        "snippet": get_relevant_snippet(content),
        "full_text": content
    }
