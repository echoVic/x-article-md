import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { absoluteUrl } from "@/lib/seo";
import {
  buildCompareMetadata,
  compareCheckedDate,
  getCompareContent,
  type CompareLocale,
} from "@/lib/compare-copy";

describe("compare page metadata", () => {
  it("uses the right canonical and hreflang per locale", () => {
    const en = buildCompareMetadata("en");
    expect(en.alternates?.canonical).toBe("/compare");
    expect(en.alternates?.languages).toEqual({
      en: "/compare",
      "zh-CN": "/zh/compare",
      "x-default": "/compare",
    });
    expect(en.openGraph?.locale).toBe("en");

    const zh = buildCompareMetadata("zh");
    expect(zh.alternates?.canonical).toBe("/zh/compare");
    expect(zh.alternates?.languages).toEqual({
      en: "/compare",
      "zh-CN": "/zh/compare",
      "x-default": "/compare",
    });
    expect(zh.openGraph?.locale).toBe("zh-CN");
  });
});

describe("compare page content", () => {
  const locales: CompareLocale[] = ["en", "zh"];

  it.each(locales)("covers all four tools in %s", (locale) => {
    const t = getCompareContent(locale);
    expect([t.md2x.name, t.carbon.name, t.pandoc.name, t.typora.name]).toEqual([
      "MD2X",
      "Carbon",
      "Pandoc",
      "Typora",
    ]);
    expect(t.rows.length).toBeGreaterThanOrEqual(6);
  });

  it.each(locales)("never mentions pricing in %s copy", (locale) => {
    const t = getCompareContent(locale);
    const blob = JSON.stringify(t);
    // Honest-comparison rule: no price numbers / currency mentions.
    expect(blob).not.toMatch(/\$\s?\d/);
    expect(blob).not.toMatch(/14\.99|price|价格|售价/i);
  });

  it.each(locales)("cites the four official sources with the check date in %s", (locale) => {
    const t = getCompareContent(locale);
    const urls = t.sources.map((s) => s.url);
    expect(urls).toContain("https://carbon.vercel.app/about");
    expect(urls).toContain("https://github.com/carbon-app/carbon");
    expect(urls).toContain("https://pandoc.org");
    expect(urls).toContain("https://typora.io");
    expect(compareCheckedDate).toBe("2026-10-23");
  });
});

describe("compare sitemap entries", () => {
  it("lists both locales with reciprocal hreflang alternates", () => {
    const entries = sitemap();
    const byUrl = new Map(entries.map((e) => [e.url, e]));

    expect(byUrl.get(absoluteUrl("/compare"))?.alternates?.languages).toEqual({
      en: absoluteUrl("/compare"),
      "zh-CN": absoluteUrl("/zh/compare"),
      "x-default": absoluteUrl("/compare"),
    });
    expect(byUrl.get(absoluteUrl("/zh/compare"))?.alternates?.languages).toEqual({
      en: absoluteUrl("/compare"),
      "zh-CN": absoluteUrl("/zh/compare"),
      "x-default": absoluteUrl("/compare"),
    });
  });
});
