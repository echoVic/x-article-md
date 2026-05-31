"use client";

import { useEffect, useState } from "react";
import {
  generateCoverImage,
  type CoverImageConfig,
  type GeneratedCoverImage,
} from "@/lib/cover-image";
import { copyPngBlob, downloadBlob } from "@/lib/image-copy";

type CoverImagePanelProps = {
  markdown: string;
};

type ActionState = "idle" | "loading" | "done" | "failed";

const storageKey = "x-article-md:cover-image-config";
const defaultConfig: CoverImageConfig = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-image-2",
};

export function CoverImagePanel({ markdown }: CoverImagePanelProps) {
  const [config, setConfig] = useState<CoverImageConfig>(defaultConfig);
  const [configReady, setConfigReady] = useState(false);
  const [cover, setCover] = useState<GeneratedCoverImage | null>(null);
  const [generateState, setGenerateState] = useState<ActionState>("idle");
  const [copyState, setCopyState] = useState<ActionState>("idle");
  const [downloadState, setDownloadState] = useState<ActionState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          setConfig({ ...defaultConfig, ...JSON.parse(saved) });
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      setConfigReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!configReady) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(config));
  }, [config, configReady]);

  function updateConfig(key: keyof CoverImageConfig, value: string) {
    setConfig((current) => ({ ...current, [key]: value }));
  }

  async function generate() {
    setError("");
    setGenerateState("loading");

    try {
      const result = await generateCoverImage(markdown, config);
      setCover(result);
      setGenerateState("done");
    } catch (err) {
      setError(getErrorMessage(err));
      setGenerateState("failed");
    }
  }

  async function copyImage() {
    if (!cover) {
      return;
    }

    setCopyState("loading");
    try {
      const ok = await copyPngBlob(await imageSrcToBlob(cover.src));
      setCopyState(ok ? "done" : "failed");
    } catch {
      setCopyState("failed");
    }
    resetState(setCopyState);
  }

  async function downloadImage() {
    if (!cover) {
      return;
    }

    setDownloadState("loading");
    try {
      downloadBlob(await imageSrcToBlob(cover.src), "x-article-cover.png");
      setDownloadState("done");
    } catch {
      openImageDownloadFallback(cover.src);
      setDownloadState("done");
    }
    resetState(setDownloadState);
  }

  const generateLabel =
    generateState === "loading"
      ? "Generating"
      : generateState === "done"
        ? "Generated"
        : "Generate";

  return (
    <aside className="mt-5 rounded-md border border-[#d8e0e5] bg-white">
      <div className="flex h-11 items-center justify-between border-b border-[#e6ecf0] px-4">
        <h2 className="text-sm font-semibold text-[#536471]">Cover image</h2>
        <span className="text-xs text-[#71808a]">
          {cover ? "Ready" : "Optional"}
        </span>
      </div>

      <div className="grid gap-4 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <label className="grid gap-1 text-xs font-semibold text-[#536471]">
            API Key
            <input
              type="password"
              value={config.apiKey}
              onChange={(event) => updateConfig("apiKey", event.target.value)}
              className="h-10 rounded-md border border-[#cfd9de] bg-white px-3 text-sm font-medium text-[#0f1419] outline-none focus:ring-2 focus:ring-[#1d9bf0]"
              placeholder="sk-..."
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-[#536471]">
            Model
            <input
              type="text"
              value={config.model}
              onChange={(event) => updateConfig("model", event.target.value)}
              className="h-10 rounded-md border border-[#cfd9de] bg-white px-3 text-sm font-medium text-[#0f1419] outline-none focus:ring-2 focus:ring-[#1d9bf0]"
            />
          </label>
          <label className="grid gap-1 text-xs font-semibold text-[#536471] sm:col-span-2">
            Base URL
            <input
              type="url"
              value={config.baseUrl}
              onChange={(event) => updateConfig("baseUrl", event.target.value)}
              className="h-10 rounded-md border border-[#cfd9de] bg-white px-3 text-sm font-medium text-[#0f1419] outline-none focus:ring-2 focus:ring-[#1d9bf0]"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PanelButton
            onClick={generate}
            state={generateState}
            primary
            disabled={generateState === "loading"}
          >
            {generateLabel}
          </PanelButton>
          {cover ? (
            <>
              <PanelButton
                onClick={downloadImage}
                state={downloadState}
                disabled={downloadState === "loading"}
              >
                Download PNG
              </PanelButton>
              <PanelButton
                onClick={copyImage}
                state={copyState}
                disabled={copyState === "loading"}
              >
                Copy image
              </PanelButton>
            </>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-md border border-[#ffd8c2] bg-[#fff7f2] px-3 py-2 text-sm text-[#8a3d12]">
            {error}
          </p>
        ) : null}

        {cover ? (
          <div className="overflow-hidden rounded-md border border-[#d8e0e5] bg-[#f6f8fa]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover.src}
              alt="Generated article cover"
              className="aspect-[3/2] w-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function PanelButton({
  children,
  disabled,
  onClick,
  primary,
  state,
}: {
  children: string;
  disabled?: boolean;
  onClick: () => void;
  primary?: boolean;
  state: ActionState;
}) {
  const label =
    state === "loading"
      ? "Working"
      : state === "done"
        ? "Done"
        : state === "failed"
          ? "Failed"
          : children;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        primary
          ? "rounded-md bg-[#0f1419] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#26323a] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          : "rounded-md border border-[#cfd9de] bg-white px-3 py-2 text-sm font-semibold text-[#0f1419] transition hover:bg-[#f6f8fa] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {label}
    </button>
  );
}

async function imageSrcToBlob(src: string): Promise<Blob> {
  const response = await fetch(src, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Image download failed with HTTP ${response.status}.`);
  }

  return response.blob();
}

function openImageDownloadFallback(src: string) {
  const anchor = document.createElement("a");
  anchor.href = src;
  anchor.download = "x-article-cover.png";
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

function resetState(setter: (state: ActionState) => void) {
  window.setTimeout(() => setter("idle"), 1600);
}

function getErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/failed to fetch|load failed|network/i.test(message)) {
    return "Image request failed. Check the Base URL, network access, and whether the provider allows browser CORS requests.";
  }

  return message || "Image generation failed.";
}
