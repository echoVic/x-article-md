import { SeoLandingPage } from "@/components/seo-landing-page";
import { buildPageMetadata } from "@/lib/seo";
import { pasteCodeIntoXArticles } from "@/lib/seo-landing-copy";

export const metadata = buildPageMetadata("pasteCodeIntoXArticles");

export default function Page() {
  return <SeoLandingPage content={pasteCodeIntoXArticles} />;
}
