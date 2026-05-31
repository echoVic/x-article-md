import LandingPage from "@/components/landing-page";
import { I18nProvider } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata("zhHome");

export default function ZhPage() {
  return (
    <I18nProvider initialLocale="zh" persistLocale={false}>
      <LandingPage />
    </I18nProvider>
  );
}
