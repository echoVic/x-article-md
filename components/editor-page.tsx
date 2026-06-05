"use client";

import { AppHeader } from "@/components/app-header";
import { ArticleAssets } from "@/components/article-assets";
import { ArticlePreview } from "@/components/article-preview";
import { CoverImagePanel } from "@/components/cover-image-panel";
import { EditorToolbar } from "@/components/editor-toolbar";
import { MarkdownEditor } from "@/components/markdown-editor";
import { trackEvent } from "@/lib/analytics";
import { useI18n } from "@/lib/i18n";
import { parseMarkdown, toXArticleClipboard } from "@/lib/markdown";
import { sampleMarkdown } from "@/lib/sample";
import { FileText, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const draftStorageKey = "x-article-md:draft";

export default function EditorPage() {
  const { t } = useI18n();
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
    trackEvent("copy_title");

    if (copyPlainText(title)) {
      markCopied("title");
      return;
    }

    setManualCopy({ label: "Manual title copy", text: title });
    setCopyState("manual");
  }

  async function copyBody() {
    trackEvent("copy_body");
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
        trackEvent("import_markdown");
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
    trackEvent("export_markdown");
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
    <div className="grid h-full grid-rows-[auto_auto_1fr]" style={{ userSelect: isResizing ? 'none' : 'auto' }}>
      {/* ═══ Global Header ═══ */}
      <AppHeader activePage="editor" />

      {/* ═══ Editor Toolbar ═══ */}
      <EditorToolbar
        codeMode={codeMode}
        onCodeModeChange={setCodeMode}
        onImport={handleImportClick}
        onExport={handleExport}
        onToggleAssets={() => setAssetsOpen(true)}
        onToggleCover={() => setCoverOpen(true)}
        onCopyTitle={copyTitle}
        onCopyBody={copyBody}
        draftReady={draftReady}
        assetsCount={clipboard.assets.length}
        copyState={copyState}
      />

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
                <X size={14} strokeWidth={1.5} aria-hidden="true" />
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
                <X size={14} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {clipboard.assets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <FileText size={40} strokeWidth={0.8} className="text-[var(--border)]" aria-hidden="true" />
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
