import React from "react";
import { Database, FileText, CheckCircle2, Layers } from "lucide-react";
import { KnowledgeBaseStats } from "../types";

interface HeaderProps {
  stats: KnowledgeBaseStats;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, onToggleSidebar }) => {
  const isReady = stats.isReady && stats.chunkCount > 0;

  return (
    <header
      id="agricultural-knowledge-header"
      className="w-full bg-white border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-xs z-10"
    >
      {/* Title, Subtitle, and Short Description */}
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label="grain">
            🌾
          </span>
          <h1 className="text-xl font-bold tracking-tight text-emerald-950">
            Agricultural Knowledge Assistant
          </h1>
        </div>
        <p className="text-xs font-semibold text-emerald-800">
          Smart Farming &amp; Extension Knowledge Base
        </p>
        <p className="text-xs text-neutral-600 max-w-2xl leading-relaxed">
          Upload crop manuals, farming guides, or research notes to get instant, reliable answers backed by page citations.
        </p>
      </div>

      {/* Right Side: Actual Metrics when ready */}
      {isReady && (
        <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200 shrink-0">
          <span className="font-medium text-neutral-800">
            Docs: <strong className="text-emerald-900">{stats.docCount}</strong>
          </span>
          <span className="text-neutral-300">•</span>
          <span className="font-medium text-neutral-800">
            Pages: <strong className="text-emerald-900">{stats.pageCount}</strong>
          </span>
          <span className="text-neutral-300">•</span>
          <span className="font-medium text-neutral-800">
            Chunks: <strong className="text-emerald-900">{stats.chunkCount}</strong>
          </span>
        </div>
      )}
    </header>
  );
};
