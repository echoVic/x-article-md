import { buildHowToJsonLd } from "@/lib/seo";

export type SeoLandingContent = {
  jsonLd: object;
  eyebrow: string;
  title: string;
  lead: string;
  problemTitle: string;
  problemDescription: string;
  problemPoints: string[];
  solutionTitle: string;
  solutionDescription: string;
  solutionPoints: string[];
  stepsTitle: string;
  steps: { title: string; description: string }[];
  demoSection?: {
    title: string;
    beforeLabel: string;
    beforeContent: string;
    afterLabel: string;
    afterContent: string;
  };
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaHref: string;
};

export const markdownToXArticles: SeoLandingContent = {
  jsonLd: buildHowToJsonLd({
    name: "How to Convert Markdown to X Articles",
    description:
      "Convert your Markdown drafts into X Articles rich text format that preserves all formatting when pasted.",
    steps: [
      { name: "Write or paste Markdown", text: "Open the MD2X editor and write your article in standard Markdown syntax, or paste an existing .md file. The live preview shows exactly how it will look in X Articles." },
      { name: "Copy the formatted output", text: "Click 'Copy Title' then 'Copy Body'. MD2X converts your Markdown into clipboard-ready rich text with headings, bold, links, and lists preserved." },
      { name: "Paste into X Articles", text: "Open the X Articles editor and press Cmd+V (or Ctrl+V). All formatting is preserved exactly as shown in the preview. Attach any asset images and publish." },
    ],
  }),
  eyebrow: "MARKDOWN → X ARTICLES",
  title: "Convert Markdown to X Articles in seconds",
  lead: "X Articles doesn't support Markdown. MD2X bridges the gap — write in Markdown, copy as rich text, paste into X Articles with all formatting intact.",
  problemTitle: "The problem: X Articles has no Markdown support",
  problemDescription:
    "X Articles uses a proprietary rich-text editor. If you write in Markdown (like most developers and technical writers do), you face these pain points:",
  problemPoints: [
    "Pasting raw Markdown shows literal asterisks, hashes, and brackets instead of formatted text",
    "Manually reformatting every heading, bold phrase, and link wastes 10-20 minutes per article",
    "Code blocks lose all syntax highlighting and become unreadable plain text",
    "Tables, Mermaid diagrams, and other structured content simply cannot be represented",
    "No way to preview how your article will look before publishing",
  ],
  solutionTitle: "The solution: MD2X converts Markdown to X Articles rich text",
  solutionDescription:
    "MD2X is a free, browser-based tool that converts standard Markdown into clipboard-ready rich text optimized for X Articles. Here's what it handles automatically:",
  solutionPoints: [
    "Headings (h1–h3) convert to X Articles heading styles",
    "Bold, italic, and strikethrough formatting is preserved in the clipboard",
    "Links become clickable hyperlinks in X Articles",
    "Ordered and unordered lists maintain their structure and nesting",
    "Code blocks render as syntax-highlighted PNG images (X Articles workaround)",
    "Tables render as formatted images you can paste inline",
    "Mermaid diagrams render as flowchart/sequence diagram PNGs",
  ],
  stepsTitle: "How to convert Markdown to X Articles",
  steps: [
    {
      title: "Write or import your Markdown",
      description:
        "Open the MD2X editor and start writing in standard Markdown. You can also import an existing .md file. The right panel shows a live preview of how your article will appear in X Articles.",
    },
    {
      title: "Copy the formatted output",
      description:
        "Click 'Copy Title' to grab the article title, then 'Copy Body' for the full formatted content. MD2X converts everything to rich text that X Articles understands — no manual formatting needed.",
    },
    {
      title: "Paste into X Articles and publish",
      description:
        "Open the X Articles editor, press Cmd+V (or Ctrl+V), and your formatted article appears instantly. Paste any code block or diagram images from the Assets panel, add a cover image, and hit publish.",
    },
  ],
  demoSection: {
    title: "See it in action",
    beforeLabel: "Markdown input",
    beforeContent: `# Building a sync engine

Writing a sync engine from scratch
sounds hard — and it is.

## The CRDT approach

- **Conflict-free** by design
- Works offline-first
- [Read more](https://example.com)`,
    afterLabel: "X Articles output",
    afterContent:
      "Formatted rich text with styled heading, bold text, bullet list, and clickable link — ready to paste into X Articles editor.",
  },
  ctaTitle: "Start converting Markdown to X Articles",
  ctaDescription:
    "Free, no sign-up, runs entirely in your browser. Your data never leaves your device.",
  ctaButtonText: "Open Editor",
  ctaHref: "/editor",
};

