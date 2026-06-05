"use client";

import { useEffect, useId, useState } from "react";
import type { CodeImageTheme } from "@/lib/code-themes";
import { THEME_GITHUB_LIGHT } from "@/lib/code-themes";
import { copySvgImage } from "@/lib/image-copy";

type MermaidBlockProps = {
  code: string;
  codeTheme?: CodeImageTheme;
};

export function MermaidBlock({ code, codeTheme }: MermaidBlockProps) {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const theme = codeTheme ?? THEME_GITHUB_LIGHT;
  const isDark = isDarkTheme(theme);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      setError("");
      setSvg("");

      if (!code.trim()) {
        return;
      }

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            primaryColor: isDark ? lightenHex(theme.cardBg, 0.12) : "#d9f3ea",
            primaryTextColor: theme.textColor,
            primaryBorderColor: isDark ? theme.borderColor : "#4aa384",
            lineColor: theme.labelColor,
            secondaryColor: isDark ? theme.headerBg : "#eef2f5",
            tertiaryColor: theme.cardBg,
            fontFamily: "Arial, sans-serif",
          },
        });

        const result = await mermaid.render(
          `x-article-md-${reactId}-${Date.now()}`,
          code,
        );

        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch {
        if (!cancelled) {
          setError("Mermaid 图表预览不可用");
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, reactId, theme, isDark]);

  if (error) {
    return (
      <div className="rounded-[var(--radius)] border border-dashed border-[var(--muted)] bg-[var(--fg-soft)] p-4">
        <p className="text-sm font-medium text-[var(--muted)]">{error}</p>
        <pre className="mt-3 overflow-auto whitespace-pre-wrap font-mono text-sm text-[var(--fg)]">
          {code}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-[var(--radius)] border border-dashed border-[var(--border)] bg-[var(--fg-soft)] text-sm text-[var(--muted)]">
        渲染 Mermaid 图表中...
      </div>
    );
  }

  async function copyImage() {
    const copied = await copySvgImage(svg);
    setCopyState(copied ? "copied" : "failed");
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  return (
    <figure className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <figcaption className="font-mono text-[11px] uppercase tracking-wider text-[var(--muted)]">
          Mermaid
        </figcaption>
        <button
          type="button"
          onClick={copyImage}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--fg)] transition hover:bg-[var(--fg-soft)] active:scale-[0.97]"
        >
          {copyState === "copied"
            ? "已复制"
            : copyState === "failed"
              ? "复制失败"
              : "复制图片"}
        </button>
      </div>
      <div
        className="overflow-auto rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}

function isDarkTheme(t: CodeImageTheme): boolean {
  const hex = t.cardBg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function lightenHex(hex: string, amount: number): string {
  const c = hex.replace("#", "");
  const r = Math.min(255, parseInt(c.slice(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(c.slice(2, 4), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(c.slice(4, 6), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
