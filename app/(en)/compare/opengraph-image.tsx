import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/components/og-card";
import { getCompareContent } from "@/lib/compare-copy";

const t = getCompareContent("en");

export const alt = t.metaTitle;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard eyebrow={t.heroEyebrow} title={t.heroTitle} subtitle={t.heroLead} />,
    size,
  );
}
