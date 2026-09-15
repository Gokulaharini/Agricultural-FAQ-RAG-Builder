import React, { useRef, useEffect, useState } from "react";
import {
  Send,
  User,
  HelpCircle,
  Loader2,
  BookOpen,
  AlertCircle,
  Upload,
  Paperclip,
  FileText,
  Download,
  Eye,
  Sparkles,
} from "lucide-react";
import Markdown from "react-markdown";
import { ChatMessage, KnowledgeBaseStats, AgriculturalDoc } from "../types";
import { SourceCard } from "./SourceCard";
import { extractDocumentContent, downloadDocument } from "../utils/fileExtractor";
import { SAMPLE_AGRICULTURAL_DEMOS } from "../data/sampleDemos";

interface ChatViewProps {
  messages: ChatMessage[];
  stats: KnowledgeBaseStats;
  docs?: AgriculturalDoc[];
  inputQuestion: string;
  isLoading: boolean;
  onInputChange: (val: string) => void;
  onSubmitQuestion: (questionToSubmit?: string) => void;
  onExampleClick: (question: string) => void;
  onManageDocs: () => void;
  onUploadDocs?: (newDocs: AgriculturalDoc[]) => void;
  onClearKB: () => void;
  onClearChat: () => void;
  onSelectDocToView?: (doc: AgriculturalDoc, targetPage?: number) => void;
}

