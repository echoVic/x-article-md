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

/**
 * Editorial workbench toolbar.
 *
 * Design intent: this is the strip between masthead and manuscript. It should
 * read like a compositor's rail — mono metadata on the left, hairline dividers,
 * the ink CTA on the right. No SaaS blues, no chip-shaped everything.
 */
const iconBtn =
  "inline-flex items-center justify-center w-[26px] h-[26px] rounded-[var(--radius-xs)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]";

const mono = {
  fontFamily: "var(--font-geist-mono)",
  fontSize: "10px",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  lineHeight: 1,
};

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
    preflightStatus === "ok"
      ? "text-[var(--success)]"
      : preflightStatus === "warning"
        ? "text-[var(--warning)]"
        : preflightStatus === "blocked"
          ? "text-[var(--danger)]"
          : "text-[var(--muted)]";

  const preflightPulse = preflightStatus === "warning" ? "animate-pulse" : "";
  const preflightRing = showPreflightHint ? "animate-[ring-pulse_1s_ease-in-out_2]" : "";

  return (
    <div className="flex h-11 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)] pl-4 pr-3">
      {/* ─── Left: Manuscript state + document actions ─── */}
      <div className="flex items-center gap-[14px] flex-shrink-0 min-w-0">
        {/* Running slug: "Manuscript · Draft ready" */}
        <div className="flex items-baseline gap-[8px]">
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
          <span className="text-[var(--fg)]" style={mono}>
            Manuscript
          </span>
          <Tooltip content={draftReady ? t.saved : t.loading}>
            <span
              className="inline-flex items-baseline gap-[6px]"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: "12.5px",
                letterSpacing: "-0.005em",
                lineHeight: 1,
                color: draftReady ? "var(--muted)" : "var(--warning)",
              }}
            >
              <span
                aria-hidden="true"
                className={draftReady ? "" : "animate-pulse"}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: draftReady ? "var(--success)" : "var(--warning)",
                  display: "inline-block",
                  transform: "translateY(-2px)",
                }}
              />
              {draftReady ? "draft ready" : "loading…"}
            </span>
          </Tooltip>
        </div>

        <div className="w-px h-[16px] bg-[var(--border)]" aria-hidden="true" />

        {/* Document actions — small text buttons, mono */}
        <div className="flex items-center gap-[2px]">
          <Tooltip content={t.templatePickerTitle}>
            <button
              type="button"
              onClick={onTemplates}
              className="hidden md:inline-flex items-center gap-[6px] px-[8px] h-[26px] rounded-[var(--radius-xs)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
              aria-label={t.templatePickerTitle}
              style={mono}
            >
              <LayoutTemplate size={13} strokeWidth={1.6} aria-hidden="true" />
              <span className="hidden lg:inline">{t.templatePickerTitle}</span>
            </button>
          </Tooltip>

          <Tooltip content={t.importFile}>
            <button
              type="button"
              onClick={onImport}
              className={`${iconBtn} hidden lg:inline-flex`}
              aria-label={t.importFile}
            >
              <Upload size={13} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </Tooltip>

          <Tooltip content={t.exportFile}>
            <button
              type="button"
              onClick={onExport}
              className={`${iconBtn} hidden lg:inline-flex`}
              aria-label={t.exportFile}
            >
              <Download size={13} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </Tooltip>

          <Tooltip content={t.orchestratorTitle}>
            <button
              type="button"
              onClick={onToggleAssets}
              className={`${iconBtn} relative`}
              aria-label={t.orchestratorTitle}
            >
              <FileText size={13} strokeWidth={1.6} aria-hidden="true" />
              {assetsCount > 0 && (
                <span
                  className="absolute -top-[3px] -right-[3px] inline-flex items-center justify-center min-w-[14px] h-[14px] px-[3px] rounded-full bg-[var(--accent)] text-white tabular-nums"
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "8.5px",
                    letterSpacing: "0.02em",
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {assetsCount}
                </span>
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ─── Center: Content config (conditional) ─── */}
      <div className="flex-1 flex items-center justify-center min-w-0 mx-2">
        {hasCodeBlocks ? (
          <div className="flex items-center gap-[10px]">
            <span className="hidden md:inline text-[var(--muted)]" style={mono}>
              Code block
            </span>
            <ToggleGroup
              value={codeMode}
              onValueChange={(v) => onCodeModeChange(v as "quote" | "image")}
              items={[
                {
                  value: "quote",
                  label: (
                    <>
                      <AlignLeft size={12} strokeWidth={1.6} aria-hidden="true" className="lg:hidden" />
                      <span className="hidden lg:inline">{t.codeQuote}</span>
                    </>
                  ),
                },
                {
                  value: "image",
                  label: (
                    <>
                      <Image size={12} strokeWidth={1.6} aria-hidden="true" className="lg:hidden" />
                      <span className="hidden lg:inline">{t.codeImage}</span>
                    </>
                  ),
                },
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
          <span
            className="hidden sm:inline text-[var(--muted)] opacity-70"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "13px",
              letterSpacing: "-0.005em",
              lineHeight: 1,
            }}
          >
            {t.noCodeBlocks}
          </span>
        )}
      </div>

      {/* ─── Right: Preflight + Publish ─── */}
      <div className="flex items-center gap-[8px] flex-shrink-0">
        {/* Preflight — quiet secondary */}
        <Tooltip content={t.preflightRun}>
          <button
            type="button"
            onClick={onPreflight}
            className={`inline-flex items-center gap-[6px] h-[26px] px-[10px] rounded-[var(--radius-xs)] border border-[var(--border)] bg-transparent transition-all active:scale-[0.97] hover:border-[var(--fg)] ${preflightIconColor} ${preflightPulse} ${preflightRing}`}
            aria-label={t.preflightRun}
            style={mono}
          >
            <ShieldCheck size={12} strokeWidth={1.6} aria-hidden="true" />
            <span className="hidden md:inline">{t.preflightRun}</span>
          </button>
        </Tooltip>

        {/* Publish checklist — quiet secondary */}
        <Tooltip content={t.publishTitle}>
          <button
            type="button"
            onClick={onPublish}
            className="inline-flex items-center gap-[6px] h-[26px] px-[10px] rounded-[var(--radius-xs)] border border-[var(--border)] bg-transparent text-[var(--muted)] transition-all active:scale-[0.97] hover:text-[var(--fg)] hover:border-[var(--fg)]"
            aria-label={t.publishTitle}
            style={mono}
          >
            <ListChecks size={12} strokeWidth={1.6} aria-hidden="true" />
            <span className="hidden md:inline">{t.publishTitle}</span>
          </button>
        </Tooltip>

        <div className="w-px h-[16px] bg-[var(--border)] mx-[2px]" aria-hidden="true" />

        {/* Copy Body — the ink CTA */}
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
            className={`inline-flex items-center gap-[8px] h-[28px] pl-[14px] pr-[14px] rounded-[var(--radius-xs)] transition-all active:scale-[0.97] ${
              copyState === "body"
                ? "bg-[var(--success)] text-white"
                : "bg-[var(--fg)] text-[var(--bg)] hover:bg-[var(--accent)] hover:text-white"
            }`}
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "10.5px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            {copyState === "body" ? (
              <Check size={12} strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <ClipboardCopy size={12} strokeWidth={1.8} aria-hidden="true" />
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

        {/* Nudge — italic serif pull-note */}
        {showNudge && (
          <span
            className="hidden sm:inline-flex items-baseline gap-[6px] px-[8px] text-[var(--accent)] animate-in fade-in slide-in-from-left-2"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "13px",
              letterSpacing: "-0.005em",
              lineHeight: 1,
            }}
          >
            →&nbsp;{t.nudgePublish}
          </span>
        )}

        {/* Overflow */}
        <DropdownMenu
          trigger={
            <button type="button" className={iconBtn} aria-label="More actions">
              <MoreHorizontal size={13} strokeWidth={1.6} aria-hidden="true" />
            </button>
          }
          items={[
            {
              label: copyState === "title" ? t.copied : t.copyTitle,
              icon: <ClipboardCopy size={12} strokeWidth={1.6} />,
              onClick: onCopyTitle,
            },
            {
              label: t.templatePickerTitle,
              icon: <LayoutTemplate size={12} strokeWidth={1.6} />,
              onClick: onTemplates,
            },
            { label: t.importFile, icon: <Upload size={12} strokeWidth={1.6} />, onClick: onImport },
            { label: t.exportFile, icon: <Download size={12} strokeWidth={1.6} />, onClick: onExport },
          ]}
        />
      </div>
    </div>
  );
}
