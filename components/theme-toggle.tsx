"use client";

import { Monitor, Moon, Sun } from "lucide-react";
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
      {theme === "light" && <Sun size={14} strokeWidth={1.5} aria-hidden="true" />}
      {theme === "dark" && <Moon size={14} strokeWidth={1.5} aria-hidden="true" />}
      {theme === "system" && <Monitor size={14} strokeWidth={1.5} aria-hidden="true" />}
    </button>
  );
}
