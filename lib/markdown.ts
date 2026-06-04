export type InlineToken =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "code"; text: string }
  | { type: "image"; alt: string; url: string };

export type ArticleBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; content: InlineToken[] }
  | { type: "paragraph"; content: InlineToken[] }
  | { type: "blockquote"; content: InlineToken[] }
  | { type: "list"; ordered: boolean; items: InlineToken[][] }
  | { type: "code"; language: string; code: string }
  | { type: "mermaid"; code: string }
  | {
      type: "table";
      headers: string[];
      alignments: TableAlignment[];
      rows: string[][];
    }
  | { type: "tweet"; url: string; tweetId: string };

export type TableAlignment = "left" | "center" | "right";

export type XArticleAsset =
  | {
      id: number;
      placeholder: string;
      type: "code" | "mermaid";
      label: string;
      code: string;
      language?: string;
    }
  | {
      id: number;
      placeholder: string;
      type: "table";
      label: string;
      headers: string[];
      alignments: TableAlignment[];
      rows: string[][];
    }
  | {
      id: number;
      placeholder: string;
      type: "tweet";
      label: string;
      url: string;
      tweetId: string;
    };

export type XArticleClipboard = {
  title: string;
  titleHtml: string;
  bodyText: string;
  bodyHtml: string;
  fullText: string;
  fullHtml: string;
  assets: XArticleAsset[];
};

export type XArticleClipboardOptions = {
  codeMode?: "quote" | "image";
};

const headingPattern = /^(#{1,6})\s+(.+)$/;
const unorderedListPattern = /^[-*]\s+(.+)$/;
const orderedListPattern = /^\d+[.)]\s+(.+)$/;
const blockquotePattern = /^>\s?(.*)$/;
const fencePattern = /^```([a-zA-Z0-9_-]*)\s*$/;
const tweetUrlPattern =
  /^https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/(\d+)(?:[?#][^\s]*)?$/;

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
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        content: parseInline(heading[2].trim()),
      });
      index += 1;
      continue;
    }

    if (blockquotePattern.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const current = lines[index];
        const match = current.match(blockquotePattern);

        if (!match) {
          break;
        }

        quoteLines.push(match[1].trim());
        index += 1;
      }

      blocks.push({
        type: "blockquote",
        content: parseInline(quoteLines.join(" ")),
      });
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

    const table = parseTableAt(lines, index);
    if (table) {
      blocks.push(table.block);
      index = table.nextIndex;
      continue;
    }

    const tweet = line.trim().match(tweetUrlPattern);
    if (tweet) {
      blocks.push({ type: "tweet", url: line.trim(), tweetId: tweet[1] });
      index += 1;
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

export function toXArticleClipboard(
  source: string,
  options: XArticleClipboardOptions = {},
): XArticleClipboard {
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
  const body = blocksToXArticleBody(bodyBlocks, {
    codeMode: options.codeMode ?? "quote",
  });
  const bodyText = body.text;
  const bodyHtml = body.html;
  const fullText = [title, bodyText].filter(Boolean).join("\n\n");
  const fullHtml = [titleHtml, bodyHtml].filter(Boolean).join("");

  return {
    title,
    titleHtml,
    bodyText,
    bodyHtml,
    fullText,
    fullHtml,
    assets: body.assets,
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
        case "blockquote":
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
        case "table":
          return [
            `| ${block.headers.join(" | ")} |`,
            `| ${block.alignments.map(alignmentToMarkdown).join(" | ")} |`,
            ...block.rows.map((row) => `| ${row.join(" | ")} |`),
          ].join("\n");
        case "tweet":
          return block.url;
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

function blocksToXArticleBody(
  blocks: ArticleBlock[],
  options: Required<XArticleClipboardOptions>,
): {
  text: string;
  html: string;
  assets: XArticleAsset[];
} {
  const textParts: string[] = [];
  const htmlParts: string[] = [];
  const assets: XArticleAsset[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        textParts.push(inlineToText(block.content));
        htmlParts.push(
          `<h${block.level}>${inlineToHtml(block.content)}</h${block.level}>`,
        );
        break;
      case "paragraph":
        textParts.push(inlineToText(block.content));
        htmlParts.push(`<p>${inlineToHtml(block.content)}</p>`);
        break;
      case "blockquote":
        textParts.push(inlineToText(block.content));
        htmlParts.push(`<blockquote>${inlineToHtml(block.content)}</blockquote>`);
        break;
      case "list": {
        textParts.push(
          block.items
            .map((item, index) => {
              const marker = block.ordered ? `${index + 1}.` : "-";
              return `${marker} ${inlineToText(item)}`;
            })
            .join("\n"),
        );

        const tag = block.ordered ? "ol" : "ul";
        const items = block.items
          .map((item) => `<li>${inlineToHtml(item)}</li>`)
          .join("");
        htmlParts.push(`<${tag}>${items}</${tag}>`);
        break;
      }
      case "code":
        if (options.codeMode === "quote") {
          textParts.push(
            [block.language ? `[${block.language}]` : "", block.code]
              .filter(Boolean)
              .join("\n"),
          );
          htmlParts.push(codeBlockToQuoteHtml(block));
          break;
        }
      // Fall through when code blocks should become image placeholders.
      case "table":
      case "mermaid": {
        const id = assets.length + 1;
        const placeholder = `XIMGPH_${id}`;
        const label = imageAssetLabel(block.type, id);
        if (block.type === "table") {
          assets.push({
            id,
            placeholder,
            type: "table",
            label,
            headers: block.headers,
            alignments: block.alignments,
            rows: block.rows,
          });
        } else {
          assets.push({
            id,
            placeholder,
            type: block.type,
            label,
            code: block.code,
            ...(block.type === "code" ? { language: block.language } : {}),
          });
        }
        textParts.push(placeholder);
        htmlParts.push(
          `<p><span data-x-asset-placeholder="${placeholder}">${placeholder}</span></p>`,
        );
        break;
      }
      case "tweet": {
        const id = assets.length + 1;
        const placeholder = `XTWEET_${id}`;
        assets.push({
          id,
          placeholder,
          type: "tweet",
          label: `Tweet embed ${id}`,
          url: block.url,
          tweetId: block.tweetId,
        });
        textParts.push(block.url);
        htmlParts.push(
          `<p><a href="${escapeAttribute(block.url)}">${escapeHtml(
            block.url,
          )}</a></p>`,
        );
        break;
      }
    }
  }

  return {
    text: textParts.filter(Boolean).join("\n\n"),
    html: htmlParts.join(""),
    assets,
  };
}

function imageAssetLabel(type: "code" | "mermaid" | "table", id: number) {
  if (type === "code") return `Code image ${id}`;
  if (type === "table") return `Table image ${id}`;
  return `Mermaid image ${id}`;
}

function codeBlockToQuoteHtml(block: Extract<ArticleBlock, { type: "code" }>) {
  const label = block.language
    ? `<strong>[${escapeHtml(block.language)}]</strong><br>`
    : "";
  return `<blockquote>${label}${escapeHtml(block.code).replaceAll(
    "\n",
    "<br>",
  )}</blockquote>`;
}

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Match **bold** (with greedy match including internal *), then *italic*, then code, images and links
  const tokenPattern = /(\*\*(?:[^*]|\*(?!\*))+?\*\*|\*[^*]+?\*|`[^`]+`|!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push({ type: "text", text: text.slice(cursor, match.index) });
    }

    const raw = match[0];
    if (raw.startsWith("**") && raw.endsWith("**")) {
      tokens.push({ type: "strong", text: raw.slice(2, -2) });
    } else if (raw.startsWith("*") && raw.endsWith("*")) {
      tokens.push({ type: "em", text: raw.slice(1, -1) });
    } else if (raw.startsWith("`")) {
      tokens.push({ type: "code", text: raw.slice(1, -1) });
    } else if (raw.startsWith("![")) {
      const image = raw.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (image) {
        tokens.push({ type: "image", alt: image[1], url: image[2] });
      }
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

      if (token.type === "image") {
        return token.alt;
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
        case "em":
          return `<em>${escapeHtml(token.text)}</em>`;
        case "code":
          return `<code>${escapeHtml(token.text)}</code>`;
        case "link":
          return `<a href="${escapeAttribute(token.href)}">${escapeHtml(
            token.text,
          )}</a>`;
        case "image":
          return `<img src="${escapeAttribute(token.url)}" alt="${escapeAttribute(token.alt)}" style="max-width: 100%;" />`;
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
    !orderedListPattern.test(line) &&
    !blockquotePattern.test(line) &&
    !tweetUrlPattern.test(line.trim())
  );
}

