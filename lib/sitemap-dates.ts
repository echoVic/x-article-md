// Explicit content dates for sitemap routes that have no blog-post
// frontmatter. These strings are baked in here ONCE: each date was verified
// against local git history (committer date of the route's content files —
// page component + copy library) and must not be recomputed at runtime from
// git, file mtimes, build time, or `new Date()`.
//
// Verification reference:
// - Repo HEAD 08c524a, checked 2026-10-23:
//   home (/, /zh) @37d8631; editor @167fe24; thread @4e6b487;
//   privacy: in-page `lastUpdated` (the c41db7a touch was a route-group
//   file move with 0 content lines changed); /compare launched fresh.
// - Re-check 2026-10-24 (committer dates):
//   compare (/compare, /zh/compare) @c4d5d5c — bilingual reposition,
//   zh tool landings (/zh/<slug> all four) @842c776 + @51aba3c — real
//   examples/source-verified limits added, then code-mode/strikethrough
//   claims corrected,
//   EN markdown-to-x-articles @51aba3c — strikethrough claim corrected
//   (the only EN tool-landing edit on 2026-10-24),
//   other EN tool landings unchanged since 2026-10-23 → keep `feature`.
// Blog-post pages keep their own frontmatter `date`; the /blog indexes reuse
// the latest post date at runtime.
export const STATIC_ROUTE_DATES = {
  home: "2026-10-23",
  editor: "2026-10-23",
  thread: "2026-10-13",
  privacy: "2026-10-13",
  // EN tool landings baseline; per-route exceptions below.
  feature: "2026-10-23",
  // EN markdown-to-x-articles: strikethrough/code-mode claim corrected @51aba3c.
  featureMarkdownToX: "2026-10-24",
  // zh tool landings: deepened with source-verified examples @842c776,
  // then corrected @51aba3c.
  featureZh: "2026-10-24",
  // /compare bilingual reposition @c4d5d5c.
  compare: "2026-10-24",
} as const;

export type StaticRouteDateKey = keyof typeof STATIC_ROUTE_DATES;
