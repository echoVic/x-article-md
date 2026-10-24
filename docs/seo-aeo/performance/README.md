# 性能修复基线与对照（首页 mobile）

> 状态：**单 delta 代码已改、未 commit / 未 push / 未部署，待串行授权**。
> 本 delta **只解决传输/unused-JS，不是 H1 LCP 修复**；H1 LCP 根因未闭环，见末节。

## 被测 URL 与口径声明（如实）
- 原审计报告 `https://markdown2x-com-seo-aeo-2026-10-23-rywe.pages.grok.bot` 在 Cursor/x.ai 登录墙后，
  本机 Chrome 同样认证阻塞，**未取得原 URL/设备/节流/缓存口径，原被测页未知**。
- 本轮**主动选择线上首页 `https://markdown2x.com/`** 作为优化对象（非由 H1 元素推断——editor 页同样有 H1）。
- 下方线上与 localhost **严格分列，互不外推**。

## 环境
- macOS 26.6.2 / M2 Pro / 32GB；Node v22.23.2；Chrome 156；Lighthouse 13.5.0 (cli, headless=new)。
- mobile 节流：rtt 150ms / 1638kbps / CPU 4×。
- 构建全部在隔离 worktree，**未动主项目 `.next`**（主 .next 由元数据线另行构建）。

## A. 线上真实基线（https://markdown2x.com/，mobile，n=3，本 vantage）
| run | Perf | FCP | LCP | TBT | CLS | TTI |
|---|---|---|---|---|---|---|
| 1 | 79 | 1762 | 1762 | 416 | 0.026 | 7468 |
| 2 | 93 | 1529 | 1529 | 303 | 0.034 | 6824 |
| 3 | 84 | 1321 | 1702 | 583 | 0.004 | 7366 |
| 中位 | **84** | **1529** | **1702** | **416** | **0.026** | **7366** |

诊断（run2）：总传输 787KB；第三方 188KB（含 GA gtag `G-6PCZ5398F1` 177KB）；unused JS 284KB；TTFB 484ms。
- 注意：本 vantage 线上 LCP 中位 **1702ms ≠ 原截图 5.0s**；vantage/设备/口径不同，**不能据此证明线上已修复，也不反驳截图**。

## B. H1 LCP 渲染延迟 profile（线上 run2）
- **LCP == FCP == 1529ms**：首屏内容即 H1，不存在"晚到的 LCP 元素"；LCP 不是被某个晚加载的图片/字体推迟。
- HTML 文档 164KB（CSS 已内联，无外部 render-blocking 样式表）。
- head 中 preload：4 个 woff2 字体（Instrument Serif ×2 + Inter ×2）+ `gtag/js` 177KB `rel=preload as=script`。
- GA 组件用 `next/script strategy="afterInteractive"`（非阻塞执行），但 Next 仍自动注入了 gtag 的高优先级 preload。
- **结论（开放）**：本 vantage 的 H1 LCP 主要由文档下载（164KB over Slow4G）决定；gtag preload 与 4 字体 preload 是否在更慢真实设备上推迟 H1，**未在可复现环境闭环**。

## C. 根因：首页预取整条 /editor 包（证据链）
线上追踪显示运行时以 Low 优先级额外拉 5 个 chunk（共 ~244KB gz）：
Radix select/dropdown ~150KB、CodeMirror ~55KB、其余 editor 路由块——这是 Next App Router 对首页指向 `/editor` 的 `<Link>` 默认 prefetch 所致，下载却未使用。

## D. 单 Delta（bundle/transfer，非 LCP 修复）
- 给首页指向 `/editor` 的 4 个 `<Link>` 加 `prefetch={false}`（`landing-page.tsx` ×2、`landing-header.tsx` ×2）。
- 不关功能、不屏蔽第三方、不改阈值；未改 shared `html-shell.tsx`。

### 同环境 localhost 配对（同一机器同一工具，仅 prefetch 一变量）
BASE = 干净 93d8979 worktree；CAND = 加 prefetch={false} worktree。mobile n=3。

| 指标(中位) | BASE | CAND | Δ |
|---|---|---|---|
| Perf | 94 | 93 | −1 |
| FCP | 829 | 894 | +65 |
| **LCP** | **2578** | **3031** | **+453（本地回退，原因未闭环，不解释为噪声）** |
| TBT | 102 | 110 | +8 |
| chunk 请求数 | 16 | 11 | −5 |
| 总传输 | 587KB | 339KB | **−248KB（−42%）** |
| unused JS | 206KB | 47KB | **−159KB（−77%）** |

- localhost 无第三方、无带宽约束，**此表不与线上比较**，也不据此宣称线上 LCP 改善。
- 该 delta 已证实：去掉 244KB gz 投机下载、unused JS −159KB。
- **未证实/未闭环**：localhost LCP 中位 +453ms 的原因；prefetch=false 对"Open Editor"导航交互时间的影响**尚未测量**（不能以导航变慢换指标）。

## 复现（worktree 已清理，需按 ref 重建）
```bash
git worktree add /tmp/md2x-base 93d8979 --detach        # baseline, 无 prefetch 改动
git worktree add /tmp/md2x-perf 93d8979 --detach       # candidate, 加 prefetch={false}
cd <wt> && pnpm build && pnpm exec next start -p <port>
npx -y lighthouse http://127.0.0.1:<port>/ --only-categories=performance --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet --output=json --output-path=out.json
```

