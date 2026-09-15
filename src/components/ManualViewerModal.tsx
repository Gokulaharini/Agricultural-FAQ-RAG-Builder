import React, { useState } from "react";
import {
  X,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { AgriculturalDoc } from "../types";
import { downloadDocument } from "../utils/fileExtractor";
import { generateManualPDFBlobUrl } from "../utils/pdfGenerator";

interface ManualViewerModalProps {
  doc: AgriculturalDoc | null;
  initialPage?: number;
  onClose: () => void;
}

export const ManualViewerModal: React.FC<ManualViewerModalProps> = ({
  doc,
  initialPage = 1,
  onClose,
}) => {
  if (!doc) return null;

  const pdfUrl = React.useMemo(() => {
    if (doc.fileUrl) return doc.fileUrl;
    try {
      return generateManualPDFBlobUrl(doc);
    } catch (e) {
      return "";
    }
  }, [doc]);

  const [viewMode, setViewMode] = useState<"pdf" | "text">(pdfUrl ? "pdf" : "text");
  const [currentPage, setCurrentPage] = useState<number>(
    Math.min(Math.max(1, initialPage), doc.totalPages || 1)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [hasCopied, setHasCopied] = useState(false);

  const handleDownload = () => {
    downloadDocument(doc);
  };

  const activePageObj = doc.pages.find((p) => p.pageNumber === currentPage) || doc.pages[0];

  const handleCopyPageText = () => {
    if (activePageObj?.text) {
      navigator.clipboard.writeText(activePageObj.text);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  // Find pages matching search query
  const matchingPages = searchQuery.trim().length > 1
    ? doc.pages.filter((p) =>
        p.text.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  return (
    <div
      id="manual-viewer-modal-backdrop"
      className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="manual-viewer-modal-dialog"
        className="bg-white rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
          <div className="flex items-center gap-3 min-w-0 mr-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-neutral-900 truncate leading-tight">
                  {doc.title || doc.filename}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shrink-0">
                  PDF
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 truncate">
                {doc.filename} • <strong className="text-neutral-700">{doc.totalPages} {doc.totalPages === 1 ? "page" : "pages"}</strong> • {doc.fileSize || "Manual"}
              </p>
            </div>
          </div>

          {/* Controls: Mode Switcher & Download & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {pdfUrl && (
              <div className="flex items-center bg-neutral-200/80 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setViewMode("pdf")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "pdf"
                      ? "bg-white text-emerald-950 shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Visual PDF
                </button>
                <button
                  onClick={() => setViewMode("text")}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "text"
                      ? "bg-white text-emerald-950 shadow-2xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Page Reader
                </button>
              </div>
            )}

            <button
              id="modal-download-pdf-btn"
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download original uploaded PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              id="modal-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col bg-neutral-100">
          {viewMode === "pdf" && pdfUrl ? (
            /* Visual PDF View via native browser PDF Engine */
            <div className="w-full h-full flex flex-col">
              <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center justify-between shrink-0">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  Viewing document ({doc.totalPages} {doc.totalPages === 1 ? "page" : "pages"}). Use the built-in toolbar below to zoom, search, jump to pages, or print.
                </span>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>Open in new tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                title={doc.title}
                className="w-full flex-1 border-0 bg-white"
              />
            </div>
          ) : (
            /* Searchable Page-by-Page Reader with 300+ page navigation */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Navigation & Search Toolbar */}
              <div className="px-5 py-3 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                {/* Page Jump and Prev/Next */}
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="p-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="font-semibold text-neutral-700">Page</span>
                  <input
                    type="number"
                    min={1}
                    max={doc.totalPages || 1}
                    value={currentPage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setCurrentPage(Math.min(Math.max(1, val), doc.totalPages || 1));
                      }
                    }}
                    className="w-16 px-2 py-1 text-center font-mono font-bold text-xs border border-neutral-300 rounded-md focus:border-emerald-600 focus:outline-hidden"
                  />
                  <span className="text-neutral-500 font-medium">of {doc.totalPages || 1}</span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(doc.totalPages || 1, p + 1))}
                    disabled={currentPage >= (doc.totalPages || 1)}
                    className="p-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Keyword Search across all pages */}
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <div className="relative w-full">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search text in 300+ pages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Copy Page Action */}
                <button
                  onClick={handleCopyPageText}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  title="Copy page text"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Copy Page</span>
                    </>
                  )}
                </button>
              </div>

              {/* Matching Pages Quick Jump Bar */}
              {searchQuery.trim().length > 1 && (
                <div className="px-5 py-2 bg-emerald-50 border-b border-emerald-200 text-xs flex items-center gap-2 overflow-x-auto shrink-0">
                  <span className="font-semibold text-emerald-950 shrink-0">
                    Found in {matchingPages.length} {matchingPages.length === 1 ? "page" : "pages"}:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {matchingPages.slice(0, 15).map((p) => (
                      <button
                        key={p.pageNumber}
                        onClick={() => setCurrentPage(p.pageNumber)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                          currentPage === p.pageNumber
                            ? "bg-emerald-800 text-white"
                            : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                        }`}
                      >
                        P.{p.pageNumber}
                      </button>
                    ))}
                    {matchingPages.length > 15 && (
                      <span className="text-neutral-500 text-[11px]">
                        +{matchingPages.length - 15} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Page Content Display */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <div className="max-w-3xl mx-auto bg-white border border-neutral-200 rounded-xl p-8 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Page {activePageObj?.pageNumber || currentPage}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      {doc.filename}
                    </span>
                  </div>

                  <div className="text-neutral-800 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                    {activePageObj?.text ? (
                      activePageObj.text
                    ) : (
                      <span className="italic text-neutral-400">
                        No text found on this page. If this page contains scanned images or tables, switch to the "Visual PDF" tab to view it.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-2.5 border-t border-neutral-200 flex items-center justify-between bg-white text-xs text-neutral-500 shrink-0">
          <span>AgriKnowledge — Agricultural Knowledge Platform</span>
          <button
            onClick={handleDownload}
            className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
