const DEFAULT_LIMIT = 280;

/**
 * Split Markdown plain text into tweet-sized chunks with numbering.
 * Strategy: paragraphs → sentences → word boundaries.
 */
export function splitThread(
  markdown: string,
  limit = DEFAULT_LIMIT,
): string[] {
  // Strip Markdown to plain text (lightweight: headings, bold, italic, links, images)
  const plain = stripMarkdown(markdown).trim();
  if (!plain) return [];

  // Split by double-newline into paragraphs
  const paragraphs = plain.split(/\n{2,}/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);

  const rawChunks: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= limit) {
      rawChunks.push(para);
    } else {
      // Split by sentence
      const sentences = splitSentences(para);
      let buffer = "";
      for (const sentence of sentences) {
        if (!buffer) {
          buffer = sentence;
        } else if ((buffer + " " + sentence).length <= limit) {
          buffer += " " + sentence;
        } else {
          if (buffer) rawChunks.push(buffer);
          // If single sentence exceeds limit, split by word
          if (sentence.length > limit) {
            rawChunks.push(...splitByWords(sentence, limit));
            buffer = "";
          } else {
            buffer = sentence;
          }
        }
      }
      if (buffer) rawChunks.push(buffer);
    }
  }

  if (rawChunks.length === 0) return [];
  if (rawChunks.length === 1) return rawChunks;

  // Add numbering: 1/N
  const total = rawChunks.length;
  return rawChunks.map((chunk, i) => {
    const num = `${i + 1}/${total}`;
    // Ensure numbering fits within limit
    const maxContent = limit - num.length - 1; // 1 for newline
    const trimmed = chunk.length > maxContent ? chunk.slice(0, maxContent - 1) + "…" : chunk;
    return `${trimmed}\n${num}`;
  });
}

function splitSentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or end
  const parts = text.match(/[^.!?…]+[.!?…]+[\s]?|[^.!?…]+$/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [text];
}

function splitByWords(text: string, limit: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let buffer = "";

  for (const word of words) {
    if (!buffer) {
      buffer = word;
    } else if ((buffer + " " + word).length <= limit) {
      buffer += " " + word;
    } else {
      chunks.push(buffer);
      buffer = word;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}

function stripMarkdown(md: string): string {
  return (
    md
      // Remove images ![alt](url)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
      // Convert links [text](url) → text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // Remove headings
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold/italic markers
      .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, "$2")
      // Remove inline code
      .replace(/`([^`]+)`/g, "$1")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove blockquotes
      .replace(/^>\s?/gm, "")
      // Remove horizontal rules
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // Remove list markers
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      // Collapse multiple spaces
      .replace(/ {2,}/g, " ")
  );
}
