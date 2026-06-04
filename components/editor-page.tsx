"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArticleAssets } from "@/components/article-assets";
import { ArticlePreview } from "@/components/article-preview";
import { CoverImagePanel } from "@/components/cover-image-panel";
import { MarkdownEditor } from "@/components/markdown-editor";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/lib/i18n";
import { parseMarkdown, toXArticleClipboard } from "@/lib/markdown";
import { sampleMarkdown } from "@/lib/sample";

const draftStorageKey = "x-article-md:draft";

export default function EditorPage() {
  const { t, locale } = useI18n();
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [draftReady, setDraftReady] = useState(false);
  const [codeMode, setCodeMode] = useState<"quote" | "image">("quote");
  const [coverOpen, setCoverOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [copyState, setCopyState] = useState<
    "idle" | "title" | "body" | "manual"
  >("idle");
  const [manualCopy, setManualCopy] = useState<{
    label: string;
    text: string;
    html?: string;
  } | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);
  const manualRichCopyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Handle resize drag
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const percentage = (offsetX / containerRect.width) * 100;

      // Constrain between 20% and 80%
      const constrainedPercentage = Math.min(Math.max(percentage, 20), 80);
      setLeftPanelWidth(constrainedPercentage);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Check file size (1MB = 1024 * 1024 bytes)
    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
      alert(t.fileTooLarge);
      e.target.value = ""; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        setMarkdown(content);
      }
      e.target.value = ""; // Reset input for next import
    };
    reader.onerror = () => {
      alert(t.importError);
      e.target.value = ""; // Reset input
    };
    reader.readAsText(file);
  }

  function handleExport() {
    // Extract filename from first line (title) or use default
    const firstLine = markdown.split("\n")[0].trim();
    const filename = firstLine
      ? firstLine.replace(/^#+\s*/, "").replace(/[^a-zA-Z0-9一-龥_-]/g, "_").substring(0, 50) || "untitled"
      : "untitled";

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr]" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
      {/* ═══ Header ═══ */}
      <header className="flex h-12 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={locale === "zh" ? "/zh" : "/"} className="flex items-center gap-1.5 no-underline hover:opacity-70 transition-opacity" title="MD2X - Markdown to X Articles">
            <span className="font-mono font-extrabold text-sm tracking-tight text-[var(--fg)]">MD</span>
            <span className="text-[var(--accent)] text-xs">→</span>
            <span className="font-mono font-extrabold text-sm tracking-tight text-[var(--fg)]">X</span>
          </Link>
          <div className="w-px h-[18px] bg-[var(--border)]" />
          <nav className="flex items-center gap-1">
            <span className="px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--fg)] bg-[var(--fg-soft)]">Editor</span>
            <Link href={locale === "zh" ? "/zh/thread" : "/thread"} title="Markdown to X Thread Splitter" className="px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium no-underline text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors">Thread</Link>
          </nav>
          <div className="w-px h-[18px] bg-[var(--border)]" />
          <span className="flex items-center gap-[5px] font-mono text-[11px] text-[var(--muted)]">
            <span className="w-[5px] h-[5px] rounded-full bg-[var(--success)]" />
            {draftReady ? t.saved : t.loading}
          </span>
        </div>

        {/* Center: mode switch */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] p-[3px] gap-[2px]">
            <button
              type="button"
              onClick={() => setCodeMode("quote")}
              className={`flex items-center gap-[5px] px-3 py-[5px] rounded-[var(--radius-sm)] text-xs font-medium transition-all ${
                codeMode === "quote"
                  ? "bg-[var(--surface)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M3 4h8M3 7h5M3 10h6"/></svg>
              {t.codeQuote}
            </button>
            <button
              type="button"
              onClick={() => setCodeMode("image")}
              className={`flex items-center gap-[5px] px-3 py-[5px] rounded-[var(--radius-sm)] text-xs font-medium transition-all ${
                codeMode === "image"
                  ? "bg-[var(--surface)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--muted)] hover:text-[var(--fg)]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><rect x="2" y="2" width="10" height="10" rx="1.5"/><circle cx="5" cy="5.5" r="1.2"/><path d="M2.5 10l2.5-3 2 2 3-4 1.5 2"/></svg>
              {t.codeImage}
            </button>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-[6px] flex-shrink-0">
          <button
            type="button"
            onClick={handleImportClick}
            className="inline-flex items-center gap-[5px] px-3 py-[6px] rounded-[var(--radius-sm)] border border-transparent text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 11V3M5 6l3-3 3 3M3 13h10"/></svg>
            {t.importFile}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-[5px] px-3 py-[6px] rounded-[var(--radius-sm)] border border-transparent text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 3v8M5 8l3 3 3-3M3 13h10"/></svg>
            {t.exportFile}
          </button>
          <div className="w-px h-[18px] bg-[var(--border)]" />
          <button
            type="button"
            onClick={() => setAssetsOpen(true)}
            className={`inline-flex items-center gap-[5px] px-3 py-[6px] rounded-[var(--radius-sm)] border border-transparent text-xs font-medium transition-all active:scale-[0.97] ${
              clipboard.assets.length > 0
                ? "text-[var(--fg)] hover:bg-[var(--fg-soft)]"
                : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)]"
            }`}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 3h10v10H3z" strokeLinejoin="round"/><path d="M6 6h4M6 8.5h4M6 11h2.5"/></svg>
            {t.assetsTitle}
            {clipboard.assets.length > 0 && (
              <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white tabular-nums">{clipboard.assets.length}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCoverOpen(true)}
            className="inline-flex items-center gap-[5px] px-3 py-[6px] rounded-[var(--radius-sm)] border border-transparent text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="2"/><circle cx="5.5" cy="7" r="1.5"/><path d="M4 13l3.5-4 2.5 2.5 3-4 1.5 2"/></svg>
            {t.coverTitle}
          </button>
          <div className="w-px h-[18px] bg-[var(--border)]" />
          <LanguageToggle href={locale === "zh" ? "/editor" : "/zh/editor"} />
          <button
            type="button"
            onClick={copyTitle}
            className="inline-flex items-center gap-[5px] px-3 py-[6px] rounded-[var(--radius-sm)] border border-transparent text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="2" width="8" height="10" rx="1.5"/><path d="M3 5v8a1.5 1.5 0 001.5 1.5H11"/></svg>
            {copyState === "title" ? t.copied : t.copyTitle}
          </button>
          <button
            type="button"
            onClick={copyBody}
            className="inline-flex items-center gap-[5px] px-3 py-[6px] rounded-[var(--radius-sm)] bg-[var(--accent)] text-white text-xs font-medium hover:bg-[var(--accent-hover)] transition-all active:scale-[0.97]"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="5" y="2" width="8" height="10" rx="1.5"/><path d="M3 5v8a1.5 1.5 0 001.5 1.5H11"/></svg>
            {copyState === "body"
              ? t.copied
              : copyState === "manual"
                ? t.selectText
                : t.copyBody}
          </button>
        </div>
      </header>

      {/* ═══ Hidden file input for import ═══ */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-label="Import Markdown file"
      />

      {/* ═══ Main: Editor + Preview ═══ */}
      <main
        ref={containerRef}
        className="grid overflow-hidden"
        style={{
          gridTemplateColumns: `${leftPanelWidth}% 1px ${100 - leftPanelWidth}%`,
        }}
      >
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          onReset={resetDraft}
          draftReady={draftReady}
        />

        {/* Resize handle */}
        <div
          className="relative cursor-col-resize group select-none"
          onMouseDown={handleResizeMouseDown}
        >
          <div
            className={`absolute inset-y-0 left-0 w-px transition-colors ${
              isResizing
                ? "bg-[var(--accent)] shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                : "bg-[var(--border)] group-hover:bg-[var(--accent)]"
            }`}
          />
        </div>

        {/* Preview pane */}
        <div className="flex flex-col overflow-hidden bg-[var(--surface)]">
          <div className="flex items-center justify-between px-4 h-[38px] border-b border-[var(--border)] min-h-[38px]">
            <span className="text-xs font-medium text-[var(--muted)]">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-[var(--success)] mr-[6px] animate-pulse" />
              {t.livePreview}
            </span>
            <span className="font-mono text-[10px] text-[var(--muted)] opacity-60">{t.xArticles}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
            <ArticlePreview blocks={blocks} />
          </div>
        </div>
      </main>

      {/* ═══ Cover Image Drawer ═══ */}
      {coverOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={() => setCoverOpen(false)}
          />
          <aside className="fixed top-0 right-0 z-40 h-full w-full max-w-md border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--border)] flex-shrink-0">
              <span className="text-sm font-medium text-[var(--fg)]">{t.coverTitle}</span>
              <button
                type="button"
                onClick={() => setCoverOpen(false)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <CoverImagePanel markdown={markdown} inline />
            </div>
          </aside>
        </>
      )}

      {/* ═══ Assets Drawer ═══ */}
      {assetsOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] transition-opacity"
            onClick={() => setAssetsOpen(false)}
          />
          <aside className="fixed top-0 right-0 z-40 h-full w-full max-w-md border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] flex flex-col animate-slide-in">
            <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--border)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--fg)]">{t.assetsTitle}</span>
                {clipboard.assets.length > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[var(--accent-soft)] text-[11px] font-semibold text-[var(--accent)] tabular-nums">{clipboard.assets.length}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setAssetsOpen(false)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {clipboard.assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <svg width="40" height="40" viewBox="0 0 16 16" fill="none" stroke="var(--border)" strokeWidth="1" aria-hidden="true"><path d="M3 3h10v10H3z" strokeLinejoin="round"/><path d="M6 6h4M6 8.5h4M6 11h2.5"/></svg>
                  <p className="mt-3 text-sm text-[var(--muted)]">{t.assetsEmpty}</p>
                </div>
              ) : (
                <ArticleAssets assets={clipboard.assets} inline />
              )}
            </div>
          </aside>
        </>
      )}

      {/* ═══ Manual copy fallback ═══ */}
      {manualCopy ? (
        <div className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-3xl rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
            <h2 className="text-sm font-medium text-[var(--muted)]">
              {manualCopy.label}
            </h2>
            <button
              type="button"
              onClick={() => {
                setManualCopy(null);
                setCopyState("idle");
              }}
              className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] transition hover:bg-[var(--fg-soft)]"
            >
              {t.manualClose}
            </button>
          </div>
          {manualCopy.html ? (
            <div
              ref={manualRichCopyRef}
              contentEditable
              suppressContentEditableWarning
              aria-label="Copyable rich article body"
              className="max-h-80 overflow-auto p-5 text-[17px] leading-8 text-[var(--fg)] outline-none [&_a]:font-medium [&_a]:text-[var(--accent)] [&_code]:rounded [&_code]:bg-[var(--fg-soft)] [&_code]:px-1.5 [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:my-1 [&_pre]:overflow-auto [&_pre]:rounded-[var(--radius)] [&_pre]:bg-[oklch(16%_0.014_250)] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-[oklch(90%_0.01_250)] [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: manualCopy.html }}
            />
          ) : (
            <textarea
              ref={manualCopyRef}
              value={manualCopy.text}
              readOnly
              aria-label="Copyable article text"
              className="h-52 w-full resize-none border-0 p-4 font-mono text-sm leading-6 text-[var(--fg)] outline-none bg-[var(--surface)]"
            />
          )}
        </div>
      ) : null}
    </div>
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
