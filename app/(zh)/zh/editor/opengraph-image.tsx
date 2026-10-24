import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";

export const alt = "免费 Markdown 转 X Articles 在线编辑器 — MD2X";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="X ARTICLES 编辑器"
      title="Markdown 转 X Articles"
      subtitle="实时预览长文效果，代码块可复制为引用或导出高清图片。"
    />,
    size,
  );
}
