"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  applyMarkdownAction,
  handleMarkdownEnter,
  insertTab,
  type EditorUpdate,
  type MarkdownAction,
} from "@/lib/editor-actions";
import { useI18n } from "@/lib/i18n";
import { CodeMirrorEditor, type CodeMirrorEditorHandle } from "@/components/codemirror-editor";

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
  const { t, locale } = useI18n();
  const editorRef = useRef<CodeMirrorEditorHandle>(null);
  const stats = useMemo(() => getStats(value), [value]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const translateButtonRef = useRef<HTMLButtonElement>(null);

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
    setShowTranslateMenu(false);
    setIsTranslating(true);

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
        throw new Error(error.error || "Translation failed");
      }

      const data = await response.json();
      onChange(data.translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      alert(t.translateError + ": " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsTranslating(false);
    }
  }

  // Close translate menu when clicking outside
  useEffect(() => {
    if (!showTranslateMenu) return;

    function handleClickOutside(event: MouseEvent) {
      if (translateButtonRef.current && !translateButtonRef.current.contains(event.target as Node)) {
        setShowTranslateMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTranslateMenu]);

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
    <div className="flex flex-col overflow-hidden bg-[var(--surface)]">
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

        {/* Translate button with dropdown */}
        <div className="relative">
          <button
            ref={translateButtonRef}
            type="button"
            onClick={() => setShowTranslateMenu(!showTranslateMenu)}
            disabled={isTranslating}
            title={t.toolTranslate}
            aria-label={t.toolTranslate}
            className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-xs)] bg-transparent text-[var(--muted)] transition-all hover:bg-[var(--fg-soft)] hover:text-[var(--fg)] active:scale-[0.92] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranslating ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="8" cy="8" r="6" opacity="0.25" />
                <path d="M8 2a6 6 0 016 6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                <path d="M2 5h6M5 2v3" />
                <path d="M4 9l2-2 2 2" />
                <path d="M14 11H8M11 14v-3" />
                <path d="M12 7l-2 2-2-2" />
              </svg>
            )}
          </button>

          {showTranslateMenu && (
            <div className="absolute top-full right-0 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-[var(--shadow-md)] py-1 z-10 min-w-[160px]">
              <button
                type="button"
                onClick={() => handleTranslate("en")}
                className="w-full px-3 py-1.5 text-left text-xs text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors flex items-center gap-2"
              >
                <span>🇬🇧</span>
                <span>{t.translateToEnglish}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTranslate("zh")}
                className="w-full px-3 py-1.5 text-left text-xs text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors flex items-center gap-2"
              >
                <span>🇨🇳</span>
                <span>{t.translateToChinese}</span>
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onReset}
          title={t.toolReset}
          aria-label={t.toolReset}
          className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-xs)] bg-transparent text-[var(--muted)] transition-all hover:text-[var(--danger)] hover:bg-[color-mix(in_oklch,var(--danger)_8%,transparent)] active:scale-[0.92]"
        >
          <ResetIcon />
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
  switch (icon) {
    case "code":
      return (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <path d="M5.5 4.5L2.5 8l3 3.5" />
          <path d="M10.5 4.5l3 3.5-3 3.5" />
        </svg>
      );
    case "link":
      return (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <path d="M7 5.5L8.5 4a2.5 2.5 0 013.5 3.5L10.5 9" />
          <path d="M9 10.5L7.5 12A2.5 2.5 0 014 8.5L5.5 7" />
          <path d="M6.5 9.5l3-3" />
        </svg>
      );
    case "ul":
      return (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 4h7M6 8h7M6 12h7" />
          <circle cx="3.5" cy="4" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="3.5" cy="8" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="3.5" cy="12" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "ol":
      return (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <path d="M6 4h7M6 8h7M6 12h7" />
          <text x="2.5" y="5.5" fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">1</text>
          <text x="2.5" y="9.5" fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">2</text>
          <text x="2.5" y="13.5" fontSize="5" fill="currentColor" stroke="none" fontFamily="monospace">3</text>
        </svg>
      );
    case "fence":
      return (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <rect x="2" y="2" width="12" height="12" rx="2" />
          <path d="M5 6h6M5 8.5h4M5 11h5" />
        </svg>
      );
    case "flow":
      return (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="2" y="2" width="5" height="4" rx="1" />
          <rect x="9" y="10" width="5" height="4" rx="1" />
          <path d="M7 4h2v8H9" />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
          <rect x="2" y="2" width="12" height="12" rx="1.5" />
          <path d="M2 6h12M2 10h12M6 2v12M10 2v12" />
        </svg>
      );
    case "H2":
      return <span className="text-[11px] font-bold font-mono" aria-hidden="true">H2</span>;
    case "B":
      return <span className="text-[12px] font-bold" aria-hidden="true">B</span>;
    default:
      return <span className="text-[11px] font-mono" aria-hidden="true">{icon}</span>;
  }
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="M3.5 5.5a5 5 0 11.5 5.3" />
      <path d="M3.5 2v3.5H7" strokeLinejoin="round" />
    </svg>
  );
}
