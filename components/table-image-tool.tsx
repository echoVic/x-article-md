"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import {
  copyPngBlob,
  downloadBlob,
  renderTableToPng,
  type TableImageTheme,
} from "@/lib/image-copy";
import { parseMarkdownTable } from "@/lib/markdown";
import type { LandingLocale } from "@/lib/feature-landing-copy";

const SAMPLE_TABLE = `| Plan | Price | Seats | Support |
| :--- | ---: | :---: | :--- |
| Free | $0 | 1 | Community |
| Pro | $12 | 5 | Email |
| Team | $49 | 25 | Priority |`;

const copy = {
  en: {
    inputLabel: "Markdown table",
    previewLabel: "Image preview",
    light: "Light",
    dark: "Dark",
    themeLabel: "Theme",
    copyImage: "Copy image",
    download: "Download PNG",
    copied: "Copied",
    downloaded: "Downloaded",
    failed: "Copy blocked — try Download",
    rendering: "Rendering…",
    renderFailed: "Could not render this table. Try a smaller table or reload the page.",
    invalid:
      "No table found. Use a header row, a separator row like | --- | --- |, then data rows.",
    reset: "Load example",
    hint: "Alignment from :--- / :---: / ---: is kept.",
  },
  zh: {
    inputLabel: "Markdown 表格",
    previewLabel: "图片预览",
    light: "亮色",
    dark: "暗色",
    themeLabel: "主题",
    copyImage: "复制图片",
    download: "下载 PNG",
    copied: "已复制",
    downloaded: "已下载",
    failed: "浏览器阻止了复制，请改用下载",
    rendering: "渲染中…",
    renderFailed: "这张表格渲染失败，可以试试缩小表格或刷新页面。",
    invalid: "没有识别到表格。需要表头行、分隔行（如 | --- | --- |）和数据行。",
    reset: "载入示例",
    hint: "会保留 :--- / :---: / ---: 的对齐方式。",
  },
} as const;

type ActionState = "idle" | "done" | "failed";

export function TableImageTool({ locale = "en" }: { locale?: LandingLocale }) {
  const t = copy[locale];
  const [source, setSource] = useState(SAMPLE_TABLE);
  const [theme, setTheme] = useState<TableImageTheme>("light");
  // Result of the latest finished render, tagged with the input it was made
  // from. "Rendering" and "stale" are derived from it rather than stored, so
  // the effect below only sets state from async callbacks.
  const [result, setResult] = useState<{
    key: string;
    blob: Blob | null;
    url: string | null;
  } | null>(null);
  const [copyState, setCopyState] = useState<ActionState>("idle");
  const [downloadState, setDownloadState] = useState<ActionState>("idle");
  const renderId = useRef(0);

  const table = useMemo(() => parseMarkdownTable(source), [source]);
  const renderKey = `${theme}\n${source}`;

  useEffect(() => {
    if (!table) return;

    const id = ++renderId.current;
    const timer = window.setTimeout(() => {
      renderTableToPng(table.headers, table.rows, {
        alignments: table.alignments,
        theme,
      })
        .then((blob) => {
          if (id !== renderId.current) return;
          setResult({ key: renderKey, blob, url: URL.createObjectURL(blob) });
        })
        .catch(() => {
          if (id !== renderId.current) return;
          setResult({ key: renderKey, blob: null, url: null });
        });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [table, theme, renderKey]);

  useEffect(() => {
    const url = result?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [result]);

  const rendering = Boolean(table) && result?.key !== renderKey;
  const blob = table ? (result?.blob ?? null) : null;
  const previewUrl = table ? (result?.url ?? null) : null;

  function flash(setter: (state: ActionState) => void, state: ActionState) {
    setter(state);
    window.setTimeout(() => setter("idle"), 1800);
  }

  function eventProps(ok: boolean) {
    return {
      type: "table",
      theme,
      surface: "table_tool",
      cols: table?.headers.length ?? 0,
      rows: table?.rows.length ?? 0,
      ok,
    };
  }

  async function handleCopy() {
    if (!blob) return;
    const ok = await copyPngBlob(blob);
    trackEvent("asset_copy", eventProps(ok));
    flash(setCopyState, ok ? "done" : "failed");
  }

  function handleDownload() {
    if (!blob) return;
    downloadBlob(blob, "markdown-table.png");
    trackEvent("asset_download", eventProps(true));
    flash(setDownloadState, "done");
  }

  const disabled = !blob || rendering;

  return (
    <div className="table-tool" data-testid="table-image-tool">
      <div className="table-tool-pane">
        <div className="table-tool-bar">
          <label htmlFor="table-tool-input" className="table-tool-label">
            {t.inputLabel}
          </label>
          <button
            type="button"
            className="table-tool-link"
            onClick={() => setSource(SAMPLE_TABLE)}
          >
            {t.reset}
          </button>
        </div>
        <textarea
          id="table-tool-input"
          className="table-tool-input"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
          rows={9}
        />
        <p className="table-tool-hint">{t.hint}</p>
      </div>

      <div className="table-tool-pane">
        <div className="table-tool-bar">
          <span className="table-tool-label">{t.previewLabel}</span>
          <div className="table-tool-toggle" role="radiogroup" aria-label={t.themeLabel}>
            {(["light", "dark"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={theme === value}
                className={theme === value ? "is-active" : undefined}
                onClick={() => setTheme(value)}
              >
                {value === "light" ? t.light : t.dark}
              </button>
            ))}
          </div>
        </div>

        <div className="table-tool-preview" aria-live="polite">
          {table && previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob: URL
            <img src={previewUrl} alt={t.previewLabel} />
          ) : table && rendering ? (
            <span className="table-tool-status">{t.rendering}</span>
          ) : table ? (
            <span className="table-tool-status" role="alert">
              {t.renderFailed}
            </span>
          ) : (
            <span className="table-tool-status" role="alert">
              {t.invalid}
            </span>
          )}
        </div>

        <div className="table-tool-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCopy}
            disabled={disabled}
          >
            <Copy size={15} aria-hidden="true" />
            {copyState === "done"
              ? t.copied
              : copyState === "failed"
                ? t.failed
                : t.copyImage}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDownload}
            disabled={disabled}
          >
            <Download size={15} aria-hidden="true" />
            {downloadState === "done" ? t.downloaded : t.download}
          </button>
        </div>
      </div>
    </div>
  );
}
