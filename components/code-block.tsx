"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { copyCodeImage } from "@/lib/image-copy";

type CodeBlockProps = {
  code: string;
  language: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const lines = code.split("\n");

  async function copyImage() {
    const copied = await copyCodeImage(code, language);
    setState(copied ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg)] border-b border-[var(--border)]">
        <span className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wider">
          {language || "plain text"}
        </span>
        <button
          type="button"
          onClick={copyImage}
          aria-label="复制代码图片"
          title={
            state === "copied"
              ? "已复制"
              : state === "failed"
                ? "复制失败"
                : "复制为图片"
          }
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-xs)] text-[11px] font-medium text-[var(--muted)] transition-all hover:bg-[var(--fg-soft)] hover:text-[var(--fg)] active:scale-[0.95]"
        >
          <Copy size={14} strokeWidth={1.4} aria-hidden="true" />
          {state === "copied" ? "已复制" : state === "failed" ? "失败" : "复制图片"}
        </button>
      </div>

      <pre className="overflow-auto bg-[oklch(16%_0.014_250)] px-4 py-4 font-mono text-[13px] leading-[1.7] text-[oklch(90%_0.01_250)]">
        <code>
          {lines.map((line, index) => (
            <span key={index} className="grid min-w-max grid-cols-[2.5rem_1fr]">
              <span className="select-none pr-4 text-right text-[oklch(50%_0.012_250)] tabular-nums">
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


