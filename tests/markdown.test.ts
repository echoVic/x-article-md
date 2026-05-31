import { describe, expect, it } from "vitest";
import {
  parseMarkdown,
  toXArticleClipboard,
  toXArticleText,
} from "@/lib/markdown";

describe("parseMarkdown", () => {
  it("parses headings, paragraphs, inline emphasis, links, lists, code, and mermaid blocks", () => {
    const blocks = parseMarkdown(`# Launch Notes

This is **bold** with [a link](https://x.com) and \`inline code\`.

- First point
- Second **point**

\`\`\`ts
const ship = true;
\`\`\`

\`\`\`mermaid
graph TD
  A[Markdown] --> B[X Articles]
\`\`\`
`);

    expect(blocks).toEqual([
      {
        type: "heading",
        level: 1,
        content: [{ type: "text", text: "Launch Notes" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "This is " },
          { type: "strong", text: "bold" },
          { type: "text", text: " with " },
          { type: "link", text: "a link", href: "https://x.com" },
          { type: "text", text: " and " },
          { type: "code", text: "inline code" },
          { type: "text", text: "." },
        ],
      },
      {
        type: "list",
        ordered: false,
        items: [
          [{ type: "text", text: "First point" }],
          [
            { type: "text", text: "Second " },
            { type: "strong", text: "point" },
          ],
        ],
      },
      { type: "code", language: "ts", code: "const ship = true;" },
      { type: "mermaid", code: "graph TD\n  A[Markdown] --> B[X Articles]" },
    ]);
  });
});

describe("toXArticleText", () => {
  it("serializes supported Markdown into copyable article text", () => {
    const text = toXArticleText(`# Launch Notes

This is **bold** with [a link](https://x.com).

1. Draft in Markdown
2. Copy to X Articles

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
`);

    expect(text).toBe(
      [
        "Launch Notes",
        "",
        "This is bold with a link (https://x.com).",
        "",
        "1. Draft in Markdown",
        "2. Copy to X Articles",
        "",
        "[Mermaid diagram]",
        "graph TD",
        "  A --> B",
      ].join("\n"),
    );
  });
});

describe("toXArticleClipboard", () => {
  it("renders code blocks as X-friendly blockquotes by default", () => {
    const clipboard = toXArticleClipboard(`# Launch Notes

This is **bold** with [a link](https://x.com).

## Details

- First point
- Second point

\`\`\`ts
const ship = true;
\`\`\`
`);

    expect(clipboard.title).toBe("Launch Notes");
    expect(clipboard.bodyText).toBe(
      [
        "This is bold with a link (https://x.com).",
        "",
        "Details",
        "",
        "- First point",
        "- Second point",
        "",
        "[ts]",
        "const ship = true;",
      ].join("\n"),
    );
    expect(clipboard.bodyHtml).toContain("<p>This is <strong>bold</strong>");
    expect(clipboard.bodyHtml).toContain(
      '<a href="https://x.com">a link</a>',
    );
    expect(clipboard.bodyHtml).toContain("<h2>Details</h2>");
    expect(clipboard.bodyHtml).toContain("<ul>");
    expect(clipboard.bodyHtml).toContain("<li>First point</li>");
    expect(clipboard.bodyHtml).toContain(
      "<blockquote><strong>[ts]</strong><br>const ship = true;</blockquote>",
    );
    expect(clipboard.bodyHtml).not.toContain("<pre><code>");
    expect(clipboard.assets).toEqual([]);
  });

  it("can render code blocks as image placeholders when requested", () => {
    const clipboard = toXArticleClipboard(
      `# Launch Notes

\`\`\`ts
const ship = true;
\`\`\`
`,
      {
        codeMode: "image",
      },
    );

    expect(clipboard.bodyText).toBe("XIMGPH_1");
    expect(clipboard.bodyHtml).toContain(
      '<p><span data-x-asset-placeholder="XIMGPH_1">XIMGPH_1</span></p>',
    );
    expect(clipboard.assets).toEqual([
      {
        id: 1,
        placeholder: "XIMGPH_1",
        type: "code",
        label: "Code image 1",
        code: "const ship = true;",
        language: "ts",
      },
    ]);
  });

  it("marks Mermaid blocks as image insertion points instead of raw diagram source", () => {
    const clipboard = toXArticleClipboard(`Intro paragraph.

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
`);

    expect(clipboard.bodyText).toBe(
      ["Intro paragraph.", "", "XIMGPH_1"].join("\n"),
    );
    expect(clipboard.bodyHtml).toContain(
      '<p><span data-x-asset-placeholder="XIMGPH_1">XIMGPH_1</span></p>',
    );
    expect(clipboard.bodyHtml).not.toContain("graph TD");
    expect(clipboard.assets).toEqual([
      {
        id: 1,
        placeholder: "XIMGPH_1",
        type: "mermaid",
        label: "Mermaid image 1",
        code: "graph TD\n  A --> B",
      },
    ]);
  });
});
