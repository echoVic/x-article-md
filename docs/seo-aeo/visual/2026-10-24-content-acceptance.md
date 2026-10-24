# SEO/AEO 内容验收记录（2026-10-24）

- 服务：`http://localhost:3456`（用户提供的稳定端口，未自行 build/重启）
- 仓库 HEAD：`51aba3c`（fix(seo): correct zh code-mode default and strikethrough claims）
- 视口：桌面 ~1006×972；移动 CDP 模拟 390×844 @DPR3
- 范围：桌面/移动内容验收。OG/Twitter 图仍在修 pre-hash 404，**本轮未判通过**，留待重验。

## 桌面端结果

### 中文工具页新增正文（4 页全部通过）
| 页面 | H1 | 真实例子 | 局限与异常恢复 | 横向溢出 |
|---|---|---|---|---|
| /zh/code-to-image | 1「把代码变成精美图片」 | ✅ TypeScript 函数示例 + 主题着色说明 | ✅ 4 条（仅 PNG/超长代码/围栏块/语言识别恢复） | 0 |
| /zh/markdown-table-to-image | 1「把 Markdown 表格变成图片」 | ✅ 带对齐表格示例（`:---:`） | ✅ 4 条（无合并格/列宽/纯文本/分隔行恢复） | 0 |
| /zh/mermaid-to-png | 1「把 Mermaid 图表渲染成 PNG」 | ✅ 流程图 graph TD 示例 | ✅ 4 条（仅 PNG/strict 安全/语法错误占位） | 0 |
| /zh/markdown-to-x-articles | 1「将 Markdown 转换为 X Articles」 | ✅ 带格式 Markdown 示例（H1/粗体/链接/列表） | ✅ X 不支持 Markdown 原生渲染说明、缩进列表限制 | 0 |

章节内容经 innerText 抽样确认非空、非折叠。

### compare（/compare 与 /zh/compare）
- 表头恰为 5 列：`能力/Capability · MD2X · X Article Markdown Paste · xPoster · Article Studio` ✅
- Article Studio 各行为 `Unknown/官方未列出` ✅
- 表格正文无 Carbon/Pandoc/Typora ✅
- **发现项 1**：全站页脚导航仍有一条文字为「对比 Carbon / Pandoc / Typora」的链接，但 href 实际指向 `/zh/compare`（新对比页）——页脚文案陈旧，与新主题不符，建议改为「对比 X Article Markdown Paste / xPoster / Article Studio」。

### 语言导航与路径
- EN 页：中文 → /zh 系；ZH 页：EN → 根路径（landing-header 按 locale 切根，非深链对应子页——设计如此，见 components/landing-header.tsx:73）。
- canonical 与 OG 图路径中英分离且每页独立，例如：
  - `/` → `/opengraph-image-35z9bs?2554…`；`/zh` → `/zh/opengraph-image-1x1kc8?8e91…`
  - `/compare` → `/compare/opengraph-image-1npxh3…`；`/zh/compare` → `/zh/compare/opengraph-image-1g8dhc…`
- OG/Twitter 图 HTTP 状态本轮未判定（pre-hash 404 修复中）。

## 移动端结果（390×844@3）
| 页面 | 横向溢出 | 例子/局限可见 | 语言链接 | 表格 |
|---|---|---|---|---|
| /zh/code-to-image | 0 | ✅ 两节均在 | EN→/ | — |
| /zh/mermaid-to-png | 0 | ✅ 两节均在 | EN→/ | — |
| /zh/compare | 0 | — | EN→/ | 容器 overflow-x:auto，表 425>容器 342，内部横滑 ✅ |
| / 首页 | 0 | — | 中文→/zh | — |

## 证据截图
- `desktop-zh-code-to-image-limitations.png` — 桌面「局限与异常恢复」4 条可见
- `mobile-zh-compare-table.png` — 移动 compare 表格内部横滑、Unknown 列可见

## 待重验项
- OG/Twitter 图 pre-hash 404（修复中）
- 发现项 1：页脚陈旧 Carbon/Pandoc/Typora 链接文案
