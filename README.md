# MD2X — Markdown to X Articles

A Markdown editor and converter for drafting content that can be previewed and pasted into X Articles with full formatting preserved.

Write Markdown, preview as X Articles, copy rich text + image assets, publish.

## Features

- **Rich Text Clipboard** — Copy preserves headings, bold, links, lists, inline code. Paste directly into X Articles.
- **Code Blocks → PNG Images** — 9 syntax-highlighting themes (GitHub, Dracula, Nord, Night Owl, Tokyo Night, etc.)
- **Mermaid Diagrams** — Flowcharts, sequence diagrams render as PNG with theme-synced colors.
- **Tables → PNG** — Markdown tables render as styled image assets.
- **AI Cover Images** — Generate cover images from article content via OpenAI-compatible API.
- **AI Text Polish & Translate** — Polish selected text or translate between EN/ZH with one click.
- **Thread Splitter** — AI-powered tweet thread generator with automatic numbering.
- **PWA Offline Support** — Install as desktop app, works offline (AI features require network).
- **Dark Mode** — Light, dark, and system theme with toggle.
- **Multi-language UI** — English and Chinese interface.
- **Import/Export** — Import existing .md files, export your draft.
- **Local Autosave** — Drafts persist in localStorage, never leave your device.
- **Rate Limiting** — Built-in abuse protection for public deployment.
- **Analytics** — Vercel Analytics + Speed Insights integration.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000

## Copy Workflow

1. Write or paste Markdown in the editor.
2. Review the live preview (right panel).
3. Choose code block mode: **Code Quote** (rich text) or **Code Image** (PNG assets).
4. Select a code image theme from the toolbar dropdown.
5. Click **Copy Title** → paste into X Articles title field.
6. Click **Copy Body** → paste into X Articles editor.
7. Copy image assets from the **X Assets** panel → paste at placeholder positions.
8. Optionally generate and attach an AI cover image.

## Supported Markdown

- Headings (h1–h6)
- Paragraphs
- Ordered and unordered lists
- Bold text
- Links
- Inline code
- Fenced code blocks (with language detection)
- Mermaid diagram blocks
- Markdown tables
- X/Twitter status URL embeds

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Vercel AI SDK + DeepSeek
- **Image Gen**: OpenAI-compatible API (GPT Image)
- **PWA**: @serwist/next + Serwist
- **Theme**: next-themes
- **Icons**: lucide-react
- **Rate Limit**: @upstash/ratelimit + @upstash/redis
- **Analytics**: @vercel/analytics + @vercel/speed-insights
- **Package Manager**: pnpm

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Production build (with --webpack for Serwist)
pnpm lint         # Lint
pnpm test         # Run tests
```

## License

MIT
