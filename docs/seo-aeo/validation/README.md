# 最终门禁验证记录

- **HEAD**: 184f3fad1700aed091a0a90b405795e5e247e0ae（perf(ga): load gtag via async script to drop high-priority preload）
- **时间**: 2026-10-24 16:15 CST
- **Dirty**: 无源码 dirty。仅 untracked：`audit-status.md`、`validation/`、`docs/backlinks/`、`final-1.md`、`zhihu-mac-storage-assets/`（后三者为用户素材，不纳入提交）。

## 结果汇总

| 门禁 | 结果 | 日志 |
|---|---|---|
| `next build --webpack` | ✅ EXIT=0（62 路由静态化完成） | build-final.log |
| `tsc --noEmit` | ✅ EXIT=0 | tsc-final.log |
| `eslint .` | ✅ EXIT=0，0 error / 3 warning | eslint-final.log |
| `vitest run` | ✅ 237/237 通过（34 files） | vitest-final.log |

## Lint warnings（0 error，均既有，未新增）

- `components/article-preview.tsx:180` `<img>` 提示（既有）
- `components/codemirror-editor.tsx:256` exhaustive-deps（既有）
- `tests/translate.test.ts:9` `markdown` 未使用（既有）

> 上一轮记录中的 compare-page / compare-copy 两条 warning 已被后续 cleanup 提交消化。

## HTTP 集成（`next start -p 3457`）

- `/robots.txt`：`*` + 7 AI UA（GPTBot / OAI-SearchBot / ChatGPT-User / ClaudeBot / Claude-User / Claude-SearchBot / PerplexityBot）全部 `Allow: /`，零 Disallow；显式 `-A GPTBot` / `-A ClaudeBot` 请求结果一致。
- `/sitemap.xml`：XML 序列化正常，含 hreflang alternate（en / zh-CN / x-default），lastmod 2026-10-23。
- `/`：canonical=`https://markdown2x.com`；hreflang 三条（en / zh-CN / x-default）；og:* 9 条；twitter:card=summary_large_image；twitter:site=`@echo_vic`（用户确认的发布账号，site 字段允许）；**未输出 twitter:creator**（全站泛化禁止）。
- GA：组件渲染 `<script async src="...gtag/js?id=...">`，**无 `<link rel=preload>`**；本地 build 未注入 `NEXT_PUBLIC_GA_ID` 故 HTML 中不输出 gtag（组件门控 `NODE_ENV=production && measurementId`，行为正确，部署侧注入即可）。
- Smoke：`/compare`、`/zh`、`/zh/compare`、`/editor` 全部 200；`/llms.txt` text/plain 正常。
- `verify-og-images.py http://localhost:3457`：19 路由 og:image + twitter:image 全部 HTTP 200、1200x630、SHA 落盘。

## Artifacts 决策

- `og-contact-sheet.png` + `og-images-verified.json` 保留作为 19 路由 OG 证据。
- 单图 `og-sheets/*.png`（19 张 untracked）已删除，`per-page-og-images.md` 文档同步移除该 artifact 引用，改为说明"可由 verify 脚本复现"。
