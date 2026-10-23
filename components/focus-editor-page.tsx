"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorPageWrapper } from "@/components/editor-page-wrapper";
import type { EditorLocale } from "@/lib/editor-copy";

export function focusUrl(href: string, focus: boolean): string {
  const url = new URL(href, "https://md2x.local");
  if (focus) url.searchParams.set("focus", "1");
  else url.searchParams.delete("focus");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function FocusEditorPage({ locale }: { locale: EditorLocale }) {
  const [focus, setFocusState] = useState(false);
  const [focusOrigin, setFocusOrigin] = useState<HTMLElement | null>(null);
  const previousScroll = useRef(0);
  const initialized = useRef(false);

  useEffect(() => {
    const readUrl = () => setFocusState(new URLSearchParams(window.location.search).get("focus") === "1");
    readUrl();
    initialized.current = true;
    window.addEventListener("popstate", readUrl);
    return () => window.removeEventListener("popstate", readUrl);
  }, []);

  const setFocus = useCallback((next: boolean) => {
    if (next === focus) return;
    if (next) {
      previousScroll.current = window.scrollY;
      setFocusOrigin(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    }
    window.history.replaceState(window.history.state, "", focusUrl(window.location.href, next));
    setFocusState(next);
  }, [focus]);

  useEffect(() => {
    if (!focus) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // Capture phase: run before Radix DismissableLayer (Tooltip/Popover) document
    // listeners, which are bubble-phase and registered earlier. Otherwise the first
    // Escape closes the tooltip, calls preventDefault, and focus mode only exits on
    // the second press. Open dialogs/dropdowns still win via the guard below.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || event.repeat || event.isComposing) return;
      if (document.querySelector('[role="dialog"], [data-radix-menu-content][data-state="open"], [role="listbox"]')) return;
      event.preventDefault();
      setFocus(false);
    };
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", onKeyDown, { capture: true });
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [focus, setFocus]);

  const lastFocus = useRef(focus);
  useEffect(() => {
    if (initialized.current && lastFocus.current && !focus) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: previousScroll.current });
        focusOrigin?.focus();
      });
    }
    lastFocus.current = focus;
  }, [focus, focusOrigin]);

  return <EditorPageWrapper locale={locale} focus={focus} onFocusChange={setFocus} />;
}
