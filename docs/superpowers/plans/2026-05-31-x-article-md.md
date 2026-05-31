# x-article-md Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deployable Next.js single-page Markdown editor with X Articles-style preview and copy support.

**Architecture:** Markdown parsing and copy serialization live in `lib/markdown.ts`. The page owns editor state and composes focused preview and Mermaid components. The first version keeps all data local in the browser.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, pnpm, Vitest, React Testing Library, Mermaid.

---

## File Structure

- `package.json`: scripts and dependencies.
- `app/layout.tsx`: app metadata and global shell.
- `app/page.tsx`: editor state, toolbar, preview layout, copy action.
- `app/globals.css`: Tailwind and app styling.
- `components/article-preview.tsx`: render parsed Markdown blocks.
- `components/mermaid-block.tsx`: client-side Mermaid rendering.
- `lib/markdown.ts`: parse supported Markdown and serialize copy text.
- `lib/sample.ts`: default Markdown content.
- `tests/markdown.test.ts`: parser and serializer behavior.

## Tasks

### Task 1: Project Scaffold

- [x] Create Next.js, TypeScript, Tailwind, Vitest, and lint configs.
- [x] Add scripts for `dev`, `build`, `lint`, and `test`.

### Task 2: Markdown Core

- [x] Write failing tests for headings, lists, bold/link inline tokens, code blocks, Mermaid blocks, and copy text.
- [x] Implement `lib/markdown.ts` until tests pass.

### Task 3: UI Components

- [x] Build the client page, preview component, Mermaid component, and default sample.
- [x] Style the app as a focused tool, not a landing page.

### Task 4: Verification

- [x] Run unit tests.
- [x] Run lint.
- [x] Run production build.
- [x] Start the local dev server and inspect the app in a browser.
