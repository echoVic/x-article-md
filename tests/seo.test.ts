import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildSoftwareSourceCodeJsonLd,
  buildWebSiteJsonLd,
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
    // og:image and twitter.images are both intentionally NOT set in metadata:
    // Next auto-attaches the colocated opengraph-image.tsx + twitter-image.tsx.
    expect(metadata.openGraph?.images).toBeUndefined();
    expect((metadata.twitter as { images?: string[] } | null | undefined)?.images).toBeUndefined();
    expect((metadata.twitter as { card?: string } | null | undefined)?.card).toBe(
      "summary_large_image",
    );
  });

  it("gives the privacy page its own canonical metadata", () => {
    const metadata = buildPageMetadata("privacy");

    expect(metadata.title).toBe("Privacy Policy | MD2X");
    expect(metadata.alternates?.canonical).toBe("/privacy");
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
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const baseline = rules.find((r) => r.userAgent === "*");
    expect(baseline?.allow).toBe("/");
    expect(result.sitemap).toBe(`${siteUrl}/sitemap.xml`);
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
    // Required by the Google OAuth consent screen (privacy policy URL).
    expect(byUrl.has(absoluteUrl("/privacy"))).toBe(true);

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

describe("site entity and semantic structured data", () => {
  it("Organization exposes only the real GitHub repo as sameAs and reuses the site icon as logo", () => {
    const org = buildOrganizationJsonLd();

    expect(org["@type"]).toBe("Organization");
    expect(org.name).toBe("MD2X");
    expect(org.url).toBe(siteUrl);
    expect(org.logo).toBe(absoluteUrl("/icon-512"));
    expect(org.sameAs).toEqual([githubRepoUrl]);
    // No invented social profiles, contacts, or prices.
    expect(JSON.stringify(org)).not.toMatch(/twitter|facebook|instagram|email|telephone/i);
  });

  it("WebSite references the publisher and supports both locales", () => {
    const web = buildWebSiteJsonLd();

    expect(web["@type"]).toBe("WebSite");
    expect(web.url).toBe(siteUrl);
    expect(web.inLanguage).toEqual(["en", "zh-CN"]);
    expect(web.publisher).toMatchObject({ "@type": "Organization", name: "MD2X" });
  });

  it("SoftwareSourceCode points at the real GitHub repository", () => {
    const src = buildSoftwareSourceCodeJsonLd();

    expect(src["@type"]).toBe("SoftwareSourceCode");
    expect(src.codeRepository).toBe(githubRepoUrl);
    expect(src.url).toBe(siteUrl);
    expect(src.programmingLanguage).toBe("TypeScript");
    // No invented price / capability claims.
    expect(src).not.toHaveProperty("offers");
  });

  it("builds a positional BreadcrumbList with absolute URLs", () => {
    const crumbs = buildBreadcrumbJsonLd([
      { name: "MD2X", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: "A Post", path: "/blog/a-post" },
    ]);

    expect(crumbs["@type"]).toBe("BreadcrumbList");
    expect(crumbs.itemListElement).toHaveLength(3);
    expect(crumbs.itemListElement[0]).toMatchObject({
      position: 1,
      name: "MD2X",
      item: absoluteUrl("/"),
    });
    expect(crumbs.itemListElement[2]).toMatchObject({
      position: 3,
      name: "A Post",
      item: absoluteUrl("/blog/a-post"),
    });
  });

  it("compresses the three Chinese core descriptions to at most 120 characters", () => {
    for (const page of ["zhHome", "zhEditor", "zhThread"] as const) {
      const description = buildPageMetadata(page).description as string;
      expect(description.length).toBeLessThanOrEqual(120);
      // Keeps the meaning: still mentions the converter and local/free claims.
      expect(description).toMatch(/Markdown/);
    }
  });

  it("demotes the landing mockup's decorative title to a non-heading element", () => {
    const source = readFileSync("components/landing-page.tsx", "utf8");

    // The product mockup preview no longer uses a heading tag for its fake title.
    expect(source).toContain('<div className="preview-title">Writing on X Articles</div>');
    expect(source).not.toContain("<h3>Writing on X Articles</h3>");
  });
});
