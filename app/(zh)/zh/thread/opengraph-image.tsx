import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";

export const alt = "免费 Markdown 转 Twitter 推文流生成器 — MD2X";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="THREAD 生成器"
      title="Markdown 转推文流"
      subtitle="自动拆分长文为 280 字符推文，自动编号，逐条或一键复制。"
    />,
    size,
  );
}
