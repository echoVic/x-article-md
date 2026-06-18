import { ThemeToggle } from "@/components/theme-toggle";
import type { LandingLocale } from "@/lib/landing-copy";
import { landingCopy } from "@/lib/landing-copy";
import { Globe } from "lucide-react";
import Link from "next/link";

export function LandingHeader({ locale = "en" }: { locale?: LandingLocale }) {
  const t = landingCopy[locale];
  const editorHref = locale === "zh" ? "/zh/editor" : "/editor";
  const threadHref = locale === "zh" ? "/zh/thread" : "/thread";

  return (
    <header className="topnav">
      <div className="container topnav-inner">
        <span className="logo">
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "15px", letterSpacing: "-0.03em" }}>MD</span>
            <span style={{ color: "var(--accent)", fontSize: "12px", margin: "0 2px" }}>→</span>
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: "15px", letterSpacing: "-0.03em" }}>X</span>
          </Link>
        </span>
        <nav className="topnav-links">
          <a href="#features">{t.navFeatures}</a>
          <Link href={editorHref}>{t.navEditor}</Link>
          <Link href={threadHref}>{t.navThread}</Link>
          <Link href="/blog">Blog</Link>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="topnav-actions">
          <ThemeToggle />
          <Link
            href={locale === "en" ? "/zh" : "/"}
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
