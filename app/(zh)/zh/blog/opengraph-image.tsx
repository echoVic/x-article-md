import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";

export const alt = "MD2X 博客 — Markdown 转 X Articles 教程";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="MD2X 博客"
      title="Markdown 转 X Articles 教程"
      subtitle="代码截图、Mermaid 图表、表格与推文流指南。"
    />,
    size,
  );
}
