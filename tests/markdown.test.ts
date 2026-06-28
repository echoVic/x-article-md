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

  it("parses italic and bold-italic combinations", () => {
    const blocks = parseMarkdown(`This is *italic* text.

This is **bold** and *italic* mixed.

This is **bold with *italic* inside**.`);

    expect(blocks).toEqual([
      {
        type: "paragraph",
        content: [
          { type: "text", text: "This is " },
          { type: "em", text: "italic" },
          { type: "text", text: " text." },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "This is " },
          { type: "strong", text: "bold" },
          { type: "text", text: " and " },
          { type: "em", text: "italic" },
          { type: "text", text: " mixed." },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "This is " },
          { type: "strong", text: "bold with *italic* inside" },
          { type: "text", text: "." },
        ],
      },
    ]);
  });

  it("parses h4-h6 headings correctly", () => {
    const blocks = parseMarkdown(`# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading
`);

    expect(blocks).toEqual([
      {
        type: "heading",
        level: 1,
        content: [{ type: "text", text: "H1 Heading" }],
      },
      {
        type: "heading",
        level: 2,
        content: [{ type: "text", text: "H2 Heading" }],
      },
      {
        type: "heading",
        level: 3,
        content: [{ type: "text", text: "H3 Heading" }],
      },
      {
        type: "heading",
        level: 4,
        content: [{ type: "text", text: "H4 Heading" }],
      },
      {
        type: "heading",
        level: 5,
        content: [{ type: "text", text: "H5 Heading" }],
      },
      {
        type: "heading",
        level: 6,
        content: [{ type: "text", text: "H6 Heading" }],
      },
    ]);
  });

  it("parses markdown tables and standalone X status URLs", () => {
    const blocks = parseMarkdown(`| Name | Value |
| --- | ---: |
| Alpha | 42 |

https://x.com/jack/status/20
`);

    expect(blocks).toEqual([
      {
        type: "table",
        headers: ["Name", "Value"],
        alignments: ["left", "right"],
        rows: [["Alpha", "42"]],
      },
      {
        type: "tweet",
        url: "https://x.com/jack/status/20",
        tweetId: "20",
      },
    ]);
  });

  it("parses single-line blockquote", () => {
    const blocks = parseMarkdown(`> This is a quote`);

    expect(blocks).toEqual([
      {
        type: "blockquote",
        content: [{ type: "text", text: "This is a quote" }],
      },
    ]);
  });

  it("parses multi-line blockquote", () => {
    const blocks = parseMarkdown(`> First line
> Second line
> Third line`);

    expect(blocks).toEqual([
      {
        type: "blockquote",
        content: [
          { type: "text", text: "First line Second line Third line" },
        ],
      },
    ]);
  });

  it("parses blockquote with inline formatting", () => {
    const blocks = parseMarkdown(
      `> This is **bold** and *italic* with [a link](https://x.com) and \`code\`.`,
    );

    expect(blocks).toEqual([
      {
        type: "blockquote",
        content: [
          { type: "text", text: "This is " },
          { type: "strong", text: "bold" },
          { type: "text", text: " and " },
          { type: "em", text: "italic" },
          { type: "text", text: " with " },
          { type: "link", text: "a link", href: "https://x.com" },
          { type: "text", text: " and " },
          { type: "code", text: "code" },
          { type: "text", text: "." },
        ],
      },
    ]);
  });

  it("parses inline images", () => {
    const blocks = parseMarkdown(
      `This is text with ![an image](https://example.com/image.png) inline.`,
    );

    expect(blocks).toEqual([
      {
        type: "paragraph",
        content: [
          { type: "text", text: "This is text with " },
          { type: "image", alt: "an image", url: "https://example.com/image.png" },
          { type: "text", text: " inline." },
        ],
      },
    ]);
  });

  it("parses block-level images", () => {
    const blocks = parseMarkdown(`![Block image](https://example.com/photo.jpg)`);

    expect(blocks).toEqual([
      {
        type: "paragraph",
        content: [
          { type: "image", alt: "Block image", url: "https://example.com/photo.jpg" },
        ],
      },
    ]);
  });

  it("parses images with empty alt text", () => {
    const blocks = parseMarkdown(`![](https://example.com/image.png)`);

    expect(blocks).toEqual([
      {
        type: "paragraph",
        content: [
          { type: "image", alt: "", url: "https://example.com/image.png" },
        ],
      },
    ]);
  });

  it("parses multiple images in the same paragraph", () => {
    const blocks = parseMarkdown(
      `![First](https://example.com/1.png) and ![Second](https://example.com/2.png)`,
    );

    expect(blocks).toEqual([
      {
        type: "paragraph",
        content: [
          { type: "image", alt: "First", url: "https://example.com/1.png" },
          { type: "text", text: " and " },
          { type: "image", alt: "Second", url: "https://example.com/2.png" },
        ],
      },
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

    expect(clipboard.bodyText).toBe(
      "\n📷 [Code image 1 — paste from Assets panel]\n",
    );
    expect(clipboard.bodyHtml).toContain(
      "<p>📷 <em>[Code image 1 — paste from Assets panel]</em></p>",
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
      "Intro paragraph.\n\n\n📷 [Mermaid image 1 — paste from Assets panel]\n",
    );
    expect(clipboard.bodyHtml).toContain(
      "<p>📷 <em>[Mermaid image 1 — paste from Assets panel]</em></p>",
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

  it("turns markdown tables into PNG assets and keeps tweet URLs as embed hints", () => {
    const clipboard = toXArticleClipboard(`# Mixed Assets

| Name | Value |
| --- | ---: |
| Alpha | 42 |

https://twitter.com/jack/status/20
`);

    expect(clipboard.bodyText).toBe(
      "\n📷 [Table image 1 — paste from Assets panel]\n\n\nhttps://twitter.com/jack/status/20",
    );
    expect(clipboard.bodyHtml).toContain(
      "<p>📷 <em>[Table image 1 — paste from Assets panel]</em></p>",
    );
    expect(clipboard.bodyHtml).toContain(
      '<p><a href="https://twitter.com/jack/status/20">https://twitter.com/jack/status/20</a></p>',
    );
    expect(clipboard.assets).toEqual([
      {
        id: 1,
        placeholder: "XIMGPH_1",
        type: "table",
        label: "Table image 1",
        headers: ["Name", "Value"],
        alignments: ["left", "right"],
        rows: [["Alpha", "42"]],
      },
      {
        id: 2,
        placeholder: "XTWEET_2",
        type: "tweet",
        label: "Tweet embed 2",
        url: "https://twitter.com/jack/status/20",
        tweetId: "20",
      },
    ]);
  });
});
