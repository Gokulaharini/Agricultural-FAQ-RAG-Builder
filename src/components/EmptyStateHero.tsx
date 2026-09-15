import React, { useRef, useState } from "react";
import {
  Upload,
  FileText,
  Cpu,
  RefreshCw,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { AgriculturalDoc } from "../types";
import { extractDocumentContent, downloadDocument } from "../utils/fileExtractor";
import { SAMPLE_AGRICULTURAL_DEMOS } from "../data/sampleDemos";

interface EmptyStateHeroProps {
  queuedDocs: AgriculturalDoc[];
  isProcessing: boolean;
  onUploadDocs: (newDocs: AgriculturalDoc[]) => void;
  onRemoveDoc: (docId: string) => void;
  onProcessDocs: () => void;
  onSelectDocToView?: (doc: AgriculturalDoc) => void;
}

export const EmptyStateHero: React.FC<EmptyStateHeroProps> = ({
  queuedDocs,
  isProcessing,
  onUploadDocs,
  onRemoveDoc,
  onProcessDocs,
  onSelectDocToView,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processUploadedFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);

    const uploadedList: AgriculturalDoc[] = [];

    try {
      const fileArray = Array.from(files);
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadStatus(
          `Extracting pages from ${file.name} (${i + 1}/${fileArray.length})...`
        );
        const doc = await extractDocumentContent(file, (msg) => setUploadStatus(msg));
        uploadedList.push(doc);
      }

      onUploadDocs(uploadedList);
      setUploadStatus("");
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(
        `Failed to process uploaded file: ${err.message || "Unknown extraction error"}`
      );
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const hasDocs = queuedDocs.length > 0;

  return (
    <div id="agri-docs-area-container" className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Hidden Native File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept=".pdf,.txt"
        className="hidden"
        id="agri-pdf-file-input"
      />

      {/* Uploading Status Banner */}
      {isUploading && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-center gap-3 text-emerald-900 animate-pulse">
          <RefreshCw className="w-5 h-5 text-emerald-700 animate-spin shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Reading and Extracting Document...</p>
            <p className="text-emerald-700">{uploadStatus || "Parsing 300+ pages and preparing knowledge index..."}</p>
          </div>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-900">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-xs">{errorMessage}</p>
        </div>
      )}

      {/* STATE 1: NO DOCUMENTS */}
      {!hasDocs ? (
        <section id="state-1-no-documents" className="space-y-6">
          <div className="text-center space-y-2 pt-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Upload your agricultural document
            </h2>
            <p className="text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
              Drop any agricultural manual, research paper, or textbook. We will read and extract its pages so you can ask questions like a chatbot.
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            id="state1-drag-drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 group shadow-xs ${
              isDragging
                ? "border-emerald-600 bg-emerald-50/50 scale-[1.01]"
                : "border-neutral-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/20"
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 group-hover:scale-105 transition-transform shadow-2xs">
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-lg">
              <p className="text-base font-bold text-neutral-900">
                Drag &amp; drop your agricultural PDF document here
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Crop manuals, field guides, soil test reports, fertilizer guides, or research PDFs.
              </p>
              <p className="text-xs text-emerald-800 font-semibold pt-2">
                Click to browse files or drop document to start chatting
              </p>
            </div>
          </div>

          {/* Sample Demos Section */}
          <div id="sample-demos-section" className="pt-2">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Or Try with Sample Demo Documents
                </h3>
              </div>
              <button
                type="button"
                id="load-all-demos-btn"
                onClick={() => onUploadDocs(SAMPLE_AGRICULTURAL_DEMOS)}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Load All 3 Demos</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {SAMPLE_AGRICULTURAL_DEMOS.map((demo) => (
                <div
                  key={demo.id}
                  id={`sample-card-${demo.id}`}
                  className="bg-white border border-neutral-200 hover:border-emerald-600 rounded-xl p-4 flex flex-col justify-between transition-all shadow-2xs hover:shadow-xs group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10.5px] font-semibold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-700" />
                        {demo.totalPages} Pages
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {demo.fileSize || "Sample PDF"}
                      </span>
                    </div>

                    <h4 className="font-semibold text-neutral-900 text-xs leading-snug group-hover:text-emerald-900 transition-colors">
                      {demo.title}
                    </h4>

                    <p className="text-[11px] text-neutral-500 font-mono truncate">
                      {demo.filename}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-100">
                    <button
                      type="button"
                      id={`load-demo-btn-${demo.id}`}
                      onClick={() => onUploadDocs([demo])}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs transition-colors cursor-pointer text-center shadow-2xs"
                    >
                      Load Demo &amp; Chat
                    </button>
                    {onSelectDocToView && (
                      <button
                        type="button"
                        onClick={() => onSelectDocToView(demo)}
                        className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition-colors cursor-pointer shrink-0"
                        title="Preview document content"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* STATE 2: DOCUMENTS UPLOADED (Pending Processing) */
        <section id="state-2-documents-uploaded" className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                  Documents Ready to Process
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {queuedDocs.length} agricultural {queuedDocs.length === 1 ? "document" : "documents"} uploaded ({queuedDocs.reduce((acc, d) => acc + (d.totalPages || 1), 0)} total pages). Click below to build your knowledge base.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Add More Files</span>
                </button>
              </div>
            </div>

            {/* Uploaded Files Clean List */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Uploaded Files ({queuedDocs.length})
              </span>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {queuedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-white transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 truncate flex-1 min-w-0 mr-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-semibold text-neutral-900 truncate">
                          {doc.filename}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          <strong className="text-neutral-700 font-semibold">{doc.totalPages} {doc.totalPages === 1 ? "page" : "pages"}</strong> • {doc.fileSize || "PDF"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Download original PDF */}
                      <button
                        onClick={() => downloadDocument(doc)}
                        className="px-2.5 py-1.5 rounded-md bg-white hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 text-emerald-800 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold shadow-2xs"
                        title="Download document file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      {/* View / Read document */}
                      {onSelectDocToView && (
                        <button
                          onClick={() => onSelectDocToView(doc)}
                          className="px-2.5 py-1.5 rounded-md bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold shadow-2xs"
                          title="Open reader and preview document"
                        >
                          <Eye className="w-3.5 h-3.5 text-neutral-600" />
                          <span>View &amp; Read</span>
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => onRemoveDoc(doc.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Action: Build Knowledge Base Button */}
            <div className="pt-2">
              <button
                id="build-knowledge-base-btn"
                onClick={onProcessDocs}
                disabled={isProcessing}
                className={`w-full py-3.5 px-6 rounded-lg font-semibold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer ${
                  isProcessing
                    ? "bg-emerald-700 text-white animate-pulse cursor-wait"
                    : "bg-emerald-800 hover:bg-emerald-900 text-white"
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing agricultural documents...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Build Knowledge Base</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
