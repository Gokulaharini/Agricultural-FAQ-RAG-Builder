import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import multer from "multer";
import { PDFParse } from "pdf-parse";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Configure multer for handling large PDF files (up to 200MB, 300+ pages)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

// Lazy initializer for Gemini client to prevent crashes if key is missing on startup
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in the environment");
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Agricultural FAQ Assistant API" });
});

// PDF Extraction Endpoint: Supports large 300+ page agricultural manuals
app.post("/api/extract-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No file provided for extraction" });
    }

    const originalName = req.file.originalname || "document.pdf";
    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(1);

    // If it is a PDF file, use PDFParse
    if (originalName.toLowerCase().endsWith(".pdf") || req.file.mimetype === "application/pdf") {
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        const parsed = await parser.getText();

        const rawPages = parsed.pages || [];
        const pages = rawPages.map((p: any) => ({
          pageNumber: p.num || 1,
          text: (p.text || "").trim(),
        }));

        // If pages array is empty but main text exists
        if (pages.length === 0 && parsed.text && parsed.text.trim()) {
          pages.push({
            pageNumber: 1,
            text: parsed.text.trim(),
          });
        }

        const totalPages = Math.max(1, parsed.total || pages.length);

        return res.json({
          success: true,
          filename: originalName,
          fileSize: `${fileSizeMB} MB`,
          totalPages,
          pages,
        });
      } catch (pdfErr: any) {
        console.error("PDFParse error:", pdfErr);
        return res.status(422).json({
          error: `Could not parse PDF pages: ${pdfErr.message || "Invalid or encrypted PDF"}`,
        });
      }
    }

    // Fallback for plain text or markdown files
    const textContent = req.file.buffer.toString("utf-8");
    const cleanContent = textContent.replace(/[\x00-\x09\x0B-\x1F\x7F-\x9F]/g, " ").trim();
    const pageSize = 2000;
    const estimatedPages = Math.max(1, Math.ceil(cleanContent.length / pageSize));
    const pages: { pageNumber: number; text: string }[] = [];

    for (let i = 0; i < estimatedPages; i++) {
      pages.push({
        pageNumber: i + 1,
        text: cleanContent.slice(i * pageSize, (i + 1) * pageSize).trim(),
      });
    }

    return res.json({
      success: true,
      filename: originalName,
      fileSize: `${(req.file.size / 1024).toFixed(1)} KB`,
      totalPages: pages.length,
      pages,
    });
  } catch (err: any) {
    console.error("Extraction error:", err);
    return res.status(500).json({ error: `Internal extraction error: ${err.message || err}` });
  }
});

// Grounded RAG Chat API Endpoint (Document-grounded assistant)
app.post("/api/chat", async (req, res) => {
  try {
    const { question, retrieved_chunks, chat_history = [], model } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'question' parameter" });
    }

    // Format retrieved document chunks as structured context
    let formattedContext = "No relevant document chunks provided.";
    if (Array.isArray(retrieved_chunks) && retrieved_chunks.length > 0) {
      formattedContext = retrieved_chunks
        .map((chunk: any, i: number) => {
          const docName = chunk.source || "Document";
          const pageNum = chunk.page || "N/A";
          return `[Source ${i + 1} | Document: ${docName} | Page: ${pageNum}]\n${chunk.content || ""}`;
        })
        .join("\n\n---\n\n");
    }

    const systemInstruction = `You are an agricultural document-based question answering assistant.

Answer the user's question using only the provided retrieved context from the uploaded agricultural documents.

Do not use unsupported information or invent facts.

If the answer is not available in the provided context, clearly state that the information was not found in the uploaded documents.

For fertilizer, pesticide, chemical, dosage, disease-treatment, and safety-related information, never fabricate recommendations.

When possible, provide the document name and page number associated with the answer.`;

    // Format conversational history for follow-up questions
    let promptText = `Retrieved Document Context:\n----------------------------------------\n${formattedContext}\n----------------------------------------\n\n`;

    if (Array.isArray(chat_history) && chat_history.length > 0) {
      promptText += `Previous Conversation History:\n`;
      for (const msg of chat_history.slice(-4)) {
        promptText += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
      }
      promptText += `\n`;
    }

    promptText += `Current Question: ${question}\n\n`;
    promptText += `Instructions: Answer the current question strictly using the retrieved document context above. If the information is not present in the context, clearly state that the information was not found in the uploaded documents. State source documents and page numbers wherever possible.`;

    const ai = getGeminiClient();

    // Primary model is gemini-3.6-flash with graceful fallbacks
    const candidateModels = [
      model,
      process.env.MODEL_NAME,
      "gemini-3.6-flash",
      "gemini-flash-latest",
      "gemini-3.8-flash",
      "gemini-3.1-pro-preview",
    ].filter(Boolean) as string[];

    let response = null;
    let lastError = null;

    for (const modelToTry of candidateModels) {
      try {
        response = await ai.models.generateContent({
          model: modelToTry,
          contents: promptText,
          config: {
            systemInstruction,
            temperature: 0.2,
            maxOutputTokens: 2048,
          },
        });
        if (response && response.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model candidate ${modelToTry} attempt failed:`, err.message);
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("All model candidates failed to return text");
    }

    const answer = response.text || "No response generated.";
    return res.json({ answer });
  } catch (error: any) {
    console.error("API /api/chat error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate agricultural FAQ response",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Agricultural Knowledge Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
