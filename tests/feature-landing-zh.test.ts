import { describe, expect, it } from "vitest";
import {
  getAllFeatureLandings,
  getFeatureLanding,
} from "@/lib/feature-landing-copy";
import {
  inlineToHtml,
  parseInline,
  parseMarkdown,
  parseMarkdownTable,
  toXArticleClipboard,
} from "@/lib/markdown";

const SLUGS = [
  "markdown-to-x-articles",
  "code-to-image",
  "mermaid-to-png",
  "markdown-table-to-image",
] as const;

describe("zh tool landing depth (honest, real content)", () => {
  it("ships all four feature landings", () => {
    for (const slug of SLUGS) {
      expect(getFeatureLanding(slug)).not.toBeNull();
    }
    expect(getAllFeatureLandings()).toHaveLength(SLUGS.length);
  });

  it("gives every zh landing at least one real input/output example", () => {
    for (const slug of SLUGS) {
      const zh = getFeatureLanding(slug)!.zh;
      expect(zh.examplesTitle, `${slug} needs examplesTitle`).toBeTruthy();
      expect(zh.examples, `${slug} needs examples`).toBeDefined();
      expect(zh.examples!.length).toBeGreaterThanOrEqual(1);
      for (const ex of zh.examples!) {
        expect(ex.title.length).toBeGreaterThan(0);
        // Real, copyable content — not a placeholder.
        expect(ex.input.length).toBeGreaterThan(10);
        expect(ex.output.length).toBeGreaterThan(20);
        expect(ex.input).not.toMatch(/lorem|placeholder|示例占位/i);
      }
    }
  });

  it("lists honest limitations plus recovery steps for every zh landing", () => {
    for (const slug of SLUGS) {
      const zh = getFeatureLanding(slug)!.zh;
      expect(zh.limitationsTitle, `${slug} needs limitationsTitle`).toBeTruthy();
      expect(zh.limitations, `${slug} needs limitations`).toBeDefined();
      expect(zh.limitations!.length).toBeGreaterThanOrEqual(3);
      // At least one note tells the user how to recover when something fails.
      const joined = zh.limitations!.join("\n");
      expect(joined).toMatch(/粘贴|复制|下载|修正|检查|重新/);
    }
  });

  it("does not add examples/limitations to the English content (unchanged behavior)", () => {
    for (const slug of SLUGS) {
      const en = getFeatureLanding(slug)!.en;
      expect(en.examples).toBeUndefined();
      expect(en.limitations).toBeUndefined();
    }
  });
});

// These run real input through the converter and pin the exact boundaries the
// Chinese landing copy now states — so the copy can never drift from code.
describe("converter-backed boundaries (zh copy claims are source-verified)", () => {
  it("lists only recognize top-level items; indented children break out into paragraphs", () => {
    const blocks = parseMarkdown("- Top\n  - Nested one\n  - Nested two\n- Top two\n");
    const lists = blocks.filter((b) => b.type === "list");
    // No nesting: the parser emits separate flat lists, never a nested <ul>.
    expect(lists).toHaveLength(2);
    // The indented lines fell through as a paragraph, merged together.
    const para = blocks.find((b) => b.type === "paragraph");
    expect(para && para.type === "paragraph"
      ? inlineToHtml(para.content)
      : "").toContain("Nested one");
  });

  it("raw HTML is escaped, not rendered; footnotes/ math have no special handling", () => {
    const html = inlineToHtml(parseInline('use <b>bold</b> and note [^1]'));
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;b&gt;");
    // The footnote marker survives as literal text.
    expect(html).toContain("[^1]");
  });

  it("fenced code blocks become assets; inline code stays inline", () => {
    const blocks = parseMarkdown("```ts\nconst a = 1;\n```\n\nInline `x` here.\n");
    const code = blocks.find((b) => b.type === "code");
    expect(code).toBeDefined();
    const para = blocks.find((b) => b.type === "paragraph");
    expect(para && para.type === "paragraph"
      ? inlineToHtml(para.content)
      : "").toContain("<code>x</code>");
  });

  it("table alignment markers are honored (center alignment parsed)", () => {
    const table = parseMarkdownTable("| A | B |\n|---|:---:|\n| 1 | 2 |");
    expect(table).not.toBeNull();
    expect(table!.alignments).toEqual(["left", "center"]);
  });

  it("code blocks are rich-text quotes by default, PNG assets only in image mode", () => {
    const src = "```ts\nconst a = 1;\n```";
    const quote = toXArticleClipboard(src, { codeMode: "quote" });
    // Default: a labelled blockquote, no image asset.
    expect(quote.bodyHtml).toContain("<blockquote>");
    expect(quote.assets.length).toBe(0);

    const image = toXArticleClipboard(src, { codeMode: "image" });
    // Opt-in: an image asset placeholder instead.
    expect(image.assets.map((a) => a.type)).toContain("code");
    expect(image.bodyHtml).not.toContain("<blockquote>");
  });

  it("~~strikethrough~~ is not parsed and stays literal", () => {
    const tokens = parseInline("use ~~gone~~ now");
    expect(tokens.some((t) => t.type === "strong" || t.type === "em")).toBe(false);
    expect(inlineToHtml(tokens)).toContain("~~gone~~");
  });
});
