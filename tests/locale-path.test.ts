import { describe, expect, it } from "vitest";
import { swapLocalePath } from "@/lib/locale-path";

/**
 * Translated blog posts (under both /blog and /zh/blog):
 *   - markdown-to-x-articles
 *   - paste-code-into-x-articles
 * All other 8 English posts have no Chinese version and must NOT deep-link.
 */
const TRANSLATED = ["markdown-to-x-articles", "paste-code-into-x-articles"];
const UNTRANSLATED = [
  "changelog-v1",
  "code-to-image-converter",
  "markdown-table-to-image",
  "md2x-vs-carbon",
  "md2x-vs-pandoc-typora",
  "mermaid-in-x-articles",
  "mermaid-to-png",
  "thread-splitter-vs-manual-x-articles-ai",
];

describe("swapLocalePath", () => {
  it("swaps home paths", () => {
    expect(swapLocalePath("/")).toEqual({ href: "/zh", to: "zh" });
    expect(swapLocalePath("/zh")).toEqual({ href: "/", to: "en" });
  });

  it("preserves deep paths for the non-parametric translated routes", () => {
    expect(swapLocalePath("/compare").href).toBe("/zh/compare");
    expect(swapLocalePath("/zh/compare").href).toBe("/compare");
    expect(swapLocalePath("/editor").href).toBe("/zh/editor");
    expect(swapLocalePath("/zh/editor").href).toBe("/editor");
    expect(swapLocalePath("/thread").href).toBe("/zh/thread");
    expect(swapLocalePath("/code-to-image").href).toBe("/zh/code-to-image");
    expect(swapLocalePath("/mermaid-to-png").href).toBe("/zh/mermaid-to-png");
    expect(swapLocalePath("/markdown-table-to-image").href).toBe(
      "/zh/markdown-table-to-image",
    );
  });

  it("deep-links only the two translated blog posts, both directions", () => {
    for (const slug of TRANSLATED) {
      expect(swapLocalePath(`/blog/${slug}`).href).toBe(`/zh/blog/${slug}`);
      expect(swapLocalePath(`/zh/blog/${slug}`).href).toBe(`/blog/${slug}`);
    }
  });

  it("falls back to the blog index for the 8 untranslated English posts", () => {
    for (const slug of UNTRANSLATED) {
      expect(swapLocalePath(`/blog/${slug}`).href).toBe("/zh/blog");
    }
  });

  it("does not blindly strip unknown /zh sub-paths", () => {
    // An English-only post never exists under /zh/blog, so do not fabricate it.
    expect(swapLocalePath("/zh/blog/md2x-vs-carbon").href).toBe("/blog");
    expect(swapLocalePath("/zh/blog/does-not-exist").href).toBe("/blog");
  });

  it("swaps blog indexes", () => {
    expect(swapLocalePath("/blog").href).toBe("/zh/blog");
    expect(swapLocalePath("/zh/blog").href).toBe("/blog");
  });

  it("falls back to the other home when no translated counterpart exists", () => {
    expect(swapLocalePath("/privacy").href).toBe("/zh");
  });
});
