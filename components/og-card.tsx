import type { JSX } from "react";

/**
 * Shared 1200x630 OpenGraph card. Visual language matches the existing root
 * and blog OG images: warm paper background, bordered "MD -> X" badge, a small
 * uppercase eyebrow, a bold title, and an optional supporting line.
 *
 * Every non-blog landing page renders its OWN card (colocated
 * opengraph-image.tsx per route + locale) so social shares never show the
 * homepage generic image.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export function OgCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}): JSX.Element {
  return (
    <div
      style={{
        alignItems: "flex-start",
        background: "#f7f5ef",
        color: "#111827",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: 72,
        width: "100%",
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid #111827",
            borderRadius: 20,
            fontSize: 28,
            fontWeight: 800,
            padding: "12px 20px",
          }}
        >
          MD -&gt; X
        </div>
        <div
          style={{
            color: "#475569",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.12em",
          }}
        >
          {eyebrow}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 1040,
        }}
      >
        <div
          style={{
            fontSize: subtitle ? 60 : 68,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.12,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              color: "#475569",
              fontSize: 30,
              lineHeight: 1.35,
              marginTop: 28,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>
  );
}
