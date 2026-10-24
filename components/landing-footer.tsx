import type { LandingLocale } from "@/lib/landing-copy";
import { landingCopy } from "@/lib/landing-copy";
import { getAllFeatureLandings } from "@/lib/feature-landing-copy";
import Link from "next/link";

/**
 * Colophon-style footer: keeps the editorial voice of the landing.
 * Left: dateline / issue mark.
 * Middle: tools directory (feature landings).
 * Right: tagline in mono meta type.
 */
export function LandingFooter({ locale = "en" }: { locale?: LandingLocale }) {
  const t = landingCopy[locale];
  const features = getAllFeatureLandings();
  const prefix = locale === "zh" ? "/zh" : "";

  return (
    <footer className="pagefoot">
      <div className="container pagefoot-inner">
        <span className="meta">
          <span style={{ color: "var(--accent)" }}>§</span>{" "}
          x-article-md · vol. 01 · 2026
        </span>
        {features.length > 0 && (
          <nav
            className="pagefoot-tools"
            aria-label={locale === "zh" ? "工具" : "Tools"}
          >
            {features.map((def) => (
              <Link key={def.slug} href={`${prefix}/${def.slug}`}>
                {def[locale].heroTitle}
              </Link>
            ))}
            <Link href={`${prefix}/compare`}>
              {locale === "zh" ? "工具对比" : "Compare tools"}
            </Link>
          </nav>
        )}
        <span className="meta">
          {t.footerTagline}
          {" · "}
          <Link href="/privacy" className="pagefoot-legal">
            {locale === "zh" ? "隐私政策" : "Privacy"}
          </Link>
        </span>
      </div>
    </footer>
  );
}
