"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

type Page = "editor" | "thread";

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

  return (
    <header className="flex h-12 items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 relative z-10">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={isZh ? "/zh" : "/"}
          className="flex items-center gap-1.5 no-underline hover:opacity-70 transition-opacity"
          title="MD2X - Markdown to X Articles"
        >
          <span className="font-mono font-extrabold text-sm tracking-tight text-[var(--fg)]">MD</span>
          <span className="text-[var(--accent)] text-xs">→</span>
          <span className="font-mono font-extrabold text-sm tracking-tight text-[var(--fg)]">X</span>
        </Link>
        <div className="w-px h-[18px] bg-[var(--border)]" />
        <nav className="flex items-center gap-1">
          <Link
            href={editorHref}
            title="Markdown to X Article Editor"
            className={`px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium no-underline transition-colors ${
              activePage === "editor"
                ? "text-[var(--fg)] bg-[var(--fg-soft)]"
                : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)]"
            }`}
          >
            Editor
          </Link>
          <Link
            href={threadHref}
            title="Markdown to X Thread Splitter"
            className={`px-2 py-1 rounded-[var(--radius-sm)] text-xs font-medium no-underline transition-colors ${
              activePage === "thread"
                ? "text-[var(--fg)] bg-[var(--fg-soft)]"
                : "text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)]"
            }`}
          >
            Thread
          </Link>
        </nav>
      </div>

      {/* Right: Language toggle */}
      <div className="flex items-center gap-[6px] flex-shrink-0">
        <Link
          href={langHref}
          onClick={() => setLocale(nextLocale)}
          className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--muted)] transition hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] no-underline"
          aria-label={isZh ? "Switch to English" : "切换到中文"}
          title={isZh ? "Switch to English" : "切换到中文"}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M1.5 8h13M8 1.5c-2 2-2.5 4-2.5 6.5s.5 4.5 2.5 6.5M8 1.5c2 2 2.5 4 2.5 6.5s-.5 4.5-2.5 6.5" />
          </svg>
          {isZh ? "EN" : "中文"}
        </Link>
      </div>
    </header>
  );
}
