import LandingPage from "@/components/landing-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("zhHome");

export default function ZhPage() {
  return <LandingPage locale="zh" />;
}
