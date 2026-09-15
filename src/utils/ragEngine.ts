import { AgriculturalDoc, DocChunk, SourceReference } from "../types";

// Clean text by normalizing spacing and fixing hyphenated words
export function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/(\w+)-\n(\w+)/g, "$1$2")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

// Split text into semantic chunks with overlap
export function splitTextIntoChunks(
  text: string,
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): string[] {
  const cleaned = cleanText(text);
  if (!cleaned) return [];
  if (cleaned.length <= chunkSize) return [cleaned];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleaned.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex >= cleaned.length) {
      chunks.push(cleaned.slice(startIndex).trim());
      break;
    }

    // Try to break at paragraph boundary, sentence boundary, or space
    let breakIndex = cleaned.lastIndexOf("\n\n", endIndex);
    if (breakIndex <= startIndex) {
      breakIndex = cleaned.lastIndexOf(". ", endIndex);
      if (breakIndex > startIndex) {
        breakIndex += 1; // Include period
      }
    }
    if (breakIndex <= startIndex) {
      breakIndex = cleaned.lastIndexOf(" ", endIndex);
    }
    if (breakIndex <= startIndex) {
      breakIndex = endIndex;
    }

    const chunk = cleaned.slice(startIndex, breakIndex).trim();
    if (chunk) {
      chunks.push(chunk);
    }

    startIndex = Math.max(startIndex + 1, breakIndex - chunkOverlap);
  }

  return chunks;
}

// Extract concise snippet for source preview
export function extractSnippet(content: string, query: string = "", maxChars: number = 220): string {
  const singleLine = content.replace(/\s+/g, " ").trim();
  if (query) {
    const words = query
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    for (const word of words) {
      const idx = singleLine.toLowerCase().indexOf(word);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(singleLine.length, idx + maxChars - 40);
        const prefix = start > 0 ? "..." : "";
        const suffix = end < singleLine.length ? "..." : "";
        return `${prefix}${singleLine.slice(start, end).trim()}${suffix}`;
      }
    }
  }
  if (singleLine.length > maxChars) {
    return singleLine.slice(0, maxChars).trim() + "...";
  }
  return singleLine;
}

// Tokenize text into words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

// Compute BM25 / TF-IDF style semantic similarity score between query and chunk
export function computeSimilarity(query: string, chunkContent: string): number {
  const queryTokens = tokenize(query);
  const chunkTokens = tokenize(chunkContent);

  if (queryTokens.length === 0 || chunkTokens.length === 0) return 0;

  const chunkTokenFreq: Record<string, number> = {};
  for (const token of chunkTokens) {
    chunkTokenFreq[token] = (chunkTokenFreq[token] || 0) + 1;
  }

  let matchScore = 0;
  let exactPhraseBonus = 0;

  // Exact phrase check
  const lowerQuery = query.toLowerCase();
  const lowerContent = chunkContent.toLowerCase();
  if (lowerContent.includes(lowerQuery)) {
    exactPhraseBonus = 2.5;
  }

  for (const token of queryTokens) {
    if (chunkTokenFreq[token]) {
      // Sub-linear term frequency
      const tf = Math.sqrt(chunkTokenFreq[token]);
      // Reward domain-specific agricultural keywords
      const isKeyAgriTerm = [
        "fertilizer",
        "irrigation",
        "borer",
        "paddy",
        "rice",
        "wheat",
        "cotton",
        "tomato",
        "deficiency",
        "nitrogen",
        "blight",
        "dosage",
        "pest",
        "spray",
        "kg",
        "ha",
        "stage",
        "cri",
      ].includes(token);
      const termWeight = isKeyAgriTerm ? 2.0 : 1.0;
      matchScore += tf * termWeight;
    }
  }

  // Length normalization
  const normalizedScore = matchScore / (Math.sqrt(chunkTokens.length) + 5) + exactPhraseBonus;
  return normalizedScore;
}

// Process documents into indexed chunks
export function buildDocumentChunks(
  docs: AgriculturalDoc[],
  chunkSize: number = 1000,
  chunkOverlap: number = 200
): DocChunk[] {
  const chunks: DocChunk[] = [];

  for (const doc of docs) {
    for (const page of doc.pages) {
      const pageChunks = splitTextIntoChunks(page.text, chunkSize, chunkOverlap);
      pageChunks.forEach((textChunk, chunkIdx) => {
        chunks.push({
          id: `${doc.id}_p${page.pageNumber}_c${chunkIdx + 1}`,
          docId: doc.id,
          source: doc.filename,
          page: page.pageNumber,
          content: textChunk,
        });
      });
    }
  }

  return chunks;
}

// Retrieve top-K most relevant chunks
export function retrieveTopChunks(
  query: string,
  chunks: DocChunk[],
  topK: number = 4
): { chunk: DocChunk; score: number; sourceRef: SourceReference }[] {
  if (chunks.length === 0) return [];

  const scored = chunks.map((chunk) => {
    const score = computeSimilarity(query, chunk.content);
    return {
      chunk,
      score,
      sourceRef: {
        source: chunk.source,
        page: chunk.page,
        chunkId: chunk.id,
        snippet: extractSnippet(chunk.content, query),
        score: Math.round(score * 100) / 100,
      },
    };
  });

  // Sort descending by similarity score
  scored.sort((a, b) => b.score - a.score);

  // Take top-K
  return scored.slice(0, topK);
}

// Reformulate conversational follow-ups
export function resolveFollowUpQuery(
  currentQuery: string,
  recentHistory: { role: string; content: string }[]
): string {
  const lower = currentQuery.toLowerCase();
  const pronouns = ["it", "this", "that", "these", "those", "they", "them", "the disease", "the pest", "the crop", "the fertilizer"];

  const hasPronoun = pronouns.some((p) => {
    const regex = new RegExp(`\\b${p}\\b`, "i");
    return regex.test(lower);
  });

  if (!hasPronoun || recentHistory.length === 0) {
    return currentQuery;
  }

  // Find the last user or assistant message to extract context subject
  let subjectContext = "";
  for (let i = recentHistory.length - 1; i >= 0; i--) {
    const text = recentHistory[i].content.toLowerCase();
    if (text.includes("rice") || text.includes("paddy")) subjectContext += " rice paddy";
    if (text.includes("wheat")) subjectContext += " wheat";
    if (text.includes("cotton")) subjectContext += " cotton";
    if (text.includes("tomato")) subjectContext += " tomato";
    if (text.includes("fertilizer") || text.includes("nitrogen") || text.includes("urea")) subjectContext += " fertilizer application";
    if (text.includes("stem borer")) subjectContext += " stem borer pest";
    if (text.includes("irrigation") || text.includes("water") || text.includes("cri")) subjectContext += " irrigation requirement";
    if (text.includes("blight")) subjectContext += " blight disease";
    if (subjectContext) break;
  }

  if (subjectContext) {
    return `${currentQuery} (${subjectContext.trim()})`;
  }

  return currentQuery;
}
