import React from "react";
import { Database, Layers, CheckCircle2, Sliders, Trash2, FolderOpen } from "lucide-react";
import { KnowledgeBaseStats } from "../types";

interface KnowledgeBaseCardProps {
  stats: KnowledgeBaseStats;
  onManageDocs: () => void;
  onClearKB: () => void;
  onClearChat: () => void;
}

export const KnowledgeBaseCard: React.FC<KnowledgeBaseCardProps> = ({
  stats,
  onManageDocs,
  onClearKB,
  onClearChat,
}) => {
  return (
    <div
      id="knowledge-base-summary-card"
      className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Stats Overview */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              Knowledge Base
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Knowledge Base Ready
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-600 pt-0.5">
            <span className="font-semibold text-neutral-900 font-mono">
              {stats.docCount} {stats.docCount === 1 ? "Document" : "Documents"}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="font-semibold text-neutral-900 font-mono">
              {stats.chunkCount} Knowledge Chunks
            </span>
            <span className="text-neutral-300 hidden md:inline">•</span>
            <span className="text-neutral-500 hidden md:inline">
              Indexed with Sentence Transformers & FAISS
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="manage-documents-btn"
            onClick={onManageDocs}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-emerald-600 bg-neutral-50 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-950 font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Manage Documents</span>
          </button>

          <button
            id="clear-kb-quick-btn"
            onClick={onClearKB}
            title="Reset Knowledge Base and Clear Index"
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-red-300 hover:bg-red-50 text-neutral-500 hover:text-red-700 text-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear KB</span>
          </button>
        </div>
      </div>
    </div>
  );
};
