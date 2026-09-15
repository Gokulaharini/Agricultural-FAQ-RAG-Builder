import { AgriculturalDoc } from "../types";
import { downloadManualAsPDF } from "./pdfGenerator";

/**
 * Uploads a user PDF (including 300+ page documents) to the server extraction
 * endpoint, parses every page, and returns an AgriculturalDoc object.
 */
export async function extractDocumentContent(
  file: File,
  onProgress?: (msg: string) => void
): Promise<AgriculturalDoc> {
  if (onProgress) {
    onProgress(`Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);
  }

  const formData = new FormData();
  formData.append("file", file);

  const fileUrl = URL.createObjectURL(file);

  try {
    const response = await fetch("/api/extract-pdf", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
      filename: file.name,
      totalPages: data.totalPages || data.pages.length || 1,
      fileSize: data.fileSize || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      rawFile: file,
      fileUrl,
      pages: data.pages || [
        {
          pageNumber: 1,
          text: `Document content from ${file.name}`,
        },
      ],
    };
  } catch (err: any) {
    console.warn("Server PDF extraction failed, attempting client fallback:", err);
    // Client-side text fallback for non-binary or fallback mode
    const text = await readFileAsText(file);
    const clean = text.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, " ").trim();
    const pageSize = 2000;
    const estPages = Math.max(1, Math.ceil(clean.length / pageSize));
    const pages = [];
    for (let i = 0; i < estPages; i++) {
      pages.push({
        pageNumber: i + 1,
        text: clean.slice(i * pageSize, (i + 1) * pageSize) || `Content from page ${i + 1}`,
      });
    }

    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
      filename: file.name,
      totalPages: pages.length,
      fileSize: `${(file.size / 1024).toFixed(1)} KB`,
      rawFile: file,
      fileUrl,
      pages,
    };
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || "");
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

/**
 * Downloads the actual original uploaded PDF file or generated PDF.
 */
export function downloadDocument(doc: AgriculturalDoc) {
  if (doc.rawFile || doc.fileUrl) {
    const url = doc.fileUrl || URL.createObjectURL(doc.rawFile!);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    downloadManualAsPDF(doc);
  }
}
