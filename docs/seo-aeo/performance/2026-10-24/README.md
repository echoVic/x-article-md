# 2026-10-24 性能基线（只读测量，无产品修复）

> **历史基线说明**：本文件记录的是 893c0f4 当时的测量与诊断，数字保留作为对比锚点，**不是最新产品状态**。后续续修见：
> - editor CLS 已修复：`ee7fd61`（源码）+ `e10a2b6`（回归测试），见 `cls.md` 与 `lh/`。同 LH13.5 throttled 条件下 candidate CLS 6/6 runs = 0（EN 0/0/0，ZH 0/0/0），vs base 0.047。
> - legacy-javascript-insight 已溯源：Next 内置 polyfill，不可安全删除，见 `legacy.md`。
> - Article Studio compare 实体已补官方 snapshot，见 `../compare-competitors.md`。
> - 当前 source HEAD：见仓库 `git rev-parse HEAD`（本文件落盘时为 83bd64e）。

## 范围
- 基线 ref：`893c0f4`（origin/main）。
- 工具：Lighthouse CLI 13.5.0，mobile 模拟节流，串行单进程。
- 本地：worktree `.worktrees/base-893c0f4`，`next start` 端口 3457，注入 `NEXT_PUBLIC_GA_ID=G-6PCZ5398F1`。
- 线上：`https://markdown2x.com/`（特征级确认 GA async 已部署，不确证精确 SHA）。

## 中位数（n=3）
| 页 | 本地 Perf/FCP/LCP/TBT/CLS/SI | 线上 Perf/FCP/LCP/TBT/CLS/SI |
|---|---|---|
| / | 91/836/2969/212/0.000/836 | 89/1730/1769/212/0.034/5808 |
| /zh | 94/855/2937/116/0.000/855 | 93/1629/1629/194/0.024/4228 |
| /editor | 86/858/3320/290/0.047/1820 | 88/1684/1684/228/0.047/6232 |
| /zh/editor | 85/862/3313/255/0.047/1758 | 81/1658/1658/345/0.047/13190 |

线上与本地网络条件不同，未做外推归因。

## 诊断（本地 home run2）
- `legacy-javascript-insight`：12 KiB，单 chunk `6183-…js`。该 chunk 内容为 Next 内部 runtime（addPathPrefix/appBootstrap 等），其中出现 Array.at/flat/flatMap、Object.fromEntries/hasOwn 等 modern 方法。是否可通过 browserslist 移除**未验证**，由独立线跟进。
- `unused-javascript` 280 KiB：chunk 1445（88/150KB，lucide-react 共享图标组，landing 仅用 Globe）、gtag 73/177KB（第三方）、b56efd7f 47KB、7580 26KB。
- editor CLS 0.047：LH `layout-shifts` 节点为 `<main class="grid min-h-0 flex-1 overflow-hidden">`。**未完成** initial-shift trace（前后 rect/time），未定位具体子节点，未做修复。
- LCP 元素 snippet 未取到（home LCP≈FCP）。

## 未闭环
- editor CLS 0.047 具体 cause node 未 trace 到子节点；无原因级修复。
- 1445 lucide chunk 来源已定位，未改。
- legacy 6183 由独立线跟进。
- prefetch/font 历史 rejected 不复活。

## 原始文件
- `base/*.json` + `base/*.err`（本地）
- `prod/*.json` + `prod/*.err`（线上）
- LH shift 详情见各 JSON `audits.layout-shifts`。
