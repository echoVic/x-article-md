import { SeoLandingPage } from "@/components/seo-landing-page";
import { buildPageMetadata } from "@/lib/seo";
import { markdownToXArticles } from "@/lib/seo-landing-copy";

export const metadata = buildPageMetadata("markdownToXArticles");

export default function Page() {
  return <SeoLandingPage content={markdownToXArticles} />;
}
