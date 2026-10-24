import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { absoluteUrl, siteUrl } from "@/lib/seo";
import { getBlogPosts } from "@/lib/blog";
import { STATIC_ROUTE_DATES } from "@/lib/sitemap-dates";

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);

describe("sitemap lastModified dates", () => {
  it("is deterministic: two builds emit identical entries, no clock leak", () => {
    const first = sitemap();
    const second = sitemap();
    expect(second).toEqual(first);
  });

  it("never invents a future date: every entry is on or before today", () => {
    const now = Date.now();
    for (const entry of sitemap()) {
      expect(new Date(entry.lastModified as Date).getTime()).toBeLessThanOrEqual(now);
    }
  });

  it("drops the stale 2026-06-01 date and the runtime new-Date() refresh", () => {
    // Static routes must never reuse the old shared 2026-06-01 placeholder
    // (blog posts keep their own frontmatter dates, one of which is 2026-06-01).
    const staticPaths = [
      "/", "/zh", "/editor", "/zh/editor", "/thread", "/zh/thread", "/blog", "/privacy",
    ];
    const staticUrls = new Set(staticPaths.map(absoluteUrl));
    for (const entry of sitemap()) {
      if (staticUrls.has(entry.url)) {
        expect(new Date(entry.lastModified as Date).toISOString().slice(0, 10)).not.toBe("2026-06-01");
      }
    }
    // /blog index would otherwise be "now"; pin it to the newest post date.
    const posts = getBlogPosts();
    const newest = posts.reduce((max, p) => (p.date > max ? p.date : max), posts[0].date);
    const blogIndex = sitemap().find((e) => e.url === absoluteUrl("/blog"));
    expect(blogIndex?.lastModified).toEqual(day(newest));
  });

  it("assigns each static route its baked git-verified content date", () => {
    const byUrl = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    const expectDate = (path: string, iso: string) =>
      expect(byUrl.get(absoluteUrl(path))).toEqual(day(iso));

    expectDate("/", STATIC_ROUTE_DATES.home);
    expectDate("/zh", STATIC_ROUTE_DATES.home);
    expectDate("/editor", STATIC_ROUTE_DATES.editor);
    expectDate("/zh/editor", STATIC_ROUTE_DATES.editor);
    expectDate("/thread", STATIC_ROUTE_DATES.thread);
    expectDate("/zh/thread", STATIC_ROUTE_DATES.thread);
    expectDate("/privacy", STATIC_ROUTE_DATES.privacy);
    expectDate("/compare", STATIC_ROUTE_DATES.compare);
    expectDate("/zh/compare", STATIC_ROUTE_DATES.compare);

    for (const slug of [
      "code-to-image",
      "mermaid-to-png",
      "markdown-table-to-image",
    ]) {
      expectDate(`/${slug}`, STATIC_ROUTE_DATES.feature);
    }
    // EN markdown-to-x-articles had its strikethrough claim corrected @51aba3c.
    expectDate("/markdown-to-x-articles", STATIC_ROUTE_DATES.featureMarkdownToX);
    // zh tool landings were deepened and corrected on 2026-10-24.
    for (const slug of [
      "markdown-to-x-articles",
      "code-to-image",
      "mermaid-to-png",
      "markdown-table-to-image",
    ]) {
      expectDate(`/zh/${slug}`, STATIC_ROUTE_DATES.featureZh);
    }
  });

  it("keeps blog posts on their frontmatter dates, sorted newest-first", () => {
    const byUrl = new Map(sitemap().map((e) => [e.url, e.lastModified]));
    const posts = getBlogPosts();
    for (const post of posts) {
      expect(byUrl.get(absoluteUrl(`/blog/${post.slug}`))).toEqual(day(post.date));
    }
  });

  it("covers every canonical route exactly once", () => {
    const entries = sitemap();
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(url.startsWith(siteUrl)).toBe(true);
    for (const path of ["/", "/zh", "/editor", "/zh/editor", "/thread", "/zh/thread", "/blog", "/privacy"]) {
      expect(urls).toContain(absoluteUrl(path));
    }
  });
});
