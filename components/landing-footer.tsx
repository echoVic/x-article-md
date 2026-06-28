import type { LandingLocale } from "@/lib/landing-copy";
import { landingCopy } from "@/lib/landing-copy";
import { getAllFeatureLandings } from "@/lib/feature-landing-copy";
import Link from "next/link";

export function LandingFooter({ locale = "en" }: { locale?: LandingLocale }) {
  const t = landingCopy[locale];
  const features = getAllFeatureLandings();
  const prefix = locale === "zh" ? "/zh" : "";

  return (
    <footer className="pagefoot">
      <div className="container pagefoot-inner">
        <span>x-article-md · 2026</span>
        {features.length > 0 && (
          <nav className="pagefoot-tools" aria-label={locale === "zh" ? "工具" : "Tools"}>
            {features.map((def) => (
              <Link key={def.slug} href={`${prefix}/${def.slug}`}>
                {def[locale].heroTitle}
              </Link>
            ))}
          </nav>
        )}
        <span className="meta">{t.footerTagline}</span>
      </div>
    </footer>
  );
}
