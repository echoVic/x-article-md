"use client";

import { useState } from "react";
import type { CodeImageTheme } from "@/lib/code-themes";
import {
  buildOrchestrationAssets,
  downloadAllAssetsAsZip,
  renderAssetToBlob,
  type OrchestrationAsset,
} from "@/lib/asset-orchestrator";
import { copyPngBlob, downloadBlob } from "@/lib/image-copy";
import type { XArticleAsset } from "@/lib/markdown";
import { useI18n } from "@/lib/i18n";
import {
  Code,
  Copy,
  Download,
  Image,
  Link,
  Locate,
  Network,
  RefreshCw,
  Table2,
} from "lucide-react";

type AssetOrchestratorProps = {
  assets: XArticleAsset[];
  assetOffsets: number[];
  codeTheme: CodeImageTheme;
  coverBlob: Blob | null;
  onJumpToSource: (offset: number) => void;
};

export function AssetOrchestrator({
  assets,
  assetOffsets,
  codeTheme,
  coverBlob,
  onJumpToSource,
}: AssetOrchestratorProps) {
  const { t } = useI18n();
  const orchestrated = buildOrchestrationAssets(assets, assetOffsets, coverBlob);
  const [renderStates, setRenderStates] = useState<
    Record<string, "idle" | "rendering" | "ready" | "error">
  >({});
  const [blobs, setBlobs] = useState<Record<string, Blob>>({});

  if (orchestrated.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Image size={40} strokeWidth={0.8} className="text-[var(--border)]" aria-hidden="true" />
        <p className="mt-3 text-sm text-[var(--muted)]">{t.orchestratorEmpty}</p>
      </div>
    );
  }

  const coverAssets = orchestrated.filter((a) => a.type === "cover");
  const contentAssets = orchestrated.filter((a) => a.type !== "cover");

  async function handleRender(asset: OrchestrationAsset) {
    setRenderStates((prev) => ({ ...prev, [asset.id]: "rendering" }));
    try {
      const blob = await renderAssetToBlob(asset, codeTheme);
      setBlobs((prev) => ({ ...prev, [asset.id]: blob }));
      setRenderStates((prev) => ({ ...prev, [asset.id]: "ready" }));
    } catch {
      setRenderStates((prev) => ({ ...prev, [asset.id]: "error" }));
    }
  }

  async function handleCopy(asset: OrchestrationAsset) {
    let blob = blobs[asset.id] ?? asset.renderedBlob;
    if (!blob) {
      setRenderStates((prev) => ({ ...prev, [asset.id]: "rendering" }));
      try {
        blob = await renderAssetToBlob(asset, codeTheme);
        setBlobs((prev) => ({ ...prev, [asset.id]: blob! }));
        setRenderStates((prev) => ({ ...prev, [asset.id]: "ready" }));
      } catch {
        setRenderStates((prev) => ({ ...prev, [asset.id]: "error" }));
        return;
      }
    }
    await copyPngBlob(blob);
  }

  async function handleDownload(asset: OrchestrationAsset) {
    let blob = blobs[asset.id] ?? asset.renderedBlob;
    if (!blob) {
      setRenderStates((prev) => ({ ...prev, [asset.id]: "rendering" }));
      try {
        blob = await renderAssetToBlob(asset, codeTheme);
        setBlobs((prev) => ({ ...prev, [asset.id]: blob! }));
        setRenderStates((prev) => ({ ...prev, [asset.id]: "ready" }));
      } catch {
        setRenderStates((prev) => ({ ...prev, [asset.id]: "error" }));
        return;
      }
    }
    const filename = asset.label.replace(/[^a-zA-Z0-9_-]/g, "-") + ".png";
    downloadBlob(blob, filename);
  }

  async function handleReRenderAll() {
    const renderable = orchestrated.filter((a) => a.type !== "tweet");
    for (const asset of renderable) {
      await handleRender(asset);
    }
  }

  async function handleDownloadZip() {
    const assetsWithBlobs = orchestrated.map((a) => ({
      ...a,
      renderedBlob: blobs[a.id] ?? a.renderedBlob,
    }));
    await downloadAllAssetsAsZip(assetsWithBlobs, codeTheme);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto divide-y divide-[var(--border)]">
        {coverAssets.length > 0 && (
          <section className="p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
              {t.orchestratorCover}
            </h3>
            {coverAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                renderState={renderStates[asset.id] ?? (asset.renderedBlob ? "ready" : "idle")}
                onCopy={() => handleCopy(asset)}
                onDownload={() => handleDownload(asset)}
                onReRender={() => handleRender(asset)}
                onJump={null}
              />
            ))}
          </section>
        )}

        {contentAssets.length > 0 && (
          <section className="p-4">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">
              {t.orchestratorContentAssets}
              <span className="ml-2 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--accent-soft)] text-[10px] font-semibold text-[var(--accent)] tabular-nums">
                {contentAssets.length}
              </span>
            </h3>
            <div className="space-y-2">
              {contentAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  renderState={renderStates[asset.id] ?? "idle"}
                  onCopy={asset.type !== "tweet" ? () => handleCopy(asset) : null}
                  onDownload={asset.type !== "tweet" ? () => handleDownload(asset) : null}
                  onReRender={asset.type !== "tweet" ? () => handleRender(asset) : null}
                  onJump={asset.sourceOffset != null ? () => onJumpToSource(asset.sourceOffset!) : null}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {orchestrated.some((a) => a.type !== "tweet") && (
        <div className="flex items-center gap-2 border-t border-[var(--border)] px-4 py-3">
          <button
            type="button"
            onClick={handleDownloadZip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white text-[11px] font-medium hover:bg-[var(--accent-hover)] transition-all active:scale-[0.97]"
          >
            <Download size={12} strokeWidth={1.8} aria-hidden="true" />
            {t.orchestratorDownloadZip}
          </button>
          <button
            type="button"
            onClick={handleReRenderAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] text-[var(--fg)] text-[11px] font-medium hover:bg-[var(--fg-soft)] transition-all active:scale-[0.97]"
          >
            <RefreshCw size={12} strokeWidth={1.8} aria-hidden="true" />
            {t.orchestratorReRenderAll}
          </button>
        </div>
      )}
    </div>
  );
}

const TYPE_ICON: Record<OrchestrationAsset["type"], React.ComponentType<{ size: number; strokeWidth: number; className?: string }>> = {
  code: Code,
  mermaid: Network,
  table: Table2,
  tweet: Link,
  cover: Image,
};

function AssetCard({
  asset,
  renderState,
  onCopy,
  onDownload,
  onReRender,
  onJump,
}: {
  asset: OrchestrationAsset;
  renderState: "idle" | "rendering" | "ready" | "error";
  onCopy: (() => void) | null;
  onDownload: (() => void) | null;
  onReRender: (() => void) | null;
  onJump: (() => void) | null;
}) {
  const { t } = useI18n();
  const Icon = TYPE_ICON[asset.type];

  return (
    <div className="flex items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--accent-soft)] flex-shrink-0">
        <Icon size={14} strokeWidth={1.8} className="text-[var(--accent)]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--fg)] truncate">{asset.label}</p>
        <StatusBadge state={renderState} />
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {onJump && (
          <IconButton onClick={onJump} title={t.orchestratorJump}>
            <Locate size={13} strokeWidth={1.6} />
          </IconButton>
        )}
        {onReRender && (
          <IconButton onClick={onReRender} title={t.orchestratorReRender} disabled={renderState === "rendering"}>
            <RefreshCw size={13} strokeWidth={1.6} className={renderState === "rendering" ? "animate-spin" : ""} />
          </IconButton>
        )}
        {onCopy && (
          <IconButton onClick={onCopy} title="Copy">
            <Copy size={13} strokeWidth={1.6} />
          </IconButton>
        )}
        {onDownload && (
          <IconButton onClick={onDownload} title="Download">
            <Download size={13} strokeWidth={1.6} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: "idle" | "rendering" | "ready" | "error" }) {
  const { t } = useI18n();
  if (state === "idle") return null;

  const config = {
    rendering: { color: "text-[var(--warning)]", label: t.orchestratorRendering },
    ready: { color: "text-[var(--success)]", label: t.orchestratorReady },
    error: { color: "text-[var(--danger)]", label: t.orchestratorError },
  }[state];

  return (
    <span className={`text-[10px] font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}

function IconButton({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center justify-center w-6 h-6 rounded-[var(--radius-xs)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] transition-all active:scale-[0.93] disabled:opacity-40 disabled:pointer-events-none"
    >
      {children}
    </button>
  );
}
