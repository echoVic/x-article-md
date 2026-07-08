export type ThreadLocale = "en" | "zh";

export type ThreadCopy = {
  h1: string;
  subtitle: string;
  howToTitle: string;
  steps: { title: string; desc: string }[];
  faqTitle: string;
  faqs: { question: string; answer: string }[];
};

export const threadCopy: Record<ThreadLocale, ThreadCopy> = {
  en: {
    h1: "Free X/Twitter Thread Generator from Markdown",
    subtitle:
      "Use Markdown to split long posts into 280-character tweets with numbering. Copy each tweet individually or copy the entire thread for X/Twitter.",
    howToTitle: "How to Use",
    steps: [
      {
        title: "Write Markdown",
        desc: "Type or paste your content in the left panel using standard Markdown syntax.",
      },
      {
        title: "Auto-Split",
        desc: "Your content is automatically split into ≤280 character tweets with 1/N numbering.",
      },
      {
        title: "Copy & Post",
        desc: "Copy tweets individually or all at once. Paste each into X to publish your thread.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "How does the thread splitting work?",
        answer:
          "MD2X splits your content by paragraphs first, then by sentences, and finally by word boundaries if a single sentence exceeds 280 characters. Each tweet gets a 1/N counter appended.",
      },
      {
        question: "Does this support Markdown formatting?",
        answer:
          "Yes. You write in Markdown for structure and readability, but the output is plain text suitable for X/Twitter which doesn't support rich formatting in tweets.",
      },
      {
        question: "What is the character limit per tweet?",
        answer:
          "The default limit is 280 characters (standard X/Twitter limit). Each tweet includes the numbering suffix (e.g., '1/5') within this limit.",
      },
      {
        question: "Is this Twitter thread generator free?",
        answer:
          "Yes, completely free and open source. It runs in your browser with no sign-up, no account required, and your content stays local. You can copy individual tweets or copy the entire thread at once.",
      },
      {
        question: "Can I use this for X (formerly Twitter)?",
        answer:
          "Yes. This tool is designed specifically for X/Twitter threads. The 280-character limit matches X's standard tweet length.",
      },
      {
        question: "How are code blocks handled in threads?",
        answer:
          "Code blocks are stripped from the output since X/Twitter doesn't support formatted code in tweets. If you need code in your thread, consider using screenshots instead.",
      },
    ],
  },
  zh: {
    h1: "免费 Markdown 转 Twitter Thread 生成器",
    subtitle:
      "面向写作者的免费推文流生成器：用 Markdown 编写，自动拆分为推文大小的段落并添加编号。支持逐条复制或一键复制整个 Thread。",
    howToTitle: "使用方法",
    steps: [
      {
        title: "编写 Markdown",
        desc: "在左侧面板中使用标准 Markdown 语法输入或粘贴内容。",
      },
      {
        title: "自动拆分",
        desc: "内容自动拆分为 ≤280 字符的推文，并添加 1/N 编号。",
      },
      {
        title: "复制并发布",
        desc: "逐条复制或一键复制全部，粘贴到 X 发布你的 Thread。",
      },
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        question: "Thread 拆分是怎么工作的？",
        answer:
          "MD2X 先按段落拆分内容，再按句子拆分，如果单个句子超过 280 字符则按词边界拆分。每条推文末尾添加 1/N 计数器。",
      },
      {
        question: "支持 Markdown 格式吗？",
        answer:
          "支持。你用 Markdown 编写以获得结构和可读性，但输出是适合 X/Twitter 的纯文本（推文不支持富文本格式）。",
      },
      {
        question: "每条推文的字符限制是多少？",
        answer:
          "默认限制为 280 字符（X/Twitter 标准限制）。每条推文的编号后缀（如「1/5」）包含在此限制内。",
      },
      {
        question: "这个 Twitter Thread 生成器免费吗？",
        answer:
          "完全免费且开源。在浏览器中运行，无需注册，内容保存在本地。",
      },
      {
        question: "可以用于 X（原 Twitter）吗？",
        answer:
          "是的。此工具专为 X/Twitter Thread 设计，280 字符限制与 X 的标准推文长度一致。",
      },
      {
        question: "Thread 中代码块怎么处理？",
        answer:
          "代码块会从输出中去除，因为 X/Twitter 推文不支持格式化代码。如需在 Thread 中包含代码，建议使用截图。",
      },
    ],
  },
};
