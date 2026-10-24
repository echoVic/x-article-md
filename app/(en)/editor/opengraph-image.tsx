import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";

export const alt = "Markdown to X Articles online editor — MD2X";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="X ARTICLES EDITOR"
      title="Markdown to X Articles"
      subtitle="Code as images, tables and Mermaid — copy straight into X."
    />,
    size,
  );
}
