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
    expect(sitemap()).toEqual([
      {
        url: absoluteUrl("/"),
        lastModified: expect.any(Date),
        changeFrequency: "weekly",
        priority: 1,
        alternates: {
          languages: {
            en: absoluteUrl("/"),
            "zh-CN": absoluteUrl("/zh"),
            "x-default": absoluteUrl("/"),
          },
        },
      },
      {
        url: absoluteUrl("/zh"),
        lastModified: expect.any(Date),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages: {
            en: absoluteUrl("/"),
            "zh-CN": absoluteUrl("/zh"),
            "x-default": absoluteUrl("/"),
          },
        },
      },
      {
        url: absoluteUrl("/editor"),
        lastModified: expect.any(Date),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages: {
            en: absoluteUrl("/editor"),
            "zh-CN": absoluteUrl("/zh/editor"),
            "x-default": absoluteUrl("/editor"),
          },
        },
      },
      {
        url: absoluteUrl("/zh/editor"),
        lastModified: expect.any(Date),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            en: absoluteUrl("/editor"),
            "zh-CN": absoluteUrl("/zh/editor"),
            "x-default": absoluteUrl("/editor"),
          },
        },
      },
      {
        url: absoluteUrl("/thread"),
        lastModified: expect.any(Date),
        changeFrequency: "weekly",
        priority: 0.9,
        alternates: {
          languages: {
            en: absoluteUrl("/thread"),
            "zh-CN": absoluteUrl("/zh/thread"),
            "x-default": absoluteUrl("/thread"),
          },
        },
      },
      {
        url: absoluteUrl("/zh/thread"),
        lastModified: expect.any(Date),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: {
            en: absoluteUrl("/thread"),
            "zh-CN": absoluteUrl("/zh/thread"),
            "x-default": absoluteUrl("/thread"),
          },
        },
      },
    ]);
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