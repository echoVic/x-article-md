export type EditorLocale = "en" | "zh";

export type EditorCopy = {
  h1: string;
  subtitle: string;
  howToTitle: string;
  steps: { title: string; desc: string }[];
  supportsTitle: string;
  supports: string[];
  limitsTitle: string;
  limits: string[];
  ioTitle: string;
  ioInput: string;
  ioOutput: string;
  whoTitle: string;
  whoItems: string[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
};

export const editorCopy: Record<EditorLocale, EditorCopy> = {
  en: {
    h1: "Free Markdown to X Articles Converter",
    subtitle:
      "Write Markdown, convert to beautifully formatted X Articles rich text — code blocks, tables, and Mermaid diagrams included.",
    howToTitle: "How to Use",
    steps: [
      {
        title: "Write Markdown",
        desc: "Type or paste your Markdown content in the left editor panel with live preview on the right.",
      },
      {
        title: "Copy Rich Text",
        desc: 'Click "Copy Body" to copy the formatted rich text to your clipboard. Code blocks are converted to syntax-highlighted images.',
      },
      {
        title: "Paste into X Articles",
        desc: "Paste directly into the X Articles editor — all formatting, images, and links are preserved.",
      },
    ],
    supportsTitle: "What This Supports",
    supports: [
      "Headings, bold, italic, strikethrough",
      "Ordered & unordered lists, nested lists",
      "Links and inline code",
      "Code blocks with syntax highlighting (rendered as PNG)",
      "Tables (rendered as formatted rich text)",
      "Mermaid diagrams (rendered as PNG)",
      "AI-generated cover images",
    ],
    limitsTitle: "Current Limitations",
    limits: [
      "Footnotes are not supported in X Articles rich text",
      "LaTeX math blocks are not rendered (plain text fallback)",
      "Embedded videos/iframes cannot be pasted — link instead",
      "Image URLs in Markdown are not auto-uploaded; paste images manually",
    ],
    ioTitle: "Input → Output",
    ioInput: "Standard Markdown (.md) — paste or type directly in the editor",
    ioOutput: "Clipboard-ready rich text for X Articles editor, with code blocks and Mermaid diagrams as inline PNG images",
    whoTitle: "Who Is This For",
    whoItems: [
      "Developers sharing technical articles on X",
      "Writers who prefer Markdown over WYSIWYG editors",
      "Content creators repurposing blog posts for X Articles",
      "Anyone who needs code snippets in X long-form posts",
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is this Markdown to X Articles converter free?",
        answer:
          "Yes, MD2X is completely free and open source. It runs entirely in your browser with no sign-up required.",
      },
      {
        question: "Does MD2X support code blocks and syntax highlighting?",
        answer:
          "Yes. Code blocks are automatically rendered as syntax-highlighted PNG images that can be pasted directly into X Articles, which doesn't natively support code formatting.",
      },
      {
        question: "Can I use Mermaid diagrams?",
        answer:
          "Yes. Mermaid diagram blocks are rendered as images and included in your clipboard when you copy the article body.",
      },
      {
        question: "Is my data stored on any server?",
        answer:
          "No. All editing happens locally in your browser. Your drafts are saved to localStorage and never leave your device.",
      },
      {
        question: "What is X Articles?",
        answer:
          "X Articles is a long-form publishing platform on X (formerly Twitter). MD2X helps you write in Markdown and seamlessly convert your content for publishing on X Articles with proper formatting.",
      },
      {
        question: "How do I add code snippets to X Articles?",
        answer:
          "X Articles does not natively support code formatting. MD2X solves this by converting your Markdown code blocks into syntax-highlighted PNG images that you can paste directly into X Articles while preserving readability.",
      },
      {
        question: "Does X Articles support Markdown formatting?",
        answer:
          "No. X Articles uses its own rich-text editor and does not accept raw Markdown. MD2X bridges the gap by converting Markdown into clipboard-ready rich text that pastes cleanly into the X Articles editor.",
      },
      {
        question: "What is the character limit for X Articles?",
        answer:
          "X Articles currently supports long-form posts with no strict character limit, unlike regular posts (280 chars). MD2X lets you write freely in Markdown and handles all formatting conversion regardless of article length.",
      },
      {
        question: "Can I include tables and diagrams in X Articles?",
        answer:
          "X Articles has limited native support for tables and no support for diagrams. MD2X renders Markdown tables as formatted rich text and Mermaid diagrams as images, so you can paste both directly into X Articles.",
      },
      {
        question: "How does MD2X compare to copying from Notion or Google Docs?",
        answer:
          "Copying from Notion or Google Docs often introduces unwanted styles, broken links, or stripped formatting. MD2X gives you predictable output from Markdown source — code blocks become images, tables stay aligned, and no hidden styles leak through.",
      },
    ],
  },
  zh: {
    h1: "免费 Markdown 转 X Articles 转换器",
    subtitle:
      "编写 Markdown，一键转换为 X Articles 富文本格式——支持代码块、表格和 Mermaid 图表。",
    howToTitle: "使用方法",
    steps: [
      {
        title: "编写 Markdown",
        desc: "在左侧编辑面板中输入或粘贴 Markdown 内容，右侧实时预览效果。",
      },
      {
        title: "复制富文本",
        desc: "点击「复制正文」将格式化的富文本复制到剪贴板。代码块会自动转为语法高亮图片。",
      },
      {
        title: "粘贴到 X Articles",
        desc: "直接粘贴到 X Articles 编辑器中——所有格式、图片和链接完整保留。",
      },
    ],
    supportsTitle: "支持的格式",
    supports: [
      "标题、粗体、斜体、删除线",
      "有序列表、无序列表、嵌套列表",
      "链接和行内代码",
      "代码块（带语法高亮，渲染为 PNG 图片）",
      "表格（渲染为格式化富文本）",
      "Mermaid 图表（渲染为 PNG 图片）",
      "AI 生成封面图",
    ],
    limitsTitle: "当前限制",
    limits: [
      "脚注在 X Articles 富文本中不受支持",
      "LaTeX 数学公式不会渲染（以纯文本显示）",
      "嵌入式视频/iframe 无法粘贴——请使用链接代替",
      "Markdown 中的图片 URL 不会自动上传，需手动粘贴图片",
    ],
    ioTitle: "输入 → 输出",
    ioInput: "标准 Markdown（.md）——在编辑器中直接输入或粘贴",
    ioOutput: "可直接粘贴到 X Articles 编辑器的富文本（代码块和 Mermaid 图表为内嵌 PNG 图片）",
    whoTitle: "适合谁使用",
    whoItems: [
      "在 X 上分享技术文章的开发者",
      "偏好 Markdown 而非富文本编辑器的作者",
      "将博客文章重新发布到 X Articles 的内容创作者",
      "需要在 X 长文中插入代码片段的任何人",
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        question: "这个 Markdown 转 X Articles 工具免费吗？",
        answer:
          "是的，MD2X 完全免费且开源。它完全在浏览器中运行，无需注册。",
      },
      {
        question: "MD2X 支持代码块和语法高亮吗？",
        answer:
          "支持。代码块会自动渲染为带语法高亮的 PNG 图片，可以直接粘贴到不支持代码格式的 X Articles 中。",
      },
      {
        question: "可以使用 Mermaid 图表吗？",
        answer:
          "可以。Mermaid 图表会渲染为图片，复制正文时会包含在剪贴板中。",
      },
      {
        question: "我的数据会存储在服务器上吗？",
        answer:
          "不会。所有编辑都在浏览器本地进行，草稿保存在 localStorage 中，不会离开你的设备。",
      },
      {
        question: "什么是 X Articles？",
        answer:
          "X Articles 是 X（原 Twitter）上的长文发布平台。MD2X 帮助你用 Markdown 编写内容，并无缝转换为适合在 X Articles 上发布的格式。",
      },
      {
        question: "如何在 X Articles 中插入代码片段？",
        answer:
          "X Articles 原生不支持代码格式。MD2X 将 Markdown 代码块自动转换为带语法高亮的 PNG 图片，可直接粘贴到 X Articles 中，保持代码可读性。",
      },
      {
        question: "X Articles 支持 Markdown 格式吗？",
        answer:
          "不支持。X Articles 使用自有的富文本编辑器，不接受原始 Markdown。MD2X 充当转换桥梁，将 Markdown 转为可直接粘贴到 X Articles 编辑器的富文本。",
      },
      {
        question: "X Articles 有字数限制吗？",
        answer:
          "X Articles 支持长文发布，没有严格字数限制（不同于普通推文的 280 字符）。MD2X 允许你自由编写 Markdown，无论文章长度如何都能处理格式转换。",
      },
      {
        question: "X Articles 能插入表格和图表吗？",
        answer:
          "X Articles 对表格支持有限，不支持图表。MD2X 将 Markdown 表格渲染为格式化富文本，Mermaid 图表渲染为图片，两者都可粘贴到 X Articles 中。",
      },
      {
        question: "MD2X 和从 Notion 或 Google Docs 复制相比有什么优势？",
        answer:
          "从 Notion 或 Google Docs 复制经常引入多余样式、断链或丢失格式。MD2X 从 Markdown 源文件出发，输出可预测——代码块变图片、表格对齐、不会泄漏隐藏样式。",
      },
    ],
  },
};
