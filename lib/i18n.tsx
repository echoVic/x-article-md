"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "zh";

const storageKey = "x-article-md:locale";

type Translations = Record<keyof typeof en, string>;

// ─── English ───────────────────────────────────────────────────────────────────
const en = {
  // Landing — nav
  navFeatures: "Features",
  navWorkflow: "Workflow",
  navOpenEditor: "Open Editor",
  navGetStarted: "Get Started",

  // Landing — hero
  heroEyebrow: "MARKDOWN → X ARTICLES",
  heroTitle: "Write Markdown, publish to X Articles",
  heroLead:
    "Convert Markdown to X Articles rich text. Code blocks render as images, tables and Mermaid diagrams copy in one click, AI-generated cover images.",
  heroOpenEditor: "Open Editor",
  heroGitHub: "GitHub",

  // Landing — features
  featuresEyebrow: "CORE FEATURES",
  featuresTitle: "Built for X Articles",
  feature1Title: "Rich Text Clipboard",
  feature1Desc:
    "Copied content preserves bold, links, and list formatting — paste directly into X Articles to publish.",
  feature2Title: "Code Blocks → Images",
  feature2Desc:
    "Code blocks automatically render as syntax-highlighted PNG images, ready to paste into your article.",
  feature3Title: "AI Cover Images",
  feature3Desc:
    "Auto-generate cover images from article content. Supports OpenAI-compatible APIs, one-click download or copy.",

  // Landing — workflow
  workflowEyebrow: "WORKFLOW",
  workflowTitle: "Publish in three steps",
  step1Title: "Write Markdown",
  step1Desc:
    "Write in the editor with familiar Markdown syntax, with a live preview of the final X Articles output.",
  step2Title: "Copy title and body",
  step2Desc:
    "Click copy title and copy body — rich text enters your clipboard automatically. Code blocks and tables render as images.",
  step3Title: "Paste into X Articles",
  step3Desc:
    "Cmd+V in the X Articles editor — formatting is fully preserved. Attach the AI-generated cover image and publish.",

  // Landing — CTA
  ctaTitle: "Start writing",
  ctaDesc: "Runs entirely in the browser. No sign-up required. Data stays local.",
  ctaOpenEditor: "Open Editor",

  // Landing — footer
  footerTagline: "MD2X · Markdown → X Articles · Open Source",

  // Editor — header
  saved: "Saved",
  loading: "Loading",
  codeQuote: "Code Quote",
  codeImage: "Code Image",
  copyTitle: "Copy Title",
  copied: "Copied",
  copyBody: "Copy Body",
  selectText: "Select Text",
  importFile: "Import",
  exportFile: "Export",
  importError: "Import failed",
  fileTooLarge: "File exceeds 1MB limit",

  // Editor — toolbar
  toolHeading: "Heading",
  toolBold: "Bold",
  toolInlineCode: "Inline Code",
  toolLink: "Link",
  toolBulletList: "Bullet List",
  toolOrderedList: "Ordered List",
  toolCodeFence: "Code Block",
  toolMermaid: "Mermaid",
  toolTable: "Table",
  toolReset: "Reset to sample",
  toolTranslate: "Translate",
  translateToEnglish: "Translate to English",
  translateToChinese: "Translate to Chinese",
  translating: "Translating...",
  translateError: "Translation failed",
  translateSuccess: "Translation completed",
  toolPolish: "Polish",
  polishDefault: "Polish",
  polishConcise: "Make Concise",
  polishProfessional: "Make Professional",
  polishCasual: "Make Casual",
  polishEngaging: "Make Engaging",
  polishing: "Polishing...",
  polishError: "Polish failed",
  polishSuccess: "Polish completed",
  polishSelectText: "Select text to polish",
  polishAccept: "Accept",
  polishReject: "Reject",
  polishComparing: "Comparing changes...",

  // Editor — footer
  footerLines: "lines",
  footerWords: "words",
  footerChars: "chars",
  footerShortcuts: "⌘B bold · ⌘K link · ⌘E code",

  // Editor — preview
  livePreview: "Live Preview",
  xArticles: "MD2X",

  // Editor — placeholder
  editorPlaceholder: "Start writing Markdown...",

  // Cover image panel
  coverTitle: "Cover Image",
  coverReady: "Ready",
  coverOptional: "Optional",
  coverApiKey: "API Key",
  coverModel: "Model",
  coverBaseUrl: "Base URL",
  coverGenerating: "Generating...",
  coverGenerated: "Generated",
  coverGenerate: "Generate Cover",
  coverDownload: "Download PNG",
  coverCopyImage: "Copy Image",
  coverProcessing: "Processing",
  coverDone: "Done",
  coverFailed: "Failed",
  coverNetworkError:
    "Image request failed. Check the Base URL, network connection, and whether the provider allows browser CORS requests.",
  coverGenericError: "Image generation failed.",

  // Assets panel
  assetsTitle: "X Assets",
  assetsEmpty: "No assets yet. Code blocks, tables, and Mermaid diagrams will appear here as copyable images.",
  assetsPlaceholder: "Placeholder",
  assetsDownloadPng: "Download PNG",
  assetsCopyImage: "Copy Image",
  assetsCopyUrl: "Copy URL",
  assetsDone: "Done",
  assetsFailed: "Failed",
  assetsColumns: "cols",
  assetsRows: "rows",

  // Manual copy
  manualClose: "Close",

  // Thread page
  threadMarkdownInput: "Markdown Input",
  threadAiSplit: "✨ AI Split",
  threadSplitting: "Splitting...",
  threadResetToRules: "Reset to Rules",
  threadCopyAll: "Copy All",
  threadCopied: "Copied!",
  threadCopy: "Copy",
  threadChars: "chars",
  threadPlaceholder: "Paste or write your Markdown here...",
  threadEmpty: "Your thread will appear here...",
  threadTweet: "tweet",
  threadTweets: "tweets",
} as const;

