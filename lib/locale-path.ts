/**
 * Deep-path-aware locale switching.
 *
 * Given the current pathname, return the equivalent path in the other locale.
 * Only routes that actually have a translated counterpart are kept on the deep
 * path; routes that exist in just one locale fall back to the other locale's
 * index for that section (or its home).
 *
 * This is a static, hand-maintained registry (no fs loading on the client):
 * when a blog post gets a Chinese translation, add its slug below.
 */

/** Top-level routes that exist under both / and /zh (single, non-parametric pages). */
const TRANSLATED_TOP_LEVEL = new Set([
  "code-to-image",
  "compare",
  "editor",
  "markdown-table-to-image",
  "markdown-to-x-articles",
  "mermaid-to-png",
  "thread",
]);

/**
 * Blog slugs that have a Chinese translation under /zh/blog.
 * All other /blog/<slug> posts are English-only and fall back to /zh/blog.
 */
const ZH_TRANSLATED_BLOG_SLUGS = new Set([
  "markdown-to-x-articles",
  "paste-code-into-x-articles",
]);

export type SwitchTarget = {
  href: string;
  to: "en" | "zh";
};

export function swapLocalePath(pathname: string): SwitchTarget {
  const path = pathname || "/";

  // --- Chinese side -> English -------------------------------------------
  if (path === "/zh") return { href: "/", to: "en" };
  if (path === "/zh/blog") return { href: "/blog", to: "en" };
  if (path.startsWith("/zh/blog/")) {
    const slug = path.slice("/zh/blog/".length).replace(/\/$/, "");
    if (ZH_TRANSLATED_BLOG_SLUGS.has(slug)) {
      return { href: `/blog/${slug}`, to: "en" };
    }
    // Unknown zh sub-path: do not blindly strip; go to the en blog index.
    return { href: "/blog", to: "en" };
  }
  if (path.startsWith("/zh/")) {
    const rest = path.slice(4) || "";
    const top = rest.split("/")[0] ?? "";
    if (TRANSLATED_TOP_LEVEL.has(top)) {
      return { href: `/${rest}`, to: "en" };
    }
    return { href: "/", to: "en" };
  }

  // --- English side -> Chinese -------------------------------------------
  if (path === "/") return { href: "/zh", to: "zh" };
  if (path === "/blog") return { href: "/zh/blog", to: "zh" };
  if (path.startsWith("/blog/")) {
    const slug = path.slice("/blog/".length).replace(/\/$/, "");
    if (ZH_TRANSLATED_BLOG_SLUGS.has(slug)) {
      return { href: `/zh/blog/${slug}`, to: "zh" };
    }
    // English-only post: fall back to the Chinese blog index, not a 404.
    return { href: "/zh/blog", to: "zh" };
  }

  const rest = path.replace(/^\//, "");
  const top = rest.split("/")[0] ?? "";
  if (TRANSLATED_TOP_LEVEL.has(top)) {
    return { href: "/zh/" + rest, to: "zh" };
  }

  // No Chinese counterpart (e.g. /privacy) -> Chinese home.
  return { href: "/zh", to: "zh" };
}
