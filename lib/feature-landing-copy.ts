import type { Metadata } from "next";
import { siteUrl } from "@/lib/seo";

export type LandingLocale = "en" | "zh";

export type FeatureFaq = { question: string; answer: string };
export type FeatureStep = { name: string; text: string };
export type FeatureExample = { title: string; input: string; output: string };

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
  /** Optional real input/output examples (only populated where useful) */
  examplesTitle?: string;
  examples?: FeatureExample[];
  /** Optional honest limitations + recovery notes */
  limitationsTitle?: string;
  limitations?: string[];
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
  /** Interactive tool rendered directly under the hero, if this page has one */
  tool?: "table-image";
  en: FeatureLandingContent;
  zh: FeatureLandingContent;
};

const markdownToXArticles: FeatureLandingDef = {
  slug: "markdown-to-x-articles",
  editorPath: "/editor",
  zhEditorPath: "/zh/editor",
  en: {
    metaTitle: "Markdown to X Articles Converter — Free Online Tool | MD2X",
    metaDescription:
      "Convert Markdown to clipboard-ready rich text for X Articles. Preserve headings, links, lists, code images, tables, and Mermaid diagrams. Free, no sign-up.",
    heroEyebrow: "MARKDOWN → X ARTICLES",
    heroTitle: "Convert Markdown to X Articles",
    heroLead:
      "Write in Markdown, copy rich text, and paste cleanly into X Articles. MD2X preserves headings, links, lists, code images, tables, and Mermaid diagrams without requiring an account.",
    ctaOpenEditor: "Open Converter",
    introTitle: "Why convert Markdown before publishing on X?",
    introBody:
      "X Articles does not understand raw Markdown. If you paste a Markdown draft directly, headings, links, lists, and code fences turn into plain text. MD2X converts your source into clipboard-ready rich text so your long-form post keeps its structure when pasted into the X Articles editor.",
    benefitsTitle: "What you get",
    benefits: [
      "Clipboard-ready rich text for X Articles headings, links, lists, bold, and italic text",
      "Code blocks rendered as syntax-highlighted PNG images with 9 themes",
      "Markdown tables and Mermaid diagrams converted into pasteable assets",
      "Live preview of the article before you copy it to X",
      "Runs fully in-browser — drafts stay on your device",
    ],
    howToEyebrow: "HOW IT WORKS",
    howToTitle: "Convert Markdown to X Articles in three steps",
    howToDescription:
      "Turn a Markdown draft into formatted X Articles content without manual reformatting.",
    steps: [
      {
        name: "Write or import Markdown",
        text: "Open the MD2X editor, paste your Markdown draft, or import a .md file. The preview shows how your article will read.",
      },
      {
        name: "Copy title and body",
        text: "Use Copy Title and Copy Body to place formatted rich text on your clipboard. Code, tables, and diagrams appear in the Assets panel.",
      },
      {
        name: "Paste into X Articles",
        text: "Open the X Articles editor, paste the rich text, then add any generated images from the Assets panel before publishing.",
      },
    ],
    ctaTitle: "Convert your next X Article",
    ctaDesc: "Free, no sign-up, and built for Markdown-first writers.",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Does X Articles support Markdown?",
        answer:
          "No. X Articles uses its own rich-text editor. MD2X converts Markdown into formatted rich text that can be pasted into that editor.",
      },
      {
        question: "What Markdown formatting is preserved?",
        answer:
          "Headings, bold, italic, strikethrough, links, ordered lists, unordered lists, and inline code are converted to rich text. Code blocks, Mermaid diagrams, and tables become pasteable visual assets.",
      },
      {
        question: "Can I use this for technical posts?",
        answer:
          "Yes. MD2X is designed for technical writers who need code snippets, diagrams, tables, links, and long-form structure inside X Articles.",
      },
      {
        question: "Is my article uploaded to a server?",
        answer:
          "No. Editing, previewing, and copying run in your browser. Your Markdown draft stays local unless you choose an optional AI feature.",
      },
    ],
  },
  zh: {
    metaTitle: "Markdown 转 X Articles — 免费在线转换器 | MD2X",
    metaDescription:
      "将 Markdown 转换为可直接粘贴到 X Articles 的富文本。保留标题、链接、列表、代码图片、表格和 Mermaid 图表。免费，无需注册。",
    heroEyebrow: "MARKDOWN → X ARTICLES",
    heroTitle: "将 Markdown 转换为 X Articles",
    heroLead:
      "用 Markdown 写作，一键复制富文本，再干净地粘贴到 X Articles。MD2X 会保留标题、链接、列表、代码图片、表格和 Mermaid 图表，无需账号。",
    ctaOpenEditor: "打开转换器",
    introTitle: "为什么发布到 X 前要先转换 Markdown？",
    introBody:
      "X Articles 不理解原始 Markdown。如果直接粘贴，标题、链接、列表和代码块都会变成普通文本。MD2X 会把 Markdown 转为可直接粘贴的富文本，让长文在 X Articles 编辑器里保留结构。",
    benefitsTitle: "你能得到什么",
    benefits: [
      "适配 X Articles 的富文本剪贴板，支持标题、链接、列表、粗体和斜体",
      "代码块渲染为带语法高亮的 PNG 图片，支持 9 种主题",
      "Markdown 表格和 Mermaid 图表转换为可粘贴的图片资产",
      "复制到 X 前可实时预览文章效果",
      "纯浏览器端运行，草稿保存在你的设备上",
    ],
    howToEyebrow: "使用方法",
    howToTitle: "三步将 Markdown 转为 X Articles",
    howToDescription: "无需手动排版，即可将 Markdown 草稿转为适合 X Articles 的格式。",
    steps: [
      {
        name: "编写或导入 Markdown",
        text: "打开 MD2X 编辑器，粘贴 Markdown 草稿，或导入 .md 文件。右侧预览会显示文章效果。",
      },
      {
        name: "复制标题和正文",
        text: "使用复制标题和复制正文，将格式化富文本放入剪贴板。代码、表格和图表会出现在 Assets 面板。",
      },
      {
        name: "粘贴到 X Articles",
        text: "打开 X Articles 编辑器，粘贴富文本，再从 Assets 面板补充生成的图片即可发布。",
      },
    ],
    ctaTitle: "转换你的下一篇 X Article",
    ctaDesc: "免费、无需注册，为 Markdown 写作者打造。",
    examplesTitle: "真实例子",
    examples: [
      {
        title: "一段带格式的 Markdown",
        input: "# 用特性开关更快发布\n**部署**和**发布**解耦。\n\n- 即时回滚\n- [阅读文档](https://example.com)",
        output:
          "粘贴到 X Articles 后：一级标题、两处粗体强调、可点击的项目符号列表，以及一个能直接点开的超链接——不再是带星号和方括号的纯文本。",
      },
      {
        title: "代码块变成图片",
        input: "```typescript\nconst ok = deploy(feature);\n```",
        output:
          "在 X Articles 里它是一张带语法高亮的 PNG（关键字 const 着色、字符串类型着色），而不是失去高亮的等宽纯文本。图片在 Assets 面板里单独复制。",
      },
    ],
    limitationsTitle: "局限与异常恢复",
    limitations: [
      "X Articles 本身不支持 Markdown：代码块、表格、Mermaid 一律以 PNG 图片粘贴，这些图片内容不能在 X 里二次编辑。",
      "转换器只识别顶格的 `-`/`1.` 列表项：带缩进的嵌套项会终止当前列表、合并成一段普通文字，需要层级时请用小标题代替缩进。",
      "行内只识别粗体、斜体、链接、行内代码和图片；原生 HTML 标签会被转义成纯文本，脚注 [^1] 和数学公式不会被特殊处理。",
      "粘贴后变成纯文本，说明没拿到富文本：重新点一次“复制正文”再粘贴；某张代码/图表图片没出现，去 Assets 面板手动复制；浏览器拦截剪贴板时，先下载 PNG 再上传。",
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        question: "X Articles 支持 Markdown 吗？",
        answer:
          "不支持。X Articles 使用自己的富文本编辑器。MD2X 会把 Markdown 转为可粘贴到该编辑器的格式化富文本。",
      },
      {
        question: "哪些 Markdown 格式会保留？",
        answer:
          "标题、粗体、斜体、删除线、链接、有序列表、无序列表和行内代码会转为富文本。代码块、Mermaid 图表和表格会变成可粘贴的图片资产。",
      },
      {
        question: "适合技术文章吗？",
        answer:
          "适合。MD2X 专为需要在 X Articles 中使用代码片段、图表、表格、链接和长文结构的技术写作者设计。",
      },
      {
        question: "文章会上传到服务器吗？",
        answer:
          "不会。编辑、预览和复制都在浏览器中完成。除非你主动使用可选 AI 功能，否则 Markdown 草稿不会离开本地设备。",
      },
    ],
  },
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
    examplesTitle: "真实例子",
    examples: [
      {
        title: "一段 TypeScript 函数",
        input: "```typescript\nfunction greet(name: string) {\n  return `Hi, ${name}`;\n}\n```",
        output:
          "渲染成一张圆角、带背景的 PNG：function 关键字、string 类型、模板字符串各自按主题着色，缩进保留。选 Dracula 就是深色底，选 GitHub Light 就是浅色底。",
      },
    ],
    limitationsTitle: "局限与异常恢复",
    limitations: [
      "只导出 PNG：代码图片由 Canvas 光栅化生成（renderCodeToPng），不提供 SVG 矢量导出。",
      "超长代码会整张渲染成一张高图，单行过长时图片会很宽；建议把超长函数拆成多个代码块，而不是塞进一个围栏里。",
      "只有围栏代码块会被渲染成图片；行内代码仍作为行内样式保留，不会变成图片。",
      "语言没识别出来时，在 ``` 后手动标注语言（如 ```python）；主题不对就在工具栏重新选；复制失败时改用“下载 PNG”再上传到 X。",
    ],
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

