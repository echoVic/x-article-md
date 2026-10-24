# 性能修复基线与对照（首页 mobile）

> **当前状态（2026-10-24 收尾，详见 `2026-10-24/README.md`、`2026-10-24/cls.md`、`2026-10-24/lh/`）**：本文是历史实验记录。产品现状：GA native async（`184f3fa`）已在线上 feature-match 部署；editor mobile CLS 修复（`ee7fd61`）本地 LH 已验证归零，待线上部署后 LH 复验；legacy polyfill 有据不删；prefetch/font/组合方案历史 rejected 不复活。
>
> **历史状态（本文件记录时）**：仅 GA async 单变量（commit `184f3fa`）当时未部署；prefetch/font/组合均为历史实验，未进入产品；本文数字是历史候选测量，非当前代码。原截图 URL/条件、legacy ~22KiB、部署后线上效果均未闭环。

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

## D. 历史实验：prefetch={false}（已拒绝，未进产品）
> 以下为历史候选测量，**当前代码未包含**。因导航回退被拒，patch 存 `rejected-prefetch.patch`。
- 曾给首页指向 `/editor` 的 4 个 `<Link>` 加 `prefetch={false}`，后因 warm nav +372ms 回退撤回。

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
- localhost LCP 中位 +453ms 的原因未定位；后续 G 节已实测导航回退，故 prefetch=false 被拒绝、未入产品。

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
| E2 字体：Geist Mono `preload:false`（已拒绝） | 96 | 921 | 2568 | 153 | **0.004** |

- **E1 GA 已交付**（commit `184f3fa`，未部署）：本地小幅 LCP −152ms/TBT −23ms，线上未复验。
- **E2 字体已回退**：CLS 0.004 swap 无法排除 Mono 实际首屏使用，不保留。
- 均为本机 localhost 结果，不据此宣称线上 LCP 改善。

## F. 历史组合候选（prefetch+GA+font，已拒绝未入产品）
> 历史测量，当前代码不含；仅留作记录。
同环境 c4d5d5c + 注入同一 GA id，BASE=gabase（未改），COMBO=三改动，各 n=3 中位：

| 配置 | Perf | FCP | LCP | TBT | CLS | chunks | 传输 | unused JS |
|---|---|---|---|---|---|---|---|---|
| BASE | 93 | 830 | 2955 | 138 | 0 | — | 765KB | — |
| COMBO | 95 | 911 | 2800 | 79 | 0.004 | 11 | 515KB | 119KB |

gtag 在 COMBO 仍真实加载（177KB）。

## G. 历史导航交互对照（Slow4G+CPU4×，真点击+试写，BASE vs COMBO 各 cold/warm×3）
> 历史实验数据，用于裁决 prefetch=false（已拒绝）；当前代码仍默认 prefetch on。
脚本 `nav_throttle.cjs`：click→等 URL=/editor→editor 可交互→输入并确认正文出现，超时即失败；同时记录 GA /collect 请求与 SW/controller。

| | cold nav | cold editReady | warm nav | warm editReady | typed | GA collect | SW |
|---|---|---|---|---|---|---|---|
| BASE (prefetch on) | 310ms | 641ms | 276ms | 572ms | ✓ | ✓ | active |
| COMBO (prefetch off) | 446ms | 793ms | 648ms | 1029ms | ✓ | ✓ | active |

- prefetch=false 确实让导航变慢：warm nav +372ms、editReady +457ms。
- 功能全部正常（输入正文可见），GA /collect 真实发出，SW active。
- **结论**：因即时/warm 导航回退无法用 intent-trigger 完全补偿，prefetch=false 被拒绝、未进产品（见 `rejected-prefetch.patch`）。

## 字体 CLS 修正
- 评审指出：`--font-geist-mono` 实际用于 landing wordmark 箭头与 "X Articles" 小标，**并非非首屏**。原"never above-fold"注释错误。
- 因无法在本环境精确把 CLS 0.004 swap 映射到具体字体 hash，**默认恢复 Mono preload**，E2 字体实验不保留。保留 GA-only / prefetch 候选。

## H. 回归测试（可运行）
`node docs/seo-aeo/performance/regression_checks.cjs <baseUrl>`（需本地注入 `NEXT_PUBLIC_GA_ID` 才会真实打 GA）：
- 真浏览器监听：gtag/js 被请求、GA `/collect`(page_view) 真实发出；
- /editor 可达 200。
注：当前产品代码 **仍保留 Next 默认 prefetch**（prefetch=false 已拒绝），本脚本不再断言"首页不预取 editor chunk"。

## I. legacy-javascript 成因（修正，原"工具不覆盖"结论错误）
- Lighthouse 13.5 仍有该审计，key 为 `legacy-javascript-insight`（非旧名）。
- Lighthouse 归因：chunk `6183-…js` 命中 `Array.at/flat/flatMap`、`Object.fromEntries/hasOwn`、`trimStart/End` 等 modern-method polyfill，浪费 12236B；工程无显式 browserslist，走 Next 默认。该 chunk 是否整段由默认 browserslist 打入、现代 browserslist 能否安全移除，**未做 bundle 级溯源验证**。
- **未做**：未实验显式现代 browserslist（chrome≥110/safari≥16/firefox≥110）；不擅自改阈值，现代目标是否真能去掉该 chunk 待验证。

## 未闭环（如实保留）
- **已交付（历史测量时状态）**：仅 GA async（commit `184f3fa`）当时未部署；本地单变量 LCP −152ms/TBT −23ms。**后续更新**：GA native async 已在线上 feature-match 部署；editor mobile CLS 修复 `ee7fd61` 本地 LH 验证归零，待线上部署后 LH 复验（见 `2026-10-24/cls.md`、`lh/`）。
- **H1 LCP 根因未修**：本 vantage 线上 LCP 1702ms ≠ 截图 5.0s（口径/vantage 不同）；gtag preload 已降权，4 字体 preload、164KB 文档体积未动。
- `legacy-javascript-insight` 总 ~22KiB（chunk 6183 ~12KiB 为 Next 默认 browserslist polyfill），未修；现代 browserslist 是否必删 Next 硬 polyfill 未验证。
- prefetch/font/组合均历史实验未进产品；原始数字保留于 `docs/seo-aeo/measurement/`。

原始 JSON：`docs/seo-aeo/measurement/{prod,base,cand}-home-mobile-{1,2,3}.json`；解析脚本 `docs/seo-aeo/performance/diag_lcp.cjs`。
