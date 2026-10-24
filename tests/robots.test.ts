import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import { siteUrl } from "@/lib/seo";

type Rule = {
  userAgent?: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
};

const EXPECTED_AI_UA = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
];

describe("robots.txt policy", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

  it("emits a multi-rule array (not a single-rule object)", () => {
    expect(Array.isArray(result.rules)).toBe(true);
    expect(rules.length).toBeGreaterThanOrEqual(EXPECTED_AI_UA.length + 1);
  });

  it("keeps the public baseline allow for every crawler", () => {
    const baseline = rules.find((r: Rule) => r.userAgent === "*");
    expect(baseline?.allow).toBe("/");
    expect(baseline?.disallow).toBeUndefined();
  });

  it("explicitly allows each verified AI crawler UA with Allow: /", () => {
    for (const ua of EXPECTED_AI_UA) {
      const rule = rules.find((r: Rule) => r.userAgent === ua);
      expect(rule, `missing explicit block for ${ua}`).toBeDefined();
      expect(rule?.allow).toBe("/");
    }
  });

  it("is an open policy: no Disallow anywhere in the rules", () => {
    for (const rule of rules) {
      expect(rule.disallow ?? "").toBeFalsy();
    }
  });

  it("does not list tokens that robots.txt cannot actually control", () => {
    const tokens = rules.map((r: Rule) => r.userAgent);
    // Not a crawler UA — only responds to Disallow, an Allow entry is noise.
    expect(tokens).not.toContain("Google-Extended");
    // Ignores robots.txt per Perplexity's own docs; listing it here is meaningless.
    expect(tokens).not.toContain("Perplexity-User");
    // No invented or third-party UAs smuggled in.
    expect(tokens.filter((t) => t !== "*" && !EXPECTED_AI_UA.includes(t as never))).toEqual([]);
  });

  it("still points at the sitemap", () => {
    expect(result.sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });
});
