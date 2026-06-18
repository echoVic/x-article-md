import type { Metadata } from "next";

export const siteUrl = "https://markdown2x.com";
export const githubRepoUrl = "https://github.com/echoVic/x-article-md";

export type SeoPage = "home" | "zhHome" | "editor" | "zhEditor" | "thread" | "zhThread" | "markdownToXArticles" | "pasteCodeIntoXArticles" | "mermaidInXArticles";

type PageSeo = {
  title: string;
  description: string;
  path: string;
  locale?: "en" | "zh-CN";
  alternates?: Metadata["alternates"];
};

const homeAlternates: Metadata["alternates"] = {
  canonical: "/",
  languages: {
    en: "/",
    "zh-CN": "/zh",
    "x-default": "/",
  },
};

const editorAlternates: Metadata["alternates"] = {
  canonical: "/editor",
  languages: {
    en: "/editor",
    "zh-CN": "/zh/editor",
    "x-default": "/editor",
  },
};

const threadAlternates: Metadata["alternates"] = {
  canonical: "/thread",
  languages: {
    en: "/thread",
    "zh-CN": "/zh/thread",
    "x-default": "/thread",
  },
};

const pageSeo: Record<SeoPage, PageSeo> = {
  home: {
    title: "MD2X - Markdown to X Articles Converter",
    description:
      "Online Markdown to X Articles converter. Code blocks become images, Mermaid diagrams and tables copy in one click. Free, no sign-up, runs in your browser.",
    path: "/",
    locale: "en",
    alternates: homeAlternates,
  },
  zhHome: {
    title: "MD2X - Markdown 转 X Articles 编辑器",
    description:
      "将 Markdown 一键转为 X Articles 富文本格式在线工具。代码块自动渲染为语法高亮 PNG 图片，Mermaid 图表和表格可一键复制粘贴到文章中。AI 智能生成封面图，支持 OpenAI 兼容接口。完全免费，无需注册，纯浏览器端运行，你的数据绝对不离开本地设备。",
    path: "/zh",
    locale: "zh-CN",
    alternates: {
      ...homeAlternates,
      canonical: "/zh",
    },
  },
  editor: {
    title: "Free Markdown to X Articles Converter - Online Editor | MD2X",
    description:
      "Convert Markdown to X Articles rich text online. Code blocks render as images, tables and Mermaid diagrams copy in one click. Free, no sign-up, runs in browser.",
    path: "/editor",
    locale: "en",
    alternates: editorAlternates,
  },
  zhEditor: {
    title: "免费 Markdown 转 X Articles 在线编辑器 | MD2X",
    description:
      "免费在线 Markdown 编辑器，实时预览 X Articles 长文发布效果。代码块自动渲染为带语法高亮的 PNG 图片，Mermaid 图表和表格支持一键复制粘贴。AI 封面图生成器让你的长文从第一眼就抓住读者注意力。完全免费，无需注册，所有数据都安全保存在你的本地浏览器中。",
    path: "/zh/editor",
    locale: "zh-CN",
    alternates: {
      ...editorAlternates,
      canonical: "/zh/editor",
    },
  },
  thread: {
    title: "Free Twitter Thread Generator from Markdown | MD2X",
    description:
      "Turn Markdown into Twitter/X threads. Rule-based and AI-powered splitting into 280-character tweets with auto-numbering. Free, no sign-up, runs in your browser.",
    path: "/thread",
    locale: "en",
    alternates: threadAlternates,
  },
  zhThread: {
    title: "免费 Markdown 转 Twitter Thread 生成器 | MD2X",
    description:
      "将 Markdown 一键转换为 Twitter/X 推文流的免费在线工具。支持基于段落结构的规则拆分和 AI 智能断句两种灵活模式，自动适配每条约 280 字符限制并自动添加序号标注。支持逐条复制和全部内容一键复制到剪贴板。完全免费，无需注册，纯浏览器端运行，数据不会离开本地设备。",
    path: "/zh/thread",
    locale: "zh-CN",
    alternates: {
      ...threadAlternates,
      canonical: "/zh/thread",
    },
  },
  markdownToXArticles: {
    title: "How to Convert Markdown to X Articles — Step-by-Step Guide | MD2X",
    description:
      "Learn how to convert Markdown to X Articles rich text. Step-by-step guide: write Markdown, copy formatted text, paste into X Articles with all formatting preserved. Free online tool.",
    path: "/markdown-to-x-articles",
    locale: "en",
    alternates: {
      canonical: "/markdown-to-x-articles",
    },
  },
  pasteCodeIntoXArticles: {
    title: "Paste Code Blocks into X Articles with Syntax Highlighting | MD2X",
    description:
      "X Articles doesn't support code blocks. MD2X renders your code as syntax-highlighted PNG images with 9 themes. Copy and paste beautiful code snippets into X Articles.",
    path: "/paste-code-into-x-articles",
    locale: "en",
    alternates: {
      canonical: "/paste-code-into-x-articles",
    },
  },
  mermaidInXArticles: {
    title: "Add Mermaid Diagrams to X Articles — Flowcharts & Sequence Diagrams | MD2X",
    description:
      "Create flowcharts, sequence diagrams, and more with Mermaid syntax, then paste them as PNG images into X Articles. Free online tool, no sign-up required.",
    path: "/mermaid-in-x-articles",
    locale: "en",
    alternates: {
      canonical: "/mermaid-in-x-articles",
    },
  },
};

export function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

export function getHtmlLangForPath(pathname: string | null) {
  return pathname === "/zh" || pathname?.startsWith("/zh/")
    ? "zh-CN"
    : "en";
}

export function buildPageMetadata(page: SeoPage): Metadata {
  const seo = pageSeo[page];
  const ogImage = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "MD2X Markdown to X Articles converter",
  };

  return {
    metadataBase: new URL(siteUrl),
    title: seo.title,
    description: seo.description,
    alternates: seo.alternates,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: seo.path,
      siteName: "MD2X",
      locale: seo.locale,
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [ogImage.url],
    },
  };
}

export function buildWebApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MD2X",
    url: siteUrl,
    applicationCategory: "WritingApplication",
    operatingSystem: "Any",
    description: pageSeo.home.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    codeRepository: githubRepoUrl,
  };
}

export function buildFaqJsonLd(
  faqs: readonly { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

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
