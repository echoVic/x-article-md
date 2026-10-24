# 最终复验记录（2026-10-24，OG/导航批）

## 验收来源与范围声明
- 所验构建：本地 build **HEAD 15b97b4**（feat(seo): per-page OG/Twitter images + twitter:site=@echo_vic）。
- 被测服务：用户提供的稳定端口 **http://localhost:3456**（非云端、非最新性能候选；本记录不代表后续性能优化批次的结论）。
- 环境：桌面 ~1006 宽；移动 CDP 模拟 390×844@DPR3。

## 1. 路由 HTTP 状态（真实 curl）
- 全部预期路由 200：`/`、`/zh`、`/editor`、`/zh/editor`、`/thread`、`/zh/thread`、`/code-to-image`、`/zh/code-to-image`、`/markdown-table-to-image`、`/zh/markdown-table-to-image`、`/mermaid-to-png`、`/zh/mermaid-to-png`、`/markdown-to-x-articles`、`/zh/markdown-to-x-articles`、`/compare`、`/zh/compare`、`/blog`、`/zh/blog`、`/blog/markdown-to-x-articles`、`/zh/blog/markdown-to-x-articles`、`/blog/paste-code-into-x-articles`、`/zh/blog/paste-code-into-x-articles`、`/blog/md2x-vs-carbon`、`/privacy`
- `/zh/blog/md2x-vs-carbon` = **404**（不存在，符合预期；关键是切换器不得指向它）

## 2. 语言切换深链（真实浏览器渲染 href 实测）
| 当前页 | 实测切换 href | 判定 |
|---|---|---|
| `/` ↔ `/zh` | `/zh` / `/` | ✅ |
| `/editor` ↔ `/zh/editor` | 深链互换 | ✅ |
| `/code-to-image` ↔ `/zh/code-to-image` | 深链互换 | ✅ |
| `/compare` ↔ `/zh/compare` | 深链互换 | ✅ |
| `/blog` ↔ `/zh/blog` | 索引互链 | ✅ |
| `/blog/markdown-to-x-articles` ↔ `/zh/blog/markdown-to-x-articles` | 深链互换 | ✅ |
| `/blog/paste-code-into-x-articles` ↔ `/zh/blog/paste-code-into-x-articles` | 深链互换 | ✅ |
| **`/blog/md2x-vs-carbon`** | **`/zh/blog`**（非 404 路径） | ✅ |
| `/privacy` | `/zh` | ✅ |

所有切换目标 curl 均 200。

## 3. Footer
- `/zh`、`/zh/compare`、`/compare` 页面正文与 footer 中 Carbon/Pandoc/Typora 字样已全部消失（此前页脚「对比 Carbon / Pandoc / Typora」陈旧链接已修）✅
- `/blog/md2x-vs-carbon` 正文仍含 Carbon——该文即 Carbon 对比文章本身，属正当内容。

## 4. OG/Twitter 图
- 本地路由抽查：`/zh/opengraph-image-1x1kc8?…`、`/zh/compare/opengraph-image-1g8dhc?…`、`/compare/opengraph-image-1npxh3?…`、`/blog/md2x-vs-carbon/opengraph-image-g58prh?…` 均 **200 image/png**。
- meta 实测：og:image 带独立 hash、og:image:alt 各页不同、twitter:card=summary_large_image、twitter:site=@echo_vic。
- 19 张独立字图已由 `docs/seo-aeo/og-contact-sheet.png` 核对（英中标题各异，含 /privacy）。

## 5. 内容/布局（桌面+移动）
- compare 表格五列：能力/MD2X/X Article Markdown Paste/xPoster/Article Studio，Article Studio 列逐行「未知/Unknown」✅
- 中文工具页新正文（真实例子/局限与异常恢复）桌面可见 ✅
- 移动 390×844：compare 表格内部横滑（表 425>容器 342），页面无横向溢出 ✅

## 证据截图（docs/seo-aeo/visual/）
- `final-zh-compare-unknown-column.png` — 桌面 Article Studio「未知」列逐行
- `final-zh-mermaid-example.png` — 中文 mermaid 工具页「真实例子/局限」新正文
- `final-mobile-zh-compare-table.png` — 移动表格内部横滑

## 结论
导航深链、footer、OG 路由、内容布局全部通过；md2x-vs-carbon 切换正确落到 /zh/blog，无 404。未 commit。
