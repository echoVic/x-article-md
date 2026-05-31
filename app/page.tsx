"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArticleAssets } from "@/components/article-assets";
import { ArticlePreview } from "@/components/article-preview";
import { CoverImagePanel } from "@/components/cover-image-panel";
import { MarkdownEditor } from "@/components/markdown-editor";
import { parseMarkdown, toXArticleClipboard } from "@/lib/markdown";
import { sampleMarkdown } from "@/lib/sample";

const draftStorageKey = "x-article-md:draft";

export default function Home() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [draftReady, setDraftReady] = useState(false);
  const [codeMode, setCodeMode] = useState<"quote" | "image">("quote");
  const [copyState, setCopyState] = useState<
    "idle" | "title" | "body" | "manual"
  >("idle");
  const [manualCopy, setManualCopy] = useState<{
    label: string;
    text: string;
    html?: string;
  } | null>(null);
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);
  const manualRichCopyRef = useRef<HTMLDivElement>(null);
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);
  const clipboard = useMemo(
    () => toXArticleClipboard(markdown, { codeMode }),
    [codeMode, markdown],
  );

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedDraft = window.localStorage.getItem(draftStorageKey);

      if (savedDraft) {
        setMarkdown(savedDraft);
      }

      setDraftReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    window.localStorage.setItem(draftStorageKey, markdown);
  }, [draftReady, markdown]);

  useEffect(() => {
    if (!manualCopy) {
      return;
    }

    if (manualCopy.html && manualRichCopyRef.current) {
      const range = document.createRange();
      range.selectNodeContents(manualRichCopyRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      manualCopyRef.current?.focus();
      manualCopyRef.current?.select();
    }
  }, [manualCopy]);

  async function copyTitle() {
    const title = clipboard.title || clipboard.fullText.split("\n")[0] || "";

    if (copyPlainText(title)) {
      markCopied("title");
      return;
    }

    setManualCopy({ label: "Manual title copy", text: title });
    setCopyState("manual");
  }

  async function copyBody() {
    if (await copyRichText(clipboard.bodyHtml, clipboard.bodyText)) {
      markCopied("body");
      return;
    }

    setManualCopy({
      label: "Manual rich body copy",
      text: clipboard.bodyText,
      html: clipboard.bodyHtml,
    });
    setCopyState("manual");
  }

  function markCopied(target: "title" | "body") {
    setCopyState(target);
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function resetDraft() {
    setMarkdown(sampleMarkdown);
    window.localStorage.removeItem(draftStorageKey);
  }

  return (
    <main className="min-h-screen bg-[#f6f8fa] text-[#0f1419]">
      <header className="sticky top-0 z-10 border-b border-[#d8e0e5] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-normal">
              x-article-md
            </h1>
            <p className="hidden text-sm text-[#536471] sm:block">
              Copy the title, then paste the rich body into X Articles.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <div
              className="flex h-10 rounded-md border border-[#cfd9de] bg-[#f6f8fa] p-1"
              aria-label="Code block copy mode"
            >
              <button
                type="button"
                onClick={() => setCodeMode("quote")}
                className={`rounded px-3 text-sm font-semibold transition ${
                  codeMode === "quote"
                    ? "bg-white text-[#0f1419] shadow-sm"
                    : "text-[#536471] hover:text-[#0f1419]"
                }`}
              >
                Code as quote
              </button>
              <button
                type="button"
                onClick={() => setCodeMode("image")}
                className={`rounded px-3 text-sm font-semibold transition ${
                  codeMode === "image"
                    ? "bg-white text-[#0f1419] shadow-sm"
                    : "text-[#536471] hover:text-[#0f1419]"
                }`}
              >
                Code as image
              </button>
            </div>
            <button
              type="button"
              onClick={copyTitle}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cfd9de] bg-white px-3 text-sm font-semibold text-[#0f1419] transition hover:bg-[#f6f8fa] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
            >
              Copy title
            </button>
            <button
              type="button"
              onClick={copyBody}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0f1419] px-4 text-sm font-semibold text-white transition hover:bg-[#26323a] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
            >
              {copyState === "body"
                ? "Body copied"
                : copyState === "title"
                  ? "Title copied"
                  : copyState === "manual"
                    ? "Select text"
                    : "Copy body"}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1440px] gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(320px,0.92fr)_minmax(420px,1.08fr)]">
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          onReset={resetDraft}
          draftReady={draftReady}
        />

        <div>
          <div className="min-h-[calc(100vh-108px)] overflow-hidden rounded-md border border-[#d8e0e5] bg-white">
            <div className="flex h-11 items-center justify-between border-b border-[#e6ecf0] px-4">
              <h2 className="text-sm font-semibold text-[#536471]">
                X Articles preview
              </h2>
              <span className="text-xs text-[#71808a]">Live</span>
            </div>
            <div className="h-[calc(100vh-153px)] min-h-[460px] overflow-auto p-5 sm:p-8">
              <ArticlePreview blocks={blocks} />
            </div>
          </div>
          <CoverImagePanel markdown={markdown} />
          <ArticleAssets assets={clipboard.assets} />
        </div>
      </section>

      {manualCopy ? (
        <div className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-3xl rounded-md border border-[#cfd9de] bg-white shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-[#e6ecf0] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#536471]">
              {manualCopy.label}
            </h2>
            <button
              type="button"
              onClick={() => {
                setManualCopy(null);
                setCopyState("idle");
              }}
              className="rounded-md border border-[#cfd9de] px-3 py-1.5 text-sm font-medium text-[#0f1419] transition hover:bg-[#f6f8fa]"
            >
              Close
            </button>
          </div>
          {manualCopy.html ? (
            <div
              ref={manualRichCopyRef}
              contentEditable
              suppressContentEditableWarning
              aria-label="Copyable rich article body"
              className="max-h-80 overflow-auto p-5 text-[17px] leading-8 text-[#0f1419] outline-none [&_a]:font-medium [&_a]:text-[#1d9bf0] [&_code]:rounded [&_code]:bg-[#eef2f5] [&_code]:px-1.5 [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:my-1 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:bg-[#101820] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-[#e6edf3] [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: manualCopy.html }}
            />
          ) : (
            <textarea
              ref={manualCopyRef}
              value={manualCopy.text}
              readOnly
              aria-label="Copyable article text"
              className="h-52 w-full resize-none border-0 p-4 font-mono text-sm leading-6 text-[#0f1419] outline-none"
            />
          )}
        </div>
      ) : null}
    </main>
  );
}

async function copyRichText(html: string, text: string): Promise<boolean> {
  if (!text.trim()) {
    return false;
  }

  if (
    "ClipboardItem" in window &&
    navigator.clipboard &&
    "write" in navigator.clipboard
  ) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
      return true;
    } catch {
      // Fall through to selection-based copy for browsers that block ClipboardItem.
    }
  }

  return copyHtmlSelection(html, text);
}

function copyPlainText(text: string): boolean {
  if (!text.trim()) {
    return false;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

function copyHtmlSelection(html: string, text: string): boolean {
  const container = document.createElement("div");
  container.setAttribute("contenteditable", "true");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "-9999px";
  container.style.width = "720px";
  container.innerHTML = html || text;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  try {
    return document.execCommand("copy");
  } finally {
    selection?.removeAllRanges();
    document.body.removeChild(container);
  }
}
