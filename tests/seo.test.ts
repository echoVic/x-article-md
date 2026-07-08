import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  absoluteUrl,
  buildPageMetadata,
  getHtmlLangForPath,
  githubRepoUrl,
  siteUrl,
} from "@/lib/seo";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { buildFeatureMetadata, getFeatureLanding } from "@/lib/feature-landing-copy";
import { editorCopy } from "@/lib/editor-copy";
import { threadCopy } from "@/lib/thread-copy";

describe("SEO configuration", () => {
  it("builds canonical metadata with social previews for the landing page", () => {
    const metadata = buildPageMetadata("home");

    expect(metadata.metadataBase?.toString()).toBe(`${siteUrl}/`);
    expect(metadata.alternates?.canonical).toBe("/");
    expect(metadata.alternates?.languages).toEqual({
      en: "/",
      "zh-CN": "/zh",
      "x-default": "/",
    });
    expect(metadata.openGraph?.url).toBe("/");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "MD2X Markdown to X Articles converter",
      },
    ]);
    expect(metadata.twitter?.card).toBe("summary_large_image");
  });

  it("uses focused metadata for the editor page", () => {
    const metadata = buildPageMetadata("editor");

    expect(metadata.title).toBe("Markdown to X Articles Converter - Free Online Editor | MD2X");
    expect(metadata.description).toContain("clipboard-ready rich text");
    expect(metadata.alternates?.canonical).toBe("/editor");
    expect(metadata.openGraph?.url).toBe("/editor");
  });

  it("uses GSC-informed metadata for thread and blog pages", () => {
    const thread = buildPageMetadata("thread");
    const blog = buildPageMetadata("blog");

    expect(thread.title).toBe("Free X/Twitter Thread Generator from Markdown | MD2X");
    expect(thread.description).toContain("split long posts");
    expect(thread.description).toContain("280-character tweets");
    expect(blog.title).toBe("Markdown to X Articles Tutorials | MD2X Blog");
  });

  it("keeps indexable SEO copy aligned with target queries", () => {
    expect(editorCopy.en.h1).toBe("Markdown to X Articles Converter");
    expect(editorCopy.en.subtitle).toContain("clipboard-ready rich text");
    expect(threadCopy.en.h1).toBe("Free X/Twitter Thread Generator from Markdown");
    expect(threadCopy.en.subtitle).toContain("split long posts");
    expect(threadCopy.en.faqs.some((faq) => faq.answer.includes("copy the entire thread"))).toBe(true);
  });

  it("exposes crawl directives and a sitemap URL", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
      },
      sitemap: `${siteUrl}/sitemap.xml`,
    });
  });

  it("lists canonical indexable URLs in the sitemap", () => {
    const entries = sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));

    // Core marketing pages are present with hreflang alternates.
    expect(byUrl.get(absoluteUrl("/"))?.priority).toBe(1);
    expect(byUrl.get(absoluteUrl("/"))?.alternates?.languages).toEqual({
      en: absoluteUrl("/"),
      "zh-CN": absoluteUrl("/zh"),
      "x-default": absoluteUrl("/"),
    });
    expect(byUrl.has(absoluteUrl("/editor"))).toBe(true);
    expect(byUrl.has(absoluteUrl("/zh/editor"))).toBe(true);
    expect(byUrl.has(absoluteUrl("/thread"))).toBe(true);
    expect(byUrl.has(absoluteUrl("/zh/thread"))).toBe(true);
    expect(byUrl.has(absoluteUrl("/blog"))).toBe(true);

    // Keyword-targeted feature landing pages are present in both locales,
    // each with reciprocal hreflang alternates.
    expect(byUrl.get(absoluteUrl("/markdown-to-x-articles"))?.alternates?.languages).toEqual({
      en: absoluteUrl("/markdown-to-x-articles"),
      "zh-CN": absoluteUrl("/zh/markdown-to-x-articles"),
      "x-default": absoluteUrl("/markdown-to-x-articles"),
    });
    expect(byUrl.has(absoluteUrl("/zh/markdown-to-x-articles"))).toBe(true);
    expect(byUrl.get(absoluteUrl("/code-to-image"))?.alternates?.languages).toEqual({
      en: absoluteUrl("/code-to-image"),
      "zh-CN": absoluteUrl("/zh/code-to-image"),
      "x-default": absoluteUrl("/code-to-image"),
    });
    expect(byUrl.has(absoluteUrl("/zh/code-to-image"))).toBe(true);

    // Every entry has an absolute URL and a lastModified date.
    for (const entry of entries) {
      expect(entry.url.startsWith(siteUrl)).toBe(true);
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });

  it("serves markdown-to-x-articles as a tool landing page instead of a redirect", () => {
    const def = getFeatureLanding("markdown-to-x-articles");
    const metadata = buildFeatureMetadata("markdown-to-x-articles", "en");
    const nextConfig = readFileSync("next.config.ts", "utf8");

    expect(def?.editorPath).toBe("/editor");
    expect(def?.en.metaTitle).toContain("Markdown to X Articles Converter");
    expect(metadata.alternates?.canonical).toBe("/markdown-to-x-articles");
    expect(nextConfig).not.toContain('source: "/markdown-to-x-articles"');
  });

  it("keeps tutorial posts linked to the matching tool landing pages", () => {
    const markdownTutorial = readFileSync("content/blog/markdown-to-x-articles.mdx", "utf8");
    const codeTutorial = readFileSync("content/blog/code-to-image-converter.mdx", "utf8");
    const mermaidTutorial = readFileSync("content/blog/mermaid-to-png.mdx", "utf8");

    expect(markdownTutorial).toContain("](/markdown-to-x-articles)");
    expect(codeTutorial).toContain("](/code-to-image)");
    expect(mermaidTutorial).toContain("](/mermaid-to-png)");
  });

  it("uses the real GitHub repository URL", () => {
    expect(githubRepoUrl).toBe("https://github.com/echoVic/x-article-md");
  });

  it("maps localized routes to the correct html lang value", () => {
    expect(getHtmlLangForPath("/")).toBe("en");
    expect(getHtmlLangForPath("/editor")).toBe("en");
    expect(getHtmlLangForPath("/zh")).toBe("zh-CN");
    expect(getHtmlLangForPath("/zh/")).toBe("zh-CN");
  });
});
