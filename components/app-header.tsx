"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "@/components/theme-toggle";
import { Globe } from "lucide-react";

type Page = "editor" | "thread";

/**
 * Editor / thread top bar — kept intentionally low-key so it never competes
 * with the writing surface. Picks up the same masthead grammar as the landing
 * (italic serif wordmark + mono ALL-CAPS nav), just at a smaller size.
 */
export function AppHeader({ activePage }: { activePage?: Page }) {
  const { setLocale } = useI18n();
  const pathname = usePathname();

  const isZh = pathname.startsWith("/zh");
  const editorHref = isZh ? "/zh/editor" : "/editor";
  const threadHref = isZh ? "/zh/thread" : "/thread";

  // Language switch: toggle between /zh/xxx and /xxx
  const langHref = isZh
    ? pathname.replace(/^\/zh/, "") || "/"
    : `/zh${pathname === "/" ? "" : pathname}`;
  const nextLocale = isZh ? "en" : "zh";

  // Editorial "issue number": tie the workspace to a date so it feels like a masthead.
  // Locale-stable format so SSR/CSR match.
  const today = new Date();
  const issueNo = `${today.getFullYear()}·${String(today.getMonth() + 1).padStart(2, "0")}`;

  return (
    <header className="flex h-11 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)] px-5 relative z-10">
      {/* Left: Editorial masthead + section nav */}
      <div className="flex items-baseline gap-4 min-w-0">
        <Link
          href={isZh ? "/zh" : "/"}
          className="flex items-baseline gap-[6px] no-underline transition-opacity hover:opacity-70"
          aria-label="MD2X home"
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

        {/* Issue plate — like a magazine folio */}
        <span
          className="hidden sm:inline-flex items-center gap-[6px] text-[var(--muted)]"
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: "9.5px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          <span
            aria-hidden="true"
            style={{ display: "inline-block", width: 14, height: 1, background: "var(--accent)" }}
          />
          Vol.&nbsp;{issueNo}
        </span>

        {/* Section nav */}
        <nav
          className="flex items-baseline gap-[18px] pl-[6px] ml-[2px] border-l border-[var(--border)]"
          aria-label="Sections"
          style={{ height: 14, paddingLeft: 18 }}
        >
          <SectionLink
            href={editorHref}
            active={activePage === "editor"}
            index="§01"
            label="Editor"
            title="Markdown to X Article Editor"
          />
          <SectionLink
            href={threadHref}
            active={activePage === "thread"}
            index="§02"
            label="Thread"
          />
        </nav>
      </div>

      {/* Right: Theme + Language toggle */}
      <div className="flex items-center gap-[10px] flex-shrink-0">
        <ThemeToggle />
        <Link
          href={langHref}
          onClick={() => setLocale(nextLocale)}
          className="inline-flex items-baseline gap-[6px] no-underline text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
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
  index,
  label,
  title,
}: {
  href: string;
  active: boolean;
  index: string;
  label: string;
  title?: string;
}) {
  return (
    <Link
      href={href}
      title={title}
      className="group inline-flex items-baseline gap-[6px] no-underline transition-colors"
      style={{
        fontFamily: "var(--font-geist-mono)",
        fontSize: "10.5px",
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        lineHeight: 1,
        color: active ? "var(--fg)" : "var(--muted)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "11px",
          letterSpacing: 0,
          textTransform: "none",
          color: active ? "var(--accent)" : "color-mix(in oklch, var(--muted) 60%, transparent)",
        }}
      >
        {index}
      </span>
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 -bottom-[6px] block h-px transition-transform origin-left"
          style={{
            background: "var(--accent)",
            transform: active ? "scaleX(1)" : "scaleX(0)",
          }}
        />
      </span>
    </Link>
  );
}
