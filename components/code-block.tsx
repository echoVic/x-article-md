"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import type { CodeImageTheme } from "@/lib/code-themes";
import { THEME_GITHUB_LIGHT } from "@/lib/code-themes";
import { copyCodeImage } from "@/lib/image-copy";

type CodeBlockProps = {
  code: string;
  language: string;
  codeTheme?: CodeImageTheme;
};

export function CodeBlock({ code, language, codeTheme }: CodeBlockProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const lines = code.split("\n");
  const theme = codeTheme ?? THEME_GITHUB_LIGHT;

  async function copyImage() {
    const copied = await copyCodeImage(code, language, codeTheme);
    setState(copied ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden border transition-colors duration-200"
      style={{ borderColor: theme.borderColor }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 border-b transition-colors duration-200"
        style={{ backgroundColor: theme.headerBg, borderColor: theme.borderColor }}
      >
        <span
          className="font-mono text-[11px] uppercase tracking-wider transition-colors duration-200"
          style={{ color: theme.labelColor }}
        >
          {language || "plain text"}
        </span>
        <button
          type="button"
          onClick={copyImage}
          aria-label="复制代码图片"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-xs)] text-[11px] font-medium transition-all hover:opacity-80 active:scale-[0.95]"
          style={{ color: theme.labelColor }}
        >
          <Copy size={14} strokeWidth={1.4} aria-hidden="true" />
          {state === "copied" ? "已复制" : state === "failed" ? "失败" : "复制图片"}
        </button>
      </div>

      <pre
        className="overflow-auto px-4 py-4 font-mono text-[13px] leading-[1.7] transition-colors duration-200"
        style={{ backgroundColor: theme.panelBg, color: theme.textColor }}
      >
        <code>
          {lines.map((line, index) => (
            <span key={index} className="grid min-w-max grid-cols-[2.5rem_1fr]">
              <span
                className="select-none pr-4 text-right tabular-nums transition-colors duration-200"
                style={{ color: theme.lineNumberColor }}
              >
                {index + 1}
              </span>
              <span>{line || " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}


