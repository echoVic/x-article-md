"use client";

import { AppHeader } from "@/components/app-header";
import { ArticlePreview } from "@/components/article-preview";
import { AssetOrchestrator } from "@/components/asset-orchestrator";
import { CoverImagePanel } from "@/components/cover-image-panel";
import { EditorToolbar } from "@/components/editor-toolbar";
import { MarkdownEditor, type MarkdownEditorHandle } from "@/components/markdown-editor";
import { PreflightPanel } from "@/components/preflight-panel";
import { initialPublishState, PublishPanel, publishReducer } from "@/components/publish-panel";
import { TemplatePicker } from "@/components/template-picker";
import { trackEvent } from "@/lib/analytics";
import { resolveTheme } from "@/lib/code-themes";
import { useI18n } from "@/lib/i18n";
import { parseMarkdown, toXArticleClipboard } from "@/lib/markdown";
import { runPreflight, type PreflightReport } from "@/lib/preflight";
import { sampleMarkdown } from "@/lib/sample";
import type { ArticleTemplate } from "@/lib/templates";
import { useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { Sheet } from "./ui/sheet";

const draftStorageKey = "x-article-md:draft";

export default function EditorPage() {
  const { t, locale } = useI18n();
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [draftReady, setDraftReady] = useState(false);
  const [codeMode, setCodeMode] = useState<"quote" | "image">("quote");
  const [codeThemeId, setCodeThemeId] = useState("auto");
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [preflightOpen, setPreflightOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [preflightReport, setPreflightReport] = useState<PreflightReport | null>(null);
  const [showPreflightHint, setShowPreflightHint] = useState(false);
  const [publishState, dispatchPublish] = useReducer(publishReducer, initialPublishState);
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
  const markdownEditorRef = useRef<MarkdownEditorHandle>(null);
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);
  const hasCodeBlocks = useMemo(() => blocks.some(b => b.type === "code" || b.type === "mermaid"), [blocks]);
  const clipboard = useMemo(
    () => toXArticleClipboard(markdown, { codeMode }),
    [codeMode, markdown],
  );

  const isDark = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );

  const resolvedCodeTheme = useMemo(
    () => resolveTheme(codeThemeId, isDark),
    [codeThemeId, isDark],
  );
  const headingCount = useMemo(() => blocks.filter((block) => block.type === "heading").length, [blocks]);
  const paragraphCount = useMemo(
    () => blocks.filter((block) => block.type === "paragraph").length,
    [blocks],
  );
  const editorDensityLabel = markdown.length > 5000 ? "long draft" : markdown.length > 1800 ? "feature draft" : "short draft";

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
      dispatchPublish({ type: "TITLE_COPIED" });
      return;
    }

    setManualCopy({ label: "Manual title copy", text: title });
    setCopyState("manual");
  }

  async function copyBody() {
    trackEvent("copy_body");

    if (!preflightReport) {
      setShowPreflightHint(true);
      window.setTimeout(() => setShowPreflightHint(false), 5000);
    }

    const htmlToWrite = clipboard.bodyHtml;

    if (await copyRichText(htmlToWrite, clipboard.bodyText)) {
      markCopied("body");
      dispatchPublish({ type: "BODY_COPIED" });
      return;
    }

    setManualCopy({
      label: "Manual rich body copy",
      text: clipboard.bodyText,
      html: htmlToWrite,
    });
    setCopyState("manual");
  }

  function handlePreflight() {
    const report = runPreflight(blocks, markdown, codeMode);
    setPreflightReport(report);
    setPreflightOpen(true);
    dispatchPublish({ type: "PREFLIGHT_DONE" });
    trackEvent("preflight_run");
  }

  function handleJumpToSource(offset: number) {
    markdownEditorRef.current?.jumpToOffset(offset);
    setPreflightOpen(false);
  }

  function handlePublishOpen() {
    dispatchPublish({ type: "RESET", assetCount: clipboard.assets.length });
    setPublishOpen(true);
  }

  function handleTemplateSelect(template: ArticleTemplate) {
    const isDirty = markdown !== sampleMarkdown && markdown.trim() !== "";
    if (isDirty && !window.confirm(t.templateConfirmReplace)) {
      return;
    }
    setMarkdown(template.content[locale]);
    setTemplatePickerOpen(false);
    trackEvent("template_select", { templateId: template.id });
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
    <div
      className="grid h-full grid-rows-[auto_auto_auto_1fr] bg-[var(--bg)]"
      style={{
        userSelect: isResizing ? "none" : "auto",
        backgroundImage:
          "linear-gradient(to right, color-mix(in oklch, var(--border) 72%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--border) 36%, transparent) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 100% 28px",
      }}
    >
      {/* ═══ Global Header ═══ */}
      <AppHeader activePage="editor" />

      {/* ═══ Editor Toolbar ═══ */}
      <EditorToolbar
        codeMode={codeMode}
        onCodeModeChange={setCodeMode}
        codeThemeId={codeThemeId}
        onCodeThemeChange={setCodeThemeId}
        onImport={handleImportClick}
        onExport={handleExport}
        onTemplates={() => setTemplatePickerOpen(true)}
        onToggleAssets={() => setAssetsOpen(true)}
        onCopyTitle={copyTitle}
        onCopyBody={copyBody}
        onPreflight={handlePreflight}
        onPublish={handlePublishOpen}
        draftReady={draftReady}
        assetsCount={clipboard.assets.length}
        copyState={copyState}
        preflightStatus={preflightReport?.status ?? null}
        hasCodeBlocks={hasCodeBlocks}
        showPreflightHint={showPreflightHint}
      />

      <div className="grid border-b border-[var(--border)] bg-[color-mix(in_oklch,var(--surface)_84%,transparent)] px-4 py-3 md:grid-cols-3 md:px-5">
        <WorkbenchMeta
          kicker="Writing desk"
          title="Manuscript first"
          detail={`${editorDensityLabel} · ${headingCount} headings · ${paragraphCount} passages`}
        />
        <WorkbenchMeta
          kicker="Production"
          title="Copy without cleanup"
          detail={`${clipboard.assets.length} asset${clipboard.assets.length === 1 ? "" : "s"} · ${hasCodeBlocks ? "code-aware" : "plain text"}`}
        />
        <WorkbenchMeta
          kicker="Reading"
          title="Proof in parallel"
          detail={`${Math.round(leftPanelWidth)} / ${100 - Math.round(leftPanelWidth)} split · ${t.xArticles}`}
          align="end"
        />
      </div>

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
        <div className="flex min-w-0 flex-col overflow-hidden bg-[color-mix(in_oklch,var(--surface)_92%,transparent)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="font-[var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Draft surface
                </div>
                <p
                  className="mt-2 text-[var(--fg)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px",
                    fontStyle: "italic",
                    lineHeight: 1.2,
                  }}
                >
                  Write like a manuscript, not a form field.
                </p>
              </div>
              <div className="hidden text-right md:block">
                <div className="font-[var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Current desk state
                </div>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
                  Keep the draft airy, then polish, preflight, and paste once.
                </p>
              </div>
            </div>
          </div>
          <MarkdownEditor
            ref={markdownEditorRef}
            value={markdown}
            onChange={setMarkdown}
            onReset={resetDraft}
            draftReady={draftReady}
          />
        </div>

        {/* Resize handle — editorial gutter with subtle center marker */}
        <div
          className="relative cursor-col-resize group select-none"
          onMouseDown={handleResizeMouseDown}
          role="separator"
          aria-label="Resize panes"
        >
          <div
            className={`absolute inset-y-0 left-0 w-px transition-colors ${
              isResizing
                ? "bg-[var(--accent)]"
                : "bg-[var(--border)] group-hover:bg-[var(--fg)]"
            }`}
          />
          <div
            aria-hidden="true"
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[2px] w-[5px] h-[5px] rotate-45 transition-colors ${
              isResizing
                ? "bg-[var(--accent)]"
                : "bg-[var(--border)] group-hover:bg-[var(--fg)]"
            }`}
          />
        </div>

        {/* Preview pane */}
        <div className="flex min-w-0 flex-col overflow-hidden bg-[var(--bg)]">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <div className="font-[var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Reading proof
                </div>
                <p
                  className="mt-2 text-[var(--fg)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px",
                    fontStyle: "italic",
                    lineHeight: 1.2,
                  }}
                >
                  Proof the pacing before you export the piece.
                </p>
              </div>
              <div className="hidden text-right md:block">
                <div className="font-[var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Surface target
                </div>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
                  {t.xArticles} · live proof · fol. 02
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-baseline justify-between px-5 h-[38px] border-b border-[var(--border)] min-h-[38px] bg-[color-mix(in_oklch,var(--surface)_68%,transparent)]">
            <span
              className="inline-flex items-baseline gap-[8px]"
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "10px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                lineHeight: 1,
                color: "var(--fg)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 1,
                  background: "var(--accent)",
                  transform: "translateY(-3px)",
                }}
              />
              Proof
              <span
                aria-hidden="true"
                className="text-[var(--muted)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: "12px",
                  letterSpacing: "-0.005em",
                  textTransform: "none",
                }}
              >
                — {t.livePreview.toLowerCase()}
              </span>
            </span>
            <span
              className="text-[var(--muted)]"
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "9.5px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              {t.xArticles}&nbsp;·&nbsp;fol.&nbsp;02
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-10 sm:px-12">
            <ArticlePreview blocks={blocks} codeTheme={resolvedCodeTheme} />
          </div>
        </div>
      </main>

      {/* ═══ Assets & Media Drawer ═══ */}
      <Sheet
        open={assetsOpen}
        onOpenChange={setAssetsOpen}
        title={t.orchestratorTitle}
        titleRight={clipboard.assets.length > 0 ? (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[var(--accent-soft)] text-[11px] font-semibold text-[var(--accent)] tabular-nums">{clipboard.assets.length}</span>
        ) : undefined}
      >
        <div className="flex flex-col h-full divide-y divide-[var(--border)]">
          <CoverImagePanel markdown={markdown} inline />
          <AssetOrchestrator
            assets={clipboard.assets}
            assetOffsets={clipboard.assetOffsets}
            codeTheme={resolvedCodeTheme}
            coverBlob={null}
            onJumpToSource={handleJumpToSource}
          />
        </div>
      </Sheet>

      {/* ═══ Preflight Drawer ═══ */}
      <Sheet open={preflightOpen} onOpenChange={setPreflightOpen} title={t.preflightTitle}>
        <PreflightPanel report={preflightReport} onJump={handleJumpToSource} />
      </Sheet>

      {/* ═══ Publish Drawer ═══ */}
      <Sheet open={publishOpen} onOpenChange={setPublishOpen} title={t.publishTitle}>
        <PublishPanel
          state={publishState}
          assets={clipboard.assets}
          onPreflight={handlePreflight}
          onCopyTitle={copyTitle}
          onCopyBody={copyBody}
          onAssetCopied={(index: number) => dispatchPublish({ type: "ASSET_COPIED", assetIndex: index })}
          onVerifyDone={() => dispatchPublish({ type: "VERIFY_DONE" })}
          onReset={() => dispatchPublish({ type: "RESET", assetCount: clipboard.assets.length })}
        />
      </Sheet>

      {/* ═══ Template Picker ═══ */}
      <TemplatePicker
        open={templatePickerOpen}
        onOpenChange={setTemplatePickerOpen}
        onSelect={handleTemplateSelect}
      />

      {/* ═══ Preflight hint toast ═══ */}
      {showPreflightHint && (
        <div className="fixed top-14 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] animate-in fade-in slide-in-from-top-2">
          <span className="text-[12px] text-[var(--fg)]">{t.preflightHint}</span>
          <button
            type="button"
            onClick={() => { setShowPreflightHint(false); handlePreflight(); }}
            className="px-2 py-0.5 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-[var(--radius-xs)] transition-colors"
          >
            {t.preflightHintAction}
          </button>
        </div>
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

type WorkbenchMetaProps = {
  kicker: string;
  title: string;
  detail: string;
  align?: "start" | "end";
};

function WorkbenchMeta({ kicker, title, detail, align = "start" }: WorkbenchMetaProps) {
  return (
    <div className={`py-1 ${align === "end" ? "md:text-right" : ""}`}>
      <div className="font-[var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
        {kicker}
      </div>
      <div
        className="mt-2 text-[var(--fg)]"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "20px",
          fontStyle: "italic",
          lineHeight: 1.15,
        }}
      >
        {title}
      </div>
      <p className="mt-2 text-[12px] leading-[1.6] text-[var(--muted)]">{detail}</p>
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
