"use client";

import { useState } from "react";
import { copyCodeImage } from "@/lib/image-copy";

type CodeBlockProps = {
  code: string;
  language: string;
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copyImage() {
    const copied = await copyCodeImage(code, language);
    setState(copied ? "copied" : "failed");
    window.setTimeout(() => setState("idle"), 1800);
  }

  return (
    <figure className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <figcaption className="text-xs font-semibold uppercase tracking-normal text-[#71808a]">
          {language ? `${language} code image` : "Code image"}
        </figcaption>
        <button
          type="button"
          onClick={copyImage}
          className="rounded-md border border-[#cfd9de] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f1419] transition hover:bg-[#f6f8fa] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
        >
          {state === "copied"
            ? "Copied image"
            : state === "failed"
              ? "Copy blocked"
              : "Copy image"}
        </button>
      </div>
      <pre className="overflow-auto rounded-md border border-[#cfd9de] bg-[#101820] p-4 font-mono text-sm leading-6 text-[#e6edf3]">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
