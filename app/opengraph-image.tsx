import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MD2X Markdown to X Articles converter";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f7f5ef",
          color: "#111827",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid #111827",
            borderRadius: 24,
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: 0,
            padding: "18px 26px",
          }}
        >
          MD -&gt; X
        </div>
        <div
          style={{
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.05,
            marginTop: 42,
            maxWidth: 940,
            textAlign: "center",
          }}
        >
          Markdown to X Articles
        </div>
        <div
          style={{
            color: "#475569",
            fontSize: 32,
            lineHeight: 1.35,
            marginTop: 24,
            maxWidth: 900,
            textAlign: "center",
          }}
        >
          Rich text, code images, tables, diagrams, and AI cover images.
        </div>
      </div>
    ),
    size,
  );
}