export const pasteCodeIntoXArticles: SeoLandingContent = {
  jsonLd: buildHowToJsonLd({
    name: "How to Paste Code Blocks into X Articles",
    description:
      "Render code blocks as syntax-highlighted PNG images and paste them into X Articles with full formatting.",
    steps: [
      { name: "Write code in Markdown fences", text: "Use standard Markdown code fences (triple backticks) with a language identifier. MD2X supports all major languages: TypeScript, Python, Go, Rust, and more." },
      { name: "Choose a syntax theme", text: "Select from 9 code themes: Dracula, Nord, GitHub Dark, One Dark Pro, Tokyo Night, and more. The preview updates in real-time." },
      { name: "Copy the code image", text: "MD2X renders your code as a PNG image. Copy it from the Assets panel and paste directly into the X Articles editor as an inline image." },
    ],
  }),
  eyebrow: "CODE BLOCKS → X ARTICLES",
  title: "Paste code into X Articles with syntax highlighting",
  lead: "X Articles can't display formatted code. MD2X renders your code blocks as beautiful, syntax-highlighted images you can paste directly into your article.",
  problemTitle: "The problem: X Articles strips code formatting",
  problemDescription:
    "If you're a developer sharing technical content on X Articles, you've hit this wall:",
  problemPoints: [
    "X Articles has no code block support — pasted code loses all indentation and highlighting",
    "Monospace font is not available in the X Articles editor",
    "Screenshot workarounds produce inconsistent sizes and low-quality images",
    "Carbon.sh and similar tools require switching between apps and manual resizing",
    "No way to keep code images in sync with your article when you edit",
  ],
  solutionTitle: "The solution: code blocks as themed PNG images",
  solutionDescription:
    "MD2X automatically detects code blocks in your Markdown and renders them as high-quality PNG images with proper syntax highlighting:",
  solutionPoints: [
    "9 professional themes: Dracula, Nord, GitHub Dark, GitHub Light, One Dark Pro, Tokyo Night, Night Owl, Solarized Dark, One Monokai",
    "Accurate syntax highlighting for 30+ languages via Shiki",
    "Consistent sizing and padding — no manual cropping needed",
    "Images update automatically when you edit the code",
    "One-click copy from the Assets panel directly into X Articles",
    "Line numbers optional, font size optimized for readability",
  ],
  stepsTitle: "How to add code to X Articles",
  steps: [
    {
      title: "Write code in Markdown fences",
      description:
        "Use triple backticks with a language identifier (```typescript, ```python, etc.). Write your code as you normally would in any Markdown editor.",
    },
    {
      title: "Select a code theme",
      description:
        "Switch to 'Code Image' mode in the toolbar and choose from 9 syntax themes. The preview panel shows exactly how your code image will look.",
    },
    {
      title: "Copy and paste the code image",
      description:
        "Open the Assets panel to see all rendered code images. Click 'Copy Image' on any code block, then paste it into X Articles as an inline image.",
    },
  ],
  demoSection: {
    title: "Before and after",
    beforeLabel: "Markdown code fence",
    beforeContent: `\`\`\`typescript
type SyncEngine = {
  id: string;
  merge: (op: Op) => void;
  snapshot: () => State;
}
\`\`\``,
    afterLabel: "Rendered code image",
    afterContent:
      "A beautifully styled PNG with syntax highlighting, proper indentation, and your chosen color theme — ready to paste into X Articles.",
  },
  ctaTitle: "Share code on X Articles today",
  ctaDescription:
    "Free, no sign-up. 9 themes, 30+ languages. Renders in your browser — your code never leaves your device.",
  ctaButtonText: "Open Editor",
  ctaHref: "/editor",
};

