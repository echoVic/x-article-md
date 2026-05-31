# x-article-md

A lightweight Markdown editor for drafting content that can be previewed and copied into X Articles.

The first version focuses on one useful workflow: write Markdown on the left, preview an X Articles-like article on the right, then copy the title, rich body, and required image assets.

## Features

- Split-pane Markdown editor and X Articles-style live preview.
- Rich text copy for headings, paragraphs, lists, bold text, links, and inline code.
- Code block handling:
  - Quote mode for paste-friendly rich text.
  - Image mode for X-style code card PNG assets.
- Mermaid diagram preview and PNG asset copy/download.
- Markdown table parsing with PNG asset copy/download.
- X/Twitter status URL detection with embed hints.
- Editor toolbar for common Markdown actions.
- Keyboard helpers for bold, links, inline code, lists, Tab indentation, and list continuation.
- Local draft autosave.

## Why

X Articles supports rich long-form writing, but pasting Markdown directly does not preserve every structure cleanly. This app keeps the authoring experience in Markdown while preparing a practical copy flow for X Articles.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
pnpm dev
pnpm test
pnpm lint
pnpm build
```

## Copy Workflow

1. Write or paste Markdown in the editor.
2. Review the live preview.
3. Choose how code blocks should be handled:
   - `Code as quote`: code blocks are included in the rich body as blockquote-style content.
   - `Code as image`: code blocks become PNG assets.
4. Copy the title.
5. Copy the body into X Articles.
6. Insert any generated assets from the `X assets` panel.

## Supported Markdown

- Headings
- Paragraphs
- Ordered and unordered lists
- Bold text
- Links
- Inline code
- Fenced code blocks
- Mermaid blocks
- Markdown tables
- Standalone X/Twitter status URLs

## Notes

This is not a Chrome extension and does not directly inject Draft.js atomic entities into X Articles. Native X Article code/table/embed blocks may require a browser extension or page-context automation. This app currently focuses on a reliable local preview and copy/assets workflow.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- pnpm
- Vitest

## License

MIT