const DEFAULT_EXAMPLE_QUESTIONS = [
  "What are the recommended practices for crop cultivation?",
  "What fertilizer recommendations are detailed in the document?",
  "How can major insect pests and plant diseases be managed?",
  "What are the symptoms of nutrient deficiencies?",
  "What irrigation practices are recommended across different growth stages?",
];

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  stats,
  docs = [],
  inputQuestion,
  isLoading,
  onInputChange,
  onSubmitQuestion,
  onExampleClick,
  onManageDocs,
  onUploadDocs,
  onClearKB,
  onClearChat,
  onSelectDocToView,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [extractStatus, setExtractStatus] = useState("");

  // Context-aware suggested questions based on uploaded / loaded documents
  const dynamicExampleQuestions = React.useMemo(() => {
    const list: string[] = [];
    const allText = docs.map((d) => `${d.title} ${d.filename}`).join(" ").toLowerCase();

    if (allText.includes("rice") || allText.includes("paddy")) {
      list.push("What is the recommended NPK fertilizer dosage and schedule for rice?");
      list.push("What are the symptoms and treatment of Khaira disease (zinc deficiency)?");
      list.push("How do I control Yellow Stem Borer and brown planthopper in rice?");
      list.push("What are the guidelines for Alternate Wetting and Drying (AWD) irrigation?");
    }
    if (allText.includes("pest") || allText.includes("disease") || allText.includes("ipm")) {
      list.push("What is the Economic Threshold Level (ETL) and IPM for Fall Armyworm in maize?");
      list.push("How do I identify and manage Yellow Stripe Rust in wheat?");
      list.push("What biological control agents and biocontrol fungi can be used?");
    }
    if (allText.includes("soil") || allText.includes("fertilizer") || allText.includes("drip") || allText.includes("irrigation")) {
      list.push("How is agricultural gypsum calculated to reclaim alkali sodic soil?");
      list.push("What are the visual deficiency symptoms for Nitrogen, Phosphorus, and Potassium?");
      list.push("What are the maintenance steps for drip irrigation emitters and acid flushing?");
    }

    if (list.length === 0) {
      return DEFAULT_EXAMPLE_QUESTIONS;
    }
    return list;
  }, [docs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputQuestion.trim() && !isLoading) {
        onSubmitQuestion();
      }
    }
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onUploadDocs) return;

    setIsExtractingFile(true);
    const newDocs: AgriculturalDoc[] = [];

    try {
      const fileList = Array.from(files);
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setExtractStatus(`Reading & extracting ${file.name}...`);
        const extracted = await extractDocumentContent(file, (msg) =>
          setExtractStatus(msg)
        );
        newDocs.push(extracted);
      }
      onUploadDocs(newDocs);
    } catch (err: any) {
      console.error("In-chat file extraction error:", err);
    } finally {
      setIsExtractingFile(false);
      setExtractStatus("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const activeDoc = docs.length > 0 ? docs[docs.length - 1] : null;

  return (
    <div id="chat-view-container" className="flex-1 flex flex-col h-full bg-neutral-50 overflow-hidden">
      {/* Scrollable conversation and knowledge base area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-4xl w-full mx-auto">
        {/* Knowledge Base Ready Banner with Actual Metrics */}
        <div
          id="kb-ready-banner"
          className="bg-white border border-emerald-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h2 className="text-sm sm:text-base font-bold text-emerald-950">
                Knowledge Base Ready
              </h2>
            </div>
            <p className="text-xs text-neutral-600">
              Retrieved passages will be automatically extracted from your indexed documents.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <span>Documents: <strong>{stats.docCount}</strong></span>
              <span className="text-emerald-300">•</span>
              <span>Pages: <strong>{stats.pageCount}</strong></span>
              <span className="text-emerald-300">•</span>
              <span>Chunks: <strong>{stats.chunkCount}</strong></span>
            </div>

            <button
              onClick={onManageDocs}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 cursor-pointer transition-colors"
            >
              Manage Documents
            </button>
          </div>
        </div>

        {/* Section Heading */}
        <div className="pt-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Ask about your agricultural documents
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Questions are answered strictly using retrieved passages from your uploaded agricultural documents.
          </p>
        </div>

        {/* Example Questions Pills */}
        <div id="example-questions-container" className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Suggested questions for active documents:</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {dynamicExampleQuestions.map((q, idx) => (
              <button
                key={idx}
                id={`example-question-${idx}`}
                onClick={() => onExampleClick(q)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:border-emerald-600 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-950 text-xs font-medium transition-colors text-left cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Answers and Conversation History */}
        <div className="space-y-6 pt-2">
          {messages.length === 0 && (
            <div className="p-8 text-center rounded-xl border border-neutral-200 bg-white space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-neutral-800">
                  Ready to answer questions from your documents
                </p>
                <p className="text-xs text-neutral-500 max-w-md mx-auto">
                  Type any question below, click a suggested question above, or upload additional manuals at any time.
                </p>
              </div>

              {onUploadDocs && docs.length < SAMPLE_AGRICULTURAL_DEMOS.length && (
                <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    Try other sample demos:
                  </span>
                  {SAMPLE_AGRICULTURAL_DEMOS.map((demo) => {
                    const isLoaded = docs.some((d) => d.id === demo.id);
                    if (isLoaded) return null;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        onClick={() => onUploadDocs([demo])}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                      >
                        + {demo.title}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === "user") {
              return (
                <div
                  key={msg.id}
                  id={`user-question-${msg.id}`}
                  className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 text-xs font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        Your Question
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-neutral-900 leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              );
            }

            // Assistant Knowledge Response
            return (
              <div
                key={msg.id}
                id={`knowledge-answer-${msg.id}`}
                className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4 transition-all"
              >
                {/* Answer Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌾</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                      Agricultural Assistant
                    </h3>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Answer Text Content with Markdown */}
                <div className="text-sm sm:text-[15px] text-neutral-800 leading-relaxed space-y-3 prose prose-neutral max-w-none">
                  {msg.isError ? (
                    <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>{msg.content}</div>
                    </div>
                  ) : (
                    <Markdown>{msg.content}</Markdown>
                  )}
                </div>

                {/* Visually Separated Sources Section with PDF Download Support */}
                {msg.sources && msg.sources.length > 0 && (
                  <SourceCard
                    sources={msg.sources}
                    docs={docs}
                    onSelectDocToView={onSelectDocToView}
                  />
                )}
              </div>
            );
          })}

          {/* Loading Indicator while processing query */}
          {isLoading && (
            <div
              id="retrieving-answer-indicator"
              className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs flex items-center gap-3.5 text-neutral-600 text-sm"
            >
              <Loader2 className="w-5 h-5 animate-spin text-emerald-700 shrink-0" />
              <div>
                <p className="font-semibold text-neutral-900">
                  Retrieving relevant agricultural passages & generating grounded response...
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Querying vector index and formulating document-grounded answer with Gemini.
                </p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-white border-t border-neutral-200 shrink-0 shadow-xs">
        <div className="max-w-4xl mx-auto">
          {/* Active Extracted Document Indicator */}
          {activeDoc && (
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2 text-xs text-neutral-600 truncate">
                <span className="font-semibold text-emerald-950 flex items-center gap-1.5 truncate">
                  <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{activeDoc.filename}</span>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium shrink-0">
                  {activeDoc.totalPages} {activeDoc.totalPages === 1 ? "page" : "pages"} extracted
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {onSelectDocToView && (
                  <button
                    type="button"
                    onClick={() => onSelectDocToView(activeDoc)}
                    className="text-[11px] font-medium text-neutral-600 hover:text-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    title="Open document viewer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => downloadDocument(activeDoc)}
                  className="text-[11px] font-medium text-neutral-600 hover:text-emerald-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Download PDF"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          {/* Extraction status notification when attaching document inside chat */}
          {isExtractingFile && (
            <div className="mb-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700 shrink-0" />
              <span>{extractStatus || "Reading and extracting document pages..."}</span>
            </div>
          )}

          {/* Hidden File Input for In-Chat Document Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileAttach}
            accept=".pdf,.txt"
            multiple
            className="hidden"
            id="chat-file-attachment-input"
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputQuestion.trim() && !isLoading) {
                onSubmitQuestion();
              }
            }}
            className="flex items-end gap-2 bg-neutral-50 border border-neutral-300 focus-within:border-emerald-700 focus-within:ring-1 focus-within:ring-emerald-700 rounded-xl p-2 transition-all"
          >
            {/* Attach Document Button */}
            <button
              type="button"
              id="chat-attach-doc-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isExtractingFile || isLoading}
              className="p-2.5 rounded-lg text-neutral-500 hover:text-emerald-800 hover:bg-neutral-200/60 transition-colors cursor-pointer shrink-0"
              title="Upload & extract agricultural document (.pdf)"
            >
              {isExtractingFile ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>

            <textarea
              id="question-input-field"
              ref={textareaRef}
              rows={2}
              value={inputQuestion}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your uploaded agricultural document..."
              disabled={isLoading}
              className="flex-1 bg-transparent resize-none border-none outline-none text-neutral-900 placeholder:text-neutral-400 text-sm p-1 leading-relaxed"
            />

            <button
              id="submit-question-btn"
              type="submit"
              disabled={!inputQuestion.trim() || isLoading}
              className={`p-2.5 rounded-lg font-medium text-xs transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                !inputQuestion.trim() || isLoading
                  ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                  : "bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs"
              }`}
              title="Submit question"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-1.5">
            <span>Press Enter to submit • Shift + Enter for new line</span>
            <span>Grounding: strictly from extracted document pages</span>
          </div>
        </div>
      </div>
    </div>
  );
};
