import type { Metadata } from "next";

export const siteUrl = "https://www.markdown2x.com";
export const githubRepoUrl = "https://github.com/echoVic/x-article-md";

export type SeoPage = "home" | "zhHome" | "editor";

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
    title: "Markdown to X Articles Editor - MD2X",
    description:
      "Write Markdown and copy polished rich text into X Articles. Code blocks, tables, and diagrams stay ready to publish.",
    path: "/editor",
    locale: "en",
    alternates: {
      canonical: "/editor",
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
