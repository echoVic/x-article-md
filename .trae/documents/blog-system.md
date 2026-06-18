# Blog 系统实现计划

## Context

当前 Header 导航中"Open Editor"和"Get Started"功能重叠，已修复为 Features / Editor / Thread / FAQ。用户进一步希望增加 Blog 来承载现有 SEO 教程页面和后续 changelog 内容，提供更好的 SEO 长尾流量和内容扩展性。

## 方案概述

- 使用 `next-mdx-remote/rsc` 实现 MDX 博客（纯 RSC，无需修改 next.config）
- 内容存放在 `content/blog/*.mdx`，通过 frontmatter 管理元数据
- 迁移现有 3 个 SEO 落地页为博客文章 + 新增 1 篇 changelog
- 旧 URL 301 重定向到 `/blog/[slug]`
- 博客索引 `/blog` + 详情 `/blog/[slug]`

## 依赖安装

```bash
pnpm add next-mdx-remote gray-matter
```

## 实施步骤

### Step 1: 创建 `lib/blog.ts`

博客文件系统工具库：
- `getBlogPosts()` — 读取 content/blog/ 目录，gray-matter 解析 frontmatter，按日期倒序返回
- `getBlogPost(slug)` — 单篇文章（frontmatter + MDX source）
- `getAllSlugs()` — 用于 generateStaticParams
- 类型 `BlogPostMeta`（slug/title/description/date/tags）和 `BlogPost`

### Step 2: 创建 `content/blog/` 内容

4 个 MDX 文件（从 lib/seo-landing-copy.ts 转化为自然文章）：
- `markdown-to-x-articles.mdx`
- `paste-code-into-x-articles.mdx`
- `mermaid-in-x-articles.mdx`
- `changelog-v1.mdx`（新增）

Frontmatter 格式：
```yaml
---
title: "..."
description: "..."
date: "2026-06-01"
tags: ["markdown", "tutorial"]
---
```

### Step 3: 创建 `components/mdx-components.tsx`

MDX 自定义组件映射（h1-h3、a、code/pre、ul/ol、blockquote）。

### Step 4: 创建 `app/blog/page.tsx` — 博客索引页

- 使用 LandingHeader + LandingFooter
- 展示文章卡片列表（标题、日期、描述、标签）
- 导出静态 metadata

### Step 5: 创建 `app/blog/[slug]/page.tsx` — 文章详情页

- `generateStaticParams()` + `generateMetadata()`
- MDXRemote 渲染 + Article JSON-LD
- prev/next 导航
- 使用 LandingHeader + LandingFooter + `.blog-prose` 排版

### Step 6: 添加 `.blog-prose` 样式到 `app/globals.css`

基于现有 CSS 变量的文章排版样式（max-width 680px，段落/标题/链接/代码/引用等）。

### Step 7: 更新 Header 导航

`landing-header.tsx` + `landing-copy.ts`：Thread 和 FAQ 之间插入 Blog 链接。

### Step 8: SEO 更新 `lib/seo.ts`

新增 `buildArticleJsonLd()` 函数。可选：在 pageSeo 添加 blog 索引页条目。

### Step 9: 配置 301 重定向 + 删除旧页面

`next.config.ts` 添加 3 条 permanent redirect：
- `/markdown-to-x-articles` → `/blog/markdown-to-x-articles`
- `/paste-code-into-x-articles` → `/blog/paste-code-into-x-articles`
- `/mermaid-in-x-articles` → `/blog/mermaid-in-x-articles`

删除 `app/markdown-to-x-articles/`、`app/paste-code-into-x-articles/`、`app/mermaid-in-x-articles/` 三个目录。

清理 `lib/seo.ts` 中 SeoPage 类型和 pageSeo 的对应条目。
删除 `lib/seo-landing-copy.ts` 和 `components/seo-landing-page.tsx`（已被 MDX 方案取代）。

### Step 10: 动态化 Sitemap

`app/sitemap.ts`：移除旧 3 条条目，改为动态读取 `getBlogPosts()` 生成博客 URL + 博客索引。

### Step 11: Tailwind content 路径

`tailwind.config.ts` 的 content 数组添加 `"./content/**/*.mdx"`。

## 验证

1. `pnpm build` 成功，blog 页面为 Static 预渲染
2. 旧 URL 301 跳转验证
3. `/blog` 索引页展示 4 篇文章
4. `/blog/markdown-to-x-articles` MDX 内容完整渲染
5. Sitemap 包含所有 blog URL，不含旧路径
6. Header 显示 Blog 链接
7. 暗色/亮色切换正常
