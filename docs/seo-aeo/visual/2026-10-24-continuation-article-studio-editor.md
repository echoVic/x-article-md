# 延续验收记录（2026-10-24，Article Studio + editor 回归）

## 环境来源
- 所验构建：HEAD **449e873b29c21744d750227f322b0830c4410b02**（compare: tighten Article Studio sourcing）
- BUILD_ID：`9wsb0L9_Q_wxua3vgeqlU`
- 被测服务：新独立端口 **http://localhost:3458**（next start，由本次 pnpm build 产出的 .next；原 3456 未 restart；3457 为用户性能隔离树旧构建，未触碰）
- 视口：桌面 ~967 宽；移动 CDP 390×844@DPR3。未 commit、未 push。

## Compare（桌面 /compare 与 /zh/compare）
Article Studio 列实测值（与预期一致）：
| 行 | EN | ZH |
|---|---|---|
| 形态 | Web app + optional Chrome companion | 网页应用 + 可选 Chrome 伴侣 |
| 代码块 | Supported; rendering not detailed | 支持；渲染方式未详述 |
| 表格 | Native table, or PNG on paste | 原生表格，或粘贴时转图片 |
| 图片上传 | Yes, via the Chrome companion (draft) | 是，经 Chrome 伴侣（草稿） |
| Mermaid | Yes, to PNG at 2x | 是，2x PNG |
| 推文嵌入/排队 | Not listed / Not listed | 官方未列出 ×2 |

- 官方链接 `https://md2xarticle.com/` 存在 ✅
- 厂商自述：FAQ「以上描述依据其官网与隐私政策 / follow the vendor's own site and privacy policy」✅
- 消歧：「它与英国摄影工作室 article-studio.com 无关」在 SSR HTML 与展开后页面中确认 ✅
- xPoster 消歧（Chrome 扩展 ≠ WordPress 插件）在 ✅
- 横向溢出 0。

## 移动 /zh/compare（390×844@3）
- 页面横向溢出 0；表格容器 overflow-x:auto，表 431>容器 342，内部横滑正常 ✅

## Editor 回归（/zh/editor）
- 工具栏按钮齐备：标题/加粗/行内代码/链接/列表×2/代码块/Mermaid/表格/润色/翻译/重置为示例/专注模式/检查/发布/复制正文/资源与媒体。
- **【更正上一版错误】**：顶部「代码块」分段切换组（role=group）有两个按钮：**代码引用（n89）/ 代码图片（n91）**，用 aria-pressed 判定。此前误把它当成 Markdown `>` 普通 blockquote，是错的——本工具的 fenced code 渲染模式切换就在这里。
- **默认 = 代码引用模式**：示例 ```ts 块在预览渲染为带语言标签「TS」、带行号（1/2）的富文本代码块（实测 pres=1、imgs=0）✅。
- **切到代码图片模式**：点 n91 后 aria-pressed=true、旁边出现主题下拉「自动」✅（GUI 模式切换通过）。
  - **PNG 导出未在本 GUI 实测**：复制走 canvas→toBlob→ClipboardItem，受浏览器剪贴板权限限制，本轮未验证剪贴板实际 blob 产物；PNG 生成正确性交给自动化/单元测试的 blob 检查，本报告不据此判通过。
  - 预览内 code `<pre>` 富文本块 ≠ 复制到 X 的 quote HTML/PNG，预览证据不含剪贴板断言。
- **table/Mermaid 真实渲染（非仅按钮存在）**：预览中实测 1 个 `<table>`（3 行）+ 2 个 `<svg>`——Mermaid graph TD 真实渲染为流程图节点「编写 Markdown→预览文章→…」，表格渲染为带边框真实 table。截图见 mermaid-table-render.png。
- 输入→预览：插入 Markdown 后右侧预览实时更新（blockquote 渲染验证 blockquoteCount=1）✅
- 专注模式：进入 `?focus=1`/data-focus=true；**单次 Esc** 后 URL 清空、data-focus=false、html overflow 恢复 ✅

## OG 抽查（仅抽查，未重做）
- /zh/compare、/compare、/ 的 og:image 各自独立 hash；twitter:site=@echo_vic；twitter:image 1200×630 ✅

## 证据
- `2026-10-24-continuation-zh-compare-article-studio-faq.png` — FAQ 展开：Article Studio 厂商自述+摄影工作室消歧
- `2026-10-24-continuation-mobile-zh-compare.png` — 移动表格横滑
- `2026-10-24-continuation-editor-input-preview.png` — 输入 blockquote 实时渲染
- `2026-10-24-continuation-code-quote-default.png` — 默认代码引用模式：TS fenced 块渲染为富文本块（带行号）
- `2026-10-24-continuation-code-image-mode.png` — 切代码图片模式：pressed=true + 主题下拉「自动」（仅 GUI 模式记录，非 PNG 产物证据）
- `2026-10-24-continuation-mermaid-table-render.png` — table 真实 table + Mermaid 真实 SVG 流程图渲染
