import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";

export type LandingLocale = "en" | "zh";

export type FeatureFaq = { question: string; answer: string };
export type FeatureStep = { name: string; text: string };

export type FeatureLandingContent = {
  /** SEO meta title */
  metaTitle: string;
  /** SEO meta description */
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  ctaOpenEditor: string;
  /** "What / why" intro section */
  introTitle: string;
  introBody: string;
  /** Bullet list of benefits / capabilities */
  benefitsTitle: string;
  benefits: string[];
  /** How-to section — also feeds HowTo JSON-LD */
  howToEyebrow: string;
  howToTitle: string;
  howToDescription: string;
  steps: FeatureStep[];
  ctaTitle: string;
  ctaDesc: string;
  faqTitle: string;
  faqs: FeatureFaq[];
};

export type FeatureLandingDef = {
  /** URL path segment, e.g. "code-to-image" */
  slug: string;
  /** Where the primary CTA points (relative path) */
  editorPath: string;
  zhEditorPath: string;
  en: FeatureLandingContent;
  zh: FeatureLandingContent;
};

const codeToImage: FeatureLandingDef = {
  slug: "code-to-image",
  editorPath: "/editor",
  zhEditorPath: "/zh/editor",
  en: {
    metaTitle: "Code to Image — Free Code Screenshot Generator | MD2X",
    metaDescription:
      "Turn code into beautiful syntax-highlighted images online. 9 themes (Dracula, Nord, GitHub Dark). A free Carbon alternative — no sign-up, runs in your browser.",
    heroEyebrow: "CODE → IMAGE",
    heroTitle: "Turn code into beautiful images",
    heroLead:
      "Paste code, pick a theme, get a crisp syntax-highlighted PNG. Nine editor themes, automatic language detection, and one-click copy. Free, no sign-up, runs entirely in your browser.",
    ctaOpenEditor: "Open Editor",
    introTitle: "Why turn code into an image?",
    introBody:
      "Plain-text code loses its highlighting the moment you paste it into X Articles, a slide deck, or a screenshot. A rendered image keeps the colors, spacing, and font so your snippet stays readable anywhere — and looks far better than a flat screenshot crop.",
    benefitsTitle: "What you get",
    benefits: [
      "9 syntax-highlighting themes: GitHub Light/Dark, Dracula, Nord, Night Owl, Tokyo Night, Solarized Dark, One Dark Pro, One Monokai",
      "Automatic language detection for accurate highlighting",
      "High-resolution PNG output, ready to paste or download",
      "Runs fully in-browser — your code never leaves your device",
      "A free, no-sign-up alternative to Carbon and ray.so",
    ],
    howToEyebrow: "HOW IT WORKS",
    howToTitle: "Convert code to an image in three steps",
    howToDescription:
      "Generate a syntax-highlighted image from any code snippet without installing anything.",
    steps: [
      {
        name: "Paste your code",
        text: "Open the MD2X editor and paste your code inside a fenced code block. Language highlighting is detected automatically.",
      },
      {
        name: "Pick a theme",
        text: "Choose Code Image mode and select one of 9 syntax themes from the toolbar dropdown to match your brand or article.",
      },
      {
        name: "Copy or download the PNG",
        text: "Grab the rendered image from the Assets panel — copy it to your clipboard or download the PNG to use anywhere.",
      },
    ],
    ctaTitle: "Generate your first code image",
    ctaDesc: "Free, no sign-up, runs entirely in your browser. Your code stays local.",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is this code-to-image tool free?",
        answer:
          "Yes. MD2X is completely free with no sign-up. It runs in your browser, so there are no usage limits and your code never leaves your device.",
      },
      {
        question: "What themes are available?",
        answer:
          "Nine themes: GitHub Light, GitHub Dark, One Dark Pro, Dracula, Nord, Night Owl, Solarized Dark, One Monokai, and Tokyo Night.",
      },
      {
        question: "Is this a Carbon alternative?",
        answer:
          "Yes. Like Carbon and ray.so, MD2X renders code into a styled image — but it also converts full Markdown documents to X Articles, splits threads, and works offline as a PWA.",
      },
      {
        question: "What image format do I get?",
        answer:
          "A high-resolution PNG that you can copy to your clipboard or download, then paste into X Articles, slides, docs, or anywhere images are supported.",
      },
    ],
  },
  zh: {
    metaTitle: "代码转图片 — 免费代码截图生成器 | MD2X",
    metaDescription:
      "在线将代码转换为带语法高亮的精美图片。9 种主题（Dracula、Nord、GitHub Dark），免费的 Carbon 替代工具，无需注册，纯浏览器端运行。",
    heroEyebrow: "代码 → 图片",
    heroTitle: "把代码变成精美图片",
    heroLead:
      "粘贴代码，选择主题，即可得到清晰的语法高亮 PNG 图片。9 种编辑器主题、自动语言识别、一键复制。完全免费，无需注册，纯浏览器端运行。",
    ctaOpenEditor: "打开编辑器",
    introTitle: "为什么要把代码转成图片？",
    introBody:
      "纯文本代码一旦粘贴到 X Articles、幻灯片或截图中，语法高亮就会丢失。渲染成图片可以保留配色、缩进和字体，让代码片段在任何地方都清晰可读——而且比直接裁剪截图好看得多。",
    benefitsTitle: "你能得到什么",
    benefits: [
      "9 种语法高亮主题：GitHub 亮/暗色、Dracula、Nord、Night Owl、Tokyo Night、Solarized Dark、One Dark Pro、One Monokai",
      "自动识别编程语言，高亮更准确",
      "高分辨率 PNG 输出，可直接粘贴或下载",
      "纯浏览器端运行，代码绝不离开你的设备",
      "免费、无需注册的 Carbon 和 ray.so 替代方案",
    ],
    howToEyebrow: "使用方法",
    howToTitle: "三步把代码转成图片",
    howToDescription: "无需安装任何软件，即可为任意代码片段生成语法高亮图片。",
    steps: [
      {
        name: "粘贴代码",
        text: "打开 MD2X 编辑器，将代码粘贴进围栏代码块中，系统会自动识别语言并高亮。",
      },
      {
        name: "选择主题",
        text: "切换到 Code Image 模式，从工具栏下拉菜单中选择 9 种语法主题之一，匹配你的品牌或文章风格。",
      },
      {
        name: "复制或下载 PNG",
        text: "从 Assets 面板获取渲染好的图片——复制到剪贴板或下载 PNG，即可在任何地方使用。",
      },
    ],
    ctaTitle: "生成你的第一张代码图片",
    ctaDesc: "完全免费，无需注册，纯浏览器端运行，代码保存在本地。",
    faqTitle: "常见问题",
    faqs: [
      {
        question: "这个代码转图片工具免费吗？",
        answer:
          "完全免费，无需注册。它在你的浏览器中运行，没有使用次数限制，代码也绝不会离开你的设备。",
      },
      {
        question: "有哪些主题？",
        answer:
          "9 种主题：GitHub Light、GitHub Dark、One Dark Pro、Dracula、Nord、Night Owl、Solarized Dark、One Monokai 和 Tokyo Night。",
      },
      {
        question: "这是 Carbon 的替代品吗？",
        answer:
          "是的。和 Carbon、ray.so 一样，MD2X 能把代码渲染成精美图片——同时它还能把完整 Markdown 文档转为 X Articles、拆分推文流，并支持 PWA 离线使用。",
      },
      {
        question: "导出的是什么图片格式？",
        answer:
          "高分辨率 PNG，可复制到剪贴板或下载，然后粘贴到 X Articles、幻灯片、文档等任何支持图片的地方。",
      },
    ],
  },
};

const definitions: Record<string, FeatureLandingDef> = {
  [codeToImage.slug]: codeToImage,
};

export function getFeatureLanding(slug: string): FeatureLandingDef | null {
  return definitions[slug] ?? null;
}

export function getAllFeatureLandings(): FeatureLandingDef[] {
  return Object.values(definitions);
}

export function buildFeatureMetadata(
  slug: string,
  locale: LandingLocale,
): Metadata {
  const def = definitions[slug];
  if (!def) return {};
  const content = def[locale];
  const enPath = `/${def.slug}`;
  const zhPath = `/zh/${def.slug}`;
  const canonical = locale === "zh" ? zhPath : enPath;
  const ogImage = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "MD2X Markdown to X Articles converter",
  };

  return {
    metadataBase: new URL(siteUrl),
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: {
      canonical,
      languages: {
        en: enPath,
        "zh-CN": zhPath,
        "x-default": enPath,
      },
    },
    openGraph: {
      title: content.metaTitle,
      description: content.metaDescription,
      url: canonical,
      siteName: "MD2X",
      locale: locale === "zh" ? "zh-CN" : "en",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle,
      description: content.metaDescription,
      images: [ogImage.url],
    },
  };
}
