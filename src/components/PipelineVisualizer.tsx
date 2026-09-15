import React from "react";
import { FileUp, Eye, Cpu, Database, Sparkles, ShieldCheck } from "lucide-react";

export const PipelineVisualizer: React.FC = () => {
  return (
    <div id="rag-pipeline-banner" className="mb-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border border-emerald-800/80 rounded-xl p-4 text-emerald-50 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Agricultural Knowledge Pipeline
          </h2>
          <p className="text-xs text-emerald-300/80 mt-0.5">
            Strictly grounded retrieval architecture preventing agricultural hallucination
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-800/60 border border-emerald-700/60 text-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero-Hallucination Chemical Policy
          </span>
        </div>
      </div>

      {/* Responsive pipeline steps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div className="p-2.5 rounded-lg bg-emerald-900/50 border border-emerald-800/60 flex flex-col items-center text-center">
          <FileUp className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="font-semibold text-emerald-100">1. PDF Ingestion</span>
          <span className="text-[10px] text-emerald-400/80">PyMuPDF Reader</span>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-900/50 border border-emerald-800/60 flex flex-col items-center text-center">
          <Eye className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="font-semibold text-emerald-100">2. OCR Fallback</span>
          <span className="text-[10px] text-emerald-400/80">Tesseract Engine</span>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-900/50 border border-emerald-800/60 flex flex-col items-center text-center">
          <Cpu className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="font-semibold text-emerald-100">3. Chunking</span>
          <span className="text-[10px] text-emerald-400/80">1000ch / 200ov</span>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-900/50 border border-emerald-800/60 flex flex-col items-center text-center">
          <Database className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="font-semibold text-emerald-100">4. Vector DB</span>
          <span className="text-[10px] text-emerald-400/80">FAISS + MiniLM</span>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-900/50 border border-emerald-800/60 flex flex-col items-center text-center">
          <Sparkles className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="font-semibold text-emerald-100">5. Top-K Retrieve</span>
          <span className="text-[10px] text-emerald-400/80">Top 4 Chunks</span>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-800/70 border border-emerald-600/70 flex flex-col items-center text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-300 mb-1" />
          <span className="font-semibold text-white">6. Grounded Gemini</span>
          <span className="text-[10px] text-emerald-200">Verified Citations</span>
        </div>
      </div>
    </div>
  );
};
