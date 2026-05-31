"use client";

import { useState } from "react";
import {
  copyCodeImage,
  copyPngBlob,
  copyTableImage,
  downloadBlob,
  downloadCodeImage,
  downloadTableImage,
  renderSvgToPng,
} from "@/lib/image-copy";
import type { XArticleAsset } from "@/lib/markdown";
import { useI18n } from "@/lib/i18n";

type ArticleAssetsProps = {
  assets: XArticleAsset[];
  inline?: boolean;
};

type ActionState = "idle" | "done" | "failed";

export function ArticleAssets({ assets, inline }: ArticleAssetsProps) {
  const { t } = useI18n();

  if (assets.length === 0) {
    return null;
  }

  if (inline) {
    return (
      <div className="divide-y divide-[var(--border)]">
        {assets.map((asset) => (
          <AssetRow key={asset.placeholder} asset={asset} />
        ))}
      </div>
    );
  }

  return (
    <aside className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex items-center justify-between px-4 h-10 border-b border-[var(--border)]">
        <span className="text-xs font-medium text-[var(--muted)]">{t.assetsTitle}</span>
        <span className="font-mono text-[10px] text-[var(--muted)] tabular-nums">{assets.length}</span>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {assets.map((asset) => (
          <AssetRow key={asset.placeholder} asset={asset} />
        ))}
      </div>
    </aside>
  );
}

function AssetRow({ asset }: { asset: XArticleAsset }) {
  const { t } = useI18n();
  const [placeholderState, setPlaceholderState] =
    useState<ActionState>("idle");
  const [imageState, setImageState] = useState<ActionState>("idle");
  const [downloadState, setDownloadState] = useState<ActionState>("idle");

  function reset(setter: (state: ActionState) => void) {
    window.setTimeout(() => setter("idle"), 1600);
  }

  function copyPlaceholder() {
    const ok = copyText(asset.placeholder);
    setPlaceholderState(ok ? "done" : "failed");
    reset(setPlaceholderState);
  }

  async function copyImage() {
    if (asset.type === "tweet") {
      const ok = copyText(asset.url);
      setImageState(ok ? "done" : "failed");
      reset(setImageState);
      return;
    }

    const ok = await copyImageAsset(asset);
    setImageState(ok ? "done" : "failed");
    reset(setImageState);
  }

  async function downloadImage() {
    try {
      const filename = `${asset.placeholder.toLowerCase()}-${asset.type}.png`;
      if (asset.type === "code") {
        await downloadCodeImage(asset.code, asset.language ?? "", filename);
      } else if (asset.type === "table") {
        await downloadTableImage(asset.headers, asset.rows, filename);
      } else if (asset.type === "tweet") {
        const ok = copyText(asset.url);
        if (!ok) throw new Error("Copy blocked.");
      } else {
        downloadBlob(await renderMermaidToPng(asset.code), filename);
      }
      setDownloadState("done");
    } catch {
      setDownloadState("failed");
    }
    reset(setDownloadState);
  }

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-[var(--radius-xs)] bg-[var(--fg-soft)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--fg)]">
            {asset.placeholder}
          </code>
          <span className="text-xs font-medium text-[var(--fg)]">
            {asset.label}
          </span>
        </div>
        <p className="mt-1 truncate font-mono text-[11px] text-[var(--muted)]">
          {assetDescription(asset)}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {asset.type === "tweet" ? null : (
          <AssetButton onClick={copyPlaceholder} state={placeholderState}>
            {t.assetsPlaceholder}
          </AssetButton>
        )}
        {asset.type === "tweet" ? null : (
          <AssetButton onClick={downloadImage} state={downloadState}>
            {t.assetsDownloadPng}
          </AssetButton>
        )}
        <AssetButton onClick={copyImage} state={imageState} primary>
          {asset.type === "tweet" ? t.assetsCopyUrl : t.assetsCopyImage}
        </AssetButton>
      </div>
    </div>
  );
}

async function copyImageAsset(asset: XArticleAsset): Promise<boolean> {
  if (asset.type === "code") {
    return copyCodeImage(asset.code, asset.language ?? "");
  }

  if (asset.type === "table") {
    return copyTableImage(asset.headers, asset.rows);
  }

  if (asset.type === "mermaid") {
    return copyMermaidImage(asset.code);
  }

  return false;
}

function assetDescription(asset: XArticleAsset) {
  if (asset.type === "code") return asset.language || "code";
  if (asset.type === "table") {
    return `${asset.headers.length} cols, ${asset.rows.length} rows`;
  }
  if (asset.type === "tweet") return asset.url;
  return "mermaid";
}

function AssetButton({
  children,
  onClick,
  state,
  primary,
}: {
  children: string;
  onClick: () => void;
  state: ActionState;
  primary?: boolean;
}) {
  const label =
    state === "done" ? "✓" : state === "failed" ? "✗" : children;

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "rounded-[var(--radius-xs)] bg-[var(--accent)] px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-[var(--accent-hover)] active:scale-[0.97]"
          : "rounded-[var(--radius-xs)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--fg)] transition hover:bg-[var(--fg-soft)] active:scale-[0.97]"
      }
    >
      {label}
    </button>
  );
}

function copyText(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
}

async function copyMermaidImage(code: string): Promise<boolean> {
  try {
    return await copyPngBlob(await renderMermaidToPng(code));
  } catch {
    return false;
  }
}

async function renderMermaidToPng(code: string): Promise<Blob> {
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      primaryColor: "#d9f3ea",
      primaryTextColor: "#0f1419",
      primaryBorderColor: "#4aa384",
      lineColor: "#536471",
      secondaryColor: "#eef2f5",
      tertiaryColor: "#ffffff",
      fontFamily: "Arial, sans-serif",
    },
  });

  const result = await mermaid.render(`ximg-${Date.now()}`, code);
  return renderSvgToPng(result.svg);
}
