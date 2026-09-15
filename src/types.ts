export interface AgriculturalDoc {
  id: string;
  title: string;
  filename: string;
  totalPages: number;
  isPreloaded?: boolean;
  fileSize?: string;
  rawFile?: File;
  fileUrl?: string;
  pages: {
    pageNumber: number;
    text: string;
  }[];
}

export interface DocChunk {
  id: string;
  docId: string;
  source: string;
  page: number;
  content: string;
  embedding?: number[];
}

export interface SourceReference {
  source: string;
  page: number | string;
  chunkId: string;
  snippet: string;
  score?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SourceReference[];
  isError?: boolean;
}

export interface RAGConfig {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  modelName: string;
  temperature: number;
}

export interface KnowledgeBaseStats {
  docCount: number;
  pageCount: number;
  chunkCount: number;
  isReady: boolean;
  processedFiles: string[];
}

export type NavigationTab = 'home' | 'kb' | 'assistant';
