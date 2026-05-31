"use client";

import { useState } from "react";
import {
  copyCodeImage,
  copyPngBlob,
  downloadBlob,
  downloadCodeImage,
  renderSvgToPng,
} from "@/lib/image-copy";
import type { XArticleAsset } from "@/lib/markdown";

type ArticleAssetsProps = {
  assets: XArticleAsset[];
};

type ActionState = "idle" | "done" | "failed";

export function ArticleAssets({ assets }: ArticleAssetsProps) {
  if (assets.length === 0) {
    return null;
  }

  return (
    <aside className="mt-5 rounded-md border border-[#d8e0e5] bg-white">
      <div className="flex h-11 items-center justify-between border-b border-[#e6ecf0] px-4">
        <h2 className="text-sm font-semibold text-[#536471]">XIMG assets</h2>
        <span className="text-xs text-[#71808a]">{assets.length}</span>
      </div>
      <div className="divide-y divide-[#edf1f4]">
        {assets.map((asset) => (
          <AssetRow key={asset.placeholder} asset={asset} />
        ))}
      </div>
    </aside>
  );
}

function AssetRow({ asset }: { asset: XArticleAsset }) {
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
    const ok =
      asset.type === "code"
        ? await copyCodeImage(asset.code, asset.language ?? "")
        : await copyMermaidImage(asset.code);
    setImageState(ok ? "done" : "failed");
    reset(setImageState);
  }

  async function downloadImage() {
    try {
      const filename = `${asset.placeholder.toLowerCase()}-${asset.type}.png`;
      if (asset.type === "code") {
        await downloadCodeImage(asset.code, asset.language ?? "", filename);
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
          <code className="rounded bg-[#eef2f5] px-2 py-1 font-mono text-xs font-semibold text-[#0f1419]">
            {asset.placeholder}
          </code>
          <span className="text-sm font-medium text-[#0f1419]">
            {asset.label}
          </span>
        </div>
        <p className="mt-1 truncate font-mono text-xs text-[#71808a]">
          {asset.type === "code" ? asset.language || "code" : "mermaid"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <AssetButton onClick={copyPlaceholder} state={placeholderState}>
          Placeholder
        </AssetButton>
        <AssetButton onClick={downloadImage} state={downloadState}>
          Download PNG
        </AssetButton>
        <AssetButton onClick={copyImage} state={imageState} primary>
          Copy image
        </AssetButton>
      </div>
    </div>
  );
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
    state === "done" ? "Done" : state === "failed" ? "Blocked" : children;

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? "rounded-md bg-[#0f1419] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#26323a] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
          : "rounded-md border border-[#cfd9de] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f1419] transition hover:bg-[#f6f8fa] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
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
