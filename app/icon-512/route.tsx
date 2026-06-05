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
          borderRadius: "102px",
          fontFamily: "monospace",
        }}
      >
        <span
          style={{
            fontSize: "200px",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-5px",
          }}
        >
          M
        </span>
        <span
          style={{
            fontSize: "140px",
            color: "#6b8afd",
            margin: "0 4px",
          }}
        >
          →
        </span>
        <span
          style={{
            fontSize: "200px",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-5px",
          }}
        >
          X
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
