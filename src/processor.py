"""
PDF Processing and OCR Fallback Engine for Agricultural Documents.
Extracts digital text using PyMuPDF (fitz) with pytesseract OCR fallback
for scanned pages, chunks text, and preserves page-level metadata.
"""

import io
import logging
from typing import List, Union, BinaryIO
import fitz  # PyMuPDF
from PIL import Image
import pytesseract
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document

from src.config import Config, CHUNK_SIZE, CHUNK_OVERLAP
from src.utils import clean_text

logger = logging.getLogger(__name__)


class PDFProcessor:
    """Handles text extraction, OCR fallback, and chunking for agricultural PDFs."""

    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or Config.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or Config.CHUNK_OVERLAP
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

    def extract_text_from_page(self, page: fitz.Page, page_num: int, filename: str) -> str:
        """
        Extract text from a single PDF page.
        If extracted text is under threshold, falls back to pytesseract OCR.
        """
        # 1. Primary extraction: standard digital text
        text = page.get_text("text").strip()

        # If text is sufficient (at least 50 characters of meaningful content), return it
        if len(text) >= 50:
            return text

        # 2. OCR Fallback for scanned / image-based PDF pages
        logger.info(f"Page {page_num} in '{filename}' has insufficient text ({len(text)} chars). Triggering OCR fallback...")
        try:
            # Render page at 2x resolution (144 DPI) for accurate OCR
            matrix = fitz.Matrix(2.0, 2.0)
            pix = page.get_pixmap(matrix=matrix)
            img_bytes = pix.tobytes("png")
            image = Image.open(io.BytesIO(img_bytes))

            # Run Tesseract OCR
            ocr_text = pytesseract.image_to_string(image)
            ocr_cleaned = ocr_text.strip()

            if ocr_cleaned:
                logger.info(f"OCR successfully extracted {len(ocr_cleaned)} characters from page {page_num}.")
                return ocr_cleaned
        except pytesseract.TesseractNotFoundError:
            logger.warning(
                "Tesseract OCR executable not found on system path. "
                "Install Tesseract OCR (e.g. `apt-get install tesseract-ocr` or Windows installer) "
                "to enable scanned PDF image parsing."
            )
        except Exception as e:
            logger.error(f"OCR error on page {page_num} in '{filename}': {str(e)}")

        return text  # Return whatever was extracted (even if minimal)

    def process_pdf(self, file_source: Union[str, bytes, BinaryIO], filename: str = "document.pdf") -> List[Document]:
        """
        Process a PDF document into a list of chunked LangChain Documents.

        Args:
            file_source: Path to file, bytes, or file-like object (e.g. Streamlit UploadedFile)
            filename: Name of the original file for metadata tracking

        Returns:
            List of chunked Document objects with metadata: source, page, chunk_id
        """
        doc = None
        try:
            if isinstance(file_source, str):
                doc = fitz.open(file_source)
            elif isinstance(file_source, bytes):
                doc = fitz.open(stream=file_source, filetype="pdf")
            else:
                # File-like object (e.g., Streamlit UploadedFile)
                content = file_source.read()
                if hasattr(file_source, "seek"):
                    file_source.seek(0)
                doc = fitz.open(stream=content, filetype="pdf")
        except Exception as e:
            raise ValueError(f"Failed to open PDF document '{filename}': {str(e)}")

        if not doc or len(doc) == 0:
            raise ValueError(f"The PDF file '{filename}' is empty or contains zero pages.")

        page_documents: List[Document] = []

        for page_idx in range(len(doc)):
            page_num = page_idx + 1  # 1-indexed page number for display
            page = doc[page_idx]

            raw_text = self.extract_text_from_page(page, page_num, filename)
            cleaned = clean_text(raw_text)

            if not cleaned:
                continue

            page_doc = Document(
                page_content=cleaned,
                metadata={
                    "source": filename,
                    "page": page_num,
                    "total_pages": len(doc)
                }
            )
            page_documents.append(page_doc)

        doc.close()

        if not page_documents:
            raise ValueError(
                f"No extractable text or OCR content found in '{filename}'. "
                "Ensure the document is a valid readable or scanned PDF."
            )

        # Split page documents into smaller semantic chunks
        chunked_docs: List[Document] = []
        for doc_item in page_documents:
            chunks = self.text_splitter.split_text(doc_item.page_content)
            for chunk_idx, chunk in enumerate(chunks):
                chunked_docs.append(
                    Document(
                        page_content=chunk,
                        metadata={
                            "source": doc_item.metadata["source"],
                            "page": doc_item.metadata["page"],
                            "total_pages": doc_item.metadata["total_pages"],
                            "chunk_id": f"{doc_item.metadata['source']}_p{doc_item.metadata['page']}_c{chunk_idx+1}"
                        }
                    )
                )

        return chunked_docs
