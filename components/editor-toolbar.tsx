"use client";

import { CODE_THEMES } from "@/lib/code-themes";
import { useI18n } from "@/lib/i18n";
import {
  AlignLeft,
  Check,
  ClipboardCopy,
  Download,
  FileText,
  Image,
  LayoutTemplate,
  ListChecks,
  MoreHorizontal,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { DropdownMenu } from "./ui/dropdown-menu";
import { Select } from "./ui/select";
import { ToggleGroup } from "./ui/toggle-group";
import { Tooltip } from "./ui/tooltip";

export type EditorToolbarProps = {
  codeMode: "quote" | "image";
  onCodeModeChange: (mode: "quote" | "image") => void;
  codeThemeId: string;
  onCodeThemeChange: (id: string) => void;
  onImport: () => void;
  onExport: () => void;
  onTemplates: () => void;
  onToggleAssets: () => void;
  onCopyTitle: () => void;
  onCopyBody: () => void;
  onPreflight: () => void;
  onPublish: () => void;
  draftReady: boolean;
  assetsCount: number;
  copyState: "idle" | "title" | "body" | "manual";
  preflightStatus: "ok" | "warning" | "blocked" | null;
  hasCodeBlocks: boolean;
  showPreflightHint: boolean;
};

const iconBtn =
  "inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]";

export function EditorToolbar({
  codeMode,
  onCodeModeChange,
  codeThemeId,
  onCodeThemeChange,
  onImport,
  onExport,
  onTemplates,
  onToggleAssets,
  onCopyTitle,
  onCopyBody,
  onPreflight,
  onPublish,
  draftReady,
  assetsCount,
  copyState,
  preflightStatus,
  hasCodeBlocks,
  showPreflightHint,
}: EditorToolbarProps) {
  const { t } = useI18n();
  const showNudge = copyState === "body";

  const preflightIconColor =
    preflightStatus === "ok" ? "text-[var(--success)]" :
    preflightStatus === "warning" ? "text-[var(--warning)]" :
    preflightStatus === "blocked" ? "text-[var(--danger)]" :
    "text-[var(--muted)]";

  const preflightPulse = preflightStatus === "warning" ? "animate-pulse" : "";
  const preflightRing = showPreflightHint ? "animate-[ring-pulse_1s_ease-in-out_2]" : "";

  return (
    <div className="flex h-10 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] px-3">
      {/* ─── Left: Document management ─── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Tooltip content={t.templatePickerTitle}>
          <button
            type="button"
            onClick={onTemplates}
            className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] text-[11px] font-medium text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all active:scale-[0.97]"
            aria-label={t.templatePickerTitle}
          >
            <LayoutTemplate size={14} strokeWidth={1.8} aria-hidden="true" />
            <span className="hidden lg:inline">{t.templatePickerTitle}</span>
          </button>
        </Tooltip>

        <Tooltip content={t.importFile}>
          <button type="button" onClick={onImport} className={`${iconBtn} hidden lg:inline-flex`} aria-label={t.importFile}>
            <Upload size={14} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </Tooltip>

        <Tooltip content={t.exportFile}>
          <button type="button" onClick={onExport} className={`${iconBtn} hidden lg:inline-flex`} aria-label={t.exportFile}>
            <Download size={14} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </Tooltip>

        <Tooltip content={t.orchestratorTitle}>
          <button
            type="button"
            onClick={onToggleAssets}
            className={`${iconBtn} relative`}
            aria-label={t.orchestratorTitle}
          >
            <FileText size={14} strokeWidth={1.8} aria-hidden="true" />
            {assetsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[14px] h-[14px] px-0.5 rounded-full bg-[var(--accent)] text-[8px] font-semibold text-white tabular-nums">
                {assetsCount}
              </span>
            )}
          </button>
        </Tooltip>

        <Tooltip content={draftReady ? t.saved : t.loading}>
          <span className="inline-flex items-center justify-center w-5 h-8">
            <span className={`w-[6px] h-[6px] rounded-full ${draftReady ? "bg-[var(--success)]" : "bg-[var(--warning)] animate-pulse"}`} />
          </span>
        </Tooltip>
      </div>

      {/* ─── Center: Content config (conditional) ─── */}
      <div className="flex-1 flex items-center justify-center min-w-0 mx-2">
        {hasCodeBlocks ? (
          <div className="flex items-center gap-1.5">
            <ToggleGroup
              value={codeMode}
              onValueChange={(v) => onCodeModeChange(v as "quote" | "image")}
              items={[
                { value: "quote", label: <><AlignLeft size={12} strokeWidth={1.8} aria-hidden="true" className="lg:hidden" /><span className="hidden lg:inline">{t.codeQuote}</span></> },
                { value: "image", label: <><Image size={12} strokeWidth={1.8} aria-hidden="true" className="lg:hidden" /><span className="hidden lg:inline">{t.codeImage}</span></> },
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
          </div>
        ) : (
          <span className="text-[11px] text-[var(--muted)] opacity-60 hidden sm:inline">
            {t.noCodeBlocks}
          </span>
        )}
      </div>

      {/* ─── Right: Publish flow ─── */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Preflight + Publish group */}
        <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-[var(--radius-sm)] bg-[var(--fg-soft)]">
          <Tooltip content={t.preflightRun}>
            <button
              type="button"
              onClick={onPreflight}
              className={`inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-xs)] text-[var(--muted)] hover:text-[var(--fg)] transition-all active:scale-[0.97] ${preflightIconColor} ${preflightPulse} ${preflightRing}`}
              aria-label={t.preflightRun}
            >
              <ShieldCheck size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </Tooltip>

          <Tooltip content={t.publishTitle}>
            <button
              type="button"
              onClick={onPublish}
              className="inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-xs)] text-[var(--muted)] hover:text-[var(--fg)] transition-all active:scale-[0.97]"
              aria-label={t.publishTitle}
            >
              <ListChecks size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </Tooltip>
        </div>

        <div className="w-px h-[18px] bg-[var(--border)] opacity-60 mx-1" />

        {/* Copy Body — primary CTA */}
        <Tooltip content={copyState === "body" ? t.copied : copyState === "manual" ? t.selectText : t.copyBody}>
          <button
            type="button"
            onClick={onCopyBody}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-[0.97] shadow-sm ${
              copyState === "body"
                ? "bg-[var(--success)] text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
            }`}
          >
            {copyState === "body" ? (
              <Check size={12} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <ClipboardCopy size={12} strokeWidth={1.8} aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {copyState === "body"
                ? t.copied
                : copyState === "manual"
                  ? t.selectText
                  : t.copyBody}
            </span>
          </button>
        </Tooltip>

        {/* Nudge chip */}
        {showNudge && (
          <span className="hidden sm:inline-flex items-center px-2 py-[3px] rounded-full bg-[var(--accent-soft)] text-[10px] font-medium text-[var(--accent)] animate-in fade-in slide-in-from-left-2">
            {t.nudgePublish}
          </span>
        )}

        {/* Overflow menu */}
        <DropdownMenu
          trigger={
            <button type="button" className={iconBtn} aria-label="More actions">
              <MoreHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          }
          items={[
            { label: copyState === "title" ? t.copied : t.copyTitle, icon: <ClipboardCopy size={12} strokeWidth={1.8} />, onClick: onCopyTitle },
            { label: t.templatePickerTitle, icon: <LayoutTemplate size={12} strokeWidth={1.8} />, onClick: onTemplates },
            { label: t.importFile, icon: <Upload size={12} strokeWidth={1.8} />, onClick: onImport },
            { label: t.exportFile, icon: <Download size={12} strokeWidth={1.8} />, onClick: onExport },
          ]}
        />
      </div>
    </div>
  );
}
