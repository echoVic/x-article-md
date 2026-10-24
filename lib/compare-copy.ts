import type { Metadata } from "next";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export type CompareLocale = "en" | "zh";

/** Entities and facts below were checked against the official sources listed on the page on 2026-10-24. */
export const compareCheckedDate = "2026-10-24";

export type CompareTool = {
  name: string;
  /** Empty string when no verifiable official URL exists (e.g. an unverified entity). */
  url: string;
  sourceLabel: string;
  whatItIs: string;
  strengths: string[];
  bestFor: string;
};

export type CompareRow = {
  capability: string;
  /** Values aligned to `tools` order: [MD2X, X Article Markdown Paste, xPoster, Article Studio]. */
  values: string[];
};

const en = {
  metaTitle: "MD2X vs X Article Markdown Paste, xPoster & Article Studio | MD2X",
  metaDescription:
    "A source-checked comparison of how MD2X, X Article Markdown Paste, xPoster and Article Studio get Markdown into X Articles. Honest trade-offs, no fabricated claims.",
  heroEyebrow: "HONEST COMPARISON · CHECKED 2026-10-24",
  heroTitle: "MD2X vs tools that put Markdown into X Articles",
  heroLead:
    "These tools all aim at the same destination — a formatted X Article — but they take different paths: a web app that puts rich text on your clipboard, and browser extensions that write straight into the X editor. Here is what each one actually does, based on their own sources.",
  introTitle: "Three ways in, one destination",
  introBody:
    "MD2X is a web app: you write or paste Markdown in your browser, it renders rich text and copies it to your clipboard, and you paste into X. X Article Markdown Paste and xPoster are Chrome extensions that run against the X editor itself. Article Studio is a web app with an optional Chrome companion that can create an X draft for you.",
  toolsTitle: "What each tool is",
  tableTitle: "Capability at a glance",
  whenTitle: "When to reach for which",
  whenItems: [
    "Use MD2X when you want a no-install web page that converts Markdown to clipboard-ready rich text, renders code blocks, tables and Mermaid diagrams as PNG images, and works offline as a PWA.",
    "Use X Article Markdown Paste when you want a Chrome extension that pastes straight into the X editor, uploads images through X's media pipeline, and keeps code blocks as native X code blocks.",
    "Use xPoster when you prefer a side-panel console that queues several .md files and writes them into the active X Article draft. Note this is the Chrome extension (ginobefun/xposter) — not the WordPress \"XPoster / WP to Twitter\" plugin by Joe Dolson, which is a different product.",
    "Article Studio: use it when you want a browser preview that attaches local images and renders Mermaid, plus an optional Chrome companion that creates an X draft with images in place; you still review and publish from X.",
  ],
  faqTitle: "Frequently asked questions",
  faqs: [
    {
      question: "Does MD2X upload my images into the X draft?",
      answer:
        "No. MD2X runs in your browser and produces rich text on the clipboard; it cannot push files into your X draft. Remote images are not uploaded for you — you add images from the Assets panel by hand after pasting. Extensions like X Article Markdown Paste and xPoster run inside the X tab and can upload images through X's own media path.",
    },
    {
      question: "Is the Chrome xPoster the same as the WordPress XPoster plugin?",
      answer:
        "No. The xPoster compared here is a Chrome extension (ginobefun/xposter) for importing Markdown into X Articles. The WordPress \"XPoster\" (formerly WP to Twitter, by Joe Dolson, xposterpro.com) is a different product that crossposts WordPress blog posts to X. They share a name but are unrelated.",
    },
    {
      question: "What is Article Studio in this comparison?",
      answer:
        "Article Studio (md2xarticle.com) is a web app that previews Markdown locally, attaches local images, renders Mermaid to PNG, and can either copy a title and body for manual paste or — via an optional Chrome companion — create an unpublished X Article draft with images placed. You review and publish from X. It is unrelated to the UK photography studio at article-studio.com.",
    },
    {
      question: "How do code blocks differ between MD2X and the extensions?",
      answer:
        "MD2X renders code blocks to syntax-highlighted PNG images so they survive the paste. The extensions instead target X's native code block, which keeps the code as selectable text inside X. Both are valid; images are self-contained, while native blocks are lighter.",
    },
  ],
  sourcesTitle: "Sources",
  sourcesNote: "Checked 2026-10-24 against the following pages:",
  sources: [
    { label: "MD2X — editor (markdown2x.com)", url: "https://markdown2x.com/editor" },
    { label: "X Article Markdown Paste — vendor site", url: "https://xmdpaste.icy-cat.com/" },
    { label: "X Article Markdown Paste — vendor comparison page", url: "https://xmdpaste.icy-cat.com/compare.html" },
    { label: "xPoster — Chrome Web Store listing", url: "https://chromewebstore.google.com/detail/xposter/iimkimodgdjnnmdopeolboakhjmhfbbj" },
    { label: "xPoster — GitHub (ginobefun/xposter)", url: "https://github.com/ginobefun/xposter" },
    { label: "xPoster — privacy policy", url: "https://nevertoday.github.io/xposter-privacy/" },
    { label: "Article Studio — md2xarticle.com", url: "https://md2xarticle.com/" },
    { label: "X Articles — official help", url: "https://help.x.com/en/using-x/articles" },
    { label: "Same-name note: WordPress XPoster / WP to Twitter (different product)", url: "https://xposterpro.com" },
  ],
  tools: [
    {
      name: "MD2X",
      url: "/editor",
      sourceLabel: "markdown2x.com · web app",
      whatItIs:
        "A browser-based Markdown to X Articles converter. Paste Markdown, copy formatted rich text to the clipboard, then paste into the X Articles editor.",
      strengths: [
        "No install, no sign-up; drafts stay in your browser, works offline as a PWA",
        "Code blocks render as syntax-highlighted PNG images",
        "Tables and Mermaid diagrams render to pasteable PNG images",
        "Includes a thread splitter and optional AI cover image generation",
      ],
      bestFor: "People who want a clipboard workflow without installing an extension.",
    },
    {
      name: "X Article Markdown Paste",
      url: "https://xmdpaste.icy-cat.com/",
      sourceLabel: "xmdpaste.icy-cat.com · Chrome extension",
      whatItIs:
        "A Chrome extension that runs on the X Articles editor and intercepts paste: it converts Markdown into the editor's own block structure and uploads images through X's media pipeline.",
      strengths: [
        "Runs directly on x.com/compose/articles — no separate clipboard step",
        "Code blocks become native X code blocks; tables render to HiDPI images",
        "Remote and local images are uploaded via X's media path",
        "Tweet links become embedded cards; drag a .md file in to start a draft",
      ],
      bestFor: "Posts with several images, tables or embeds where you publish often.",
    },
    {
      name: "xPoster",
      url: "https://chromewebstore.google.com/detail/xposter/iimkimodgdjnnmdopeolboakhjmhfbbj",
      sourceLabel: "Chrome Web Store · Chrome extension",
      whatItIs:
        "A Chrome MV3 extension that opens a side panel to paste, choose or drop Markdown, previews the recognized blocks, and writes them into the active X Article draft. Local-first, no backend, no separate account.",
      strengths: [
        "Side-panel console with preview of headings, lists, links, tables, code and embeds",
        "Handles web images and authorized local image folders",
        "Can queue multiple .md files and write them one by one",
        "Open source (ginobefun/xposter); no analytics, no xPoster account",
      ],
      bestFor: "Drafting several Markdown files and batching them into X Articles.",
    },
    {
      name: "Article Studio",
      url: "https://md2xarticle.com/",
      sourceLabel: "md2xarticle.com · web app",
      whatItIs:
        "A web app that previews Markdown locally and either copies a title and body for manual paste into X, or — via an optional Chrome companion — creates an unpublished X Article draft with images already placed. You review and publish from X.",
      strengths: [
        "Live preview with local images attached from a chosen folder",
        "Mermaid renders to PNG at 2x; tables stay native or render to image",
        "Optional Chrome companion creates an X draft with images in place",
        "Local-first; content leaves the browser only when you confirm draft creation",
      ],
      bestFor: "Writers who want a browser preview of images, tables and Mermaid plus an optional one-click X draft.",
    },
  ],
  rows: [
    {
      capability: "Form factor",
      values: [
        "Web app, no install",
        "Chrome extension, pastes into the X editor",
        "Chrome extension, side panel",
        "Web app + optional Chrome companion",
      ],
    },
    {
      capability: "Code blocks",
      values: [
        "Rendered to PNG image",
        "Native X code block",
        "Native X code block",
        "Markdown code blocks supported",
      ],
    },
    {
      capability: "Tables",
      values: [
        "Rendered to PNG image",
        "Rendered to HiDPI image",
        "Rendered to image",
        "Native table, or PNG on paste",
      ],
    },
    {
      capability: "Images uploaded to X for you",
      values: [
        "No — clipboard only; add by hand",
        "Yes, via X's media pipeline",
        "Yes, web and authorized local images",
        "Yes, via the Chrome companion (draft)",
      ],
    },
    {
      capability: "Mermaid diagrams",
      values: [
        "Yes, to PNG",
        "Not listed by the vendor",
        "Not listed by the vendor",
        "Yes, to PNG at 2x",
      ],
    },
    {
      capability: "Tweet / post embeds",
      values: [
        "No",
        "Yes",
        "Yes",
        "Not listed",
      ],
    },
    {
      capability: "Queue multiple .md drafts",
      values: [
        "No",
        "No",
        "Yes",
        "Not listed",
      ],
    },
    {
      capability: "Account / backend",
      values: [
        "No account, nothing uploaded",
        "Uses your X login; extension has no separate account",
        "No extension account, local-first",
        "Local in browser; draft created via the companion",
      ],
    },
  ],
};

