"use client";

import { CodeMirrorEditor, type CodeMirrorEditorHandle } from "@/components/codemirror-editor";
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
  Workflow,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { DropdownMenu } from "./dropdown-menu";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  draftReady: boolean;
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

export function MarkdownEditor({
  value,
  onChange,
  onReset,
  draftReady,
}: MarkdownEditorProps) {
  const { t } = useI18n();
  const editorRef = useRef<CodeMirrorEditorHandle>(null);
  const stats = useMemo(() => getStats(value), [value]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishComparison, setPolishComparison] = useState<{
    original: string;
    polished: string;
    start: number;
    end: number;
  } | null>(null);

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
    <div className="flex flex-col overflow-hidden bg-[var(--surface)] relative">
      {/* Toolbar */}
      <div className="flex items-center gap-[2px] px-[10px] py-[5px] border-b border-[var(--border)] min-h-[38px]">
        {toolbarGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="contents">
            {groupIndex > 0 && (
              <div className="w-px h-[18px] bg-[var(--border)] mx-[6px]" />
            )}
            <div className="flex items-center gap-[1px]">
              {group.map((item) => {
                const label = t[item.labelKey as keyof typeof t] || item.labelKey;
                return (
                <button
                  key={item.action}
                  type="button"
                  onClick={() => applyAction(item.action)}
                  title={item.shortcut ? `${label} (${item.shortcut})` : label}
                  aria-label={label}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-xs)] bg-transparent text-[var(--muted)] transition-all hover:bg-[var(--fg-soft)] hover:text-[var(--fg)] active:scale-[0.92]"
                >
                  <ToolbarIcon icon={item.icon} />
                </button>
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
              title={t.toolPolish}
              aria-label={t.toolPolish}
              className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-xs)] bg-transparent text-[var(--muted)] transition-all hover:bg-[var(--fg-soft)] hover:text-[var(--fg)] active:scale-[0.92] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPolishing ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles size={16} strokeWidth={1.8} aria-hidden="true" />
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
              title={t.toolTranslate}
              aria-label={t.toolTranslate}
              className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-xs)] bg-transparent text-[var(--muted)] transition-all hover:bg-[var(--fg-soft)] hover:text-[var(--fg)] active:scale-[0.92] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Languages size={16} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
          }
          items={[
            { icon: "🇬🇧", label: t.translateToEnglish, onClick: () => handleTranslate("en") },
            { icon: "🇨🇳", label: t.translateToChinese, onClick: () => handleTranslate("zh") },
          ]}
        />

        <button
          type="button"
          onClick={onReset}
          title={t.toolReset}
          aria-label={t.toolReset}
          className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-xs)] bg-transparent text-[var(--muted)] transition-all hover:text-[var(--danger)] hover:bg-[color-mix(in_oklch,var(--danger)_8%,transparent)] active:scale-[0.92]"
        >
          <RotateCcw size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      {/* Editor area */}
      <div className="flex flex-1 overflow-hidden">
        <CodeMirrorEditor
          ref={editorRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={draftReady ? t.editorPlaceholder : ""}
        />
      </div>

      {/* Polish comparison overlay */}
      {polishComparison && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20 p-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-lg)] max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--fg)]">{t.polishComparing}</h3>
              <button
                type="button"
                onClick={rejectPolish}
                className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-[var(--muted)] mb-2 uppercase">Original</div>
                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] p-3 text-sm text-[var(--fg)] whitespace-pre-wrap font-mono leading-relaxed">
                    {polishComparison.original}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-[var(--muted)] mb-2 uppercase">Polished</div>
                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] p-3 text-sm text-[var(--fg)] whitespace-pre-wrap font-mono leading-relaxed">
                    {polishComparison.polished}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-[var(--border)]">
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
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-[14px] h-[30px] border-t border-[var(--border)] font-mono text-[11px] text-[var(--muted)]">
        <div className="flex items-center gap-1 tabular-nums">
          <span>{stats.lines} {t.footerLines}</span>
          <span className="opacity-40">·</span>
          <span>{stats.words} {t.footerWords}</span>
          <span className="opacity-40">·</span>
          <span>{stats.characters} {t.footerChars}</span>
        </div>
        <span className="opacity-60 text-[10px]">{t.footerShortcuts}</span>
      </div>
    </div>
  );
}

function getStats(value: string) {
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
