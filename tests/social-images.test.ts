import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildCompareMetadata } from "@/lib/compare-copy";
import { buildFeatureMetadata } from "@/lib/feature-landing-copy";
import {
  absoluteUrl,
  buildPageMetadata,
  siteUrl,
  type SeoPage,
} from "@/lib/seo";

function twitterOf(m: { twitter?: unknown }) {
  return m.twitter as {
    card?: string;
    site?: string;
    creator?: string;
    images?: string[];
  };
}

describe("page-level OG/Twitter images (buildPageMetadata)", () => {
  it.each([
    "home",
    "zhHome",
    "editor",
    "zhEditor",
    "thread",
    "zhThread",
  ] as const)("%s twitter image auto-mounted from colocated file", (page) => {
    const meta = buildPageMetadata(page as SeoPage);
    const t = twitterOf(meta);
    // twitter.images intentionally omitted: Next auto-mounts the colocated
    // twitter-image.tsx (re-export of the page's OG generator).
    expect(t.images).toBeUndefined();
    // Site-level associated account, never a per-page creator.
    expect(t.site).toBe("@echo_vic");
    expect(t.creator).toBeUndefined();
  });

  it("does not force the generic homepage image on per-page routes", () => {
    const editor = twitterOf(buildPageMetadata("editor"));
    const zhEditor = twitterOf(buildPageMetadata("zhEditor"));
    expect(editor.images).toBeUndefined();
    expect(zhEditor.images).toBeUndefined();
  });
});

describe("feature landing OG images", () => {
  const slugs = [
    "code-to-image",
    "markdown-table-to-image",
    "mermaid-to-png",
    "markdown-to-x-articles",
  ];

  it.each(slugs)("%s twitter image auto-mounted from colocated file", (slug) => {
    const en = twitterOf(buildFeatureMetadata(slug, "en"));
    const zh = twitterOf(buildFeatureMetadata(slug, "zh"));
    expect(en.images).toBeUndefined();
    expect(zh.images).toBeUndefined();
  });
});

describe("compare OG images", () => {
  it("twitter image auto-mounted from colocated file", () => {
    const en = twitterOf(buildCompareMetadata("en"));
    const zh = twitterOf(buildCompareMetadata("zh"));
    expect(en.images).toBeUndefined();
    expect(zh.images).toBeUndefined();
  });
});

describe("twitter:site / creator discipline", () => {
  it("the zh group base sets site account and never a creator", () => {
    const src = readFileSync(
      join(process.cwd(), "components/html-shell.tsx"),
      "utf8",
    );
    expect(src).toContain("twitter: { site: \"@echo_vic\" }");
    // No per-post creator is wired at the group root level.
    expect(src).not.toMatch(/creator\s*:/);
  });
});

describe("root URL serialization consistency", () => {
  it("absoluteUrl root has no trailing slash (matches canonical)", () => {
    expect(absoluteUrl("/")).toBe(siteUrl);
    expect(absoluteUrl("/")).not.toBe(`${siteUrl}/`);
    expect(absoluteUrl("/editor")).toBe(`${siteUrl}/editor`);
  });
});

describe("colocated image files exist per page + locale", () => {
  const expected = [
    "app/(en)/editor/opengraph-image.tsx",
    "app/(en)/thread/opengraph-image.tsx",
    "app/(en)/compare/opengraph-image.tsx",
    "app/(en)/code-to-image/opengraph-image.tsx",
    "app/(en)/markdown-table-to-image/opengraph-image.tsx",
    "app/(en)/mermaid-to-png/opengraph-image.tsx",
    "app/(en)/markdown-to-x-articles/opengraph-image.tsx",
    "app/(zh)/zh/opengraph-image.tsx",
    "app/(zh)/zh/editor/opengraph-image.tsx",
    "app/(zh)/zh/thread/opengraph-image.tsx",
    "app/(zh)/zh/compare/opengraph-image.tsx",
    "app/(zh)/zh/code-to-image/opengraph-image.tsx",
    "app/(zh)/zh/markdown-table-to-image/opengraph-image.tsx",
    "app/(zh)/zh/mermaid-to-png/opengraph-image.tsx",
    "app/(zh)/zh/markdown-to-x-articles/opengraph-image.tsx",
  ];

  it.each(expected)("exists at %s", (p) => {
    expect(existsSync(join(process.cwd(), p))).toBe(true);
  });

  it("counts new per-page image files (home EN keeps the root generic)", () => {
    const found = readdirSync("app", { withFileTypes: true, recursive: true })
      .filter((d) => d.name === "opengraph-image.tsx")
      .length;
    // root generic + blog[en]/blog[zh] dynamic + 18 per-page images (15 + compare×2 + privacy)
    expect(found).toBe(1 + 2 + 18);
  });
});