const zh = {
  metaTitle: "MD2X 与 X Article Markdown Paste、xPoster、Article Studio 对比 | MD2X",
  metaDescription:
    "基于来源核查（2026-10-24）的对比：MD2X、X Article Markdown Paste、xPoster、Article Studio 如何把 Markdown 放进 X Articles。诚实取舍，不编造。",
  heroEyebrow: "诚实对比 · 2026-10-24 核查",
  heroTitle: "MD2X 与把 Markdown 放进 X Articles 的工具",
  heroLead:
    "这些工具都指向同一个终点——一篇排版好的 X Article——但路径不同：一个是把富文本放进剪贴板的网页应用，另两个是直接写入 X 编辑器的浏览器扩展。下面是各自官方资料里的真实做法。",
  introTitle: "三条路径，同一个终点",
  introBody:
    "MD2X 是网页应用：你在浏览器里写或粘贴 Markdown，它把富文本复制到剪贴板，你再粘进 X。X Article Markdown Paste 和 xPoster 是对着 X 编辑器本身运行的 Chrome 扩展。Article Studio 是带可选 Chrome 伴侣的网页应用，可替你生成 X 草稿。",
  toolsTitle: "每个工具是什么",
  tableTitle: "能力一览",
  whenTitle: "什么时候选哪个",
  whenItems: [
    "想要免安装网页、把 Markdown 转成可直接粘贴的富文本，并把代码块/表格/Mermaid 渲染成 PNG，且可离线 PWA 时用 MD2X。",
    "想要一个直接在 X 编辑器里粘贴、通过 X 媒体通道上传图片、代码块保留为 X 原生代码块的 Chrome 扩展时，用 X Article Markdown Paste。",
    "想要侧栏控制台、可排队多篇 .md 并写入当前 X Article 草稿时用 xPoster。注意：这里指 Chrome 扩展（ginobefun/xposter），不是 Joe Dolson 的 WordPress 插件“XPoster / WP to Twitter”，那是另一个产品。",
    "Article Studio：当你想要浏览器预览（挂载本地图片、渲染 Mermaid），并希望可选的 Chrome 伴侣直接生成带图的 X 草稿时使用；发布仍由你在 X 里确认。",
  ],
  faqTitle: "常见问题",
  faqs: [
    {
      question: "MD2X 会把我的图片上传进 X 草稿吗？",
      answer:
        "不会。MD2X 在浏览器里运行，只把富文本放到剪贴板，无法把文件推进你的 X 草稿；远程图片需要粘贴后手动从资源面板添加。扩展类工具运行在 X 标签页内，可通过 X 自己的媒体通道上传图片。",
    },
    {
      question: "Chrome 的 xPoster 和 WordPress 的 XPoster 是同一个吗？",
      answer:
        "不是。这里对比的 xPoster 是把 Markdown 导入 X Articles 的 Chrome 扩展（ginobefun/xposter）。WordPress 的“XPoster”（前身 WP to Twitter，作者 Joe Dolson，xposterpro.com）是把 WordPress 博客同步到 X 的另一款产品，二者同名但无关。",
    },
    {
      question: "本对比里的 Article Studio 是什么？",
      answer:
        "Article Studio（md2xarticle.com）是一个网页应用：本地预览 Markdown、挂载本地图片、把 Mermaid 渲染为 PNG，既可复制标题与正文手动粘贴，也可通过可选 Chrome 伴侣生成带图的未发布 X Article 草稿。发布仍由你在 X 里完成。它与英国摄影工作室 article-studio.com 无关。",
    },
    {
      question: "MD2X 和扩展的代码块处理有何不同？",
      answer:
        "MD2X 把代码块渲染成语法高亮 PNG 图片以保留粘贴效果；扩展则直接生成 X 的原生代码块，代码在 X 内仍可选中复制。两者都成立：图片自包含，原生块更轻量。",
    },
  ],
  sourcesTitle: "来源",
  sourcesNote: "2026-10-24 核查以下页面：",
  sources: [
    { label: "MD2X 编辑器（markdown2x.com）", url: "https://markdown2x.com/editor" },
    { label: "X Article Markdown Paste 官网", url: "https://xmdpaste.icy-cat.com/" },
    { label: "X Article Markdown Paste 对比页", url: "https://xmdpaste.icy-cat.com/compare.html" },
    { label: "xPoster Chrome 网上商店", url: "https://chromewebstore.google.com/detail/xposter/iimkimodgdjnnmdopeolboakhjmhfbbj" },
    { label: "xPoster GitHub（ginobefun/xposter）", url: "https://github.com/ginobefun/xposter" },
    { label: "xPoster 隐私政策", url: "https://nevertoday.github.io/xposter-privacy/" },
    { label: "Article Studio 官网（md2xarticle.com）", url: "https://md2xarticle.com/" },
    { label: "X Articles 官方帮助", url: "https://help.x.com/en/using-x/articles" },
    { label: "同名辨析：WordPress XPoster / WP to Twitter（另一产品）", url: "https://xposterpro.com" },
  ],
  tools: [
    {
      name: "MD2X",
      url: "/zh/editor",
      sourceLabel: "markdown2x.com · 网页应用",
      whatItIs:
        "浏览器端的 Markdown 转 X Articles 工具。粘贴 Markdown，把富文本复制到剪贴板，再粘进 X Articles 编辑器。",
      strengths: [
        "免安装、免注册；草稿留在浏览器，支持离线 PWA",
        "代码块渲染为语法高亮 PNG 图片",
        "表格和 Mermaid 图表渲染为可粘贴 PNG",
        "内置推文流拆分与可选 AI 封面图生成",
      ],
      bestFor: "不想安装扩展、走剪贴板工作流的人。",
    },
    {
      name: "X Article Markdown Paste",
      url: "https://xmdpaste.icy-cat.com/",
      sourceLabel: "xmdpaste.icy-cat.com · Chrome 扩展",
      whatItIs:
        "运行在 X Articles 编辑器内、拦截粘贴的 Chrome 扩展：把 Markdown 转成编辑器自身的块结构，并通过 X 的媒体通道上传图片。",
      strengths: [
        "直接在 x.com/compose/articles 上运行，无需额外剪贴板步骤",
        "代码块成为 X 原生代码块；表格渲染为 HiDPI 图片",
        "远程与本地图片经 X 媒体通道上传",
        "推文链接变为嵌入卡片；可拖入 .md 文件新建草稿",
      ],
      bestFor: "含较多图片、表格或嵌入、且发布频繁的文章。",
    },
    {
      name: "xPoster",
      url: "https://chromewebstore.google.com/detail/xposter/iimkimodgdjnnmdopeolboakhjmhfbbj",
      sourceLabel: "Chrome 网上商店 · Chrome 扩展",
      whatItIs:
        "Chrome MV3 扩展，侧栏粘贴/选择/拖入 Markdown，预览识别到的块，再写入当前 X Article 草稿。本地优先，无后端、无独立账号。",
      strengths: [
        "侧栏控制台，预览标题、列表、链接、表格、代码与嵌入",
        "处理网络图片与已授权的本地图片文件夹",
        "可排队多篇 .md 依次写入",
        "开源（ginobefun/xposter）；无统计、无 xPoster 账号",
      ],
      bestFor: "写多篇 Markdown、批量导入 X Articles。",
    },
    {
      name: "Article Studio",
      url: "https://md2xarticle.com/",
      sourceLabel: "md2xarticle.com · 网页应用",
      whatItIs:
        "网页应用：本地预览 Markdown，可复制标题与正文手动粘贴；也可通过可选 Chrome 伴侣，直接生成图片就位的未发布 X Article 草稿。发布由你在 X 里确认。",
      strengths: [
        "实时预览，本地图片按所选文件夹挂载",
        "Mermaid 渲染为 2x PNG；表格保留原生或渲染为图片",
        "可选 Chrome 伴侣生成带图的 X 草稿",
        "本地优先；确认创建草稿前内容不离开浏览器",
      ],
      bestFor: "想要浏览器预览图片/表格/Mermaid，并可选一键生成 X 草稿的写作者。",
    },
  ],
  rows: [
    {
      capability: "形态",
      values: [
        "网页应用，免安装",
        "Chrome 扩展，粘贴进 X 编辑器",
        "Chrome 扩展，侧栏",
        "网页应用 + 可选 Chrome 伴侣",
      ],
    },
    {
      capability: "代码块",
      values: [
        "渲染为 PNG 图片",
        "X 原生代码块",
        "X 原生代码块",
        "支持 Markdown 代码块",
      ],
    },
    {
      capability: "表格",
      values: [
        "渲染为 PNG 图片",
        "渲染为 HiDPI 图片",
        "渲染为图片",
        "原生表格，或粘贴时转图片",
      ],
    },
    {
      capability: "替你把图片上传到 X",
      values: [
        "否——仅剪贴板，需手动添加",
        "是，经 X 媒体通道",
        "是，网络图片与已授权本地图片",
        "是，经 Chrome 伴侣（草稿）",
      ],
    },
    {
      capability: "Mermaid 图表",
      values: [
        "是，导出 PNG",
        "官方未列出",
        "官方未列出",
        "是，2x PNG",
      ],
    },
    {
      capability: "推文/帖子嵌入",
      values: [
        "否",
        "是",
        "是",
        "官方未列出",
      ],
    },
    {
      capability: "排队多篇 .md 草稿",
      values: [
        "否",
        "否",
        "是",
        "官方未列出",
      ],
    },
    {
      capability: "账号 / 后端",
      values: [
        "无账号，不上传",
        "用你的 X 登录；扩展无独立账号",
        "无扩展账号，本地优先",
        "本地在浏览器；经伴侣生成草稿",
      ],
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
      // openGraph.images omitted: the colocated opengraph-image.tsx for this
      // segment is auto-attached by Next per page + locale.
    },
    twitter: {
      card: "summary_large_image",
      title: t.metaTitle,
      description: t.metaDescription,
      // twitter.images omitted: colocated twitter-image.tsx auto-attached.
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
