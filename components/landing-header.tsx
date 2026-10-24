"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import type { LandingLocale } from "@/lib/landing-copy";
import { landingCopy } from "@/lib/landing-copy";
import { swapLocalePath } from "@/lib/locale-path";
import { Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Editorial masthead-style navigation:
 * — the wordmark reads like a small caps issue title ("MD · X ARTICLES")
 * — nav links are mono ALL-CAPS with a red underline on hover
 * — right-hand actions cluster keeps utility controls small and honest
 */
export function LandingHeader({ locale = "en" }: { locale?: LandingLocale }) {
  const t = landingCopy[locale];
  const editorHref = locale === "zh" ? "/zh/editor" : "/editor";
  const threadHref = locale === "zh" ? "/zh/thread" : "/thread";
  const pathname = usePathname() ?? "/";
  const switchHref = swapLocalePath(pathname).href;

  return (
    <header className="topnav">
      <div className="container topnav-inner">
        <span className="logo">
          <Link
            href="/"
            style={{ textDecoration: "none", color: "inherit", display: "inline-flex", alignItems: "baseline", gap: "8px" }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "22px",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              MD
            </span>
            <span
              style={{
                color: "var(--accent)",
                fontFamily: "var(--font-geist-mono)",
                fontSize: "13px",
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              →
            </span>
            <span
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontWeight: 600,
                fontSize: "12px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              X Articles
            </span>
          </Link>
        </span>
        <nav className="topnav-links">
          <a href="#features">{t.navFeatures}</a>
          <Link href={editorHref}>{t.navEditor}</Link>
          <Link href={threadHref}>{t.navThread}</Link>
          <Link href={locale === "zh" ? "/zh/blog" : "/blog"}>Blog</Link>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="topnav-actions">
          <ThemeToggle />
          <Link
            href={switchHref}
            className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--muted)] transition hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] no-underline"
            aria-label={locale === "en" ? "切换到中文" : "Switch to English"}
          >
            <Globe size={14} strokeWidth={1.3} aria-hidden="true" />
            {locale === "en" ? "中文" : "EN"}
          </Link>
          <Link href={editorHref} className="btn btn-primary">
            {t.navGetStarted}
          </Link>
        </div>
      </div>
    </header>
  );
}
