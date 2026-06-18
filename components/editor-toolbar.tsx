"use client";

import { CODE_THEMES } from "@/lib/code-themes";
import { useI18n } from "@/lib/i18n";
import {
  AlignLeft,
  ClipboardCopy,
  Download,
  FileText,
  Image,
  ListChecks,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Select } from "./ui/select";
import { ToggleGroup } from "./ui/toggle-group";

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
  onPreflight: () => void;
  onPublish: () => void;
  draftReady: boolean;
  assetsCount: number;
  copyState: "idle" | "title" | "body" | "manual";
  preflightStatus: "ok" | "warning" | "blocked" | null;
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
  onPreflight,
  onPublish,
  draftReady,
  assetsCount,
  copyState,
  preflightStatus,
}: EditorToolbarProps) {
  const { t } = useI18n();

  return (
    <div className="flex h-10 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)] px-4">
      {/* Left: mode switch + file actions */}
      <div className="flex items-center gap-[6px]">
        {/* Code mode switch */}
        <ToggleGroup
          value={codeMode}
          onValueChange={(v) => onCodeModeChange(v as "quote" | "image")}
          items={[
            { value: "quote", label: <><AlignLeft size={12} strokeWidth={1.8} aria-hidden="true" /> {t.codeQuote}</> },
            { value: "image", label: <><Image size={12} strokeWidth={1.8} aria-hidden="true" /> {t.codeImage}</> },
          ]}
        />

        {codeMode === "image" && (
          <Select
            value={codeThemeId}
            onValueChange={onCodeThemeChange}
            options={[
              { value: "auto", label: t.codeThemeAuto },
              ...CODE_THEMES.map((theme) => ({ value: theme.id, label: theme.name })),
            ]}
          />
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

      {/* Right: preflight + publish + copy actions */}
      <div className="flex items-center gap-[6px] flex-shrink-0">
        <button
          type="button"
          onClick={onPreflight}
          className="inline-flex items-center gap-[4px] px-2.5 py-[4px] rounded-[var(--radius-sm)] text-[11px] font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
        >
          <ShieldCheck size={12} strokeWidth={1.8} aria-hidden="true" />
          {t.preflightRun}
          {preflightStatus && (
            <span className={`w-[5px] h-[5px] rounded-full ${
              preflightStatus === "ok" ? "bg-[var(--success)]" :
              preflightStatus === "warning" ? "bg-[var(--warning)]" :
              "bg-[var(--danger)]"
            }`} />
          )}
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="inline-flex items-center gap-[4px] px-2.5 py-[4px] rounded-[var(--radius-sm)] text-[11px] font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
        >
          <ListChecks size={12} strokeWidth={1.8} aria-hidden="true" />
          {t.publishTitle}
        </button>

        <div className="w-px h-[14px] bg-[var(--border)]" />

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
