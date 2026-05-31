export type InlineToken =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "code"; text: string };

export type ArticleBlock =
  | { type: "heading"; level: 1 | 2 | 3; content: InlineToken[] }
  | { type: "paragraph"; content: InlineToken[] }
  | { type: "list"; ordered: boolean; items: InlineToken[][] }
  | { type: "code"; language: string; code: string }
  | { type: "mermaid"; code: string };

export type XArticleClipboard = {
  title: string;
  titleHtml: string;
  bodyText: string;
  bodyHtml: string;
  fullText: string;
  fullHtml: string;
};

const headingPattern = /^(#{1,3})\s+(.+)$/;
const unorderedListPattern = /^[-*]\s+(.+)$/;
const orderedListPattern = /^\d+[.)]\s+(.+)$/;
const fencePattern = /^```([a-zA-Z0-9_-]*)\s*$/;

export function parseMarkdown(source: string): ArticleBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ArticleBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(fencePattern);
    if (fence) {
      const language = fence[1] ?? "";
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      const code = trimCodeBlock(codeLines);
      if (language.toLowerCase() === "mermaid") {
        blocks.push({ type: "mermaid", code });
      } else {
        blocks.push({ type: "code", language, code });
      }
      continue;
    }

    const heading = line.match(headingPattern);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3,
        content: parseInline(heading[2].trim()),
      });
      index += 1;
      continue;
    }

    if (unorderedListPattern.test(line) || orderedListPattern.test(line)) {
      const ordered = orderedListPattern.test(line);
      const items: InlineToken[][] = [];

      while (index < lines.length) {
        const current = lines[index];
        const match = ordered
          ? current.match(orderedListPattern)
          : current.match(unorderedListPattern);

        if (!match) {
          break;
        }

        items.push(parseInline(match[1].trim()));
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && isParagraphLine(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      content: parseInline(paragraphLines.join(" ")),
    });
  }

  return blocks;
}

export function toXArticleText(source: string): string {
  return blocksToText(parseMarkdown(source), "source");
}

export function toXArticleClipboard(source: string): XArticleClipboard {
  const blocks = parseMarkdown(source);
  const firstBlock = blocks[0];
  const titleBlock =
    firstBlock?.type === "heading" && firstBlock.level === 1
      ? firstBlock
      : undefined;
  const title = titleBlock ? inlineToText(titleBlock.content) : "";
  const titleHtml = titleBlock
    ? `<h1>${inlineToHtml(titleBlock.content)}</h1>`
    : "";
  const bodyBlocks = titleBlock ? blocks.slice(1) : blocks;
  const bodyText = blocksToText(bodyBlocks, "placeholder");
  const bodyHtml = blocksToHtml(bodyBlocks);
  const fullText = [title, bodyText].filter(Boolean).join("\n\n");
  const fullHtml = [titleHtml, bodyHtml].filter(Boolean).join("");

  return {
    title,
    titleHtml,
    bodyText,
    bodyHtml,
    fullText,
    fullHtml,
  };
}

function blocksToText(
  blocks: ArticleBlock[],
  assetMode: "source" | "placeholder",
): string {
  const assetCounts = { code: 0, mermaid: 0 };

  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
        case "paragraph":
          return inlineToText(block.content);
        case "list":
          return block.items
            .map((item, index) => {
              const marker = block.ordered ? `${index + 1}.` : "-";
              return `${marker} ${inlineToText(item)}`;
            })
            .join("\n");
        case "code":
          if (assetMode === "source") {
            return block.code;
          }
          assetCounts.code += 1;
          return `[Insert code image ${assetCounts.code}]`;
        case "mermaid":
          if (assetMode === "source") {
            return `[Mermaid diagram]\n${block.code}`;
          }
          assetCounts.mermaid += 1;
          return `[Insert Mermaid image ${assetCounts.mermaid}]`;
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

function blocksToHtml(blocks: ArticleBlock[]): string {
  const assetCounts = { code: 0, mermaid: 0 };

  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading":
          return `<h${block.level}>${inlineToHtml(block.content)}</h${block.level}>`;
        case "paragraph":
          return `<p>${inlineToHtml(block.content)}</p>`;
        case "list": {
          const tag = block.ordered ? "ol" : "ul";
          const items = block.items
            .map((item) => `<li>${inlineToHtml(item)}</li>`)
            .join("");
          return `<${tag}>${items}</${tag}>`;
        }
        case "code":
          assetCounts.code += 1;
          return `<p><em>[Insert code image ${assetCounts.code}]</em></p>`;
        case "mermaid":
          assetCounts.mermaid += 1;
          return `<p><em>[Insert Mermaid image ${assetCounts.mermaid}]</em></p>`;
      }
    })
    .join("");
}

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const tokenPattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push({ type: "text", text: text.slice(cursor, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith("**")) {
      tokens.push({ type: "strong", text: raw.slice(2, -2) });
    } else if (raw.startsWith("`")) {
      tokens.push({ type: "code", text: raw.slice(1, -1) });
    } else {
      const link = raw.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        tokens.push({ type: "link", text: link[1], href: link[2] });
      }
    }

    cursor = match.index + raw.length;
  }

  if (cursor < text.length) {
    tokens.push({ type: "text", text: text.slice(cursor) });
  }

  return tokens;
}

export function inlineToText(tokens: InlineToken[]): string {
  return tokens
    .map((token) => {
      if (token.type === "link") {
        return `${token.text} (${token.href})`;
      }

      return token.text;
    })
    .join("");
}

export function inlineToHtml(tokens: InlineToken[]): string {
  return tokens
    .map((token) => {
      switch (token.type) {
        case "text":
          return escapeHtml(token.text);
        case "strong":
          return `<strong>${escapeHtml(token.text)}</strong>`;
        case "code":
          return `<code>${escapeHtml(token.text)}</code>`;
        case "link":
          return `<a href="${escapeAttribute(token.href)}">${escapeHtml(
            token.text,
          )}</a>`;
      }
    })
    .join("");
}

function isParagraphLine(line: string): boolean {
  return (
    Boolean(line.trim()) &&
    !headingPattern.test(line) &&
    !fencePattern.test(line) &&
    !unorderedListPattern.test(line) &&
    !orderedListPattern.test(line)
  );
}

function trimCodeBlock(lines: string[]): string {
  return lines.join("\n").replace(/\n+$/, "");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', "&quot;");
}
