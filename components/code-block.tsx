"use client";

import { useState } from "react";
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
    <figure className="rounded-[14px] border border-[#d8e0e5] bg-white p-5 shadow-[0_8px_28px_rgba(15,20,25,0.08)]">
      <div className="mb-4 flex h-5 items-center justify-end gap-3 text-[#8a99a3]">
        <EditGlyph />
        <CloseGlyph />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#d8e0e5] bg-[#f7f9fa]">
        <figcaption className="flex h-11 items-center justify-between border-b border-[#d8e0e5] bg-[#eff3f4] px-4">
          <span className="text-sm font-semibold text-[#536471]">
            {language || "plain text"}
          </span>
          <button
            type="button"
            onClick={copyImage}
            aria-label="Copy code block image"
            title={
              state === "copied"
                ? "Copied image"
                : state === "failed"
                  ? "Copy blocked"
                  : "Copy image"
            }
            className="inline-flex size-8 items-center justify-center rounded-md text-[#536471] transition hover:bg-white hover:text-[#0f1419] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
          >
            <CopyGlyph />
          </button>
        </figcaption>

        <pre className="overflow-auto px-4 py-4 font-mono text-[15px] leading-7 text-[#0f1419]">
          <code>
            {lines.map((line, index) => (
              <span key={index} className="grid min-w-max grid-cols-[2.5rem_1fr]">
                <span className="select-none pr-4 text-right text-[#f58b23]">
                  {index + 1}
                </span>
                <span>{line || " "}</span>
              </span>
            ))}
          </code>
        </pre>
      </div>

      <p
        aria-live="polite"
        className={`mt-2 min-h-5 text-right text-xs font-medium ${
          state === "failed" ? "text-[#b42318]" : "text-[#536471]"
        }`}
      >
        {state === "copied"
          ? "Copied image"
          : state === "failed"
            ? "Copy blocked"
            : ""}
      </p>
    </figure>
  );
}

function EditGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      <path d="M3.5 14.5 14.1 3.9l2 2L5.5 16.5h-2z" />
      <path d="M12.7 5.3 14.7 7.3" />
    </svg>
  );
}

function CloseGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    >
      <path d="m5 5 10 10" />
      <path d="m15 5-10 10" />
    </svg>
  );
}

function CopyGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      <rect x="7" y="3" width="9" height="11" rx="1.5" />
      <rect x="4" y="6" width="9" height="11" rx="1.5" />
    </svg>
  );
}
