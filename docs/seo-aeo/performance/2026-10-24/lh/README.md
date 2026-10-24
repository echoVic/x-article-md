# Lighthouse candidate evidence — editor mobile CLS

## Environment
- Lighthouse: 13.5.0
- Chrome: 156.0.8078.47 (headless=new)
- Form factor: mobile (412x823 viewport, DSR=2)
- Throttling: simulated (Slow 4G, 4x CPU slowdown) — LH defaults
- Build: source fix at `ee7fd61` (commit `e10a2b6` added regression test;
  commit `4184311` on top is docs-only). Next.js BUILD_ID
  `MTNM0SJdBRaPZhSrL9Mg-`.
- Server: `next start -p 3458`
- GA: enabled (default production build, GA_MEASUREMENT_ID wired)

## Command
```
npx lighthouse http://localhost:3458/editor \
  --output=json --output-path=.../candidate-en-N.json \
  --chrome-flags="--headless=new --no-sandbox" \
  --quiet --only-categories=performance \
  --form-factor=mobile --throttling-method=simulate
```
(same for `/zh/editor`).

## Results

| file | URL | CLS | FCP (ms) | LCP (ms) | TBT (ms) |
|---|---|---|---|---|---|
| candidate-en-1.json | /editor | **0.00000** | 934 | 3321 | 260 |
| candidate-en-2.json | /editor | **0.00000** | 857 | 3312 | 281 |
| candidate-en-3.json | /editor | **0.00000** | 827 | 3319 | 123 |
| candidate-zh-1.json | /zh/editor | **0.00000** | 860 | 3167 | 215 |
| candidate-zh-2.json | /zh/editor | **0.00000** | 856 | 3320 | 114 |
| candidate-zh-3.json | /zh/editor | **0.00000** | 854 | 3320 | 126 |

## Causal claim
The pre-fix baseline (already recorded in `base/` from Lighthouse 13.5 /
same Chrome / mobile throttled) measured editor CLS ≈ 0.047486 with a
single layout-shift entry at top=136, bottom=763, height=627. The
candidate build (ee7fd61) measures CLS = 0 across 6 runs (3 EN + 3 ZH)
under identical LH throttled mobile conditions. The shift entry is
gone — confirming the root cause was the SSR→hydration insertion of the
h-11 tab strip + h-[60px] bottom bar, not CodeMirror mount or fonts.

## Open items (not in scope for this CLS fix)
- TBT still 114–281ms (mermaid/1948 long task, compare 189ms, etc.) —
  unrelated to this CLS fix.
- Unused JS / legacy polyfill 12.3KiB — already traced in `legacy.md`,
  no safe delta.
- LCP ~3.3s — CodeMirror mount, not CLS.
