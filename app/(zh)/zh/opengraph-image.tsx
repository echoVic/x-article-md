import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";

export const alt = "Markdown 转 X Articles 在线编辑器 — MD2X";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="MD2X 编辑器"
      title="Markdown 转 X Articles"
      subtitle="代码块一键复制为引用或导出高清图片，表格与 Mermaid 图表同样可复制。"
    />,
    size,
  );
}
