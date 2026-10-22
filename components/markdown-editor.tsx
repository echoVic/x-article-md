"use client";

import { CodeMirrorEditor, type CodeMirrorEditorHandle } from "@/components/codemirror-editor";
import type { SourceScrollPosition } from "@/lib/scroll-sync";
import { trackEvent } from "@/lib/analytics";
import {
    applyMarkdownAction,
    type EditorUpdate,
    type MarkdownAction
} from "@/lib/editor-actions";
import { useI18n } from "@/lib/i18n";
import {
    Bold,
    Code,
    FileCode2,
    Heading2,
    Languages,
    Link as LinkIcon,
    List,
    ListOrdered,
    Loader2,
    RotateCcw,
    Sparkles,
    Table,
    Workflow
} from "lucide-react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Dialog } from "./ui/dialog";
import { DropdownMenu } from "./ui/dropdown-menu";
import { Tooltip } from "./ui/tooltip";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  draftReady: boolean;
  onScrollPosition?: (position: SourceScrollPosition) => void;
};

export type MarkdownEditorHandle = {
  jumpToOffset: (offset: number) => void;
};

type ToolbarItem = {
  action: MarkdownAction;
  labelKey: string;
  shortcut?: string;
  icon: string;
  group?: number;
};

const toolbarItems: ToolbarItem[] = [
  { action: "heading2", labelKey: "toolHeading", icon: "H2", group: 1 },
  { action: "bold", labelKey: "toolBold", shortcut: "⌘B", icon: "B", group: 1 },
  { action: "inlineCode", labelKey: "toolInlineCode", shortcut: "⌘E", icon: "code", group: 1 },
  { action: "link", labelKey: "toolLink", shortcut: "⌘K", icon: "link", group: 2 },
  { action: "bulletList", labelKey: "toolBulletList", shortcut: "⌘⇧8", icon: "ul", group: 2 },
  { action: "orderedList", labelKey: "toolOrderedList", shortcut: "⌘⇧7", icon: "ol", group: 2 },
  { action: "codeFence", labelKey: "toolCodeFence", icon: "fence", group: 3 },
  { action: "mermaid", labelKey: "toolMermaid", icon: "flow", group: 3 },
  { action: "table", labelKey: "toolTable", icon: "grid", group: 3 },
];

