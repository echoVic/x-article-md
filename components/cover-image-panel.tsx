"use client";

import { useEffect, useState } from "react";
import {
  generateCoverImage,
  type CoverImageConfig,
  type GeneratedCoverImage,
} from "@/lib/cover-image";
import { copyPngBlob, downloadBlob } from "@/lib/image-copy";
import { useI18n } from "@/lib/i18n";

type CoverImagePanelProps = {
  markdown: string;
  inline?: boolean;
};

type ActionState = "idle" | "loading" | "done" | "failed";

const storageKey = "x-article-md:cover-image-config";
const defaultConfig: CoverImageConfig = {
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-image-2",
};

export function CoverImagePanel({ markdown, inline }: CoverImagePanelProps) {
  const { t } = useI18n();
  const [config, setConfig] = useState<CoverImageConfig>(defaultConfig);
  const [configReady, setConfigReady] = useState(false);
  const [cover, setCover] = useState<GeneratedCoverImage | null>(null);
  const [generateState, setGenerateState] = useState<ActionState>("idle");
  const [copyState, setCopyState] = useState<ActionState>("idle");
  const [downloadState, setDownloadState] = useState<ActionState>("idle");
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

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
      setError(getErrorMessage(err, t.coverNetworkError, t.coverGenericError));
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
      ? t.coverGenerating
      : generateState === "done"
        ? t.coverGenerated
        : t.coverGenerate;

  const formContent = (
    <div className="grid gap-4">
      <div className="grid gap-3">
        <label className="grid gap-1.5 text-[11px] font-medium text-[var(--muted)]">
          {t.coverApiKey}
          <input
            type="password"
            value={config.apiKey}
            onChange={(event) => updateConfig("apiKey", event.target.value)}
            className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
            placeholder="sk-..."
          />
        </label>
        <label className="grid gap-1.5 text-[11px] font-medium text-[var(--muted)]">
          {t.coverModel}
          <input
            type="text"
            value={config.model}
            onChange={(event) => updateConfig("model", event.target.value)}
            className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
        </label>
        <label className="grid gap-1.5 text-[11px] font-medium text-[var(--muted)]">
          {t.coverBaseUrl}
          <input
            type="url"
            value={config.baseUrl}
            onChange={(event) => updateConfig("baseUrl", event.target.value)}
            className="h-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]"
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
              {t.coverDownload}
            </PanelButton>
            <PanelButton
              onClick={copyImage}
              state={copyState}
              disabled={copyState === "loading"}
            >
              {t.coverCopyImage}
            </PanelButton>
          </>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-[var(--radius-sm)] border border-[color-mix(in_oklch,var(--danger)_30%,transparent)] bg-[color-mix(in_oklch,var(--danger)_5%,transparent)] px-3 py-2 text-sm text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      {cover ? (
        <div className="overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.src}
            alt="Generated article cover"
            className="aspect-[16/9] w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );

  // Inline mode: no wrapper, used inside the drawer
  if (inline) {
    return formContent;
  }

  // Standalone mode: collapsible panel (legacy, kept for flexibility)
  return (
    <aside className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 h-10 text-left transition-colors hover:bg-[var(--fg-soft)] rounded-t-[var(--radius-lg)]"
      >
        <span className="text-xs font-medium text-[var(--muted)]">{t.coverTitle}</span>
        <span className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-[var(--muted)] opacity-60">
            {cover ? t.coverReady : t.coverOptional}
          </span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="M3 4.5l3 3 3-3" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)] p-4">
          {formContent}
        </div>
      )}
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
  // Labels are passed from the parent which already uses t.*
  const label =
    state === "loading"
      ? "…"
      : state === "done"
        ? "✓"
        : state === "failed"
          ? "✗"
          : children;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        primary
          ? "rounded-[var(--radius-sm)] bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.97]"
          : "rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] transition hover:bg-[var(--fg-soft)] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.97]"
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

function getErrorMessage(err: unknown, networkMsg: string, genericMsg: string): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/failed to fetch|load failed|network/i.test(message)) {
    return networkMsg;
  }

  return message || genericMsg;
}
