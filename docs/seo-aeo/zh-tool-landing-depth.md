# 中文工具落地页内容厚度批次 — 证据记录（源码核验版）

日期：2026-10-24
范围：`lib/feature-landing-copy.ts` 中文对象、`components/feature-landing-page.tsx`、`tests/feature-landing-zh.test.ts`。

## 每条新增示例/限制 ↔ 源码证据

| 声明（zh 文案） | 源码位置 | 实测证据 |
|---|---|---|
| 代码/表格/Mermaid 只出 PNG | `lib/image-copy.ts`：`renderCodeToPng`（canvas→blob，:59/:176）、`renderSvgToPng`（SVG 光栅化，:179）；`copySvgImage`/`downloadSvgImage` 都走 `renderSvgToPng` | 内部即使产 SVG（Mermaid），复制/下载前一律光栅化为 PNG；`lib/llms-txt.ts` 亦写明 "not SVG" |
| 围栏代码块出图、行内代码不出图 | `lib/markdown.ts`：行内 code token → `<code>` 内联（:492）；围栏 ` ``` ` → `type:"code"` block（:108） | 测试：围栏 → code block；`\`x\`` → `<code>x</code>` |
| 列表只认顶格项，缩进项掉出为段落 | `lib/markdown.ts`：`unorderedListPattern=/^[-*]\s+/`、`orderedListPattern=/^\d+[.)]\s+/`（:69-70），列表循环遇不匹配即 break（:156-162） | 实测 `- Top\n  - Nested…` → 两个平铺 list + 一个合并段落 "Nested one - Nested two"，无嵌套 `<ul>` |
| 原生 HTML 被转义、脚注/公式无特殊处理 | `lib/markdown.ts`：inline token 仅 text/strong/em/link/code/image（:1-7）；所有输出经 `escapeHtml`（:486-498,:704） | 测试：`<b>` → `&lt;b&gt;`，`[^1]` 原样保留为文本 |
| Mermaid strict 模式禁外链/交互 | `components/mermaid-block.tsx`：`securityLevel:"strict"`（:41）；`lib/image-copy.ts` 同配置（:361） | 渲染失败走 `failed` 占位框并保留源码（mermaid-block.tsx:62-85） |
| 表格对齐 `:---:`/`---:` 被识别 | `lib/markdown.ts`：`parseAlignment`/`alignmentToMarkdown`（:659,:694-696） | 测试：`|---|:---:|` → `["left","center"]` |
| 表格无合并单元格、单元格纯文本 | `lib/markdown.ts`：`splitTableRow` 按竖线切纯文本，无嵌套解析（:641-651） | 解析器对列数无上限（`headers.length<2` 即拒绝，:643），故文案不写列数上限 |

## 已纠正的“凭常识”内容（本轮删除）

- 删除“单段约 30 行内”——源码无行数截断（`components/code-block.tsx` 全量 `lines.map`）。
- 删除“建议控制在 4–5 列内”——表格解析器无列数硬上限。
- 把“嵌套列表被 X Articles 拍平”改为“列表只认顶格项，缩进项掉出为段落”（实测行为）。
- 把“Mermaid 预览直接标红”改为“渲染失败显示错误占位框并保留源码”。
- “不支持外部图片”精确为 `securityLevel:"strict"` 下外链/点击交互被禁用。

## 测试

`tests/feature-landing-zh.test.ts`（8 条）：
- 对象存在性 + 反向断言（en 无 examples/limitations）。
- **转换器实测**：嵌套列表行为、HTML 转义/脚注原样、围栏 vs 行内代码、表格居中对齐。

运行：`npx vitest run tests/feature-landing-zh.test.ts` → 8 passed。
`tsc --noEmit` 对本批文件无错误（现存 `tests/robots.test.ts` 报错属其他批次）。
未 build、未 add/commit，等待协调。
