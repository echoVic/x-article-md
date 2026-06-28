import { FeatureLandingPage } from "@/components/feature-landing-page";
import { buildFeatureMetadata, getFeatureLanding } from "@/lib/feature-landing-copy";
import { notFound } from "next/navigation";

const SLUG = "code-to-image";

export const metadata = buildFeatureMetadata(SLUG, "zh");

export default function Page() {
  const def = getFeatureLanding(SLUG);
  if (!def) notFound();
  return <FeatureLandingPage def={def} locale="zh" />;
}
