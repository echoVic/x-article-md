import type { Metadata } from "next";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export type CompareLocale = "en" | "zh";

/** Facts below were checked against the official sources listed in the page on 2026-10-23. */
export const compareCheckedDate = "2026-10-23";

export type CompareTool = {
  name: string;
  url: string;
  sourceLabel: string;
  whatItIs: string;
  strengths: string[];
  bestFor: string;
};

export type CompareRow = {
  capability: string;
  md2x: string;
  carbon: string;
  pandoc: string;
  typora: string;
};

const en = {
  metaTitle: "MD2X vs Carbon, Pandoc & Typora: Honest Comparison | MD2X",
  metaDescription:
    "An honest, source-checked comparison of MD2X, Carbon, Pandoc and Typora: what each tool does best, where they overlap, and when to reach for which. No exaggeration, no false negatives.",
  heroEyebrow: "HONEST COMPARISON · CHECKED 2026-10-23",
  heroTitle: "MD2X vs Carbon, Pandoc & Typora",
  heroLead:
    "These four tools are often mentioned together, but they solve different jobs. Here is what each one is actually best at — straight from their official docs.",
  introTitle: "Different jobs, not a winner",
  introBody:
    "MD2X turns a Markdown draft into clipboard-ready rich text for X Articles. Carbon turns source code into beautiful standalone images. Pandoc converts whole documents between hundreds of formats. Typora is a distraction-free WYSIWYG Markdown editor. The right choice depends on what you are trying to publish.",
  toolsTitle: "What each tool does",
  tableTitle: "Capability at a glance",
  whenTitle: "When to reach for which",
  whenItems: [
    "Use MD2X when your goal is pasting a formatted long-form article into X Articles — code blocks render as images automatically, tables and Mermaid diagrams copy as assets.",
    "Use Carbon when you need one gorgeous standalone code screenshot for a tweet, slide, or embed. Its themes and share links are excellent.",
    "Use Pandoc when converting whole documents between Markdown, Word, EPUB, LaTeX, or PDF. It is a command-line converter, not a clipboard tool.",
    "Use Typora when you want a calm desktop writing environment for reading and editing Markdown files locally.",
  ],
  faqTitle: "Frequently asked questions",
  faqs: [
    {
      question: "Is MD2X a replacement for Carbon?",
      answer:
        "No. Carbon specializes in standalone code screenshots with shareable links and embeds, and it does that beautifully. MD2X renders code blocks as images inside a full-article workflow for X Articles. If you only need a pretty code image, Carbon is a great choice.",
    },
    {
      question: "Can I use Pandoc to publish to X Articles?",
      answer:
        "Pandoc converts files between formats like Markdown, docx, EPUB, and PDF. X Articles needs rich text on the clipboard, not an exported file, so Pandoc is the wrong tool for that specific step — though it is unmatched for document conversion.",
    },
    {
      question: "Does Typora support Mermaid diagrams?",
      answer:
        "Yes, Typora renders flowcharts, sequence, and Gantt diagrams through Mermaid while you write. MD2X instead exports those diagrams as pasteable PNG images for X Articles.",
    },
  ],
  sourcesTitle: "Sources",
  sourcesNote: "Checked 2026-10-23 against the following official pages:",
  sources: [
    { label: "Carbon — About (carbon.vercel.app/about)", url: "https://carbon.vercel.app/about" },
    { label: "carbon-app/carbon — GitHub README", url: "https://github.com/carbon-app/carbon" },
    { label: "Pandoc — pandoc.org", url: "https://pandoc.org" },
    { label: "Typora — typora.io", url: "https://typora.io" },
  ],
  md2x: {
    name: "MD2X",
    url: "/editor",
    sourceLabel: "markdown2x.com",
    whatItIs:
      "A browser-based Markdown to X Articles converter. Paste Markdown, copy formatted rich text, paste it into X Articles.",
    strengths: [
      "Code blocks render as syntax-highlighted PNG images on the clipboard",
      "Tables and Mermaid diagrams copy as pasteable image assets",
      "Runs entirely in the browser, no sign-up, PWA offline mode",
      "Thread splitter and AI cover image generation included",
    ],
    bestFor: "Publishing a long-form article to X Articles.",
  },
  carbon: {
    name: "Carbon",
    url: "https://carbon.now.sh",
    sourceLabel: "carbon.now.sh · MIT, open source",
    whatItIs:
      "A web app that turns source code into beautiful, customizable images you can share as screenshots, links, or embeds.",
    strengths: [
      "Excellent syntax themes, background, window, and padding customization",
      "PNG/SVG export, clipboard copy, saved snippets with unfurled links",
      "Embed snippets in your own site via iframe",
      "Open source (MIT), with editor plugins and a CLI",
    ],
    bestFor: "Standalone gorgeous code screenshots for social posts.",
  },
  pandoc: {
    name: "Pandoc",
    url: "https://pandoc.org",
    sourceLabel: "pandoc.org · free command-line tool",
    whatItIs:
      "A universal document converter: a command-line program and Haskell library that converts between hundreds of markup and document formats.",
    strengths: [
      "Converts Markdown to Word, HTML, EPUB, LaTeX, PDF, PowerPoint and more",
      "Built-in citations, bibliographies, templates, and Lua filters",
      "Free open-source software, mature and scriptable",
    ],
    bestFor: "Converting whole documents between file formats.",
  },
  typora: {
    name: "Typora",
    url: "https://typora.io",
    sourceLabel: "typora.io · desktop app",
    whatItIs:
      "A minimal Markdown editor and reader with a true WYSIWYG experience — no split preview, no visible syntax symbols.",
    strengths: [
      "Seamless live preview while writing",
      "Tables, math, Mermaid diagrams, TOC, and CSS theming",
      "Imports and exports docx, HTML, PDF, EPUB, LaTeX",
      "Works offline as a desktop application",
    ],
    bestFor: "Writing and reading Markdown files locally.",
  },
  rows: [
    {
      capability: "Runs in the browser, no install",
      md2x: "Yes",
      carbon: "Yes (web app, PWA)",
      pandoc: "No — command-line tool",
      typora: "No — desktop application",
    },
    {
      capability: "Built for X Articles rich-text clipboard",
      md2x: "Yes — its core purpose",
      carbon: "No",
      pandoc: "No",
      typora: "No",
    },
    {
      capability: "Code blocks as syntax-highlighted images",
      md2x: "Yes — automatic, in the article",
      carbon: "Yes — its core purpose",
      pandoc: "No",
      typora: "No",
    },
    {
      capability: "Tables become pasteable images",
      md2x: "Yes",
      carbon: "No",
      pandoc: "Converts tables into document formats",
      typora: "Edits tables, does not export images",
    },
    {
      capability: "Mermaid diagrams",
      md2x: "Renders as a PNG asset",
      carbon: "No",
      pandoc: "No",
      typora: "Renders live in the editor",
    },
    {
      capability: "Write and edit Markdown",
      md2x: "Lightweight editor",
      carbon: "No",
      pandoc: "No",
      typora: "Yes — its core strength",
    },
    {
      capability: "Export to docx / PDF / EPUB",
      md2x: "No",
      carbon: "PNG / SVG only",
      pandoc: "Yes — hundreds of formats",
      typora: "Yes",
    },
    {
      capability: "Works offline",
      md2x: "Yes — PWA",
      carbon: "Yes — installable PWA",
      pandoc: "Yes",
      typora: "Yes",
    },
  ],
};

