import { describe, expect, it } from "vitest";
import { getBlogPosts } from "@/lib/blog";
import { getAllFeatureLandings } from "@/lib/feature-landing-copy";
import { absoluteUrl, githubRepoUrl, siteUrl } from "@/lib/seo";
import { buildLlmsTxt, buildLlmsFullTxt } from "@/lib/llms-txt";
import * as shortRoute from "@/app/llms.txt/route";
import * as fullRoute from "@/app/llms-full.txt/route";

describe("llms.txt discovery files", () => {
  it("serves both endpoints as text/plain", async () => {
    const shortRes = shortRoute.GET();
    const fullRes = fullRoute.GET();

    expect(shortRes.headers.get("content-type")).toMatch(/^text\/plain/);
    expect(fullRes.headers.get("content-type")).toMatch(/^text\/plain/);

    const shortBody = await shortRes.text();
    const fullBody = await fullRes.text();
    expect(shortBody).toBe(buildLlmsTxt());
    expect(fullBody).toBe(buildLlmsFullTxt());
  });

  it("lists every real entry point, tool and the source repository", () => {
    const body = buildLlmsTxt();

    // Core entry points
    expect(body).toContain(absoluteUrl("/editor"));
    expect(body).toContain(absoluteUrl("/thread"));
    expect(body).toContain(absoluteUrl("/blog"));
    expect(body).toContain(absoluteUrl("/privacy"));
    expect(body).toContain(githubRepoUrl);

    // Every real feature landing page, derived from the data (not hard-coded)
    for (const def of getAllFeatureLandings()) {
      expect(body).toContain(absoluteUrl(`/${def.slug}`));
    }

    // Self-referential full file link
    expect(body).toContain(absoluteUrl("/llms-full.txt"));
  });

  it("lists every real blog post only in the full file", () => {
    const short = buildLlmsTxt();
    const full = buildLlmsFullTxt();

    for (const post of getBlogPosts()) {
      const url = absoluteUrl(`/blog/${post.slug}`);
      // Full file links each post by URL and carries its real description.
      expect(full).toContain(url);
      expect(full).toContain(post.title);
      expect(full).toContain(post.description);
      // Short file must not bloat itself with per-post links.
      expect(short).not.toContain(url);
    }

    // Sanity: we actually cover the whole blog, not a hard-coded subset.
    const postLinks = (full.match(/\]\(https:\/\/markdown2x\.com\/blog\/[^)]+\)/g) ?? []).length;
    expect(postLinks).toBe(getBlogPosts().length);
  });

  it("states the real limitations and BYO-key AI requirement", () => {
    const body = buildLlmsTxt();

    // Free / no sign-up, local-only drafts
    expect(body).toMatch(/free/i);
    expect(body).toMatch(/no account|no sign-up/i);
    expect(body).toMatch(/browser/i);
    expect(body).toMatch(/not uploaded/i);

    // AI features require the caller's own OpenAI-compatible key
    expect(body).toContain("OpenAI-compatible API key");
    expect(body).toContain("does not host model inference");

    // Cover image default endpoint, as implemented in lib/cover-image.ts
    expect(body).toContain("https://api.openai.com/v1");
    expect(body).toContain("gpt-image-2");

    // Exports are PNG, not SVG
    expect(body).toContain("PNG");
    expect(body).toContain("not SVG");
  });

  it("does not fabricate prices, tiers or features", () => {
    for (const body of [buildLlmsTxt(), buildLlmsFullTxt()]) {
      // No invented pricing or tier marketing ("no paid plan" above is the
      // real limitation, not a tier).
      expect(body).not.toMatch(/\$\d/);
      expect(body).not.toMatch(/\bPremium\b|\bEnterprise\b|\bSubscription\b/i);
      // Every URL mentioned lives under the real site or the real repo.
      const urls = [...body.matchAll(/\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
      for (const url of urls) {
        expect(
          url.startsWith(siteUrl) || url.startsWith(githubRepoUrl),
          `unexpected external URL: ${url}`,
        ).toBe(true);
      }
    }
  });
});