export const mermaidInXArticles: SeoLandingContent = {
  jsonLd: buildHowToJsonLd({
    name: "How to Add Mermaid Diagrams to X Articles",
    description:
      "Write Mermaid diagram syntax in Markdown, render as PNG images, and paste flowcharts and sequence diagrams into X Articles.",
    steps: [
      { name: "Write Mermaid syntax", text: "Use a ```mermaid code fence to define your diagram. MD2X supports flowcharts, sequence diagrams, class diagrams, state diagrams, and more." },
      { name: "Preview the rendered diagram", text: "The live preview panel shows your Mermaid diagram rendered as a vector graphic in real-time. Colors sync with your chosen theme (light or dark)." },
      { name: "Copy the diagram image", text: "MD2X exports the diagram as a PNG. Copy it from the Assets panel and paste into X Articles as an inline image." },
    ],
  }),
  eyebrow: "MERMAID DIAGRAMS → X ARTICLES",
  title: "Add flowcharts and diagrams to X Articles",
  lead: "X Articles doesn't support diagrams. MD2X renders your Mermaid syntax as PNG images you can paste directly into your article — flowcharts, sequence diagrams, and more.",
  problemTitle: "The problem: no diagram support in X Articles",
  problemDescription:
    "Technical writers often need to visualize architecture, workflows, or sequences. X Articles offers no solution:",
  problemPoints: [
    "No native support for any diagram syntax (Mermaid, PlantUML, etc.)",
    "No way to embed SVGs or interactive diagrams",
    "Taking screenshots from external tools produces inconsistent quality",
    "Diagrams become outdated when you change the article — no way to regenerate",
    "Dark/light mode mismatches between your diagram and the article",
  ],
  solutionTitle: "The solution: Mermaid diagrams as inline PNGs",
  solutionDescription:
    "MD2X renders standard Mermaid syntax into theme-aware PNG images that work perfectly in X Articles:",
  solutionPoints: [
    "Full Mermaid.js support: flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, Gantt charts",
    "Theme-synced colors: diagrams adapt to light/dark mode automatically",
    "High-resolution PNG export optimized for X Articles image display",
    "Live preview — see your diagram update as you type",
    "One-click copy from the Assets panel",
    "No external tools or accounts needed",
  ],
  stepsTitle: "How to add diagrams to X Articles",
  steps: [
    {
      title: "Write Mermaid syntax in a code fence",
      description:
        "Use a ```mermaid code fence and write standard Mermaid diagram syntax. Define nodes, edges, and labels using the familiar Mermaid DSL.",
    },
    {
      title: "Preview and adjust your diagram",
      description:
        "The live preview shows your diagram rendered in real-time. Adjust the syntax until the diagram looks right — colors automatically match your chosen theme.",
    },
    {
      title: "Copy the PNG and paste into X Articles",
      description:
        "Open the Assets panel, find your rendered diagram, and click 'Copy Image'. Paste it directly into the X Articles editor as an inline image.",
    },
  ],
  demoSection: {
    title: "See it in action",
    beforeLabel: "Mermaid syntax",
    beforeContent: `\`\`\`mermaid
graph TD
  A[Write Markdown] --> B[MD2X converts]
  B --> C[Copy rich text]
  C --> D[Paste into X Articles]
\`\`\``,
    afterLabel: "Rendered diagram",
    afterContent:
      "A clean flowchart PNG with styled nodes and arrows, theme-matched colors, and proper sizing — ready to paste into X Articles.",
  },
  ctaTitle: "Start creating diagrams for X Articles",
  ctaDescription:
    "Free, no sign-up. Write Mermaid syntax, get PNG images instantly. All rendering happens in your browser.",
  ctaButtonText: "Open Editor",
  ctaHref: "/editor",
};
