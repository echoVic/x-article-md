import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a1a2e",
          borderRadius: "38px",
          fontFamily: "monospace",
        }}
      >
        <span
          style={{
            fontSize: "76px",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-2px",
          }}
        >
          M
        </span>
        <span
          style={{
            fontSize: "52px",
            color: "#6b8afd",
            margin: "0 2px",
          }}
        >
          →
        </span>
        <span
          style={{
            fontSize: "76px",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-2px",
          }}
        >
          X
        </span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
