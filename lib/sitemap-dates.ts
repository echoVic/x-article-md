// Explicit content dates for sitemap routes that have no blog-post
// frontmatter. These strings are baked in here ONCE: each date was verified
// against local git history (committer date of the route's content files —
// page component + copy library) and must not be recomputed at runtime from
// git, file mtimes, build time, or `new Date()`.
//
// Verification reference (repo HEAD 08c524a, checked 2026-10-23):
// - home (/, /zh):           components/landing-page.tsx @37d8631 (JSON-LD + zh copy)
// - editor (/editor, /zh/*): components/focus-editor-page.tsx @167fe24 (focus mode)
// - thread (/thread, /zh/*):components/thread-page-wrapper.tsx @4e6b487
// - /privacy:                in-page `lastUpdated` constant; the c41db7a touch was a
//                             route-group file move with 0 content lines changed
// - feature landings:        components/feature-landing-page.tsx @37d8631
// - /compare:                brand-new page; no git history before its first
//                             commit yet, so the launch date is baked in here
// Blog-post pages keep their own frontmatter `date`; the /blog indexes reuse
// the latest post date at runtime.
export const STATIC_ROUTE_DATES = {
  home: "2026-10-23",
  editor: "2026-10-23",
  thread: "2026-10-13",
  privacy: "2026-10-13",
  feature: "2026-10-23",
  compare: "2026-10-23",
} as const;

export type StaticRouteDateKey = keyof typeof STATIC_ROUTE_DATES;
