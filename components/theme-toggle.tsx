"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        type="button"
        className={`inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--muted)] ${className ?? ""}`}
        aria-label="Toggle theme"
      >
        <span className="w-3.5 h-3.5" />
      </button>
    );
  }

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const label =
    theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--muted)] transition hover:text-[var(--fg)] hover:bg-[var(--fg-soft)] ${className ?? ""}`}
      aria-label={`Theme: ${label}`}
      title={label}
    >
      {theme === "light" && <SunIcon />}
      {theme === "dark" && <MoonIcon />}
      {theme === "system" && <MonitorIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M13.2 10.5A5.5 5.5 0 015.5 2.8a5.5 5.5 0 107.7 7.7z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="2" y="3" width="12" height="8" rx="1.5" />
      <path d="M5.5 14h5M8 11v3" />
    </svg>
  );
}
