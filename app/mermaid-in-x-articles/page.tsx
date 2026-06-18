import { SeoLandingPage } from "@/components/seo-landing-page";
import { buildPageMetadata } from "@/lib/seo";
import { mermaidInXArticles } from "@/lib/seo-landing-copy";

export const metadata = buildPageMetadata("mermaidInXArticles");

export default function Page() {
  return <SeoLandingPage content={mermaidInXArticles} />;
}
