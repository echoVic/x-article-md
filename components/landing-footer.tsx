import type { LandingLocale } from "@/lib/landing-copy";
import { landingCopy } from "@/lib/landing-copy";

export function LandingFooter({ locale = "en" }: { locale?: LandingLocale }) {
  const t = landingCopy[locale];

  return (
    <footer className="pagefoot">
      <div className="container pagefoot-inner">
        <span>x-article-md · 2026</span>
        <span className="meta">{t.footerTagline}</span>
      </div>
    </footer>
  );
}
