import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";

export const alt = "Markdown to X/Twitter thread generator — MD2X";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="THREAD GENERATOR"
      title="Markdown to X Threads"
      subtitle="Split long posts into numbered 280-character tweets in one click."
    />,
    size,
  );
}
