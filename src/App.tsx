import React, { useState } from "react";
import { AgriculturalDoc, DocChunk, ChatMessage, RAGConfig, KnowledgeBaseStats } from "./types";
import { buildDocumentChunks, retrieveTopChunks, resolveFollowUpQuery } from "./utils/ragEngine";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { ChatView } from "./components/ChatView";
import { EmptyStateHero } from "./components/EmptyStateHero";
import { ManualViewerModal } from "./components/ManualViewerModal";

export default function App() {
  // Modal for viewing, reading, and downloading documents
  const [modalState, setModalState] = useState<{
    doc: AgriculturalDoc;
    initialPage?: number;
  } | null>(null);

  // Uploaded documents state (starts empty on startup per requirement)
  const [docs, setDocs] = useState<AgriculturalDoc[]>([]);

  // Generated document chunks and knowledge base metrics
  const [chunks, setChunks] = useState<DocChunk[]>([]);
  const [stats, setStats] = useState<KnowledgeBaseStats>({
    docCount: 0,
    pageCount: 0,
    chunkCount: 0,
    isReady: false,
    processedFiles: [],
  });

  const [config] = useState<RAGConfig>({
    chunkSize: 1000,
    chunkOverlap: 200,
    topK: 4,
    modelName: "gemini-3.6-flash",
    temperature: 0.2,
  });

  // Chat conversation state (Single, grounded assistant)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isProcessingDocs, setIsProcessingDocs] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Helper to calculate total pages from document list
  const calculateTotalPages = (targetDocs: AgriculturalDoc[]) => {
    return targetDocs.reduce((acc, doc) => acc + (doc.totalPages || 1), 0);
  };

  // Internal document processing function
  const processDocumentsInternal = (targetDocs: AgriculturalDoc[]) => {
    setIsProcessingDocs(true);
    setTimeout(() => {
      try {
        if (targetDocs.length === 0) {
          setChunks([]);
          setStats({
            docCount: 0,
            pageCount: 0,
            chunkCount: 0,
            isReady: false,
            processedFiles: [],
          });
        } else {
          const generatedChunks = buildDocumentChunks(
            targetDocs,
            config.chunkSize,
            config.chunkOverlap
          );
          setChunks(generatedChunks);
          setStats({
            docCount: targetDocs.length,
            pageCount: calculateTotalPages(targetDocs),
            chunkCount: generatedChunks.length,
            isReady: true,
            processedFiles: targetDocs.map((d) => d.filename),
          });
        }
      } catch (err) {
        console.error("Error processing documents:", err);
      } finally {
        setIsProcessingDocs(false);
      }
    }, 600);
  };

  // Build Knowledge Base Trigger
  const handleProcessDocs = () => {
    processDocumentsInternal(docs);
  };

  // Upload Documents Handler - Automatically reads, extracts, indexes, and activates the chatbot
  const handleUploadDocs = (newDocs: AgriculturalDoc[]) => {
    setIsProcessingDocs(true);
    const existingIds = new Set(docs.map((d) => d.id));
    const uniqueNewDocs = newDocs.filter((d) => !existingIds.has(d.id));

    if (uniqueNewDocs.length === 0) {
      setIsProcessingDocs(false);
      return;
    }

    const updatedDocs = [...docs, ...uniqueNewDocs];
    setDocs(updatedDocs);

    // Build vector chunks immediately from extracted document content
    const generatedChunks = buildDocumentChunks(
      updatedDocs,
      config.chunkSize,
      config.chunkOverlap
    );
    setChunks(generatedChunks);

    const totalPages = calculateTotalPages(updatedDocs);
    setStats({
      docCount: updatedDocs.length,
      pageCount: totalPages,
      chunkCount: generatedChunks.length,
      isReady: true,
      processedFiles: updatedDocs.map((d) => d.filename),
    });
    setIsProcessingDocs(false);

    // Provide immediate chatbot greeting announcing extracted document
    const docSummary = uniqueNewDocs
      .map(
        (d) =>
          `**${d.filename}** (${d.totalPages} ${
            d.totalPages === 1 ? "page" : "pages"
          })`
      )
      .join(", ");

    const welcomeMsg: ChatMessage = {
      id: `assistant-welcome-${Date.now()}`,
      role: "assistant",
      content: `👋 I have read and extracted ${docSummary}. All contents and pages have been indexed into searchable passages.\n\nYou can now ask me any question about the document just like a chatbot! Ask about recommended practices, fertilizer dosages, pest management, or irrigation requirements.`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, welcomeMsg]);
  };

  // Remove a document
  const handleRemoveDoc = (docId: string) => {
    setDocs((prev) => {
      const updated = prev.filter((d) => d.id !== docId);
      if (updated.length === 0) {
        setChunks([]);
        setStats({
          docCount: 0,
          pageCount: 0,
          chunkCount: 0,
          isReady: false,
          processedFiles: [],
        });
      } else if (stats.isReady) {
        processDocumentsInternal(updated);
      } else {
        setStats({
          docCount: updated.length,
          pageCount: calculateTotalPages(updated),
          chunkCount: 0,
          isReady: false,
          processedFiles: updated.map((d) => d.filename),
        });
      }
      return updated;
    });
  };

  // Clear entire knowledge base
  const handleClearKB = () => {
    setDocs([]);
    setChunks([]);
    setStats({
      docCount: 0,
      pageCount: 0,
      chunkCount: 0,
      isReady: false,
      processedFiles: [],
    });
    setChatMessages([]);
  };

  // Clear conversation history
  const handleClearChat = () => {
    setChatMessages([]);
  };

  const handleOpenDocModal = (doc: AgriculturalDoc, targetPage?: number) => {
    setModalState({ doc, initialPage: targetPage });
  };

  // Document-grounded question submit handler
  const handleSubmitQuestion = async (overrideQuestion?: string) => {
    const questionText = (overrideQuestion || chatInput).trim();
    if (!questionText) return;

    // Guard: strictly require knowledge base ready
    if (!stats.isReady || chunks.length === 0) {
      const warningMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content:
          "⚠️ The knowledge base has not been built yet. Please upload agricultural documents and click 'Build Knowledge Base' before asking questions.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };
      setChatMessages((prev) => [...prev, warningMsg]);
      return;
    }

    // 1. Add User message to chat
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      // 2. Query Reformulation for Follow-Up Questions (Conversational Memory)
      const searchHeadline = resolveFollowUpQuery(questionText, chatMessages);

      // 3. FAISS Vector Retrieval Simulation across all chunks (supporting 300+ pages)
      const retrievalResults = retrieveTopChunks(searchHeadline, chunks, config.topK);

      // NO RELEVANT ANSWER FOUND CHECK
      const maxScore = retrievalResults.length > 0 ? retrievalResults[0].score : 0;
      if (retrievalResults.length === 0 || maxScore < 0.15) {
        const noAnswerMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            "I couldn't find enough relevant information in the uploaded documents to answer this question reliably.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setChatMessages((prev) => [...prev, noAnswerMsg]);
        setIsChatLoading(false);
        return;
      }

      const sourceRefs = retrievalResults.map((r) => r.sourceRef);
      const retrievedContentChunks = retrievalResults.map((r) => ({
        source: r.chunk.source,
        page: r.chunk.page,
        content: r.chunk.content,
      }));

      // 4. Send strictly retrieved context to Gemini via server-side API
      let answerText = "";
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: questionText,
            retrieved_chunks: retrievedContentChunks,
            chat_history: chatMessages.slice(-4).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            model: config.modelName,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          answerText = data.answer;
        } else {
          const errData = await response.json().catch(() => ({ error: "Server error" }));
          throw new Error(errData.error || `HTTP ${response.status}`);
        }
      } catch (apiErr: any) {
        console.warn("Backend /api/chat invocation error, fallback to grounded local summary:", apiErr);
        if (retrievalResults.length > 0) {
          const topDoc = retrievalResults[0].chunk;
          answerText = `According to **${topDoc.source}** (Page ${topDoc.page}):\n\n${topDoc.content}\n\n*Safety Advisory: For critical agricultural chemicals, pesticides, or fertilizer dosages, please verify recommendations with local agricultural extension offices or licensed agronomists.*`;
        } else {
          answerText =
            "I couldn't find enough relevant information in the uploaded documents to answer this question reliably.";
        }
      }

      // 5. Append Assistant Response with Source Document and Page Citations
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: sourceRefs,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("RAG error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ An error occurred while retrieving or processing your question: ${
          err.message || "Unknown error"
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const isKnowledgeBaseReady = stats.isReady && stats.chunkCount > 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-neutral-100 font-sans text-neutral-900 overflow-hidden">
      {/* Header: Title, Description & Status */}
      <Header
        stats={stats}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Single Page Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Minimal Sidebar */}
        {isSidebarOpen && (
          <Sidebar
            docs={docs}
            stats={stats}
            isProcessing={isProcessingDocs}
            onUploadDocs={handleUploadDocs}
            onProcessDocs={handleProcessDocs}
            onClearKB={handleClearKB}
            onClearChat={handleClearChat}
            onRemoveDoc={handleRemoveDoc}
            onSelectDocToView={(doc) => handleOpenDocModal(doc)}
          />
        )}

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50">
          {!isKnowledgeBaseReady ? (
            /* STATE 1 & STATE 2: Document Ingestion / Pre-processing */
            <div className="flex-1 overflow-y-auto">
              <EmptyStateHero
                queuedDocs={docs}
                isProcessing={isProcessingDocs}
                onUploadDocs={handleUploadDocs}
                onRemoveDoc={handleRemoveDoc}
                onProcessDocs={handleProcessDocs}
                onSelectDocToView={(doc) => handleOpenDocModal(doc)}
              />
            </div>
          ) : (
            /* STATE 3: Knowledge Base Ready -> Conversational QA */
            <ChatView
              messages={chatMessages}
              stats={stats}
              docs={docs}
              inputQuestion={chatInput}
              isLoading={isChatLoading}
              onInputChange={setChatInput}
              onSubmitQuestion={handleSubmitQuestion}
              onExampleClick={(q) => {
                setChatInput(q);
                handleSubmitQuestion(q);
              }}
              onManageDocs={() => {
                setIsSidebarOpen(true);
              }}
              onUploadDocs={handleUploadDocs}
              onClearKB={handleClearKB}
              onClearChat={handleClearChat}
              onSelectDocToView={(doc, page) => handleOpenDocModal(doc, page)}
            />
          )}
        </main>
      </div>

      {/* Document Content Preview & PDF Download Modal */}
      {modalState && (
        <ManualViewerModal
          doc={modalState.doc}
          initialPage={modalState.initialPage || 1}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
