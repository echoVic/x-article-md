# SEO 落地页实现方案

## Context

当前项目 MD2X 有 6 个页面（首页/编辑器/Thread × 中英文），SEO 覆盖面有限。需要添加针对长尾搜索意图的独立落地页，精准捕获 "markdown to x articles"、"code blocks in x articles"、"mermaid in x articles" 等高转化意图流量。

先做英文版 3 个页面，中文版后续 Phase 2 扩展。

---

## 架构决策

1. **可复用模板组件** `SeoLandingPage` — 三个页面共享相同的 section 结构，但各自有不同内容和 JSON-LD
2. **提取 Header/Footer** — 从 `landing-page.tsx` 中提取为独立组件，SEO 页面和主站共享
3. **静态路由** — 每个 SEO 页面一个 `app/[slug]/page.tsx`，不用动态路由
4. **扩展现有 SEO 系统** — 在 `lib/seo.ts` 的 `SeoPage` 类型和 `pageSeo` 中新增条目

---

## 目标页面

| 路径 | 目标关键词 | 搜索意图 |
|------|-----------|---------|
| `/markdown-to-x-articles` | markdown to x articles, convert markdown x | 把 Markdown 发布为 X Articles |
| `/paste-code-into-x-articles` | code blocks x articles, syntax highlighting x | 在 X Articles 中分享代码 |
| `/mermaid-in-x-articles` | mermaid diagram x articles, flowchart x | 在 X Articles 中展示图表 |

---

## 新建文件

| 文件 | 说明 |
|------|------|
| `components/landing-header.tsx` | 提取的顶部导航组件 |
| `components/landing-footer.tsx` | 提取的页脚组件 |
| `components/seo-landing-page.tsx` | SEO 落地页模板组件 |
| `lib/seo-landing-copy.ts` | 三个 SEO 页面的内容数据 |
| `app/markdown-to-x-articles/page.tsx` | 页面入口 |
| `app/paste-code-into-x-articles/page.tsx` | 页面入口 |
| `app/mermaid-in-x-articles/page.tsx` | 页面入口 |

## 修改文件

| 文件 | 改动 |
|------|------|
| `lib/seo.ts` | 扩展 SeoPage 类型 + 三个 pageSeo 条目 + `buildHowToJsonLd()` |
| `app/sitemap.ts` | 添加 3 个新 URL 条目 |
| `components/landing-page.tsx` | 重构为引用 LandingHeader/LandingFooter（行为不变） |

---

## 页面结构设计

每个 SEO 页面的 section 布局（复用 globals.css 现有类）：

```
<div className="landing">
  <LandingHeader locale="en" />
  <JSON-LD: HowTo schema>
  
  <hero section>          — eyebrow + h1 + lead + CTA button
  <problem section>       — 为什么 X Articles 有这个限制
  <solution section>      — MD2X 如何解决
  <steps section>         — 三步操作指南（复用 .workflow-steps）
  <demo section>          — 左右对比展示（复用 .product-frame）
  <cta section>           — CTA 驱动到 /editor
  
  <LandingFooter locale="en" />
</div>
```

所有样式来自 `globals.css` 已有类（`.landing`, `.section`, `.container`, `.hero`, `.eyebrow`, `.lead`, `.workflow-steps`, `.product-frame`, `.cta-section`, `.btn`, `.btn-primary`）。不需要新增 CSS。

---

## `SeoLandingPage` 组件接口

```typescript
type SeoLandingContent = {
  jsonLd: object;
  eyebrow: string;
  title: string;
  lead: string;
  problemTitle: string;
  problemDescription: string;
  problemPoints: string[];
  solutionTitle: string;
  solutionDescription: string;
  solutionPoints: string[];
  stepsTitle: string;
  steps: { title: string; description: string }[];
  demoSection?: {
    title: string;
    beforeLabel: string;
    beforeContent: string;
    afterLabel: string;
    afterContent: string;
  };
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaHref: string;
};
```

---

## JSON-LD: HowTo Schema

在 `lib/seo.ts` 中新增：

```typescript
export function buildHowToJsonLd(data: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: data.name,
    description: data.description,
    step: data.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
    tool: { "@type": "HowToTool", name: "MD2X" },
  };
}
```

---

## 实施步骤

### Step 1: 提取 Header/Footer
从 `landing-page.tsx` 提取 header 和 footer 为 `landing-header.tsx` / `landing-footer.tsx`，重构主站引用。确保 `/` 和 `/zh` 页面不变。

### Step 2: SEO 系统扩展
- 扩展 `SeoPage` 类型添加 `"markdownToXArticles" | "pasteCodeIntoXArticles" | "mermaidInXArticles"`
- 在 `pageSeo` 中添加三条记录（title/description/path/alternates）
- 添加 `buildHowToJsonLd()` 函数

### Step 3: 内容数据
创建 `lib/seo-landing-copy.ts`，定义三个页面的完整内容数据。每页 800-1200 词实质内容。

### Step 4: 模板组件
创建 `components/seo-landing-page.tsx`，接受 `SeoLandingContent` 渲染完整页面。

### Step 5: 页面入口
创建三个 `app/[slug]/page.tsx`，各自导出 metadata 并渲染 SeoLandingPage。

### Step 6: Sitemap
更新 `app/sitemap.ts` 添加三个 URL（priority 0.8, changeFrequency monthly）。

---

## 验证

1. `npm run build` 通过（exit code 0）
2. 浏览器访问三个新 URL 验证渲染正确
3. 验证 `/` 和 `/zh` 页面未受影响（header/footer 提取的回归测试）
4. 检查 HTML 源码中 JSON-LD 正确输出
5. 检查 `<head>` 中 title/description/canonical 正确
6. `/sitemap.xml` 包含新 URL
