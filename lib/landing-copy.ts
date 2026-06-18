export type LandingLocale = "en" | "zh";

export const landingCopy = {
  en: {
    navFeatures: "Features",
    navWorkflow: "Workflow",
    navEditor: "Editor",
    navThread: "Thread",
    navGetStarted: "Get Started",
    heroEyebrow: "MARKDOWN → X ARTICLES",
    heroTitle: "Write Markdown, publish to X Articles",
    heroLead:
      "Convert Markdown to X Articles rich text. Code blocks render as themed images, tables and Mermaid diagrams copy in one click, AI-generated cover images. Works offline as a PWA.",
    heroOpenEditor: "Open Editor",
    heroGitHub: "GitHub",
    featuresEyebrow: "CORE FEATURES",
    featuresTitle: "Built for X Articles",
    feature1Title: "Rich Text Clipboard",
    feature1Desc:
      "Copied content preserves bold, links, and list formatting — paste directly into X Articles to publish.",
    feature2Title: "Code Blocks → Images",
    feature2Desc:
      "Code blocks render as syntax-highlighted PNG images with 9 themes (Dracula, Nord, GitHub, etc.) — ready to paste into your article.",
    feature3Title: "AI Cover Images",
    feature3Desc:
      "Auto-generate cover images from article content. Supports OpenAI-compatible APIs, one-click download or copy.",
    feature4Title: "Thread Splitter",
    feature4Desc:
      "AI-powered tweet thread generator. Write long-form Markdown, split into numbered tweet-sized chunks automatically.",
    feature5Title: "Mermaid Diagrams",
    feature5Desc:
      "Flowcharts, sequence diagrams, and more render as PNG images with theme-synced colors. Paste directly into X Articles.",
    feature6Title: "Offline PWA",
    feature6Desc:
      "Install as a desktop app. Edit and preview Markdown offline — AI features activate when you're back online.",
    workflowEyebrow: "WORKFLOW",
    workflowTitle: "Publish in three steps",
    step1Title: "Write Markdown",
    step1Desc:
      "Write in the editor with familiar Markdown syntax, with a live preview of the final X Articles output. Import existing .md files or start fresh.",
    step2Title: "Copy title and body",
    step2Desc:
      "Click copy title and copy body — rich text enters your clipboard automatically. Code blocks and tables render as images with your chosen theme.",
    step3Title: "Paste into X Articles",
    step3Desc:
      "Cmd+V in the X Articles editor — formatting is fully preserved. Paste asset images from the panel, attach the AI-generated cover and publish.",
    ctaTitle: "Start writing",
    ctaDesc: "Runs entirely in the browser. No sign-up required. Data stays local. Supports dark mode and Chinese/English UI.",
    ctaOpenEditor: "Open Editor",
    footerTagline: "MD2X · Markdown → X Articles · Open Source",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Does X Articles support Markdown?",
        answer:
          "No. X Articles uses its own rich-text editor with no native Markdown support. MD2X converts your Markdown into formatted rich text you can paste directly into the X Articles editor.",
      },
      {
        question: "How do I paste Markdown into X Articles?",
        answer:
          "Write or paste Markdown in the MD2X editor, click 'Copy Body', then Cmd+V (or Ctrl+V) into the X Articles editor. All formatting — headings, bold, links, lists — is preserved.",
      },
      {
        question: "How are code blocks handled?",
        answer:
          "X Articles cannot display formatted code. MD2X renders code blocks as syntax-highlighted PNG images with your chosen theme (9 options including Dracula, Nord, GitHub Dark, etc.). Copy them from the Assets panel and paste into X Articles.",
      },
      {
        question: "What is the Thread mode?",
        answer:
          "Thread mode splits your long-form article into tweet-sized chunks using AI. Each chunk is numbered and ready to post as a Twitter/X thread.",
      },
      {
        question: "Can I use MD2X offline?",
        answer:
          "Yes. MD2X is a Progressive Web App (PWA) — install it from your browser and use it offline. Editing, previewing, and copying work without a network. AI features (polish, translate, cover image) require an internet connection.",
      },
      {
        question: "Is my content uploaded to any server?",
        answer:
          "No. MD2X runs entirely in your browser. Your Markdown drafts are saved to localStorage and never leave your device. AI features send only the selected text to the API.",
      },
      {
        question: "How do I switch themes or languages?",
        answer:
          "Use the theme toggle (sun/moon icon) in the header to switch between light, dark, and system modes. Use the globe icon to switch between English and Chinese UI.",
      },
      {
        question: "What code image themes are available?",
        answer:
          "MD2X offers 9 themes: GitHub Light, GitHub Dark, One Dark Pro, Dracula, Nord, Night Owl, Solarized Dark, One Monokai, and Tokyo Night. Select from the dropdown in the editor toolbar when in Code Image mode.",
      },
    ],
  },
  zh: {
    navFeatures: "功能",
    navWorkflow: "工作流",
    navEditor: "编辑器",
    navThread: "推文流",
    navGetStarted: "开始使用",
    heroEyebrow: "MARKDOWN → X ARTICLES",
    heroTitle: "写 Markdown，发布到 X Articles",
    heroLead:
      "将 Markdown 转换为 X Articles 富文本格式。代码块渲染为可选主题的图片，表格和 Mermaid 图表一键复制，AI 生成封面图。支持 PWA 离线使用。",
    heroOpenEditor: "打开编辑器",
    heroGitHub: "GitHub",
    featuresEyebrow: "核心能力",
    featuresTitle: "为 X Articles 量身定制",
    feature1Title: "富文本剪贴板",
    feature1Desc:
      "复制的内容保留粗体、链接、列表格式，粘贴到 X Articles 即可发布。",
    feature2Title: "代码块 → 图片",
    feature2Desc:
      "代码块自动渲染为带语法高亮的 PNG 图片，支持 9 种主题配色（Dracula、Nord、GitHub 等），直接粘贴到文章中。",
    feature3Title: "AI 封面图",
    feature3Desc:
      "基于文章内容自动生成封面图，支持 OpenAI 兼容 API，一键下载或复制。",
    feature4Title: "推文流拆分",
    feature4Desc:
      "AI 驱动的推文流生成器。编写长文 Markdown，自动拆分为带编号的推文大小片段。",
    feature5Title: "Mermaid 图表",
    feature5Desc:
      "流程图、时序图等渲染为主题同步配色的 PNG 图片，可直接粘贴到 X Articles。",
    feature6Title: "离线 PWA",
    feature6Desc:
      "可安装为桌面应用。离线编辑和预览 Markdown，联网后 AI 功能自动恢复。",
    workflowEyebrow: "工作流",
    workflowTitle: "三步完成发布",
    step1Title: "编写 Markdown",
    step1Desc:
      "在编辑器中用熟悉的 Markdown 语法写作，实时预览 X Articles 最终效果。支持导入现有 .md 文件。",
    step2Title: "复制标题和正文",
    step2Desc:
      "点击复制标题和复制正文，富文本自动进入剪贴板。代码块和表格按所选主题渲染为图片。",
    step3Title: "粘贴到 X Articles",
    step3Desc:
      "在 X Articles 编辑器中 Cmd+V，格式完整保留。从 Assets 面板粘贴图片资产，附上 AI 生成的封面图即可发布。",
    ctaTitle: "开始写作",
    ctaDesc: "纯浏览器端运行，无需注册，数据保存在本地。支持暗色模式和中英文界面。",
    ctaOpenEditor: "打开编辑器",
    footerTagline: "MD2X · Markdown → X Articles · 开源项目",
    faqTitle: "常见问题",
    faqs: [
      {
        question: "X Articles 支持 Markdown 吗？",
        answer:
          "不支持。X Articles 使用自有的富文本编辑器，没有原生 Markdown 支持。MD2X 将你的 Markdown 转换为格式化富文本，可直接粘贴到 X Articles 编辑器中。",
      },
      {
        question: "如何把 Markdown 粘贴到 X Articles？",
        answer:
          "在 MD2X 编辑器中编写或粘贴 Markdown，点击「复制正文」，然后在 X Articles 编辑器中 Cmd+V（或 Ctrl+V）。所有格式——标题、粗体、链接、列表——都会保留。",
      },
      {
        question: "代码块是怎么处理的？",
        answer:
          "X Articles 无法显示格式化代码。MD2X 将代码块渲染为带语法高亮的 PNG 图片，支持 9 种主题（Dracula、Nord、GitHub Dark 等）。从 Assets 面板复制后粘贴到 X Articles。",
      },
      {
        question: "什么是推文流模式？",
        answer:
          "推文流模式使用 AI 将长文拆分为推文大小的片段，每段自动编号，可直接作为 Twitter/X Thread 发布。",
      },
      {
        question: "可以离线使用吗？",
        answer:
          "可以。MD2X 是 PWA 应用，从浏览器安装后可离线使用。编辑、预览、复制均可离线工作，AI 功能（润色、翻译、封面图）需联网。",
      },
      {
        question: "我的内容会上传到服务器吗？",
        answer:
          "不会。MD2X 完全在浏览器中运行。你的 Markdown 草稿保存在 localStorage 中，不会离开你的设备。AI 功能仅发送选中的文本到 API。",
      },
      {
        question: "如何切换主题或语言？",
        answer:
          "使用顶部导航栏的太阳/月亮图标切换亮色、暗色和系统模式。使用地球图标切换中英文界面。",
      },
      {
        question: "有哪些代码图片主题？",
        answer:
          "MD2X 提供 9 种主题：GitHub Light、GitHub Dark、One Dark Pro、Dracula、Nord、Night Owl、Solarized Dark、One Monokai 和 Tokyo Night。在 Code Image 模式下从编辑器工具栏下拉菜单选择。",
      },
    ],
  },
} as const;
