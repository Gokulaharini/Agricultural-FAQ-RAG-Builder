import React from "react";
import { FileText, BookOpen, Download, Eye } from "lucide-react";
import { SourceReference, AgriculturalDoc } from "../types";
import { downloadDocument } from "../utils/fileExtractor";

interface SourceCardProps {
  sources: SourceReference[];
  docs?: AgriculturalDoc[];
  onSelectDocToView?: (doc: AgriculturalDoc, targetPage?: number) => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({
  sources,
  docs = [],
  onSelectDocToView,
}) => {
  if (!sources || sources.length === 0) return null;

  // Deduplicate sources by document source name and page number
  const uniqueSources: SourceReference[] = [];
  const seen = new Set<string>();

  for (const src of sources) {
    const key = `${src.source}-p${src.page}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSources.push(src);
    }
  }

  const findMatchingDoc = (sourceName: string): AgriculturalDoc | undefined => {
    return docs.find((d) => d.filename === sourceName || d.title === sourceName);
  };

  return (
    <div id="retrieved-sources-section" className="mt-4 pt-4 border-t border-neutral-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-800" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
            {uniqueSources.length > 1 ? "Retrieved Sources" : "Retrieved Source"}
          </h4>
        </div>
        <span className="text-[11px] text-neutral-500">
          Grounded citations from your uploaded documents
        </span>
      </div>

      <div className="space-y-3">
        {uniqueSources.map((src, idx) => {
          const matchedDoc = findMatchingDoc(src.source);

          return (
            <div
              key={`${src.chunkId}-${idx}`}
              id={`source-reference-${idx}`}
              className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/80 text-neutral-800 text-xs hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-950 truncate flex-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{src.source}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[11px] font-medium">
                    Page {src.page}
                  </span>

                  {matchedDoc && (
                    <button
                      onClick={() => downloadDocument(matchedDoc)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-emerald-50 text-emerald-800 border border-neutral-200 hover:border-emerald-300 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                      title="Download this cited document as PDF"
                    >
                      <Download className="w-3 h-3 text-emerald-700" />
                      <span>Download PDF</span>
                    </button>
                  )}

                  {matchedDoc && onSelectDocToView && (
                    <button
                      onClick={() =>
                        onSelectDocToView(
                          matchedDoc,
                          typeof src.page === "number"
                            ? src.page
                            : parseInt(String(src.page), 10) || 1
                        )
                      }
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer shadow-2xs text-[11px] font-medium"
                      title="View cited page in reader"
                    >
                      <Eye className="w-3 h-3 text-neutral-600" />
                      <span>View Page {src.page}</span>
                    </button>
                  )}
                </div>
              </div>

              <blockquote className="pl-3 py-1 border-l-2 border-emerald-600 italic text-neutral-600 text-[11.5px] leading-relaxed">
                "{src.snippet}"
              </blockquote>
            </div>
          );
        })}
      </div>
    </div>
  );
};
