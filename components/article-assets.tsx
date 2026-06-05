"use client";

import { useState } from "react";
import type { CodeImageTheme } from "@/lib/code-themes";
import {
  copyCodeImage,
  copyPngBlob,
  copyTableImage,
  downloadBlob,
  downloadCodeImage,
  downloadTableImage,
  renderMermaidToPng,
} from "@/lib/image-copy";
import type { XArticleAsset } from "@/lib/markdown";
import { useI18n } from "@/lib/i18n";

type ArticleAssetsProps = {
  assets: XArticleAsset[];
  codeTheme?: CodeImageTheme;
  inline?: boolean;
};

type ActionState = "idle" | "done" | "failed";

export function ArticleAssets({ assets, codeTheme, inline }: ArticleAssetsProps) {
  const { t } = useI18n();

  if (assets.length === 0) {
    return null;
  }

  if (inline) {
    return (
      <div className="divide-y divide-[var(--border)]">
        {assets.map((asset) => (
          <AssetRow key={asset.placeholder} asset={asset} codeTheme={codeTheme} />
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
          <AssetRow key={asset.placeholder} asset={asset} codeTheme={codeTheme} />
        ))}
      </div>
    </aside>
  );
}

function AssetRow({ asset, codeTheme }: { asset: XArticleAsset; codeTheme?: CodeImageTheme }) {
  const { t } = useI18n();
  const [imageState, setImageState] = useState<ActionState>("idle");
  const [downloadState, setDownloadState] = useState<ActionState>("idle");

  function reset(setter: (state: ActionState) => void) {
    window.setTimeout(() => setter("idle"), 1600);
  }

  async function copyImage() {
    if (asset.type === "tweet") {
      const ok = copyText(asset.url);
      setImageState(ok ? "done" : "failed");
      reset(setImageState);
      return;
    }

    const ok = await copyImageAsset(asset, codeTheme);
    setImageState(ok ? "done" : "failed");
    reset(setImageState);
  }

  async function downloadImage() {
    try {
      const filename = `${asset.placeholder.toLowerCase()}-${asset.type}.png`;
      if (asset.type === "code") {
        await downloadCodeImage(asset.code, asset.language ?? "", filename, codeTheme);
      } else if (asset.type === "table") {
        await downloadTableImage(asset.headers, asset.rows, filename);
      } else if (asset.type === "tweet") {
        const ok = copyText(asset.url);
        if (!ok) throw new Error("Copy blocked.");
      } else {
        downloadBlob(await renderMermaidToPng(asset.code, codeTheme), filename);
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
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
            {asset.id}
          </span>
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

async function copyImageAsset(asset: XArticleAsset, codeTheme?: CodeImageTheme): Promise<boolean> {
  if (asset.type === "code") {
    return copyCodeImage(asset.code, asset.language ?? "", codeTheme);
  }

  if (asset.type === "table") {
    return copyTableImage(asset.headers, asset.rows);
  }

  if (asset.type === "mermaid") {
    return copyMermaidImage(asset.code, codeTheme);
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

async function copyMermaidImage(code: string, theme?: CodeImageTheme): Promise<boolean> {
  try {
    return await copyPngBlob(await renderMermaidToPng(code, theme));
  } catch {
    return false;
  }
}
