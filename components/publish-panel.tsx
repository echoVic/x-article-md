"use client";

import { useI18n } from "@/lib/i18n";
import type { XArticleAsset } from "@/lib/markdown";
import { Check, Circle, RotateCcw } from "lucide-react";

export type PublishStepStatus = "pending" | "active" | "done" | "skipped";

export type PublishStep = {
  id: "preflight" | "title" | "body" | "assets" | "verify";
  status: PublishStepStatus;
};

export type PublishState = {
  steps: PublishStep[];
  assetChecks: boolean[];
  verified: boolean;
};

export type PublishAction =
  | { type: "PREFLIGHT_DONE" }
  | { type: "TITLE_COPIED" }
  | { type: "BODY_COPIED" }
  | { type: "ASSET_COPIED"; assetIndex: number }
  | { type: "VERIFY_DONE" }
  | { type: "RESET"; assetCount: number };

export const initialPublishState: PublishState = {
  steps: [
    { id: "preflight", status: "active" },
    { id: "title", status: "pending" },
    { id: "body", status: "pending" },
    { id: "assets", status: "pending" },
    { id: "verify", status: "pending" },
  ],
  assetChecks: [],
  verified: false,
};

export function publishReducer(state: PublishState, action: PublishAction): PublishState {
  switch (action.type) {
    case "PREFLIGHT_DONE":
      return updateStep(state, "preflight", "done");
    case "TITLE_COPIED":
      return updateStep(state, "title", "done");
    case "BODY_COPIED":
      return updateStep(state, "body", "done");
    case "ASSET_COPIED": {
      const newChecks = [...state.assetChecks];
      newChecks[action.assetIndex] = true;
      const next = { ...state, assetChecks: newChecks };
      if (newChecks.every(Boolean)) {
        return updateStep(next, "assets", "done");
      }
      return next;
    }
    case "VERIFY_DONE":
      return { ...updateStep(state, "verify", "done"), verified: true };
    case "RESET":
      return {
        ...initialPublishState,
        assetChecks: new Array(action.assetCount).fill(false),
      };
  }
}

function updateStep(state: PublishState, stepId: PublishStep["id"], status: PublishStepStatus): PublishState {
  const steps = state.steps.map((s) => {
    if (s.id === stepId) return { ...s, status };
    return s;
  });
  // Advance next pending step to active
  const doneIndex = steps.findIndex((s) => s.id === stepId);
  if (status === "done" && doneIndex < steps.length - 1) {
    const nextPending = steps.findIndex((s, i) => i > doneIndex && s.status === "pending");
    if (nextPending !== -1) {
      steps[nextPending] = { ...steps[nextPending], status: "active" };
    }
  }
  return { ...state, steps };
}

type PublishPanelProps = {
  state: PublishState;
  assets: XArticleAsset[];
  onPreflight: () => void;
  onCopyTitle: () => void;
  onCopyBody: () => void;
  onAssetCopied: (index: number) => void;
  onVerifyDone: () => void;
  onReset: () => void;
};

export function PublishPanel({
  state,
  assets,
  onPreflight,
  onCopyTitle,
  onCopyBody,
  onAssetCopied,
  onVerifyDone,
  onReset,
}: PublishPanelProps) {
  const { t } = useI18n();

  const allDone = state.steps.every((s) => s.status === "done" || s.status === "skipped");

  return (
    <div className="space-y-1">
      {/* Steps */}
      <div className="space-y-0.5">
        <StepRow
          step={state.steps[0]}
          label={t.publishStepPreflight}
          onAction={onPreflight}
        />
        <StepRow
          step={state.steps[1]}
          label={t.publishStepTitle}
          onAction={onCopyTitle}
        />
        <StepRow
          step={state.steps[2]}
          label={t.publishStepBody}
          onAction={onCopyBody}
        />

        {/* Assets step with sub-items */}
        <div>
          <StepRow
            step={assets.length === 0 ? { ...state.steps[3], status: "skipped" } : state.steps[3]}
            label={assets.length === 0 ? `${t.publishStepAssets} — ${t.publishNoAssets}` : `${t.publishStepAssets} (${assets.length})`}
          />
          {assets.length > 0 && state.steps[3].status !== "pending" && (
            <div className="ml-8 mt-1 space-y-0.5">
              {assets.map((asset, i) => (
                <label
                  key={asset.id}
                  className="flex items-center gap-2 px-2 py-1 rounded-[var(--radius-xs)] hover:bg-[var(--fg-soft)] cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={state.assetChecks[i] ?? false}
                    onChange={() => onAssetCopied(i)}
                    className="w-3.5 h-3.5 rounded accent-[var(--accent)]"
                  />
                  <span className="text-[12px] text-[var(--fg)]">{asset.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <StepRow
          step={state.steps[4]}
          label={t.publishStepVerify}
          onAction={state.steps[4].status === "active" ? onVerifyDone : undefined}
          actionLabel={t.publishVerifyLabel}
          isCheckbox
        />
      </div>

      {/* Done state */}
      {allDone && (
        <div className="mt-4 px-3 py-2 rounded-[var(--radius)] bg-[color-mix(in_oklch,var(--success)_8%,transparent)] text-center">
          <p className="text-sm font-medium text-[var(--success)]">{t.publishDone}</p>
        </div>
      )}

      {/* Reset */}
      <div className="pt-3 border-t border-[var(--border)] mt-4">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] rounded-[var(--radius-sm)] transition-all"
        >
          <RotateCcw size={12} strokeWidth={1.8} />
          {t.publishReset}
        </button>
      </div>
    </div>
  );
}

function StepRow({
  step,
  label,
  onAction,
  actionLabel,
  isCheckbox,
}: {
  step: PublishStep;
  label: string;
  onAction?: () => void;
  actionLabel?: string;
  isCheckbox?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] transition-colors ${
      step.status === "active" ? "bg-[var(--fg-soft)]" : ""
    }`}>
      <StepIcon status={step.status} />
      <span className={`flex-1 text-[13px] ${
        step.status === "done" || step.status === "skipped"
          ? "text-[var(--muted)] line-through"
          : step.status === "active"
            ? "text-[var(--fg)] font-medium"
            : "text-[var(--muted)]"
      }`}>
        {label}
      </span>
      {step.status === "active" && onAction && (
        isCheckbox ? (
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              onChange={onAction}
              className="w-3.5 h-3.5 rounded accent-[var(--accent)]"
            />
            <span className="text-[10px] text-[var(--muted)]">{actionLabel}</span>
          </label>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="px-2 py-0.5 text-[10px] font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-[var(--radius-xs)] transition-colors"
          >
            {actionLabel || label}
          </button>
        )
      )}
    </div>
  );
}

function StepIcon({ status }: { status: PublishStepStatus }) {
  switch (status) {
    case "done":
    case "skipped":
      return <Check size={14} className="text-[var(--success)] flex-shrink-0" />;
    case "active":
      return <Circle size={14} className="text-[var(--accent)] fill-[var(--accent)] flex-shrink-0" />;
    case "pending":
      return <Circle size={14} className="text-[var(--border)] flex-shrink-0" />;
  }
}