const formatBtn =
  "inline-flex shrink-0 items-center justify-center h-11 w-11 md:h-7 md:w-7 rounded-[var(--radius-sm)] bg-transparent text-[var(--muted)] transition-colors hover:bg-[var(--fg-soft)] hover:text-[var(--fg)] disabled:opacity-50 disabled:cursor-not-allowed";

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({
  value,
  onChange,
  onReset,
  draftReady,
  onScrollPosition,
}, ref) {
  const { t } = useI18n();
  const editorRef = useRef<CodeMirrorEditorHandle>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishComparison, setPolishComparison] = useState<{
    original: string;
    polished: string;
    start: number;
    end: number;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    jumpToOffset: (offset: number) => {
      editorRef.current?.jumpToOffset(offset);
    },
  }));

  function applyAction(action: MarkdownAction) {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    const selection = editor.getSelection();
    const currentValue = editor.getValue();

    const update = applyMarkdownAction(
      {
        value: currentValue,
        selectionStart: selection.start,
        selectionEnd: selection.end,
      },
      action
    );

    applyUpdate(update);
  }

  function applyUpdate(update: EditorUpdate) {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.setValue(update.value);
    window.requestAnimationFrame(() => {
      editor.focus();
      // CodeMirror will handle selection positioning
    });
  }

  async function handleTranslate(targetLang: "en" | "zh") {
    setIsTranslating(true);
    trackEvent("translate", { targetLang });

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: value,
          targetLang,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) throw new Error(t.rateLimitError);
        throw new Error(error.error || "Translation failed");
      }

      const data = await response.json();
      onChange(data.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      alert(error instanceof Error ? error.message : t.translateError);
    } finally {
      setIsTranslating(false);
    }
  }

  async function handlePolish(style?: "concise" | "professional" | "casual" | "engaging") {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const selectedText = value.substring(selection.start, selection.end);

    if (!selectedText || selectedText.trim().length === 0) {
      alert(t.polishSelectText);
      return;
    }

    setIsPolishing(true);
    trackEvent("polish", { style: style || "default" });

    try {
      const response = await fetch("/api/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedText,
          style,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) throw new Error(t.rateLimitError);
        throw new Error(error.error || "Polish failed");
      }

      const data = await response.json();

      // Show comparison
      setPolishComparison({
        original: selectedText,
        polished: data.polishedText,
        start: selection.start,
        end: selection.end,
      });
    } catch (error) {
      console.error("Polish error:", error);
      alert(error instanceof Error ? error.message : t.polishError);
    } finally {
      setIsPolishing(false);
    }
  }

  function acceptPolish() {
    if (!polishComparison) return;

    const newValue =
      value.substring(0, polishComparison.start) +
      polishComparison.polished +
      value.substring(polishComparison.end);

    onChange(newValue);
    setPolishComparison(null);
  }

  function rejectPolish() {
    setPolishComparison(null);
  }

  function handleKeyDown(event: KeyboardEvent): boolean {
    // Handle custom shortcuts for markdown actions
    if (event.key === "Tab") {
      event.preventDefault();
      // Tab is handled by CodeMirror
      return true;
    }

    if (!(event.metaKey || event.ctrlKey)) {
      return false;
    }

    const key = event.key.toLowerCase();
    const shortcutAction =
      key === "b"
        ? "bold"
        : key === "k"
          ? "link"
          : key === "e"
            ? "inlineCode"
            : event.shiftKey && key === "8"
              ? "bulletList"
              : event.shiftKey && key === "7"
                ? "orderedList"
                : null;

    if (shortcutAction) {
      event.preventDefault();
      applyAction(shortcutAction);
      return true;
    }

    return false;
  }

  // Group toolbar items with separators
  const toolbarGroups: Array<Array<ToolbarItem>> = [];
  let currentGroup = toolbarItems[0]?.group;
  let currentItems: ToolbarItem[] = [];
  for (const item of toolbarItems) {
    if (item.group !== currentGroup) {
      toolbarGroups.push(currentItems);
      currentItems = [];
      currentGroup = item.group;
    }
    currentItems.push(item);
  }
  if (currentItems.length > 0) toolbarGroups.push(currentItems);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[var(--surface)]">
      {/* Format bar — 36px desktop, 44px touch-friendly scroll on mobile */}
      <div className="wb-formatbar flex h-11 md:h-9 shrink-0 items-center gap-px overflow-x-auto border-b border-[var(--border)] px-2">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center">
            {groupIndex > 0 && (
              <div className="w-px h-4 bg-[var(--border-struct)] mx-1 md:mx-1.5 shrink-0" aria-hidden="true" />
            )}
            <div className="flex items-center gap-px">
              {group.map((item) => {
                const label = t[item.labelKey as keyof typeof t] || item.labelKey;
                return (
                  <Tooltip key={item.action} content={item.shortcut ? `${label} (${item.shortcut})` : String(label)}>
                    <button
                      type="button"
                      onClick={() => applyAction(item.action)}
                      aria-label={String(label)}
                      className={formatBtn}
                    >
                      <ToolbarIcon icon={item.icon} />
                    </button>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
        <div className="flex-1" />

        {/* Polish button with dropdown */}
        <DropdownMenu
          disabled={isPolishing}
          trigger={
            <button
              type="button"
              disabled={isPolishing}
              aria-label={t.toolPolish}
              className={formatBtn}
            >
              {isPolishing ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles size={16} strokeWidth={1.6} aria-hidden="true" />
              )}
            </button>
          }
          items={[
            { icon: "✨", label: t.polishDefault, onClick: () => handlePolish() },
            { icon: "📝", label: t.polishConcise, onClick: () => handlePolish("concise") },
            { icon: "💼", label: t.polishProfessional, onClick: () => handlePolish("professional") },
            { icon: "💬", label: t.polishCasual, onClick: () => handlePolish("casual") },
            { icon: "🎯", label: t.polishEngaging, onClick: () => handlePolish("engaging") },
          ]}
        />

        {/* Translate button with dropdown */}
        <DropdownMenu
          disabled={isTranslating}
          trigger={
            <button
              type="button"
              disabled={isTranslating}
              aria-label={t.toolTranslate}
              className={formatBtn}
            >
              {isTranslating ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Languages size={16} strokeWidth={1.6} aria-hidden="true" />
              )}
            </button>
          }
          items={[
            { icon: "🇬🇧", label: t.translateToEnglish, onClick: () => handleTranslate("en") },
            { icon: "🇨🇳", label: t.translateToChinese, onClick: () => handleTranslate("zh") },
          ]}
        />

        <Tooltip content={t.toolReset}>
          <button
            type="button"
            onClick={onReset}
            aria-label={t.toolReset}
            className={`${formatBtn} hover:text-[var(--danger)]`}
          >
            <RotateCcw size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </Tooltip>
      </div>

      {/* Editor area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CodeMirrorEditor
          ref={editorRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onScrollPosition={onScrollPosition}
          placeholder={draftReady ? t.editorPlaceholder : ""}
        />
      </div>

      {/* Polish comparison dialog */}
      <Dialog
        open={polishComparison !== null}
        onOpenChange={(open) => { if (!open) rejectPolish(); }}
        title={t.polishComparing}
        footer={
          <>
            <button
              type="button"
              onClick={rejectPolish}
              className="px-4 py-2 text-sm text-[var(--fg)] hover:bg-[var(--fg-soft)] rounded-[var(--radius-sm)] transition-colors"
            >
              {t.polishReject}
            </button>
            <button
              type="button"
              onClick={acceptPolish}
              className="px-4 py-2 text-sm text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-[var(--radius-sm)] transition-colors"
            >
              {t.polishAccept}
            </button>
          </>
        }
      >
        {polishComparison && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-[var(--muted)] mb-2 uppercase">{t.polishOriginal}</div>
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] p-3 text-sm text-[var(--fg)] whitespace-pre-wrap font-mono leading-relaxed">
                {polishComparison.original}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium text-[var(--muted)] mb-2 uppercase">{t.polishPolished}</div>
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] p-3 text-sm text-[var(--fg)] whitespace-pre-wrap font-mono leading-relaxed">
                {polishComparison.polished}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
});

export function getStats(value: string) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  return {
    characters: value.length,
    lines: value ? value.split("\n").length : 1,
    words,
  };
}

function ToolbarIcon({ icon }: { icon: string }) {
  const props = { size: 16, strokeWidth: 1.8, "aria-hidden": true as const };
  switch (icon) {
    case "H2":
      return <Heading2 {...props} />;
    case "B":
      return <Bold {...props} />;
    case "code":
      return <Code {...props} />;
    case "link":
      return <LinkIcon {...props} />;
    case "ul":
      return <List {...props} />;
    case "ol":
      return <ListOrdered {...props} />;
    case "fence":
      return <FileCode2 {...props} />;
    case "flow":
      return <Workflow {...props} />;
    case "grid":
      return <Table {...props} />;
    default:
      return <span className="text-[11px] font-mono" aria-hidden="true">{icon}</span>;
  }
}