function parseTableAt(
  lines: string[],
  index: number,
): { block: Extract<ArticleBlock, { type: "table" }>; nextIndex: number } | null {
  const headerLine = lines[index]?.trim() ?? "";
  const separatorLine = lines[index + 1]?.trim() ?? "";
  if (!isTableRow(headerLine) || !isTableSeparator(separatorLine)) {
    return null;
  }

  const headers = splitTableRow(headerLine);
  const separator = splitTableRow(separatorLine);
  if (headers.length < 2 || separator.length !== headers.length) {
    return null;
  }

  const rows: string[][] = [];
  let cursor = index + 2;
  while (cursor < lines.length && isTableRow(lines[cursor].trim())) {
    const cells = splitTableRow(lines[cursor].trim());
    rows.push(padRow(cells, headers.length));
    cursor += 1;
  }

  return {
    block: {
      type: "table",
      headers,
      alignments: separator.map(parseAlignment),
      rows,
    },
    nextIndex: cursor,
  };
}

function isTableRow(line: string) {
  return line.includes("|") && splitTableRow(line).length >= 2;
}

function isTableSeparator(line: string) {
  if (!isTableRow(line)) return false;
  return splitTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function splitTableRow(line: string) {
  let value = line.trim();
  if (value.startsWith("|")) value = value.slice(1);
  if (value.endsWith("|")) value = value.slice(0, -1);
  return value.split("|").map((cell) => cell.trim());
}

function padRow(row: string[], length: number) {
  return Array.from({ length }, (_, index) => row[index] ?? "");
}

function parseAlignment(cell: string): TableAlignment {
  const left = cell.startsWith(":");
  const right = cell.endsWith(":");
  if (left && right) return "center";
  if (right) return "right";
  return "left";
}

function alignmentToMarkdown(alignment: TableAlignment) {
  if (alignment === "center") return ":---:";
  if (alignment === "right") return "---:";
  return "---";
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
