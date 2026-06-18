"use client";

import { Collapsible } from "@/components/ui/collapsible";
import { useI18n } from "@/lib/i18n";
import type { PreflightReport } from "@/lib/preflight";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type PreflightPanelProps = {
  report: PreflightReport | null;
  onJump: (offset: number) => void;
};

export function PreflightPanel({ report, onJump }: PreflightPanelProps) {
  const { t } = useI18n();

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <Info size={40} strokeWidth={0.8} className="text-[var(--border)]" aria-hidden="true" />
        <p className="mt-3 text-sm text-[var(--muted)]">{t.preflightEmpty}</p>
      </div>
    );
  }

  const readyItems = report.items.filter(
    (it) => it.level === "info" && !isAssetItem(it),
  );
  const assetItems = report.items.filter(
    (it) => it.level === "info" && isAssetItem(it),
  );
  const warningItems = report.items.filter((it) => it.level === "warning");
  const errorItems = report.items.filter((it) => it.level === "error");

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] bg-[var(--bg)]">
        <StatusBadge status={report.status} />
        <div className="flex-1 flex items-center gap-3 text-[11px] text-[var(--muted)] tabular-nums">
          <span>{report.summary.readyCount} ready</span>
          <span>{report.summary.assetCount} assets</span>
          {report.summary.warningCount > 0 && (
            <span className="text-[var(--warning)]">{report.summary.warningCount} warnings</span>
          )}
          {report.summary.unsupportedCount > 0 && (
            <span className="text-[var(--danger)]">{report.summary.unsupportedCount} errors</span>
          )}
        </div>
      </div>

      {/* Error items - open by default */}
      {errorItems.length > 0 && (
        <Collapsible
          title={
            <span className="flex items-center gap-2">
              <XCircle size={14} className="text-[var(--danger)]" />
              {t.preflightUnsupported}
              <span className="text-[11px] text-[var(--muted)] tabular-nums">({errorItems.length})</span>
            </span>
          }
          defaultOpen
        >
          <ItemList items={errorItems} onJump={onJump} />
        </Collapsible>
      )}

      {/* Warning items - open by default */}
      {warningItems.length > 0 && (
        <Collapsible
          title={
            <span className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[var(--warning)]" />
              {t.preflightWarnings}
              <span className="text-[11px] text-[var(--muted)] tabular-nums">({warningItems.length})</span>
            </span>
          }
          defaultOpen
        >
          <ItemList items={warningItems} onJump={onJump} />
        </Collapsible>
      )}

      {/* Asset items - collapsed */}
      {assetItems.length > 0 && (
        <Collapsible
          title={
            <span className="flex items-center gap-2">
              <Info size={14} className="text-[var(--accent)]" />
              {t.preflightAssets}
              <span className="text-[11px] text-[var(--muted)] tabular-nums">({assetItems.length})</span>
            </span>
          }
        >
          <ItemList items={assetItems} onJump={onJump} />
        </Collapsible>
      )}

      {/* Ready items - collapsed */}
      {readyItems.length > 0 && (
        <Collapsible
          title={
            <span className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--success)]" />
              {t.preflightReady}
              <span className="text-[11px] text-[var(--muted)] tabular-nums">({readyItems.length})</span>
            </span>
          }
        >
          <ItemList items={readyItems} onJump={onJump} />
        </Collapsible>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PreflightReport["status"] }) {
  const { t } = useI18n();
  const config = {
    ok: { label: t.preflightOk, color: "bg-[var(--success)]", textColor: "text-[var(--success)]" },
    warning: { label: t.preflightHasWarnings, color: "bg-[var(--warning)]", textColor: "text-[var(--warning)]" },
    blocked: { label: t.preflightHasErrors, color: "bg-[var(--danger)]", textColor: "text-[var(--danger)]" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${config.textColor}`}>
      <span className={`w-[6px] h-[6px] rounded-full ${config.color}`} />
      {config.label}
    </span>
  );
}

function ItemList({
  items,
  onJump,
}: {
  items: PreflightReport["items"];
  onJump: (offset: number) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="px-2 py-1 space-y-0.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--fg-soft)] transition-colors"
        >
          <LevelIcon level={item.level} />
          <span className="flex-1 text-[12px] text-[var(--fg)] truncate">
            {item.message}
          </span>
          {item.sourceOffset != null && (
            <button
              type="button"
              onClick={() => onJump(item.sourceOffset!)}
              className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-[var(--radius-xs)] transition-colors"
            >
              {t.preflightJump}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function LevelIcon({ level }: { level: "info" | "warning" | "error" }) {
  const size = 12;
  switch (level) {
    case "info":
      return <CheckCircle2 size={size} className="text-[var(--success)] flex-shrink-0" />;
    case "warning":
      return <AlertTriangle size={size} className="text-[var(--warning)] flex-shrink-0" />;
    case "error":
      return <XCircle size={size} className="text-[var(--danger)] flex-shrink-0" />;
  }
}

function isAssetItem(item: PreflightReport["items"][number]): boolean {
  return (
    item.kind === "mermaid" ||
    item.kind === "table" ||
    item.kind === "tweet" ||
    (item.kind === "code" && item.message.includes("→ PNG"))
  );
}
