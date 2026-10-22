"use client";

import { AppHeader } from "@/components/app-header";
import { ArticlePreview } from "@/components/article-preview";
import { AssetOrchestrator } from "@/components/asset-orchestrator";
import { CoverImagePanel } from "@/components/cover-image-panel";
import { EditorToolbar } from "@/components/editor-toolbar";
import { MarkdownEditor, type MarkdownEditorHandle, getStats } from "@/components/markdown-editor";
import { PreflightPanel } from "@/components/preflight-panel";
import { initialPublishState, PublishPanel, publishReducer } from "@/components/publish-panel";
import { TemplatePicker } from "@/components/template-picker";
import { trackEvent } from "@/lib/analytics";
import { resolveTheme } from "@/lib/code-themes";
import { useI18n } from "@/lib/i18n";
import { computeBlockOffsets, parseMarkdown, toXArticleClipboard } from "@/lib/markdown";
import { previewScrollTop, type SourceScrollPosition } from "@/lib/scroll-sync";
import { runPreflight } from "@/lib/preflight";
import { sampleMarkdown } from "@/lib/sample";
import type { ArticleTemplate } from "@/lib/templates";
import { Check, ClipboardCopy, ListChecks, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { Sheet } from "./ui/sheet";

const draftStorageKey = "x-article-md:draft";

const monoLabel: React.CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  fontSize: "10.5px",
  letterSpacing: "0.08em",
  lineHeight: 1,
};

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
  const [preflightChecked, setPreflightChecked] = useState(false);
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
  const [mobileView, setMobileView] = useState<"manuscript" | "preview">("manuscript");
  const manualCopyRef = useRef<HTMLTextAreaElement>(null);
  const manualRichCopyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const markdownEditorRef = useRef<MarkdownEditorHandle>(null);
  const [syncScroll, setSyncScroll] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const lastScroll = useRef<SourceScrollPosition>({ offset: 0, atStart: true, atEnd: false });
  const scrollFrame = useRef<number | null>(null);
  const sourceOffsets = useMemo(() => computeBlockOffsets(markdown), [markdown]);
  const normalizedLength = markdown.replace(/\r\n/g, "\n").length;
  const blocks = useMemo(() => parseMarkdown(markdown), [markdown]);
  const preflightReport = useMemo(() => preflightChecked ? runPreflight(blocks, markdown, codeMode) : null, [preflightChecked, blocks, markdown, codeMode]);
  const hasCodeBlocks = useMemo(() => blocks.some(b => b.type === "code" || b.type === "mermaid"), [blocks]);
  const stats = useMemo(() => getStats(markdown), [markdown]);
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

  const isDesktop = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(min-width: 768px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );

  const alignPreview = useCallback(() => {
    const pane = previewRef.current;
    if (!pane || !syncScroll || !isDesktop) return;
    const article = pane.querySelector(".x-preview");
    if (!article) return;
    const paneTop = pane.getBoundingClientRect().top;
    const tops = Array.from(article.children).map(child => child.getBoundingClientRect().top - paneTop + pane.scrollTop);
    pane.scrollTop = previewScrollTop(lastScroll.current, sourceOffsets, tops, normalizedLength, pane.scrollHeight, pane.scrollHeight - pane.clientHeight);
  }, [syncScroll, isDesktop, sourceOffsets, normalizedLength]);

  const handleSourceScroll = useCallback((position: SourceScrollPosition) => {
    lastScroll.current = position;
    if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    if (!syncScroll || !isDesktop) { scrollFrame.current = null; return; }
    scrollFrame.current = requestAnimationFrame(() => { scrollFrame.current = null; alignPreview(); });
  }, [alignPreview, syncScroll, isDesktop]);

  useEffect(() => {
    const article = previewRef.current?.querySelector(".x-preview");
    if (!article || !syncScroll || !isDesktop) return;
    const observer = new ResizeObserver(() => handleSourceScroll(lastScroll.current));
    observer.observe(article);
    return () => {
      observer.disconnect();
      if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current);
    };
  }, [handleSourceScroll, syncScroll, isDesktop]);

  const resolvedCodeTheme = useMemo(
    () => resolveTheme(codeThemeId, isDark),
    [codeThemeId, isDark],
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
      dispatchPublish({ type: "TITLE_COPIED" });
      return;
    }

    setManualCopy({ label: t.manualTitleCopy, text: title });
    setCopyState("manual");
  }

  async function copyBody() {
    if (!preflightReport) {
      setShowPreflightHint(true);
      window.setTimeout(() => setShowPreflightHint(false), 5000);
    }

    const htmlToWrite = clipboard.bodyHtml;

    const ok = await copyRichText(htmlToWrite, clipboard.bodyText);
    trackEvent("copy_body", { codeMode, assets: clipboard.assets.length, ok });

    if (ok) {
      markCopied("body");
      dispatchPublish({ type: "BODY_COPIED" });
      return;
    }

    setManualCopy({
      label: t.manualBodyCopy,
      text: clipboard.bodyText,
      html: htmlToWrite,
    });
    setCopyState("manual");
  }

  function handlePreflight() {
    setPreflightChecked(true);
    setPreflightOpen(true);
    dispatchPublish({ type: "PREFLIGHT_DONE" });
    trackEvent("preflight_run");
  }

  function handleJumpToSource(offset: number) {
    setPreflightOpen(false);
    setAssetsOpen(false);
    setMobileView("manuscript");
    window.requestAnimationFrame(() => markdownEditorRef.current?.jumpToOffset(offset));
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
      className="workbench flex h-full flex-col bg-[var(--bg)]"
      style={{ userSelect: isResizing ? "none" : "auto" }}
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

      {/* ═══ Mobile: manuscript / preview tab strip ═══ */}
      {!isDesktop && (
        <div className="flex h-11 shrink-0 border-b border-[var(--border)] bg-[var(--surface)]" role="tablist" aria-label={t.livePreview}>
          {(
            [
              { id: "manuscript", label: t.manuscript },
              { id: "preview", label: t.livePreview },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mobileView === tab.id}
              onClick={() => setMobileView(tab.id)}
              className="relative h-11 flex-1 text-[14px] font-medium transition-colors"
              style={{ color: mobileView === tab.id ? "var(--fg)" : "var(--muted)" }}
            >
              {tab.label}
              <span
                aria-hidden="true"
                className="absolute left-0 right-0 bottom-0 h-[2px] mx-auto w-16 transition-transform"
                style={{
                  background: "var(--accent)",
                  transform: mobileView === tab.id ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ═══ Hidden file input for import ═══ */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        onChange={handleFileChange}
        style={{ display: "none" }}
        aria-label={t.importFile}
      />

      {/* ═══ Main: Editor + Preview ═══ */}
      <main
        ref={containerRef}
        className="grid min-h-0 flex-1 overflow-hidden"
        style={{
          gridTemplateColumns: isDesktop
            ? `${leftPanelWidth}% 1px ${100 - leftPanelWidth}%`
            : "100%",
        }}
      >
        {/* Left pane */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden bg-[var(--surface)] ${
            !isDesktop && mobileView !== "manuscript" ? "hidden" : ""
          }`}
        >
          {/* Column head — 30px */}
          <div className="wb-colhead hidden h-[30px] shrink-0 items-center justify-between border-b border-[var(--border)] px-4 md:flex">
            <span className="flex items-baseline gap-[6px]" style={{ ...monoLabel, color: "var(--fg)" }}>
              {t.manuscript}
              <span className="text-[var(--muted)]">· MARKDOWN</span>
            </span>
            <span
              className="tabular-nums text-[var(--muted)]"
              style={{ fontFamily: "var(--font-geist-mono)", fontSize: "10.5px", letterSpacing: "0.02em", lineHeight: 1 }}
            >
              {stats.lines} {t.footerLines} · {stats.words} {t.footerWords} · {stats.characters} {t.footerChars}
            </span>
          </div>
          <MarkdownEditor
            ref={markdownEditorRef}
            value={markdown}
            onChange={setMarkdown}
            onReset={resetDraft}
            draftReady={draftReady}
            onScrollPosition={handleSourceScroll}
          />
        </div>

        {/* Resize handle */}
        {isDesktop && (
          <div
            className="group relative cursor-col-resize select-none"
            onMouseDown={handleResizeMouseDown}
            role="separator"
            aria-label={t.resizePanes}
          >
            <div
              className={`absolute inset-y-0 left-0 w-px transition-colors ${
                isResizing
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--border-struct)] group-hover:bg-[var(--fg)]"
              }`}
            />
            <div
              aria-hidden="true"
              className={`absolute left-0 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rotate-45 transition-colors ${
                isResizing
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--border-struct)] group-hover:bg-[var(--fg)]"
              }`}
            />
          </div>
        )}

        {/* Right pane — X reading surface */}
        <div
          className={`flex min-w-0 flex-col overflow-hidden ${
            !isDesktop && mobileView !== "preview" ? "hidden" : ""
          }`}
          style={{ background: "var(--x-bg)" }}
        >
          {/* Column head — 30px */}
          <div
            className="wb-colhead hidden h-[30px] shrink-0 items-center justify-between border-b border-[var(--border)] px-4 md:flex"
            style={{ background: "var(--surface)" }}
          >
            <span className="flex items-center gap-[6px]" style={{ ...monoLabel, color: "var(--fg)" }}>
              <span
                aria-hidden="true"
                className="inline-block h-[6px] w-[6px] rounded-full"
                style={{ background: "var(--success)" }}
              />
              {t.livePreview}
            </span>
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-[var(--muted)]" title={t.syncScrollHint}>
              <input type="checkbox" checked={syncScroll} onChange={event => setSyncScroll(event.target.checked)} className="accent-[var(--accent)]" />
              {t.syncScroll}
            </label>
          </div>
          <div ref={previewRef} className="min-h-0 flex-1 overflow-y-auto" aria-label={t.livePreview}>
            <ArticlePreview blocks={blocks} codeTheme={resolvedCodeTheme} />
          </div>
        </div>
      </main>

      {/* ═══ Mobile bottom action bar — 60px thumb zone ═══ */}
      {!isDesktop && (
        <div className="flex h-[60px] shrink-0 items-center gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-3">
          <button
            type="button"
            onClick={handlePreflight}
            aria-label={t.preflightRun}
            className="inline-flex h-11 items-center gap-[6px] rounded-[var(--radius-sm)] border border-[var(--border-struct)] px-3 text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--fg)] hover:text-[var(--fg)]"
          >
            <ShieldCheck size={15} strokeWidth={1.6} aria-hidden="true" />
            {t.preflightRun}
          </button>
          <button
            type="button"
            onClick={handlePublishOpen}
            aria-label={t.publishTitle}
            className="inline-flex h-11 items-center gap-[6px] rounded-[var(--radius-sm)] border border-[var(--border-struct)] px-3 text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--fg)] hover:text-[var(--fg)]"
          >
            <ListChecks size={15} strokeWidth={1.6} aria-hidden="true" />
            {t.publishTitle}
          </button>
          <button
            type="button"
            onClick={copyBody}
            aria-label={t.copyBody}
            className={`inline-flex h-11 flex-1 items-center justify-center gap-[6px] rounded-[var(--radius-sm)] transition-colors ${
              copyState === "body"
                ? "bg-[var(--success)] text-white"
                : "bg-[var(--fg)] text-[var(--bg)] active:bg-[var(--accent)] active:text-[var(--on-accent)]"
            }`}
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {copyState === "body" ? (
              <Check size={15} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <ClipboardCopy size={15} strokeWidth={1.8} aria-hidden="true" />
            )}
            {copyState === "body" ? t.copied : t.copyBody}
          </button>
        </div>
      )}

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
          articleTitle={clipboard.title}
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
        <div className="fixed top-14 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius)] border border-[var(--border-struct)] bg-[var(--surface)] shadow-[var(--shadow-md)] animate-in fade-in slide-in-from-top-2">
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
        <div className="fixed inset-x-4 bottom-4 z-20 mx-auto max-w-3xl rounded-[var(--radius-lg)] border border-[var(--border-struct)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
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
              className="rounded-[var(--radius-sm)] border border-[var(--border-struct)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] transition hover:bg-[var(--fg-soft)]"
            >
              {t.manualClose}
            </button>
          </div>
          {manualCopy.html ? (
            <div
              ref={manualRichCopyRef}
              contentEditable
              suppressContentEditableWarning
              aria-label={t.copyableBody}
              className="max-h-80 overflow-auto p-5 text-[17px] leading-8 text-[var(--fg)] outline-none [&_a]:font-medium [&_a]:text-[var(--accent)] [&_code]:rounded [&_code]:bg-[var(--fg-soft)] [&_code]:px-1.5 [&_h2]:mb-3 [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:my-1 [&_pre]:overflow-auto [&_pre]:rounded-[var(--radius)] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-[oklch(90%_0.01_250)] [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: manualCopy.html }}
            />
          ) : (
            <textarea
              ref={manualCopyRef}
              value={manualCopy.text}
              readOnly
              aria-label={t.copyableText}
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
    "write" in navigator
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
