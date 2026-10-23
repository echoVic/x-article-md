import LandingPage from "@/components/landing-page";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("home");

export default function Page() {
  return <LandingPage />;
}
