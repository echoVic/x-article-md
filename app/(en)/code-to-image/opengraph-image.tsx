import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";
import { getFeatureLanding } from "@/lib/feature-landing-copy";

const c = getFeatureLanding("code-to-image")!["en"];

export const alt = c.metaTitle;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard eyebrow={c.heroEyebrow} title={c.heroTitle} subtitle={c.heroLead} />,
    size,
  );
}