// ─── Chinese ───────────────────────────────────────────────────────────────────
const zh: Translations = {
  // Landing — nav
  navFeatures: "功能",
  navWorkflow: "工作流",
  navOpenEditor: "打开编辑器",
  navGetStarted: "开始使用",

  // Landing — hero
  heroEyebrow: "MARKDOWN → X ARTICLES",
  heroTitle: "写 Markdown，发布到 X Articles",
  heroLead:
    "将 Markdown 转换为 X Articles 富文本格式。代码块渲染为图片，表格和 Mermaid 图表一键复制，AI 生成封面图。",
  heroOpenEditor: "打开编辑器",
  heroGitHub: "GitHub",

  // Landing — features
  featuresEyebrow: "核心能力",
  featuresTitle: "为 X Articles 量身定制",
  feature1Title: "富文本剪贴板",
  feature1Desc:
    "复制的内容保留粗体、链接、列表格式，粘贴到 X Articles 即可发布。",
  feature2Title: "代码块 → 图片",
  feature2Desc:
    "代码块自动渲染为带语法高亮的 PNG 图片，直接粘贴到文章中。",
  feature3Title: "AI 封面图",
  feature3Desc:
    "基于文章内容自动生成封面图，支持 OpenAI 兼容 API，一键下载或复制。",

  // Landing — workflow
  workflowEyebrow: "工作流",
  workflowTitle: "三步完成发布",
  step1Title: "编写 Markdown",
  step1Desc:
    "在编辑器中用熟悉的 Markdown 语法写作，实时预览 X Articles 最终效果。",
  step2Title: "复制标题和正文",
  step2Desc:
    "点击复制标题和复制正文，富文本自动进入剪贴板。代码块和表格渲染为图片。",
  step3Title: "粘贴到 X Articles",
  step3Desc:
    "在 X Articles 编辑器中 Cmd+V，格式完整保留。附上 AI 生成的封面图即可发布。",

  // Landing — CTA
  ctaTitle: "开始写作",
  ctaDesc: "纯浏览器端运行，无需注册，数据保存在本地。",
  ctaOpenEditor: "打开编辑器",

  // Landing — footer
  footerTagline: "MD2X · Markdown → X Articles · 开源项目",

  // Editor — header
  saved: "已保存",
  loading: "加载中",
  codeQuote: "代码引用",
  codeImage: "代码图片",
  copyTitle: "复制标题",
  copied: "已复制",
  copyBody: "复制正文",
  selectText: "选择文本",
  importFile: "导入",
  exportFile: "导出",
  importError: "导入失败",
  fileTooLarge: "文件超过 1MB 限制",

  // Editor — toolbar
  toolHeading: "标题",
  toolBold: "加粗",
  toolInlineCode: "行内代码",
  toolLink: "链接",
  toolBulletList: "无序列表",
  toolOrderedList: "有序列表",
  toolCodeFence: "代码块",
  toolMermaid: "Mermaid",
  toolTable: "表格",
  toolReset: "重置为示例",
  toolTranslate: "翻译",
  translateToEnglish: "翻译为英文",
  translateToChinese: "翻译为中文",
  translating: "翻译中...",
  translateError: "翻译失败",
  translateSuccess: "翻译完成",
  toolPolish: "润色",
  polishDefault: "润色",
  polishConcise: "精简版",
  polishProfessional: "专业版",
  polishCasual: "口语版",
  polishEngaging: "吸睛版",
  polishing: "润色中...",
  polishError: "润色失败",
  polishSuccess: "润色完成",
  polishSelectText: "请先选择要润色的文本",
  polishAccept: "接受",
  polishReject: "拒绝",
  polishComparing: "对比变化...",

  // Editor — footer
  footerLines: "行",
  footerWords: "词",
  footerChars: "字符",
  footerShortcuts: "⌘B 加粗 · ⌘K 链接 · ⌘E 代码",

  // Editor — preview
  livePreview: "实时预览",
  xArticles: "MD2X",

  // Editor — placeholder
  editorPlaceholder: "开始编写 Markdown...",

  // Cover image panel
  coverTitle: "封面图片",
  coverReady: "就绪",
  coverOptional: "可选",
  coverApiKey: "API Key",
  coverModel: "模型",
  coverBaseUrl: "Base URL",
  coverGenerating: "生成中...",
  coverGenerated: "已生成",
  coverGenerate: "生成封面",
  coverDownload: "下载 PNG",
  coverCopyImage: "复制图片",
  coverProcessing: "处理中",
  coverDone: "完成",
  coverFailed: "失败",
  coverNetworkError:
    "图片请求失败。请检查 Base URL、网络连接以及服务商是否允许浏览器 CORS 请求。",
  coverGenericError: "图片生成失败。",

  // Assets panel
  assetsTitle: "X 资源",
  assetsEmpty: "暂无资源。代码块、表格和 Mermaid 图表会以可复制图片的形式出现在这里。",
  assetsPlaceholder: "占位符",
  assetsDownloadPng: "下载 PNG",
  assetsCopyImage: "复制图片",
  assetsCopyUrl: "复制 URL",
  assetsDone: "完成",
  assetsFailed: "失败",
  assetsColumns: "列",
  assetsRows: "行",

  // Manual copy
  manualClose: "关闭",

  // Thread page
  threadMarkdownInput: "Markdown 输入",
  threadAiSplit: "✨ AI 拆分",
  threadSplitting: "拆分中...",
  threadResetToRules: "恢复规则拆分",
  threadCopyAll: "全部复制",
  threadCopied: "已复制!",
  threadCopy: "复制",
  threadChars: "字符",
  threadPlaceholder: "粘贴或编写你的 Markdown...",
  threadEmpty: "推文流将在这里显示...",
  threadTweet: "条推文",
  threadTweets: "条推文",
};

// ─── Context ───────────────────────────────────────────────────────────────────
const dictionaries: Record<Locale, Translations> = { en, zh };

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

export function I18nProvider({
  children,
  initialLocale = "en",
  persistLocale = true,
}: {
  children: ReactNode;
  initialLocale?: Locale;
  persistLocale?: boolean;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    if (!persistLocale) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(storageKey) as Locale | null;
      if (saved && (saved === "en" || saved === "zh")) {
        setLocaleState(saved);
      } else if (window.location.pathname.startsWith("/zh")) {
        setLocaleState("zh");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [persistLocale]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (persistLocale) {
      localStorage.setItem(storageKey, newLocale);
    }
  }, [persistLocale]);

  const t = dictionaries[locale];

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
