import type { Locale } from "./i18n";

/** Only public X article/status URLs, never compose/draft URLs or arbitrary schemes. */
export function isPublishedArticleUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && !url.username && !url.password && !url.port &&
      ["x.com", "www.x.com", "twitter.com", "www.twitter.com"].includes(url.hostname) &&
      /^\/(?:[A-Za-z0-9_]+\/status|i\/article)\/\d+\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

export function buildSharePost(title: string, articleUrl: string, locale: Locale): string {
  if (!title.trim() || !isPublishedArticleUrl(articleUrl)) return "";
  const heading = title.replace(/\s+/g, " ").trim();
  return locale === "zh"
    ? `刚写了一篇文章：${heading}\n\n全文：${articleUrl.trim()}`
    : `I wrote about ${heading}\n\nRead the article: ${articleUrl.trim()}`;
}
