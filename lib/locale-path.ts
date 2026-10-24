/**
 * Deep-path-aware locale switching.
 *
 * Given the current pathname, return the equivalent path in the other locale.
 * Only routes that actually have a translated counterpart are kept on the deep
 * path; routes that exist in just one locale (e.g. /privacy) fall back to the
 * other locale's home.
 */

/** Top-level routes that exist under both / and /zh. */
const TRANSLATED_TOP_LEVEL = new Set([
  "blog",
  "code-to-image",
  "compare",
  "editor",
  "markdown-table-to-image",
  "markdown-to-x-articles",
  "mermaid-to-png",
  "thread",
]);

export type SwitchTarget = {
  href: string;
  to: "en" | "zh";
};

export function swapLocalePath(pathname: string): SwitchTarget {
  const path = pathname || "/";

  // Already on a Chinese path -> strip /zh to return to the English route.
  if (path === "/zh") return { href: "/", to: "en" };
  if (path.startsWith("/zh/")) {
    return { href: path.slice(3) || "/", to: "en" };
  }

  // English path.
  if (path === "/") return { href: "/zh", to: "zh" };

  const rest = path.replace(/^\//, "");
  const top = rest.split("/")[0] ?? "";
  if (TRANSLATED_TOP_LEVEL.has(top)) {
    return { href: "/zh/" + rest, to: "zh" };
  }

  // No Chinese counterpart (e.g. /privacy) -> Chinese home.
  return { href: "/zh", to: "zh" };
}