const zh = {
  metaTitle: "MD2X 与 Carbon、Pandoc、Typora 的诚实对比 | MD2X",
  metaDescription:
    "基于官方资料核查（2026-10-23）的 MD2X、Carbon、Pandoc、Typora 诚实对比：各自最擅长什么、在哪里重叠、什么场景选哪个。不夸张、不贬低。",
  heroEyebrow: "诚实对比 · 2026-10-23 核查",
  heroTitle: "MD2X 与 Carbon、Pandoc、Typora",
  heroLead:
    "这四个工具经常被放在一起讨论，但它们解决的是不同的问题。下面是各自官方资料里的真实定位。",
  introTitle: "不同的任务，没有唯一赢家",
  introBody:
    "MD2X 把 Markdown 草稿转成可直接粘贴到 X Articles 的富文本；Carbon 把源码转成精美的独立图片；Pandoc 在数百种文档格式之间转换；Typora 是所见即所得的 Markdown 编辑器。怎么选，取决于你要发布什么。",
  toolsTitle: "每个工具做什么",
  tableTitle: "能力一览",
  whenTitle: "什么时候选哪个",
  whenItems: [
    "目标是把排版好的长文粘贴到 X Articles 时用 MD2X——代码块自动渲染为图片，表格和 Mermaid 图表作为资源一键复制。",
    "只需要一张精美的独立代码截图发推文、做幻灯片时用 Carbon——主题和分享链接都很出色。",
    "要在 Markdown、Word、EPUB、LaTeX、PDF 之间转换整篇文档时用 Pandoc——它是命令行转换器，不是剪贴板工具。",
    "想要一个安静的桌面写作环境、本地读写 Markdown 文件时用 Typora。",
  ],
  faqTitle: "常见问题",
  faqs: [
    {
      question: "MD2X 能替代 Carbon 吗？",
      answer:
        "不能。Carbon 专注于带分享链接和嵌入的独立代码截图，做得非常出色。MD2X 是把代码块作为图片嵌入整篇 X Articles 文章的工作流里。如果只需要一张漂亮的代码图，Carbon 是很好的选择。",
    },
    {
      question: "能用 Pandoc 发布到 X Articles 吗？",
      answer:
        "Pandoc 在 Markdown、docx、EPUB、PDF 等文件格式之间转换。X Articles 需要的是剪贴板上的富文本，而不是导出的文件，所以这一步它并不合适——但在文档转换领域它无可替代。",
    },
    {
      question: "Typora 支持 Mermaid 吗？",
      answer:
        "支持，Typora 写作时可以实时渲染流程图、时序图、甘特图。MD2X 则把这些图表导出为可粘贴的 PNG 图片，用于 X Articles。",
    },
  ],
  sourcesTitle: "来源",
  sourcesNote: "2026-10-23 核查以下官方页面：",
  sources: [
    { label: "Carbon 官方介绍（carbon.vercel.app/about）", url: "https://carbon.vercel.app/about" },
    { label: "carbon-app/carbon GitHub README", url: "https://github.com/carbon-app/carbon" },
    { label: "Pandoc 官网（pandoc.org）", url: "https://pandoc.org" },
    { label: "Typora 官网（typora.io）", url: "https://typora.io" },
  ],
  md2x: {
    name: "MD2X",
    url: "/zh/editor",
    sourceLabel: "markdown2x.com",
    whatItIs:
      "浏览器端的 Markdown 转 X Articles 工具。粘贴 Markdown，复制富文本，再粘贴进 X Articles。",
    strengths: [
      "代码块在剪贴板上直接渲染为语法高亮 PNG 图片",
      "表格和 Mermaid 图表复制为可粘贴的图片资源",
      "纯浏览器端运行，无需注册，支持 PWA 离线",
      "内置推文流拆分与 AI 封面图生成",
    ],
    bestFor: "把长文发布到 X Articles。",
  },
  carbon: {
    name: "Carbon",
    url: "https://carbon.now.sh",
    sourceLabel: "carbon.now.sh · MIT 开源",
    whatItIs:
      "网页应用，把源码转成可自定义、可分享的精美图片，支持截图、链接和嵌入。",
    strengths: [
      "出色的语法主题、背景、窗口样式和边距自定义",
      "PNG/SVG 导出、剪贴板复制、保存片段并自动展开链接",
      "可通过 iframe 把片段嵌入自己的网站",
      "MIT 开源，提供编辑器插件和 CLI",
    ],
    bestFor: "为社交媒体制作精美的独立代码截图。",
  },
  pandoc: {
    name: "Pandoc",
    url: "https://pandoc.org",
    sourceLabel: "pandoc.org · 免费命令行工具",
    whatItIs:
      "通用文档转换器：命令行程序与 Haskell 库，在数百种标记与文档格式之间转换。",
    strengths: [
      "Markdown 转 Word、HTML、EPUB、LaTeX、PDF、PowerPoint 等",
      "内置引用、参考文献、模板和 Lua 过滤器",
      "免费开源，成熟且可脚本化",
    ],
    bestFor: "在文件格式之间转换整篇文档。",
  },
  typora: {
    name: "Typora",
    url: "https://typora.io",
    sourceLabel: "typora.io · 桌面应用",
    whatItIs:
      "极简的 Markdown 编辑器与阅读器，真正所见即所得——没有分栏预览，看不到语法符号。",
    strengths: [
      "写作时无缝实时预览",
      "表格、数学公式、Mermaid 图表、目录与 CSS 主题",
      "支持导入导出 docx、HTML、PDF、EPUB、LaTeX",
      "作为桌面应用离线可用",
    ],
    bestFor: "本地读写 Markdown 文件。",
  },
  rows: [
    {
      capability: "浏览器运行、无需安装",
      md2x: "是",
      carbon: "是（网页应用，PWA）",
      pandoc: "否——命令行工具",
      typora: "否——桌面应用",
    },
    {
      capability: "为 X Articles 剪贴板而生",
      md2x: "是——核心目标",
      carbon: "否",
      pandoc: "否",
      typora: "否",
    },
    {
      capability: "代码块转语法高亮图片",
      md2x: "是——文章内自动完成",
      carbon: "是——核心功能",
      pandoc: "否",
      typora: "否",
    },
    {
      capability: "表格转可粘贴图片",
      md2x: "是",
      carbon: "否",
      pandoc: "把表格转为文档格式",
      typora: "编辑表格，不导出图片",
    },
    {
      capability: "Mermaid 图表",
      md2x: "渲染为 PNG 资源",
      carbon: "否",
      pandoc: "否",
      typora: "在编辑器中实时渲染",
    },
    {
      capability: "编写和编辑 Markdown",
      md2x: "轻量编辑器",
      carbon: "否",
      pandoc: "否",
      typora: "是——核心强项",
    },
    {
      capability: "导出 docx / PDF / EPUB",
      md2x: "否",
      carbon: "仅 PNG / SVG",
      pandoc: "是——数百种格式",
      typora: "是",
    },
    {
      capability: "离线可用",
      md2x: "是——PWA",
      carbon: "是——可安装 PWA",
      pandoc: "是",
      typora: "是",
    },
  ],
};

const dictionaries: Record<CompareLocale, typeof en> = { en, zh };

export function getCompareContent(locale: CompareLocale) {
  return dictionaries[locale];
}

export function buildCompareMetadata(locale: CompareLocale): Metadata {
  const t = dictionaries[locale];
  const enPath = "/compare";
  const zhPath = "/zh/compare";
  const canonical = locale === "zh" ? zhPath : enPath;

  return {
    metadataBase: new URL(siteUrl),
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical,
      languages: {
        en: enPath,
        "zh-CN": zhPath,
        "x-default": enPath,
      },
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url: canonical,
      siteName: "MD2X",
      locale: locale === "zh" ? "zh-CN" : "en",
      type: "article",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "MD2X Markdown to X Articles converter",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.metaTitle,
      description: t.metaDescription,
      images: ["/opengraph-image"],
    },
  };
}

export function getComparePath(locale: CompareLocale): string {
  return locale === "zh" ? "/zh/compare" : "/compare";
}

export function getCompareAlternates() {
  return {
    languages: {
      en: absoluteUrl("/compare"),
      "zh-CN": absoluteUrl("/zh/compare"),
      "x-default": absoluteUrl("/compare"),
    },
  };
}