const mermaidToPng: FeatureLandingDef = {
  slug: "mermaid-to-png",
  editorPath: "/editor",
  zhEditorPath: "/zh/editor",
  en: {
    metaTitle: "Mermaid to PNG — Free Mermaid Diagram to Image Converter | MD2X",
    metaDescription:
      "Render Mermaid diagrams to PNG images online for free. Flowcharts, sequence and class diagrams export as crisp images with theme-synced colors. No sign-up, runs in your browser.",
    heroEyebrow: "MERMAID → PNG",
    heroTitle: "Render Mermaid diagrams to PNG",
    heroLead:
      "Paste Mermaid syntax, preview live, and export a crisp PNG. Flowcharts, sequence diagrams, class diagrams and more — with colors that match your theme. Free, no sign-up, runs entirely in your browser.",
    ctaOpenEditor: "Open Editor",
    introTitle: "Why export Mermaid as a PNG?",
    introBody:
      "Mermaid is the fastest way to describe a diagram in text — but most places you want to share it (X Articles, slides, docs, issues) can't render Mermaid source. Exporting to a PNG gives you a portable image that looks identical everywhere, with no live renderer required.",
    benefitsTitle: "What you get",
    benefits: [
      "Supports flowcharts, sequence, class, state, ER, and Gantt diagrams",
      "Live preview as you type — catch syntax errors instantly",
      "Diagram colors stay in sync with your light or dark theme",
      "High-resolution PNG, ready to copy or download",
      "Runs fully in-browser — nothing is uploaded to a server",
    ],
    howToEyebrow: "HOW IT WORKS",
    howToTitle: "Convert Mermaid to PNG in three steps",
    howToDescription:
      "Turn any Mermaid diagram definition into a shareable PNG image without installing anything.",
    steps: [
      {
        name: "Write your Mermaid diagram",
        text: "Open the MD2X editor and add a ```mermaid code block with your diagram definition. The live preview renders it as you type.",
      },
      {
        name: "Review the rendered diagram",
        text: "Check the preview panel. The diagram uses theme-synced colors, so it matches whether you're in light or dark mode.",
      },
      {
        name: "Copy or download the PNG",
        text: "Grab the rendered diagram from the Assets panel — copy it to your clipboard or download the PNG to embed anywhere.",
      },
    ],
    ctaTitle: "Render your first Mermaid diagram",
    ctaDesc: "Free, no sign-up, runs entirely in your browser. Your diagrams stay local.",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is this Mermaid to PNG converter free?",
        answer:
          "Yes. MD2X is completely free with no sign-up. It renders Mermaid in your browser, so there are no limits and your diagrams never leave your device.",
      },
      {
        question: "Which Mermaid diagram types are supported?",
        answer:
          "Flowcharts, sequence diagrams, class diagrams, state diagrams, entity-relationship diagrams, Gantt charts, and more — anything Mermaid itself supports.",
      },
      {
        question: "Can I export Mermaid as SVG too?",
        answer:
          "MD2X exports high-resolution PNG images, which paste cleanly into X Articles, slides, and docs without needing a renderer on the other end.",
      },
      {
        question: "Do the diagram colors match dark mode?",
        answer:
          "Yes. Diagram colors are synced to your selected theme, so a diagram rendered in dark mode uses dark-friendly colors automatically.",
      },
    ],
  },
  zh: {
    metaTitle: "Mermaid 转 PNG — 免费 Mermaid 图表转图片工具 | MD2X",
    metaDescription:
      "在线免费将 Mermaid 图表渲染为 PNG 图片。流程图、时序图、类图导出为主题同步配色的清晰图片，无需注册，纯浏览器端运行。",
    heroEyebrow: "MERMAID → PNG",
    heroTitle: "把 Mermaid 图表渲染成 PNG",
    heroLead:
      "粘贴 Mermaid 语法，实时预览，导出清晰 PNG。支持流程图、时序图、类图等，配色与主题同步。完全免费，无需注册，纯浏览器端运行。",
    ctaOpenEditor: "打开编辑器",
    introTitle: "为什么要把 Mermaid 导出成 PNG？",
    introBody:
      "Mermaid 是用文本描述图表最快的方式——但你想分享它的大多数场景（X Articles、幻灯片、文档、Issue）都无法渲染 Mermaid 源码。导出为 PNG 后，你得到一张到处看起来都一致的便携图片，对方无需任何渲染器。",
    benefitsTitle: "你能得到什么",
    benefits: [
      "支持流程图、时序图、类图、状态图、ER 图和甘特图",
      "边输入边实时预览，语法错误即时发现",
      "图表配色与亮色/暗色主题保持同步",
      "高分辨率 PNG，可直接复制或下载",
      "纯浏览器端运行，不会上传到任何服务器",
    ],
    howToEyebrow: "使用方法",
    howToTitle: "三步把 Mermaid 转成 PNG",
    howToDescription: "无需安装任何软件，即可将任意 Mermaid 图表定义转为可分享的 PNG 图片。",
    steps: [
      {
        name: "编写 Mermaid 图表",
        text: "打开 MD2X 编辑器，添加一个 ```mermaid 代码块并写入图表定义，实时预览会随输入即时渲染。",
      },
      {
        name: "查看渲染效果",
        text: "在预览面板检查图表。图表使用主题同步配色，无论亮色还是暗色模式都能很好匹配。",
      },
      {
        name: "复制或下载 PNG",
        text: "从 Assets 面板获取渲染好的图表——复制到剪贴板或下载 PNG，即可嵌入任何地方。",
      },
    ],
    ctaTitle: "渲染你的第一张 Mermaid 图表",
    ctaDesc: "完全免费，无需注册，纯浏览器端运行，图表保存在本地。",
    examplesTitle: "真实例子",
    examples: [
      {
        title: "一张流程图",
        input: "```mermaid\ngraph TD\n  A[写 Markdown] --> B[复制富文本]\n  B --> C[粘贴到 X]\n```",
        output:
          "渲染成一张带箭头的流程图 PNG：A、B、C 三个节点按顺序连线，配色跟随你当前的亮色/暗色主题，粘贴到 X Articles 就是一张静态图。",
      },
    ],
    limitationsTitle: "局限与异常恢复",
    limitations: [
      "只导出 PNG：Mermaid 在内部渲染成 SVG 后由 renderSvgToPng 光栅化，复制/下载拿到的都是 PNG。",
      "节点很多或标签很长时图会变宽，粘贴到 X 后可能偏小；建议拆成两张图或缩短节点文字。",
      "Mermaid 以 securityLevel: \"strict\" 初始化，图里的外链图片和点击交互会被禁用。",
      "语法错误时渲染区会显示错误占位框并保留源码：按提示修正 Mermaid 语法；图太宽就减少节点；导出后模糊时确认拿到的是高分辨率 PNG 再粘贴。",
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        question: "这个 Mermaid 转 PNG 工具免费吗？",
        answer:
          "完全免费，无需注册。它在你的浏览器中渲染 Mermaid，没有次数限制，图表也绝不会离开你的设备。",
      },
      {
        question: "支持哪些 Mermaid 图表类型？",
        answer:
          "流程图、时序图、类图、状态图、实体关系图、甘特图等——只要 Mermaid 本身支持的都可以。",
      },
      {
        question: "可以导出 SVG 吗？",
        answer:
          "MD2X 导出高分辨率 PNG 图片，可以干净地粘贴进 X Articles、幻灯片和文档，对方无需任何渲染器。",
      },
      {
        question: "图表配色能匹配暗色模式吗？",
        answer:
          "可以。图表配色会同步到你选择的主题，在暗色模式下渲染的图表会自动使用适合暗色的配色。",
      },
    ],
  },
};

