"use client";

import { useEffect, useRef, useState } from "react";
import type { CodeImageTheme } from "@/lib/code-themes";
import { buildOrchestrationAssets, downloadAllAssetsAsZip, renderAssetToBlob, type OrchestrationAsset } from "@/lib/asset-orchestrator";
import { copyPngBlob, downloadBlob } from "@/lib/image-copy";
import { trackEvent } from "@/lib/analytics";
import type { XArticleAsset } from "@/lib/markdown";
import { useI18n } from "@/lib/i18n";
import { Image as ImageIcon } from "lucide-react";

type AssetOrchestratorProps = {
  assets: XArticleAsset[];
  assetOffsets: number[];
  codeTheme: CodeImageTheme;
  coverBlob: Blob | null;
  onJumpToSource: (offset: number) => void;
};

// A changed document/theme gets a new session, including A → B → A. Old async
// work may finish but cannot update state, copy, or initiate a download.
export function AssetOrchestrator(props: AssetOrchestratorProps) {
  return <AssetSession key={JSON.stringify([props.assets, props.assetOffsets, props.codeTheme])} {...props} />;
}

type Result = { state: "rendering" | "ready" | "error"; error?: string; notice?: string };

function AssetSession({ assets, assetOffsets, codeTheme, coverBlob, onJumpToSource }: AssetOrchestratorProps) {
  const { t } = useI18n();
  const orchestrated = buildOrchestrationAssets(assets, assetOffsets, coverBlob);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [busy, setBusy] = useState(false);
  const [batchMessage, setBatchMessage] = useState("");
  const cache = useRef(new Map<string, Blob>());
  const active = useRef(false);
  const mounted = useRef(false);
  const cancellations = useRef(new Set<() => void>());
  useEffect(() => {
    mounted.current = true;
    const pending = cancellations.current;
    return () => { mounted.current = false; for (const cancel of pending) cancel(); pending.clear(); };
  }, []);

  function update(id: string, result: Result) {
    if (mounted.current) setResults(previous => ({ ...previous, [id]: result }));
  }

  async function getBlob(asset: OrchestrationAsset, force = false): Promise<Blob | null> {
    if (!mounted.current) return null;
    if (asset.type === "cover") return asset.renderedBlob ?? null;
    if (!force && cache.current.has(asset.id)) return cache.current.get(asset.id)!;
    cache.current.delete(asset.id);
    update(asset.id, { state: "rendering" });
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancel = () => {};
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Render timed out (20s)")), 20_000);
      cancel = () => { clearTimeout(timer); reject(new Error("Render cancelled")); };
      cancellations.current.add(cancel);
    });
    try {
      const blob = await Promise.race([renderAssetToBlob(asset, codeTheme), deadline]);
      if (!mounted.current) return null;
      cache.current.set(asset.id, blob);
      update(asset.id, { state: "ready" });
      return blob;
    } catch (error) {
      update(asset.id, { state: "error", error: error instanceof Error ? error.message.slice(0, 600) : String(error).slice(0, 600) });
      return null;
    } finally {
      clearTimeout(timer);
      cancellations.current.delete(cancel);
    }
  }

  // One synchronous admission gate for all asset operations; UI disabling alone
  // would still allow overlapping render/copy/download before React re-renders.
  async function run(action: () => Promise<void>) {
    if (active.current || !mounted.current) return;
    active.current = true;
    setBusy(true);
    setBatchMessage("");
    try { await action(); }
    catch { if (mounted.current) setBatchMessage(t.assetBatchError); }
    finally {
      active.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function handleAsset(asset: OrchestrationAsset, action: "render" | "copy" | "download") {
    await run(async () => {
      const blob = await getBlob(asset, action === "render");
      if (!mounted.current) return;
      if (!blob) {
        if (action !== "render") trackEvent(action === "copy" ? "asset_copy" : "asset_download", { type: asset.type, theme: codeTheme.id, surface: "assets_panel", ok: false });
        return;
      }
      if (action === "render") return;
      if (action === "copy") {
        let ok = false;
        try { ok = await copyPngBlob(blob); } catch { /* keep the image available for download */ }
        if (!mounted.current) return;
        update(asset.id, { state: "ready", notice: ok ? t.copied : t.assetCopyError });
        trackEvent("asset_copy", { type: asset.type, theme: codeTheme.id, surface: "assets_panel", ok });
      } else {
        try {
          downloadBlob(blob, asset.label.replace(/[^a-zA-Z0-9_-]/g, "-") + ".png");
          update(asset.id, { state: "ready", notice: t.assetDownloaded });
          trackEvent("asset_download", { type: asset.type, theme: codeTheme.id, surface: "assets_panel", ok: true });
        } catch (error) {
          update(asset.id, { state: "ready", notice: error instanceof Error ? error.message : t.assetsFailed });
        }
      }
    });
  }

  async function handleBatch(zip: boolean) {
    await run(async () => {
      const ready: OrchestrationAsset[] = [];
      let failed = false;
      for (const asset of orchestrated.filter(item => item.type !== "tweet")) {
        const blob = await getBlob(asset, !zip);
        if (!mounted.current) return;
        if (blob) ready.push({ ...asset, renderedBlob: blob });
        else failed = true;
      }
      if (failed) { setBatchMessage(t.assetBatchError); return; }
      if (zip) {
        await downloadAllAssetsAsZip(ready, codeTheme, () => mounted.current);
        if (!mounted.current) return;
        trackEvent("asset_zip_download", { count: ready.length, theme: codeTheme.id, ok: true });
      }
      setBatchMessage(zip ? t.assetDownloaded : t.assetBatchDone);
    });
  }

  if (!orchestrated.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ImageIcon size={40} strokeWidth={0.8} aria-hidden="true" />
      <p className="mt-3 text-sm text-[var(--muted)]">{t.orchestratorEmpty}</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-[var(--muted)]">{t.orchestratorContentAssets} ({assets.length})</h3>
        {orchestrated.map(asset => {
          const result = results[asset.id];
          const source = assetSource(asset);
          return (
            <section key={asset.id} aria-label={asset.label} className="space-y-2 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="min-w-0 break-words text-sm font-medium">{asset.label}</h4>
                <span role="status" className="text-xs text-[var(--muted)]">{result?.state === "rendering" ? t.orchestratorRendering : result?.state === "ready" ? t.orchestratorReady : result?.state === "error" ? t.orchestratorError : ""}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {asset.sourceOffset != null && <Action onClick={() => onJumpToSource(asset.sourceOffset!)}>{t.orchestratorJump}</Action>}
                {asset.type !== "tweet" && <>
                  <Action disabled={busy} onClick={() => handleAsset(asset, "render")}>{result?.state === "error" ? t.assetRetry : t.orchestratorReRender}</Action>
                  <Action disabled={busy} onClick={() => handleAsset(asset, "copy")}>{t.assetsCopyImage}</Action>
                  <Action disabled={busy} onClick={() => handleAsset(asset, "download")}>{t.assetsDownloadPng}</Action>
                </>}
              </div>
              {result?.state === "error" && (
                <div role="alert" className="space-y-2 text-xs leading-5 text-[var(--danger)]">
                  <p>{t.assetRenderError}</p>
                  <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words">{result.error}</pre>
                  {source && <SourceFallback source={source} />}
                </div>
              )}
              {result?.notice && <p role="status" className="text-xs leading-5 text-[var(--muted)]">{result.notice}</p>}
              {asset.type === "tweet" && <p className="break-all text-xs text-[var(--muted)]">{asset.url}</p>}
            </section>
          );
        })}
      </div>
      {orchestrated.some(asset => asset.type !== "tweet") && <div className="space-y-2 border-t border-[var(--border)] p-4">
        <div className="flex flex-wrap gap-2">
          <Action disabled={busy} onClick={() => handleBatch(true)}>{t.orchestratorDownloadZip}</Action>
          <Action disabled={busy} onClick={() => handleBatch(false)}>{t.orchestratorReRenderAll}</Action>
        </div>
        <p role="status" className="text-xs leading-5 text-[var(--muted)]">{busy ? t.assetWorking : batchMessage}</p>
      </div>}
    </div>
  );
}

function assetSource(asset: OrchestrationAsset): string {
  if (asset.code !== undefined) return asset.code;
  if (asset.headers) return [
    `| ${asset.headers.join(" | ")} |`,
    `| ${asset.headers.map((_, index) => asset.alignments?.[index] === "right" ? "---:" : asset.alignments?.[index] === "center" ? ":---:" : "---").join(" | ")} |`,
    ...(asset.rows ?? []).map(row => `| ${row.join(" | ")} |`),
  ].join("\n");
  return asset.url ?? "";
}

function SourceFallback({ source }: { source: string }) {
  const { t } = useI18n();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const alive = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  return <div className="space-y-2 text-[var(--fg)]">
    <label className="block">{t.assetSource}<textarea ref={ref} readOnly value={source} rows={4} className="mt-1 w-full rounded border border-[var(--border)] bg-[var(--surface)] p-2 font-mono" /></label>
    <Action onClick={async () => {
      ref.current?.focus(); ref.current?.select();
      try { await navigator.clipboard.writeText(source); if (alive.current) setCopied(true); } catch { if (alive.current) setCopied(false); }
    }}>{copied ? t.assetSourceCopied : t.assetCopySource}</Action>
  </div>;
}

function Action({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="min-h-11 rounded-[var(--radius-sm)] border border-[var(--border)] px-2.5 text-xs text-[var(--fg)] transition-colors hover:bg-[var(--fg-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] disabled:opacity-40">{children}</button>;
}
