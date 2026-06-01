export type EditorLocale = "en" | "zh";

export type EditorCopy = {
  h1: string;
  subtitle: string;
  howToTitle: string;
  steps: { title: string; desc: string }[];
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
    ],
  },
};
