"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { Globe } from "lucide-react";

type Page = "editor" | "thread";

/**
 * Quiet workbench top bar — 44px desktop (48px mobile), neutral surface.
 * The only warm pixel is the brand "×"; the active nav link keeps a 1px
 * brick underline. No issue plates, no folio numbers.
 */
export function AppHeader({ activePage, focus = false }: { activePage?: Page; focus?: boolean }) {
  const { t, setLocale } = useI18n();
  const pathname = usePathname();

  const isZh = pathname.startsWith("/zh");
  const editorHref = isZh ? "/zh/editor" : "/editor";
  const threadHref = isZh ? "/zh/thread" : "/thread";

  // Language switch: toggle between /zh/xxx and /xxx
  const langPath = isZh
    ? pathname.replace(/^\/zh/, "") || "/"
    : `/zh${pathname === "/" ? "" : pathname}`;
  const langHref = focus ? `${langPath}?focus=1` : langPath;
  const nextLocale = isZh ? "en" : "zh";

  return (
    <header className="wb-header flex h-12 md:h-11 shrink-0 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)] px-4 md:px-5 relative z-10">
      {/* Left: wordmark + section nav */}
      <div className="flex items-baseline gap-4 min-w-0">
        <Link
          href={isZh ? "/zh" : "/"}
          className="flex h-11 items-center gap-[6px] no-underline transition-opacity hover:opacity-70 md:h-auto md:items-baseline"
          aria-label={t.homeAria}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "20px",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: "var(--fg)",
            }}
          >
            MD
          </span>
          <span
            aria-hidden="true"
            className="text-[var(--accent)]"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "14px",
              lineHeight: 1,
            }}
          >
            ×
          </span>
          <span
            className="text-[var(--fg)]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 600,
              fontSize: "9.5px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            X&nbsp;Articles
          </span>
        </Link>

        <nav
          className="hidden items-center gap-[18px] border-l border-[var(--border)] pl-[18px] md:flex"
          aria-label={t.sectionsNav}
        >
          <SectionLink href={editorHref} active={activePage === "editor"} label={t.navEditor} />
          <SectionLink href={threadHref} active={activePage === "thread"} label={t.navThread} />
        </nav>
      </div>

      {/* Right: theme + language toggle */}
      <div className="flex items-center gap-[10px] flex-shrink-0">
        <ThemeToggle className="h-11 w-11 rounded-[var(--radius-sm)] md:h-[30px] md:w-[30px]" />
        <Link
          href={langHref}
          onClick={() => setLocale(nextLocale)}
          className="inline-flex items-baseline gap-[6px] no-underline text-[var(--muted)] transition-colors hover:text-[var(--fg)] h-11 min-w-[44px] items-center justify-center md:h-auto md:min-w-0"
          aria-label={isZh ? "Switch to English" : "切换到中文"}
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "10px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          <Globe size={12} strokeWidth={1.6} aria-hidden="true" />
          {isZh ? "EN" : "中文"}
        </Link>
      </div>
    </header>
  );
}

function SectionLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="relative inline-flex items-center no-underline transition-colors"
      style={{
        fontFamily: "var(--font-geist-sans)",
        fontSize: "13px",
        fontWeight: active ? 600 : 400,
        letterSpacing: "-0.005em",
        lineHeight: 1,
        color: active ? "var(--fg)" : "var(--muted)",
        paddingBottom: 4,
      }}
    >
      {label}
      <span
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-0 block h-[2px] transition-transform origin-left"
        style={{
          background: "var(--accent)",
          transform: active ? "scaleX(1)" : "scaleX(0)",
        }}
      />
    </Link>
  );
}
