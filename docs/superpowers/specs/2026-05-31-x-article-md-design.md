# x-article-md Design

## Scope

Build a usable first version of a single-page Markdown to X Articles tool. The app uses Next.js App Router, TypeScript, Tailwind CSS, and pnpm, with a structure that deploys cleanly to Vercel.

## User Experience

The first screen is the tool itself. A top toolbar shows the product name and a copy button. The main workspace has a Markdown editor on the left and an X Articles-style preview on the right. The preview updates as the user types.

The default content demonstrates title, paragraph text, lists, bold text, links, code blocks, and Mermaid blocks. Mermaid blocks are rendered client-side when valid, and fall back to a readable preview placeholder if rendering fails.

## Architecture

- `app/page.tsx` hosts the interactive editor and preview.
- `components/article-preview.tsx` renders Markdown tokens into article-style React UI.
- `components/mermaid-block.tsx` renders Mermaid diagrams on the client.
- `lib/markdown.ts` parses Markdown and serializes it into copyable X Articles-style plain text.

## Data Flow

Markdown text lives in client state. On each edit, the app parses the source into a small typed document model. The preview consumes the model for rendering. The copy button serializes the same model into plain text and writes it to the clipboard.

## Testing

Unit tests cover Markdown parsing and copy serialization for the supported first-version syntax. A production build verifies the Next.js and TypeScript integration.

## Out of Scope

No accounts, database, Chrome extension, browser injection, analytics, or X publishing automation in this version.