const markdownTableToImage: FeatureLandingDef = {
  slug: "markdown-table-to-image",
  editorPath: "/editor",
  zhEditorPath: "/zh/editor",
  tool: "table-image",
  en: {
    metaTitle: "Markdown Table to Image — Free Table to PNG Converter | MD2X",
    metaDescription:
      "Convert Markdown tables into styled PNG images online for free. Paste a Markdown table, get a clean image for X Articles, slides, and docs. No sign-up, runs in your browser.",
    heroEyebrow: "MARKDOWN TABLE → IMAGE",
    heroTitle: "Turn Markdown tables into images",
    heroLead:
      "Paste a Markdown table below and get a clean, styled PNG you can drop anywhere — X Articles, slides, docs. Free, no sign-up, runs entirely in your browser.",
    ctaOpenEditor: "Write a full article in the editor",
    introTitle: "Why turn a Markdown table into an image?",
    introBody:
      "Markdown tables are easy to write but fragile to share — paste one into X Articles or a slide and the pipes and dashes show up as raw text. Rendering the table as an image preserves the layout, borders, and alignment so it looks like a real table wherever you paste it.",
    benefitsTitle: "What you get",
    benefits: [
      "Clean, styled table rendering with proper borders and alignment",
      "Handles multi-column tables and long cell content",
      "Light and dark styles, and column alignment from your separator row",
      "High-resolution PNG, ready to copy or download",
      "Runs fully in-browser — your data never leaves your device",
    ],
    howToEyebrow: "HOW IT WORKS",
    howToTitle: "Convert a Markdown table to an image in three steps",
    howToDescription:
      "Turn any Markdown table into a shareable PNG image without installing anything.",
    steps: [
      {
        name: "Paste your table",
        text: "Paste a standard Markdown table (header row, separator row, data rows) into the box at the top of this page. The preview updates as you type.",
      },
      {
        name: "Pick a style",
        text: "Choose light or dark. Column alignment set with :--- , :---: or ---: in the separator row is kept in the image.",
      },
      {
        name: "Copy or download the PNG",
        text: "Click Copy image to paste it straight into X Articles or a doc, or Download PNG to save the file.",
      },
    ],
    ctaTitle: "Convert your first Markdown table",
    ctaDesc: "Free, no sign-up, runs entirely in your browser. Your data stays local.",
    faqTitle: "Frequently Asked Questions",
    faqs: [
      {
        question: "Is this Markdown table to image tool free?",
        answer:
          "Yes. MD2X is completely free with no sign-up. It renders tables in your browser, so there are no limits and your data never leaves your device.",
      },
      {
        question: "What does the output look like?",
        answer:
          "A clean, styled table image with proper borders, header styling, and column alignment — far more readable than raw Markdown pipes pasted as text.",
      },
      {
        question: "Can I use it for X Articles?",
        answer:
          "Yes. Copy the image here and paste it into the X Articles editor. If your article has several tables, the MD2X editor renders all of them at once in its Assets panel.",
      },
      {
        question: "What image format do I get?",
        answer:
          "A high-resolution PNG you can copy to your clipboard or download, then paste into X Articles, slides, docs, or anywhere images are supported.",
      },
    ],
  },
  zh: {
    metaTitle: "Markdown 表格转图片 — 免费表格转 PNG 工具 | MD2X",
    metaDescription:
      "在线免费将 Markdown 表格转换为带样式的 PNG 图片。粘贴 Markdown 表格，即可得到适用于 X Articles、幻灯片和文档的精美图片。无需注册，纯浏览器端运行。",
    heroEyebrow: "MARKDOWN 表格 → 图片",
    heroTitle: "把 Markdown 表格变成图片",
    heroLead:
      "在下方粘贴 Markdown 表格，即可得到干净、带样式的 PNG，可用于 X Articles、幻灯片和文档。完全免费，无需注册，纯浏览器端运行。",
    ctaOpenEditor: "在编辑器里写整篇文章",
    introTitle: "为什么要把 Markdown 表格转成图片？",
    introBody:
      "Markdown 表格写起来简单，但分享时很脆弱——粘贴到 X Articles 或幻灯片里，竖线和横线会变成原始文本。把表格渲染成图片可以保留布局、边框和对齐方式，让它在任何粘贴的地方都像一张真正的表格。",
    benefitsTitle: "你能得到什么",
    benefits: [
      "干净、带样式的表格渲染，边框和对齐都规整",
      "支持多列表格和较长的单元格内容",
      "支持亮色/暗色样式，并保留分隔行设置的列对齐",
      "高分辨率 PNG，可直接复制或下载",
      "纯浏览器端运行，数据绝不离开你的设备",
    ],
    howToEyebrow: "使用方法",
    howToTitle: "三步把 Markdown 表格转成图片",
    howToDescription: "无需安装任何软件，即可将任意 Markdown 表格转为可分享的 PNG 图片。",
    steps: [
      {
        name: "粘贴表格",
        text: "把标准 Markdown 表格（表头行、分隔行、数据行）粘贴到本页顶部的输入框，预览会随输入实时更新。",
      },
      {
        name: "选择样式",
        text: "选择亮色或暗色。分隔行里用 :---、:---: 或 ---: 设置的列对齐会保留在图片中。",
      },
      {
        name: "复制或下载 PNG",
        text: "点“复制图片”直接粘贴到 X Articles 或文档里，或点“下载 PNG”保存文件。",
      },
    ],
    ctaTitle: "转换你的第一个 Markdown 表格",
    ctaDesc: "完全免费，无需注册，纯浏览器端运行，数据保存在本地。",
    examplesTitle: "真实例子",
    examples: [
      {
        title: "一张带对齐的小表格",
        input: "| 主题 | 适用 |\n|---|:---:|\n| Dracula | 暗色 |\n| Nord | 亮色 |",
        output:
          "渲染成一张带边框的表格 PNG：表头加粗，第二列按 `:---:` 居中对齐，亮色/暗色两种样式可选。直接粘贴到 X Articles 就是一张规整的表。",
      },
    ],
    limitationsTitle: "局限与异常恢复",
    limitations: [
      "只导出 PNG；Markdown 表格本身没有合并单元格语法，渲染出的图片也就没有合并格。",
      "解析器不设列数上限，但列很多或单元格文字过长时图片会很宽；列太宽时建议把长文本拆行或拆表。",
      "单元格按纯文本解析，不支持表格内嵌图片或嵌套代码块。",
      "边框/对齐错乱时检查分隔行是否写成 `|---|:---:|`；列对齐不对就用 `:---`、`:---:`、`---:` 重标；复制失败时先下载 PNG 再上传。",
    ],
    faqTitle: "常见问题",
    faqs: [
      {
        question: "这个 Markdown 表格转图片工具免费吗？",
        answer:
          "完全免费，无需注册。它在你的浏览器中渲染表格，没有次数限制，数据也绝不会离开你的设备。",
      },
      {
        question: "输出效果是什么样的？",
        answer:
          "一张干净、带样式的表格图片，边框、表头样式和列对齐都规整，比直接粘贴原始 Markdown 竖线可读性强得多。",
      },
      {
        question: "可以用于 X Articles 吗？",
        answer:
          "可以。在本页复制图片，粘贴到 X Articles 编辑器即可。如果文章里有多张表格，MD2X 编辑器的 Assets 面板会一次性全部渲染。",
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
  [markdownToXArticles.slug]: markdownToXArticles,
  [codeToImage.slug]: codeToImage,
  [mermaidToPng.slug]: mermaidToPng,
  [markdownTableToImage.slug]: markdownTableToImage,
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
