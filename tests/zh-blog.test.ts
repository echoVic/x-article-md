import { describe, expect, it } from "vitest";
import {
  getAllSlugs,
  getAllZhSlugs,
  getZhBlogPost,
  hasZhTranslation,
} from "@/lib/blog";
import { generateMetadata as enPostMeta } from "@/app/(en)/blog/[slug]/page";
import { generateMetadata as zhPostMeta } from "@/app/(zh)/zh/blog/[slug]/page";
import sitemap from "@/app/sitemap";
import { absoluteUrl } from "@/lib/seo";

const TRANSLATED = ["markdown-to-x-articles", "paste-code-into-x-articles"];

describe("Chinese blog pairing", () => {
  it("ships exactly the two hand-translated posts", () => {
    expect(getAllZhSlugs().sort()).toEqual([...TRANSLATED].sort());
  });

  it("flags translations only for the two translated English slugs", () => {
    for (const slug of getAllSlugs()) {
      expect(hasZhTranslation(slug)).toBe(TRANSLATED.includes(slug));
    }
    for (const slug of TRANSLATED) {
      expect(getZhBlogPost(slug)).not.toBeNull();
    }
  });

  it("keeps translated posts' internal links inside the Chinese routes", () => {
    const md = getZhBlogPost("markdown-to-x-articles")!;
    const code = getZhBlogPost("paste-code-into-x-articles")!;
    expect(md.content).toContain("](/zh/markdown-to-x-articles)");
    expect(code.content).toContain("](/zh/editor)");
  });
});

describe("conditional bidirectional hreflang", () => {
  it("advertises zh-CN alternate on English posts only when a translation exists", async () => {
    for (const slug of getAllSlugs()) {
      const meta = await enPostMeta({ params: Promise.resolve({ slug }) });
      const languages = (meta.alternates?.languages ?? {}) as Record<string, string>;
      expect(languages["x-default"]).toBe(`/blog/${slug}`);
      if (TRANSLATED.includes(slug)) {
        expect(languages["zh-CN"]).toBe(`/zh/blog/${slug}`);
      } else {
        expect(languages["zh-CN"]).toBeUndefined();
      }
    }
  });

  it("pairs each Chinese post back to its English original", async () => {
    for (const slug of getAllZhSlugs()) {
      const meta = await zhPostMeta({ params: Promise.resolve({ slug }) });
      expect(meta.alternates?.canonical).toBe(`/zh/blog/${slug}`);
      const languages = (meta.alternates?.languages ?? {}) as Record<string, string>;
      expect(languages["en"]).toBe(`/blog/${slug}`);
      expect(languages["zh-CN"]).toBe(`/zh/blog/${slug}`);
      // Per-post OG image for the Chinese route.
      expect((meta.twitter as { images?: string[] }).images).toEqual([
        `/zh/blog/${slug}/opengraph-image`,
      ]);
    }
  });
});

describe("sitemap blog pairing", () => {
  it("includes the Chinese blog list paired with the English list", () => {
    const entries = sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));
    expect(byUrl.has(absoluteUrl("/zh/blog"))).toBe(true);
    expect(byUrl.get(absoluteUrl("/zh/blog"))?.alternates?.languages).toEqual({
      en: absoluteUrl("/blog"),
      "zh-CN": absoluteUrl("/zh/blog"),
      "x-default": absoluteUrl("/blog"),
    });
  });

  it("emits /zh/blog/<slug> only for translated posts", () => {
    const entries = sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));
    for (const slug of getAllSlugs()) {
      const zhUrl = absoluteUrl(`/zh/blog/${slug}`);
      if (TRANSLATED.includes(slug)) {
        expect(byUrl.has(zhUrl)).toBe(true);
        expect(byUrl.get(absoluteUrl(`/blog/${slug}`))?.alternates?.languages).toEqual({
          en: absoluteUrl(`/blog/${slug}`),
          "zh-CN": zhUrl,
          "x-default": absoluteUrl(`/blog/${slug}`),
        });
      } else {
        expect(byUrl.has(zhUrl)).toBe(false);
      }
    }
  });
});
