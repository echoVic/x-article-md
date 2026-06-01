import type { Metadata } from "next";

export const siteUrl = "https://www.markdown2x.com";
export const githubRepoUrl = "https://github.com/echoVic/x-article-md";

export type SeoPage = "home" | "zhHome" | "editor" | "zhEditor";

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

const pageSeo: Record<SeoPage, PageSeo> = {
  home: {
    title: "MD2X - Markdown to X Articles Converter",
    description:
      "Convert Markdown to X Articles rich text. Copy code blocks, tables, and Mermaid diagrams with a browser-based editor.",
    path: "/",
    locale: "en",
    alternates: homeAlternates,
  },
  zhHome: {
    title: "MD2X - Markdown 转 X Articles 编辑器",
    description:
      "将 Markdown 转换为 X Articles 富文本格式，代码块、表格和 Mermaid 图表可一键复制。",
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
      "在线将 Markdown 转换为 X Articles 富文本。代码块渲染为图片，表格和 Mermaid 图表一键复制。免费、无需注册、浏览器端运行。",
    path: "/zh/editor",
    locale: "zh-CN",
    alternates: {
      ...editorAlternates,
      canonical: "/zh/editor",
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
