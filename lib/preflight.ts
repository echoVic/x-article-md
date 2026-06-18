import { type ArticleBlock, type InlineToken, computeBlockOffsets } from "./markdown";

export type PreflightLevel = "info" | "warning" | "error";
export type PreflightKind =
  | "heading"
  | "paragraph"
  | "list"
  | "blockquote"
  | "code"
  | "table"
  | "mermaid"
  | "tweet"
  | "image"
  | "latex"
  | "footnote"
  | "hr"
  | "strikethrough"
  | "html";

export type PreflightItem = {
  id: string;
  level: PreflightLevel;
  kind: PreflightKind;
  message: string;
  blockIndex?: number;
  sourceOffset?: number;
};

export type PreflightReport = {
  status: "ok" | "warning" | "blocked";
  summary: {
    readyCount: number;
    assetCount: number;
    warningCount: number;
    unsupportedCount: number;
  };
  items: PreflightItem[];
};

const footnotePattern = /\[\^[^\]]+\]/gm;
const latexBlockPattern = /\$\$[\s\S]+?\$\$/gm;
const latexInlinePattern = /(?<!\$)\$(?!\$)([^$\n]+?)\$/gm;
const iframePattern = /<iframe[\s\S]*?>/gim;
const hrPattern = /^(?:---+|___+|\*\*\*+)\s*$/gm;
const strikethroughPattern = /~~[^~]+~~/gm;

export function runPreflight(
  blocks: ArticleBlock[],
  rawMarkdown: string,
  codeMode: "quote" | "image",
): PreflightReport {
  const items: PreflightItem[] = [];
  const offsets = computeBlockOffsets(rawMarkdown);
  let idCounter = 0;

  function nextId() {
    idCounter += 1;
    return `pf-${idCounter}`;
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const offset = offsets[i];

    switch (block.type) {
      case "heading": {
        const text = inlineToPlainText(block.content);
        items.push({
          id: nextId(),
          level: "info",
          kind: "heading",
          message: `H${block.level}: ${truncate(text, 40)}`,
          blockIndex: i,
          sourceOffset: offset,
        });
        if (text.length > 100) {
          items.push({
            id: nextId(),
            level: "warning",
            kind: "heading",
            message: `Heading too long (${text.length} chars)`,
            blockIndex: i,
            sourceOffset: offset,
          });
        }
        checkInlineImages(block.content, i, offset, items, nextId);
        break;
      }
      case "paragraph": {
        items.push({
          id: nextId(),
          level: "info",
          kind: "paragraph",
          message: `Paragraph: ${truncate(inlineToPlainText(block.content), 40)}`,
          blockIndex: i,
          sourceOffset: offset,
        });
        checkInlineImages(block.content, i, offset, items, nextId);
        break;
      }
      case "blockquote": {
        items.push({
          id: nextId(),
          level: "info",
          kind: "blockquote",
          message: `Blockquote: ${truncate(inlineToPlainText(block.content), 40)}`,
          blockIndex: i,
          sourceOffset: offset,
        });
        checkInlineImages(block.content, i, offset, items, nextId);
        break;
      }
      case "list": {
        items.push({
          id: nextId(),
          level: "info",
          kind: "list",
          message: `${block.ordered ? "Ordered" : "Unordered"} list (${block.items.length} items)`,
          blockIndex: i,
          sourceOffset: offset,
        });
        for (const item of block.items) {
          checkInlineImages(item, i, offset, items, nextId);
        }
        break;
      }
      case "code": {
        if (codeMode === "image") {
          items.push({
            id: nextId(),
            level: "info",
            kind: "code",
            message: `Code block → PNG${block.language ? ` (${block.language})` : ""}`,
            blockIndex: i,
            sourceOffset: offset,
          });
        } else {
          items.push({
            id: nextId(),
            level: "info",
            kind: "code",
            message: `Code block → blockquote${block.language ? ` (${block.language})` : ""}`,
            blockIndex: i,
            sourceOffset: offset,
          });
        }
        break;
      }
      case "mermaid": {
        items.push({
          id: nextId(),
          level: "info",
          kind: "mermaid",
          message: "Mermaid diagram → PNG",
          blockIndex: i,
          sourceOffset: offset,
        });
        break;
      }
      case "table": {
        items.push({
          id: nextId(),
          level: "info",
          kind: "table",
          message: `Table (${block.headers.length} cols, ${block.rows.length} rows) → PNG`,
          blockIndex: i,
          sourceOffset: offset,
        });
        break;
      }
      case "tweet": {
        items.push({
          id: nextId(),
          level: "info",
          kind: "tweet",
          message: "Tweet embed → link + asset",
          blockIndex: i,
          sourceOffset: offset,
        });
        break;
      }
    }
  }

  // Scan raw markdown for unsupported content
  scanPattern(rawMarkdown, footnotePattern, "footnote", "Footnote reference detected", items, nextId);
  scanPattern(rawMarkdown, latexBlockPattern, "latex", "LaTeX block detected", items, nextId);
  scanPattern(rawMarkdown, latexInlinePattern, "latex", "Inline LaTeX detected", items, nextId);
  scanPattern(rawMarkdown, iframePattern, "html", "iframe detected", items, nextId);
  scanPattern(rawMarkdown, hrPattern, "hr", "Horizontal rule (not supported)", items, nextId);
  scanPattern(rawMarkdown, strikethroughPattern, "strikethrough", "Strikethrough (not supported)", items, nextId);

  const readyCount = items.filter(
    (it) => it.level === "info" && !isAssetKind(it.kind, codeMode),
  ).length;
  const assetCount = items.filter(
    (it) => it.level === "info" && isAssetKind(it.kind, codeMode),
  ).length;
  const warningCount = items.filter((it) => it.level === "warning").length;
  const unsupportedCount = items.filter((it) => it.level === "error").length;

  let status: PreflightReport["status"] = "ok";
  if (unsupportedCount > 0) status = "blocked";
  else if (warningCount > 0) status = "warning";

  return {
    status,
    summary: { readyCount, assetCount, warningCount, unsupportedCount },
    items,
  };
}

function isAssetKind(kind: PreflightKind, codeMode: "quote" | "image"): boolean {
  if (kind === "mermaid" || kind === "table" || kind === "tweet") return true;
  if (kind === "code" && codeMode === "image") return true;
  return false;
}

function checkInlineImages(
  tokens: InlineToken[],
  blockIndex: number,
  sourceOffset: number | undefined,
  items: PreflightItem[],
  nextId: () => string,
) {
  for (const token of tokens) {
    if (token.type === "image" && /^https?:\/\//.test(token.url)) {
      items.push({
        id: nextId(),
        level: "warning",
        kind: "image",
        message: `Remote image won't auto-upload: ${truncate(token.url, 50)}`,
        blockIndex,
        sourceOffset,
      });
    }
  }
}

function scanPattern(
  raw: string,
  pattern: RegExp,
  kind: PreflightKind,
  message: string,
  items: PreflightItem[],
  nextId: () => string,
) {
  const regex = new RegExp(pattern.source, pattern.flags);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    items.push({
      id: nextId(),
      level: "error",
      kind,
      message,
      sourceOffset: match.index,
    });
  }
}

function inlineToPlainText(tokens: InlineToken[]): string {
  return tokens
    .map((t) => {
      if (t.type === "image") return t.alt;
      if (t.type === "link") return t.text;
      return t.text;
    })
    .join("");
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}
