import type { Locale } from "@/lib/i18n";

// The default manuscript deliberately starts with `##` (not `#`): the page's
// SEO section renders the real single <h1>, so the sample must not contribute a
// second H1 to the server-rendered editor HTML.
export const sampleMarkdown = `## From Markdown to X Articles

Draft once, then preview how your article will feel before you paste it into X.

### What works in this first version

- **Bold text** for emphasis
- Links like [x.com](https://x.com)
- Inline code such as \`pnpm build\`
- Code blocks for technical snippets
- Tables as PNG assets
- X status links as embed hints
- Mermaid diagrams with a rendered preview

| Asset | X Articles strategy |
| --- | --- |
| Table | PNG asset |
| Mermaid | PNG asset |

https://x.com/jack/status/20

\`\`\`ts
const readyToShip = true;
console.log({ readyToShip });
\`\`\`

\`\`\`mermaid
graph TD
  A[Write Markdown] --> B[Preview Article]
  B --> C[Copy]
  C --> D[Paste into X Articles]
\`\`\`
`;

export const sampleMarkdownZh = `## 从 Markdown 到 X Articles

先写好草稿，再预览文章粘贴到 X 后的真实效果。

### 第一版支持的能力

- **加粗文本**强调重点
- 链接，比如 [x.com](https://x.com)
- 行内代码，比如 \`pnpm build\`
- 代码块，方便贴技术片段
- 表格自动转为 PNG 图片
- X 帖子链接作为嵌入提示
- Mermaid 图表实时渲染预览

| 资源 | X Articles 策略 |
| --- | --- |
| 表格 | PNG 图片 |
| Mermaid | PNG 图片 |

https://x.com/jack/status/20

\`\`\`ts
const readyToShip = true;
console.log({ readyToShip });
\`\`\`

\`\`\`mermaid
graph TD
  A[编写 Markdown] --> B[预览文章]
  B --> C[复制]
  C --> D[粘贴到 X Articles]
\`\`\`
`;

export function getSampleMarkdown(locale: Locale): string {
  return locale === "zh" ? sampleMarkdownZh : sampleMarkdown;
}
