"use client";

import { useEffect, useId, useState } from "react";
import { copySvgImage } from "@/lib/image-copy";

type MermaidBlockProps = {
  code: string;
};

export function MermaidBlock({ code }: MermaidBlockProps) {
  const reactId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

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
            primaryColor: "#d9f3ea",
            primaryTextColor: "#0f1419",
            primaryBorderColor: "#4aa384",
            lineColor: "#536471",
            secondaryColor: "#eef2f5",
            tertiaryColor: "#ffffff",
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
          setError("Mermaid preview unavailable for this diagram.");
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, reactId]);

  if (error) {
    return (
      <div className="rounded-md border border-dashed border-[#8aa3b1] bg-[#f7fafb] p-4">
        <p className="text-sm font-medium text-[#536471]">{error}</p>
        <pre className="mt-3 overflow-auto whitespace-pre-wrap font-mono text-sm text-[#0f1419]">
          {code}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-md border border-dashed border-[#8aa3b1] bg-[#f7fafb] text-sm text-[#536471]">
        Rendering Mermaid preview...
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
        <figcaption className="text-xs font-semibold uppercase tracking-normal text-[#71808a]">
          Mermaid image
        </figcaption>
        <button
          type="button"
          onClick={copyImage}
          className="rounded-md border border-[#cfd9de] bg-white px-3 py-1.5 text-xs font-semibold text-[#0f1419] transition hover:bg-[#f6f8fa] focus:outline-none focus:ring-2 focus:ring-[#1d9bf0] focus:ring-offset-2"
        >
          {copyState === "copied"
            ? "Copied image"
            : copyState === "failed"
              ? "Copy blocked"
              : "Copy image"}
        </button>
      </div>
      <div
        className="overflow-auto rounded-md border border-[#cfd9de] bg-white p-4 [&_svg]:mx-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}
