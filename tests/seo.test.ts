import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  buildPageMetadata,
  getHtmlLangForPath,
  githubRepoUrl,
  siteUrl,
} from "@/lib/seo";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

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

    expect(metadata.title).toBe("Free Markdown to X Articles Converter - Online Editor | MD2X");
    expect(metadata.alternates?.canonical).toBe("/editor");
    expect(metadata.openGraph?.url).toBe("/editor");
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