## E. GA / 字体 因果实验（GA 两边同开，c4d5d5c，n=3 中位）
> 注入同一 `NEXT_PUBLIC_GA_ID=G-6PCZ5398F1`，BASE 与候选均真实加载 GA（third-party 178KB）。
> 本机 localhost，与线上分列，不据此宣称线上收益。

| 配置 | Perf | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|
| BASE（next/script afterInteractive，gtag High preload） | 93 | 830 | 2955 | 138 | 0 |
| E1 GA：改 async script，去 high preload | 95 | 842 | 2803 | 115 | 0 |
| E2 字体：Geist Mono `preload:false` | 96 | 921 | 2568 | 153 | **0.004** |

- **E1 GA**：gtag 仍完整加载（177KB，pageview 保留），优先级 High→Low；LCP −152ms、TBT −23ms。未禁用/未延后到不加载。
- **E2 字体**：preload 字体 4→3；LCP −387ms，但 CLS 由 0 升至 0.004（远低于 0.1，仍记为轻微回退，需验收 FOIT/CLS）。H1 `<em>` 用的 Instrument Serif italic 保留 preload，未动。
- 两项均为小幅度本地结果，**未闭环线上 LCP**；差异在本机也存在 run 间波动。

## F. 组合候选（prefetch+GA+font 一起，非拼单变量最优）
同环境 c4d5d5c + 注入同一 GA id，BASE=gabase（未改），COMBO=三改动，各 n=3 中位：

| 配置 | Perf | FCP | LCP | TBT | CLS | chunks | 传输 | unused JS |
|---|---|---|---|---|---|---|---|---|
| BASE | 93 | 830 | 2955 | 138 | 0 | — | 765KB | — |
| COMBO | 95 | 911 | 2800 | 79 | 0.004 | 11 | 515KB | 119KB |

gtag 在 COMBO 仍真实加载（177KB）。

## G. 导航交互对照（Slow4G+CPU4×，真点击+试写，BASE vs COMBO 各 cold/warm×3）
脚本 `nav_throttle.cjs`：click→等 URL=/editor→editor 可交互→输入并确认正文出现，超时即失败；同时记录 GA /collect 请求与 SW/controller。

| | cold nav | cold editReady | warm nav | warm editReady | typed | GA collect | SW |
|---|---|---|---|---|---|---|---|
| BASE (prefetch on) | 310ms | 641ms | 276ms | 572ms | ✓ | ✓ | active |
| COMBO (prefetch off) | 446ms | 793ms | 648ms | 1029ms | ✓ | ✓ | active |

- prefetch=false 确实让导航变慢：warm nav +372ms、editReady +457ms（预期代价）。
- 功能全部正常（输入正文可见），GA /collect 真实发出，SW active。
- **补偿待做**：按用户要求，若 nav 显著变坏需加 intent-triggered preload（hover/focus 时 router.prefetch），否则不提交 prefetch 改动。

## 字体 CLS 修正
- 评审指出：`--font-geist-mono` 实际用于 landing wordmark 箭头与 "X Articles" 小标，**并非非首屏**。原"never above-fold"注释错误。
- 因无法在本环境精确把 CLS 0.004 swap 映射到具体字体 hash，**默认恢复 Mono preload**，E2 字体实验不保留。保留 GA-only / prefetch 候选。

## H. 回归测试（可运行）
`node docs/seo-aeo/performance/regression_checks.cjs <baseUrl>` —— 已对 COMBO 通过：
- gtag async、无 preload link、pageview config 存在；
- 首页 HTML 不预取 editor 大 chunk（1 chunk link）；
- /editor 可达 200。

## I. legacy-javascript 成因（修正，原"工具不覆盖"结论错误）
- Lighthouse 13.5 仍有该审计，key 为 `legacy-javascript-insight`（非旧名）。
- 线上 chunk `6183-…js` 浪费 12236B，命中 `Array.at/flat/flatMap`、`Object.fromEntries/hasOwn`、`trimStart/End` 等——这是 **Next 默认 browserslist 覆盖旧浏览器而打入的 polyfill**。
- 工程无 `.browserslistrc` / package browserslist，走 Next 默认（含旧浏览器）。
- 修复方向：显式 browserslist 现代目标（如 chrome≥110/safari≥16/firefox≥110）让 webpack 丢弃该 polyfill chunk。
- **兼容风险（未做）**：会放弃 2023 年前旧浏览器；未在本轮实验（构建被网络阻塞）。不擅自改阈值。

## 未闭环 / 待授权
- **H1 LCP 根因未修**：候选 LCP 本地回退原因未定位；gtag preload 优先级、4 字体 preload 子集化、文档体积 164KB 这三项会触及 shared `html-shell.tsx` / next/font / GA 配置——**改前需先报范围**。
- `legacy-javascript` 审计在 Lighthouse 13.5 已不存在，无法复现截图该项。
- 工作树另有 compare/html-shell/seo.ts 并发改动；`tests/seo.test.ts` 1 失败属 seo.ts，与本 delta 无关；typecheck 通过、197/198 测试通过。

原始 JSON：`docs/seo-aeo/measurement/{prod,base,cand}-home-mobile-{1,2,3}.json`；解析脚本 `docs/seo-aeo/performance/diag_lcp.cjs`。
