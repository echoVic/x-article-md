"use client";

import Link from "next/link";
import { useI18n, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

export function LanguageToggle({
  className,
  href,
}: {
  className?: string;
  href?: string;
}) {
  const { locale, setLocale } = useI18n();
  const nextLocale: Locale = locale === "en" ? "zh" : "en";
  const label = locale === "en" ? "中文" : "EN";
  const accessibleLabel = locale === "en" ? "切换到中文" : "Switch to English";

  function toggle() {
    setLocale(nextLocale);
  }

  const content = (
    <>
      <Globe size={14} strokeWidth={1.5} aria-hidden="true" />
      {label}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={toggle}
        className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--muted)] transition hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] no-underline ${className ?? ""}`}
        aria-label={accessibleLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--muted)] transition hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] ${className ?? ""}`}
      aria-label={accessibleLabel}
    >
      {content}
    </button>
  );
}
