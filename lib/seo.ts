import type { Metadata } from "next";

export const siteUrl = "https://markdown2x.com";
export const githubRepoUrl = "https://github.com/echoVic/x-article-md";

export type SeoPage = "home" | "zhHome" | "editor" | "zhEditor" | "thread" | "zhThread" | "blog" | "privacy";

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
      "在线将 Markdown 一键转为 X Articles 富文本。代码块自动渲染为语法高亮图片，Mermaid 图表和表格可一键复制。免费、无需注册，纯浏览器端运行，数据不离开本地。",
    path: "/zh",
    locale: "zh-CN",
    alternates: {
      ...homeAlternates,
      canonical: "/zh",
    },
  },
  editor: {
    title: "Markdown to X Articles Converter - Free Online Editor | MD2X",
    description:
      "Convert Markdown to clipboard-ready rich text for X Articles. Code blocks render as images, tables and Mermaid diagrams copy in one click. Free, no sign-up.",
    path: "/editor",
    locale: "en",
    alternates: editorAlternates,
  },
  zhEditor: {
    title: "免费 Markdown 转 X Articles 在线编辑器 | MD2X",
    description:
      "免费在线 Markdown 编辑器，实时预览 X Articles 长文效果。代码块渲染为语法高亮 PNG 图片，Mermaid 图表和表格一键复制，AI 生成封面图。无需注册，数据保存在本地浏览器。",
    path: "/zh/editor",
    locale: "zh-CN",
    alternates: {
      ...editorAlternates,
      canonical: "/zh/editor",
    },
  },
  thread: {
    title: "Free X/Twitter Thread Generator from Markdown | MD2X",
    description:
      "Use Markdown to split long posts into numbered X/Twitter threads. Create 280-character tweets, copy each tweet or copy the entire thread. Free, no sign-up.",
    path: "/thread",
    locale: "en",
    alternates: threadAlternates,
  },
  zhThread: {
    title: "免费 Markdown 转 Twitter Thread 生成器 | MD2X",
    description:
      "免费在线将 Markdown 转为 Twitter/X 推文流。支持段落规则拆分与 AI 智能断句，自动适配 280 字符限制并加序号，可逐条或一键复制。无需注册，纯浏览器端运行。",
    path: "/zh/thread",
    locale: "zh-CN",
    alternates: {
      ...threadAlternates,
      canonical: "/zh/thread",
    },
  },
  privacy: {
    title: "Privacy Policy | MD2X",
    description:
      "How MD2X handles your data: drafts stay in your browser, AI features send only the selected text to the model provider, and analytics never include draft content.",
    path: "/privacy",
    locale: "en",
    alternates: {
      canonical: "/privacy",
    },
  },
  blog: {
    title: "Markdown to X Articles Tutorials | MD2X Blog",
    description:
      "Tutorials for converting Markdown to X Articles, code screenshots, Mermaid diagrams, tables, and Twitter/X threads with MD2X.",
    path: "/blog",
    locale: "en",
    alternates: {
      canonical: "/blog",
      languages: {
        en: "/blog",
        "zh-CN": "/zh/blog",
        "x-default": "/blog",
      },
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

export function buildArticleJsonLd(
  post: {
    title: string;
    description: string;
    date: string;
    slug: string;
  },
  opts: { locale?: "en" | "zh" } = {},
) {
  const basePath = opts.locale === "zh" ? "/zh/blog" : "/blog";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    inLanguage: opts.locale === "zh" ? "zh-CN" : "en",
    datePublished: post.date,
    url: `${siteUrl}${basePath}/${post.slug}`,
    author: { "@type": "Organization", name: "MD2X" },
    publisher: { "@type": "Organization", name: "MD2X", url: siteUrl },
  };
}

/**
 * Site-wide Organization entity. Only real facts: the open-source repo is the
 * sole `sameAs` (no invented social profiles, contacts, or prices). The logo
 * reuses the existing generated site icon route.
 */
export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MD2X",
    url: siteUrl,
    logo: absoluteUrl("/icon-512"),
    sameAs: [githubRepoUrl],
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MD2X",
    url: siteUrl,
    inLanguage: ["en", "zh-CN"],
    publisher: { "@type": "Organization", name: "MD2X", url: siteUrl },
  };
}

export function buildSoftwareSourceCodeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "MD2X - Markdown to X Articles Converter",
    url: siteUrl,
    codeRepository: githubRepoUrl,
    programmingLanguage: "TypeScript",
    runtimePlatform: "Web browser",
  };
}

export function buildBreadcrumbJsonLd(
  items: readonly { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
