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

  it.each(locales)("covers MD2X plus the three named competitors in %s", (locale) => {
    const t = getCompareContent(locale);
    expect(t.tools.map((tool) => tool.name)).toEqual([
      "MD2X",
      "X Article Markdown Paste",
      "xPoster",
      "Article Studio",
    ]);
    expect(t.rows.length).toBeGreaterThanOrEqual(6);
    // Every row has one value per tool.
    for (const row of t.rows) {
      expect(row.values.length).toBe(t.tools.length);
    }
  });

  it.each(locales)("no longer compares Carbon/Pandoc/Typora in %s", (locale) => {
    const blob = JSON.stringify(getCompareContent(locale));
    expect(blob).not.toMatch(/Carbon|Pandoc|Typora/i);
  });

  it.each(locales)("pins Article Studio to its official site with grounded strengths in %s", (locale) => {
    const t = getCompareContent(locale);
    const studio = t.tools.find((tool) => tool.name === "Article Studio");
    expect(studio).toBeDefined();
    expect(studio!.url).toBe("https://md2xarticle.com/");
    expect(studio!.strengths.length).toBeGreaterThan(0);
  });

  it.each(locales)("cites Article Studio capabilities that match the vendor page in %s", (locale) => {
    const t = getCompareContent(locale);
    // Rows are fixed in order: form factor, code, tables, images, mermaid, embeds, queue, account.
    const col = (i: number) => t.rows[i].values[3];
    expect(col(4)).toMatch(/2x/i); // Mermaid -> 2x PNG
    expect(col(3)).toMatch(/companion|伴侣/i); // images via Chrome companion
    expect(col(2)).toMatch(/native|原生/i); // tables native or image
    expect(col(1)).toMatch(/supported|支持/i); // code blocks supported, rendering not detailed
  });

  it.each(locales)("never mentions pricing, tiers, or character limits in %s", (locale) => {
    const blob = JSON.stringify(getCompareContent(locale));
    // Honest-comparison rule: no price numbers / currency / tier words.
    expect(blob).not.toMatch(/\$\s?\d/);
    expect(blob).not.toMatch(/14\.99|4\.99|price|价格|售价/i);
    // No unobserved character-limit number.
    expect(blob).not.toMatch(/280/);
  });

  it.each(locales)("cites the real sources and the check date in %s", (locale) => {
    const t = getCompareContent(locale);
    const urls = t.sources.map((s) => s.url);
    expect(urls).toContain("https://xmdpaste.icy-cat.com/");
    expect(urls).toContain("https://chromewebstore.google.com/detail/xposter/iimkimodgdjnnmdopeolboakhjmhfbbj");
    expect(urls).toContain("https://github.com/ginobefun/xposter");
    expect(urls).toContain("https://md2xarticle.com/");
    expect(urls).toContain("https://help.x.com/en/using-x/articles");
    // Same-name disambiguation source is cited.
    expect(urls).toContain("https://xposterpro.com");
    expect(compareCheckedDate).toBe("2026-10-24");
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
