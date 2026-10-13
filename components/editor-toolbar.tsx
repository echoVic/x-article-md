"use client";

import { CODE_THEMES } from "@/lib/code-themes";
import { useI18n } from "@/lib/i18n";
import {
  Check,
  ClipboardCopy,
  Download,
  FileText,
  LayoutTemplate,
  ListChecks,
  MoreHorizontal,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { DropdownMenu } from "./ui/dropdown-menu";
import { Select } from "./ui/select";
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

/**
 * Quiet workbench toolbar — 44px neutral strip.
 * Left: saved state + document actions · Center: code-mode segmented ·
 * Right: check / publish / copy-body primary. No editorial serif slogans.
 */
const iconBtn =
  "inline-flex items-center justify-center h-11 w-11 md:h-[30px] md:w-[30px] rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-colors";

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

  const preflightIconColor =
    preflightStatus === "ok"
      ? "text-[var(--success)]"
      : preflightStatus === "warning"
        ? "text-[var(--warning)]"
        : preflightStatus === "blocked"
          ? "text-[var(--danger)]"
          : "text-[var(--muted)]";

  const preflightPulse = preflightStatus === "warning" ? "animate-pulse" : "";
  const preflightRing = showPreflightHint ? "animate-[ring-pulse_1s_ease-in-out_2]" : "";

  const docActions = (
    <>
      <Tooltip content={t.templatePickerTitle}>
        <button type="button" onClick={onTemplates} className={iconBtn} aria-label={t.templatePickerTitle}>
          <LayoutTemplate size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content={t.importFile}>
        <button type="button" onClick={onImport} className={iconBtn} aria-label={t.importFile}>
          <Upload size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content={t.exportFile}>
        <button type="button" onClick={onExport} className={iconBtn} aria-label={t.exportFile}>
          <Download size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content={t.orchestratorTitle}>
        <button
          type="button"
          onClick={onToggleAssets}
          className={`${iconBtn} relative`}
          aria-label={t.orchestratorTitle}
        >
          <FileText size={16} strokeWidth={1.6} aria-hidden="true" />
          {assetsCount > 0 && (
            <span
              className="absolute -top-[2px] -right-[2px] inline-flex items-center justify-center min-w-[15px] h-[15px] px-[3px] rounded-full bg-[var(--accent)] text-white tabular-nums"
              style={{ fontSize: "9px", fontWeight: 600, lineHeight: 1 }}
            >
              {assetsCount}
            </span>
          )}
        </button>
      </Tooltip>
    </>
  );

  return (
    <div className="wb-toolbar flex h-11 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface)] pl-2 pr-2 md:pl-3">
      {/* Left: saved state */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Tooltip content={draftReady ? t.saved : t.loading}>
          <span className="flex items-center gap-[6px] h-11 md:h-auto px-2" role="status">
            <span
              aria-hidden="true"
              className={`inline-block h-[6px] w-[6px] rounded-full ${draftReady ? "" : "animate-pulse"}`}
              style={{ background: draftReady ? "var(--success)" : "var(--warning)" }}
            />
            <span className="text-[12.5px] font-medium leading-none text-[var(--fg)]">
              {draftReady ? t.saved : t.loading}
            </span>
          </span>
        </Tooltip>
        <div className="hidden md:flex items-center">
          <div className="w-px h-4 bg-[var(--border-struct)] mx-1" aria-hidden="true" />
          {docActions}
        </div>
      </div>

      {/* Mobile: doc actions live on the right */}
      <div className="flex items-center gap-0 md:hidden">{docActions}</div>

      {/* Center: code-mode segmented (desktop) */}
      <div className="hidden md:flex flex-1 items-center justify-center gap-2 min-w-0">
        {hasCodeBlocks && (
          <>
            <span className="text-[12.5px] font-medium text-[var(--muted)]">{t.codeBlockLabel}</span>
            <div
              className="flex items-center rounded-[7px] border border-[var(--border-struct)] p-[2px] h-[30px]"
              role="group"
              aria-label={t.codeBlockLabel}
            >
              <button
                type="button"
                onClick={() => onCodeModeChange("quote")}
                aria-pressed={codeMode === "quote"}
                className="h-[26px] px-3 rounded-[5px] text-[12.5px] font-medium transition-colors"
                style={{
                  background: codeMode === "quote" ? "var(--fg)" : "transparent",
                  color: codeMode === "quote" ? "var(--bg)" : "var(--muted)",
                }}
              >
                {t.codeQuote}
              </button>
              <button
                type="button"
                onClick={() => onCodeModeChange("image")}
                aria-pressed={codeMode === "image"}
                className="h-[26px] px-3 rounded-[5px] text-[12.5px] font-medium transition-colors"
                style={{
                  background: codeMode === "image" ? "var(--fg)" : "transparent",
                  color: codeMode === "image" ? "var(--bg)" : "var(--muted)",
                }}
              >
                {t.codeImage}
              </button>
            </div>
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
          </>
        )}
      </div>

      {/* Right: check / publish / copy body (desktop) */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <Tooltip content={t.preflightRun}>
          <button
            type="button"
            onClick={onPreflight}
            aria-label={t.preflightRun}
            className={`inline-flex items-center gap-[6px] h-[32px] px-[10px] rounded-[var(--radius-sm)] border border-[var(--border-struct)] bg-transparent transition-colors hover:border-[var(--fg)] ${preflightIconColor} ${preflightPulse} ${preflightRing}`}
          >
            <ShieldCheck size={14} strokeWidth={1.6} aria-hidden="true" />
            <span className="text-[12.5px] font-medium">{t.preflightRun}</span>
          </button>
        </Tooltip>

        <Tooltip content={t.publishTitle}>
          <button
            type="button"
            onClick={onPublish}
            aria-label={t.publishTitle}
            className="inline-flex items-center gap-[6px] h-[32px] px-[10px] rounded-[var(--radius-sm)] border border-[var(--border-struct)] bg-transparent text-[var(--muted)] transition-colors hover:text-[var(--fg)] hover:border-[var(--fg)]"
          >
            <ListChecks size={14} strokeWidth={1.6} aria-hidden="true" />
            <span className="text-[12.5px] font-medium">{t.publishTitle}</span>
          </button>
        </Tooltip>

        <Tooltip
          content={
            copyState === "body"
              ? t.copied
              : copyState === "manual"
                ? t.selectText
                : t.copyBody
          }
        >
          <button
            type="button"
            onClick={onCopyBody}
            aria-label={t.copyBody}
            className={`inline-flex items-center gap-[6px] h-[32px] px-[14px] rounded-[var(--radius-sm)] transition-colors ${
              copyState === "body"
                ? "bg-[var(--success)] text-white"
                : "bg-[var(--fg)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-[var(--on-accent)]"
            }`}
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {copyState === "body" ? (
              <Check size={14} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <ClipboardCopy size={14} strokeWidth={1.8} aria-hidden="true" />
            )}
            <span>
              {copyState === "body"
                ? t.copied
                : copyState === "manual"
                  ? t.selectText
                  : t.copyBody}
            </span>
          </button>
        </Tooltip>

        <DropdownMenu
          trigger={
            <button type="button" className={iconBtn} aria-label={t.moreActions}>
              <MoreHorizontal size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
          }
          items={[
            {
              label: copyState === "title" ? t.copied : t.copyTitle,
              icon: <ClipboardCopy size={12} strokeWidth={1.6} />,
              onClick: onCopyTitle,
            },
          ]}
        />
      </div>
    </div>
  );
}
