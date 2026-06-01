export type LandingLocale = "en" | "zh";

export const landingCopy = {
  en: {
    navFeatures: "Features",
    navWorkflow: "Workflow",
    navOpenEditor: "Open Editor",
    navGetStarted: "Get Started",
    heroEyebrow: "MARKDOWN → X ARTICLES",
    heroTitle: "Write Markdown, publish to X Articles",
    heroLead:
      "Convert Markdown to X Articles rich text. Code blocks render as images, tables and Mermaid diagrams copy in one click, AI-generated cover images.",
    heroOpenEditor: "Open Editor",
    heroGitHub: "GitHub",
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
    ctaTitle: "Start writing",
    ctaDesc: "Runs entirely in the browser. No sign-up required. Data stays local.",
    ctaOpenEditor: "Open Editor",
    footerTagline: "MD2X · Markdown → X Articles · Open Source",
  },
  zh: {
    navFeatures: "功能",
    navWorkflow: "工作流",
    navOpenEditor: "打开编辑器",
    navGetStarted: "开始使用",
    heroEyebrow: "MARKDOWN → X ARTICLES",
    heroTitle: "写 Markdown，发布到 X Articles",
    heroLead:
      "将 Markdown 转换为 X Articles 富文本格式。代码块渲染为图片，表格和 Mermaid 图表一键复制，AI 生成封面图。",
    heroOpenEditor: "打开编辑器",
    heroGitHub: "GitHub",
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
    ctaTitle: "开始写作",
    ctaDesc: "纯浏览器端运行，无需注册，数据保存在本地。",
    ctaOpenEditor: "打开编辑器",
    footerTagline: "MD2X · Markdown → X Articles · 开源项目",
  },
} as const;
