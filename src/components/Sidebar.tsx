import React, { useRef, useState } from "react";
import {
  Upload,
  BookOpen,
  Trash2,
  RefreshCw,
  Cpu,
  FileText,
  Plus,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";
import { AgriculturalDoc, KnowledgeBaseStats } from "../types";
import { extractDocumentContent, downloadDocument } from "../utils/fileExtractor";
import { SAMPLE_AGRICULTURAL_DEMOS } from "../data/sampleDemos";

interface SidebarProps {
  docs: AgriculturalDoc[];
  stats: KnowledgeBaseStats;
  isProcessing: boolean;
  onUploadDocs: (newDocs: AgriculturalDoc[]) => void;
  onProcessDocs: () => void;
  onClearKB: () => void;
  onClearChat: () => void;
  onRemoveDoc: (docId: string) => void;
  onSelectDocToView?: (doc: AgriculturalDoc) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  docs,
  stats,
  isProcessing,
  onUploadDocs,
  onProcessDocs,
  onClearKB,
  onClearChat,
  onRemoveDoc,
  onSelectDocToView,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newDocs: AgriculturalDoc[] = [];

    try {
      const fileList = Array.from(files);
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadStatus(`Reading ${file.name}...`);
        const doc = await extractDocumentContent(file, (msg) => setUploadStatus(msg));
        newDocs.push(doc);
      }

      onUploadDocs(newDocs);
    } catch (err) {
      console.error("Sidebar file upload error:", err);
    } finally {
      setIsUploading(false);
      setUploadStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isReady = stats.isReady && stats.chunkCount > 0;

  return (
    <aside
      id="rag-sidebar"
      className="w-72 sm:w-80 h-full bg-white border-r border-neutral-200 flex flex-col shrink-0 select-none overflow-y-auto"
    >
      <div className="p-5 space-y-5 flex-1">
        {/* Knowledge Base Minimal Status */}
        <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                Knowledge Base
              </h2>
            </div>
            <span
              id="sidebar-kb-status-tag"
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                isReady
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isReady ? "bg-emerald-600" : "bg-neutral-400"
                }`}
              />
              Status: {isReady ? "Ready" : "Not Ready"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
              <span className="text-[11px] text-neutral-500 font-medium">
                Documents:
              </span>
              <p className="text-lg font-bold text-neutral-900 mt-0.5">
                {stats.docCount}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
              <span className="text-[11px] text-neutral-500 font-medium">
                Pages:
              </span>
              <p className="text-lg font-bold text-neutral-900 mt-0.5">
                {stats.pageCount}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Upload Document, Re-index, Clear KB, Clear Chat */}
        <div className="space-y-2">
          <button
            id="sidebar-upload-doc-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isProcessing}
            className="w-full py-2.5 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{uploadStatus || "Extracting pages..."}</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document (.pdf)</span>
              </>
            )}
          </button>

          {docs.length > 0 && (
            <button
              id="sidebar-reindex-kb-btn"
              onClick={onProcessDocs}
              disabled={isProcessing || isUploading}
              className="w-full py-2 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Re-indexing...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Re-index Documents</span>
                </>
              )}
            </button>
          )}

          <button
            id="sidebar-clear-chat-btn"
            onClick={onClearChat}
            className="w-full py-2 px-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Chat</span>
          </button>

          <button
            id="sidebar-clear-kb-btn"
            onClick={onClearKB}
            className="w-full py-2 px-3 rounded-lg border border-neutral-200 hover:border-red-300 hover:bg-red-50 text-neutral-600 hover:text-red-700 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Documents</span>
          </button>
        </div>

        {/* Uploaded Documents List */}
        <div className="pt-2 border-t border-neutral-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Documents ({docs.length})
            </span>
            <button
              id="sidebar-upload-trigger-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".pdf,.txt"
            className="hidden"
            id="sidebar-pdf-upload-input"
          />

          {isUploading && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700 shrink-0" />
              <span className="truncate">{uploadStatus || "Extracting pages..."}</span>
            </div>
          )}

          {docs.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-neutral-300 text-center space-y-1 bg-neutral-50/50">
              <p className="text-xs text-neutral-500">No documents uploaded yet.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-emerald-800 underline cursor-pointer"
              >
                Upload PDFs
              </button>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  id={`sidebar-doc-${doc.id}`}
                  className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-white transition-colors flex items-center justify-between text-xs group"
                >
                  <div
                    onClick={() => onSelectDocToView && onSelectDocToView(doc)}
                    className="flex items-center gap-2 truncate cursor-pointer flex-1 min-w-0 mr-1"
                    title="Click to view & read document"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-neutral-900 truncate">
                        {doc.filename}
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        <strong className="text-neutral-700">{doc.totalPages} {doc.totalPages === 1 ? "page" : "pages"}</strong> • {doc.fileSize || "PDF"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onSelectDocToView && onSelectDocToView(doc)}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      title="Read and view document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onRemoveDoc(doc.id)}
                      className="p-1 hover:bg-red-100 rounded text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sample Demos Quick Load Section in Sidebar */}
        <div className="pt-4 border-t border-neutral-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              <span>Sample Demos</span>
            </span>
            <button
              onClick={() => onUploadDocs(SAMPLE_AGRICULTURAL_DEMOS)}
              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold hover:underline cursor-pointer"
            >
              Load All
            </button>
          </div>

          <div className="space-y-1.5">
            {SAMPLE_AGRICULTURAL_DEMOS.map((demo) => {
              const isAlreadyLoaded = docs.some((d) => d.id === demo.id);
              return (
                <div
                  key={demo.id}
                  className="p-2 rounded-lg border border-neutral-200 bg-white hover:border-emerald-400 transition-all flex items-center justify-between gap-2 text-xs"
                >
                  <div className="truncate flex-1 min-w-0">
                    <p className="font-medium text-neutral-800 truncate text-[11.5px]">
                      {demo.title}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {demo.totalPages} pages • {demo.filename}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {onSelectDocToView && (
                      <button
                        type="button"
                        onClick={() => onSelectDocToView(demo)}
                        className="p-1 hover:bg-neutral-100 rounded text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                        title="Preview demo document"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAlreadyLoaded) {
                          onUploadDocs([demo]);
                        }
                      }}
                      disabled={isAlreadyLoaded}
                      className={`px-2 py-0.5 rounded text-[10.5px] font-semibold transition-colors cursor-pointer ${
                        isAlreadyLoaded
                          ? "bg-emerald-100 text-emerald-800 cursor-default"
                          : "bg-neutral-100 hover:bg-emerald-800 hover:text-white text-neutral-700"
                      }`}
                    >
                      {isAlreadyLoaded ? "Active" : "Load"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
