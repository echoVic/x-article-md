"use client";

import { CODE_THEMES } from "@/lib/code-themes";
import { useI18n } from "@/lib/i18n";
import {
  AlignLeft,
  ClipboardCopy,
  Download,
  FileText,
  Image,
  Upload,
} from "lucide-react";

export type EditorToolbarProps = {
  codeMode: "quote" | "image";
  onCodeModeChange: (mode: "quote" | "image") => void;
  codeThemeId: string;
  onCodeThemeChange: (id: string) => void;
  onImport: () => void;
  onExport: () => void;
  onToggleAssets: () => void;
  onToggleCover: () => void;
  onCopyTitle: () => void;
  onCopyBody: () => void;
  draftReady: boolean;
  assetsCount: number;
  copyState: "idle" | "title" | "body" | "manual";
};

export function EditorToolbar({
  codeMode,
  onCodeModeChange,
  codeThemeId,
  onCodeThemeChange,
  onImport,
  onExport,
  onToggleAssets,
  onToggleCover,
  onCopyTitle,
  onCopyBody,
  draftReady,
  assetsCount,
  copyState,
}: EditorToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="flex h-10 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)] px-4">
      {/* Left: mode switch + file actions */}
      <div className="flex items-center gap-[6px]">
        {/* Code mode switch */}
        <div className="flex items-center bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-[2px] gap-[2px]">
          <button
            type="button"
            onClick={() => onCodeModeChange("quote")}
            className={`flex items-center gap-[4px] px-2.5 py-[3px] rounded-[var(--radius-sm)] text-[11px] font-medium transition-all ${
              codeMode === "quote"
                ? "bg-[var(--bg)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            <AlignLeft size={12} strokeWidth={1.8} aria-hidden="true" />
            {t.codeQuote}
          </button>
          <button
            type="button"
            onClick={() => onCodeModeChange("image")}
            className={`flex items-center gap-[4px] px-2.5 py-[3px] rounded-[var(--radius-sm)] text-[11px] font-medium transition-all ${
              codeMode === "image"
                ? "bg-[var(--bg)] text-[var(--fg)] shadow-[var(--shadow-sm)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            <Image size={12} strokeWidth={1.8} aria-hidden="true" />
            {t.codeImage}
          </button>
        </div>

        {codeMode === "image" && (
          <select
            value={codeThemeId}
            onChange={(e) => onCodeThemeChange(e.target.value)}
            className="h-[26px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-[11px] font-medium text-[var(--fg)] outline-none focus:border-[var(--accent)]"
          >
            <option value="auto">{t.codeThemeAuto}</option>
            {CODE_THEMES.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        )}

        <div className="w-px h-[14px] bg-[var(--border)]" />

        <button
          type="button"
          onClick={onImport}
          className="inline-flex items-center gap-[4px] px-2.5 py-[4px] rounded-[var(--radius-sm)] text-[11px] font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
        >
          <Upload size={12} strokeWidth={1.8} aria-hidden="true" />
          {t.importFile}
        </button>
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-[4px] px-2.5 py-[4px] rounded-[var(--radius-sm)] text-[11px] font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
        >
          <Download size={12} strokeWidth={1.8} aria-hidden="true" />
          {t.exportFile}
        </button>

        <div className="w-px h-[14px] bg-[var(--border)]" />

        <button
          type="button"
          onClick={onToggleAssets}
          className={`inline-flex items-center gap-[4px] px-2.5 py-[4px] rounded-[var(--radius-sm)] text-[11px] font-medium transition-all active:scale-[0.97] ${
            assetsCount > 0
              ? "text-[var(--fg)] hover:bg-[var(--fg-soft)]"
              : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)]"
          }`}
        >
          <FileText size={12} strokeWidth={1.8} aria-hidden="true" />
          {t.assetsTitle}
          {assetsCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full bg-[var(--accent)] text-[9px] font-semibold text-white tabular-nums">{assetsCount}</span>
          )}
        </button>
        <button
          type="button"
          onClick={onToggleCover}
          className="inline-flex items-center gap-[4px] px-2.5 py-[4px] rounded-[var(--radius-sm)] text-[11px] font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
        >
          <Image size={12} strokeWidth={1.8} aria-hidden="true" />
          {t.coverTitle}
        </button>

        <div className="w-px h-[14px] bg-[var(--border)]" />

        <span className="flex items-center gap-[4px] font-mono text-[10px] text-[var(--muted)]">
          <span className="w-[5px] h-[5px] rounded-full bg-[var(--success)]" />
          {draftReady ? t.saved : t.loading}
        </span>
      </div>

      {/* Right: copy actions */}
      <div className="flex items-center gap-[6px] flex-shrink-0">
        <button
          type="button"
          onClick={onCopyTitle}
          className="inline-flex items-center gap-[4px] px-2.5 py-[4px] rounded-[var(--radius-sm)] text-[11px] font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
        >
          <ClipboardCopy size={12} strokeWidth={1.8} aria-hidden="true" />
          {copyState === "title" ? t.copied : t.copyTitle}
        </button>
        <button
          type="button"
          onClick={onCopyBody}
          className="inline-flex items-center gap-[4px] px-2.5 py-[4px] rounded-[var(--radius-sm)] bg-[var(--accent)] text-white text-[11px] font-medium hover:bg-[var(--accent-hover)] transition-all active:scale-[0.97]"
        >
          <ClipboardCopy size={12} strokeWidth={1.8} aria-hidden="true" />
          {copyState === "body"
            ? t.copied
            : copyState === "manual"
              ? t.selectText
              : t.copyBody}
        </button>
      </div>
    </div>
  );
}
