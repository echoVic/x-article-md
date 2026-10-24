import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";

export const alt = "MD2X Blog — Markdown to X Articles tutorials";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="MD2X BLOG"
      title="Markdown to X Articles tutorials"
      subtitle="Code screenshots, Mermaid diagrams, tables and thread guides."
    />,
    size,
  );
}
