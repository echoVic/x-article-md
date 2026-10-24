# Editor mobile CLS regression — 2026-10-24

## Root cause
`components/editor-page.tsx` used `useSyncExternalStore` for `isDesktop`
with `getServerSnapshot = () => true`. SSR always rendered the desktop
shell. On a mobile client, hydration immediately flipped `isDesktop=false`
and the two mobile-only chrome bars — the `h-11` manuscript/preview tab
strip and the `h-[60px]` bottom action bar — were inserted out of nowhere
(via `{!isDesktop && (...)}`). That inserted ~104px of layout space and
pushed the `flex-1` editor grid down.

Lighthouse mobile (412x823, slow 4G, 4x CPU slowdown) reported a single
layout-shift entry at top=136, bottom=763, height=627, CLS ≈ 0.047.

## Fix (commit ee7fd61)
Render both bars unconditionally and hide them on desktop with `md:hidden`.
CSS media queries apply at first paint, so the mobile layout is already
correct in SSR HTML; hydration no longer inserts layout space. Desktop
rendering is unchanged (bars stay `display:none` ≥768px).

## Regression test
`tests/editor-mobile-cls.test.tsx` mounts `EditorPage` (with heavy
children stubbed) on a desktop-sized viewport and asserts:
1. The `role="tablist"` strip is in the initial DOM and carries `md:hidden` + `h-11`.
2. The bottom bar (container of the "Copy body" button) carries `md:hidden` + `h-[60px]`.
3. Mount succeeds and both bars are in the tree — proving they are not
   wrapped in a JS conditional that would disappear when `isDesktop=true`.

If a future refactor reintroduces `{!isDesktop && ...}` around either bar,
this test fails.

## Trace harness
`cls-trace.mjs` connects to headless Chrome on `:9222`, opens a 390x844
mobile viewport, injects a `PerformanceObserver` via
`Page.addScriptToEvaluateOnNewDocument` **before** navigation, and dumps
every `layout-shift` entry with source node, previous/current rects, and
timestamp. Run `runs` times and writes a JSON file.

Usage:
```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9222 --disable-gpu \
  --window-size=390,844 --user-data-dir=/tmp/chrome-cls about:blank &
npx next start -p 3458 &
node docs/seo-aeo/performance/2026-10-24/cls-trace.mjs \
  http://localhost:3458/editor /tmp/out.json 3
```

## Candidate results (build at ee7fd61)
- `cls-candidate-en.json` — EN `/editor`, 3 runs: CLS = 0.00000 / 0.00000 / 0.00000, 0 entries each.
- `cls-candidate-zh.json` — ZH `/zh/editor`, 3 runs: CLS = 0.00000 / 0.00000 / 0.00000, 0 entries each.

## Note on headless traces
Synthetic headless traces without Lighthouse CPU/network throttling do
not reproduce the SSR→hydration shift on **base** (the DOM settles
between the observer registration and hydration in a way that doesn't
emit a layout-shift entry). The authoritative base number is the
Lighthouse run already recorded in `base/` (CLS ≈ 0.047 at 412x823 throttled).
The regression test pins the structural contract (bars always in DOM +
md:hidden) so future refactors can't silently reintroduce the
conditional insertion.
