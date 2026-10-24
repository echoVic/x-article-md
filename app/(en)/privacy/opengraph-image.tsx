import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MD2X Markdown to X Articles converter";
export const size = { width: 1200, height: 630 };
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
          fontFamily: "sans-serif",
          height: "100%",
          justifyContent: "center",
          padding: 80,
          width: "100%",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, opacity: 0.6 }}>MD2X</div>
        <div style={{ fontSize: 72, fontWeight: 700, marginTop: 20 }}>
          Privacy Policy
        </div>
        <div style={{ fontSize: 32, marginTop: 24, opacity: 0.7 }}>
          How MD2X handles drafts, AI requests and analytics
        </div>
      </div>
    ),
    size
  );
}
