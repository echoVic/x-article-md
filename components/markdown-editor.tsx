"use client";

import { useMemo, useRef, type KeyboardEvent } from "react";
import {
  applyMarkdownAction,
  handleMarkdownEnter,
  insertTab,
  type EditorUpdate,
  type MarkdownAction,
} from "@/lib/editor-actions";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onReset: () => void;
  draftReady: boolean;
};

const toolbar: Array<{
  action: MarkdownAction;
  label: string;
  shortcut?: string;
  icon: string;
}> = [
  { action: "heading2", label: "Heading", icon: "H2" },
  { action: "bold", label: "Bold", shortcut: "Mod+B", icon: "B" },
  { action: "inlineCode", label: "Inline code", shortcut: "Mod+E", icon: "<>" },
  { action: "link", label: "Link", shortcut: "Mod+K", icon: "link" },
  { action: "bulletList", label: "Bullet list", shortcut: "Mod+Shift+8", icon: "ul" },
  { action: "orderedList", label: "Ordered list", shortcut: "Mod+Shift+7", icon: "ol" },
  { action: "codeFence", label: "Code block", icon: "{ }" },
  { action: "mermaid", label: "Mermaid", icon: "flow" },
  { action: "table", label: "Table", icon: "grid" },
];

export function MarkdownEditor({
  value,
  onChange,
  onReset,
  draftReady,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stats = useMemo(() => getStats(value), [value]);

  function applyAction(action: MarkdownAction) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    applyUpdate(
      applyMarkdownAction(
        {
          value,
          selectionStart: textarea.selectionStart,
          selectionEnd: textarea.selectionEnd,
        },
        action,
      ),
    );
  }

  function applyUpdate(update: EditorUpdate) {
    onChange(update.value);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        update.selectionStart,
        update.selectionEnd,
      );
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget;
    const state = {
      value,
      selectionStart: textarea.selectionStart,
      selectionEnd: textarea.selectionEnd,
    };

    if (event.key === "Tab") {
      event.preventDefault();
      applyUpdate(insertTab(state));
      return;
    }

    if (event.key === "Enter") {
      const update = handleMarkdownEnter(state);
      if (update) {
        event.preventDefault();
        applyUpdate(update);
      }
      return;
    }

    if (!(event.metaKey || event.ctrlKey)) {
      return;
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
      applyUpdate(applyMarkdownAction(state, shortcutAction));
    }
  }

  return (
    <div className="min-h-[calc(100vh-108px)] overflow-hidden rounded-md border border-[#d8e0e5] bg-white">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-[#e6ecf0] px-3 py-2">
        <div className="flex items-center gap-2">
          <h2 className="px-1 text-sm font-semibold text-[#536471]">
            Markdown
          </h2>
          <span className="hidden text-xs text-[#71808a] sm:inline">
            {draftReady ? "Draft saved locally" : "Loading draft"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {toolbar.map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => applyAction(item.action)}
              title={
                item.shortcut ? `${item.label} (${item.shortcut})` : item.label
              }
              aria-label={item.label}
              className="inline-flex size-8 items-center justify-center rounded-md border border-transparent bg-white text-xs font-bold text-[#536471] transition hover:border-[#cfd9de] hover:bg-[#f6f8fa] hover:text-[#0f1419] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
            >
              <ToolbarIcon icon={item.icon} />
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            title="Reset to sample"
            aria-label="Reset to sample"
            className="ml-1 inline-flex size-8 items-center justify-center rounded-md border border-[#cfd9de] bg-white text-[#536471] transition hover:bg-[#f6f8fa] hover:text-[#0f1419] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
          >
            <ResetIcon />
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="h-[calc(100vh-197px)] min-h-[414px] w-full resize-none border-0 bg-white p-4 font-mono text-sm leading-6 text-[#0f1419] outline-none"
        aria-label="Markdown editor"
      />

      <div className="flex h-11 items-center justify-between border-t border-[#e6ecf0] px-4 text-xs text-[#71808a]">
        <span>
          {stats.lines} lines / {stats.words} words
        </span>
        <span>{stats.characters} chars</span>
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
    case "link":
      return (
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
          <path
            d="M8.5 6.5 10 5a3.2 3.2 0 0 1 4.5 4.5L13 11"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="m11.5 13.5-1.5 1.5A3.2 3.2 0 0 1 5.5 10.5L7 9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
          <path
            d="m8 12 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "grid":
      return (
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
          <path d="M4 5h12M4 10h12M4 15h12M8 5v10" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "flow":
      return (
        <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
          <path d="M5 5h4v4H5zM11 11h4v4h-4zM9 7h2.5v6H11" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    default:
      return <span aria-hidden="true">{icon}</span>;
  }
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" fill="none" aria-hidden="true">
      <path
        d="M5 7a6 6 0 1 1 .6 6.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M5 3v4h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
