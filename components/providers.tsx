"use client";

import { ThemeProvider } from "next-themes";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { I18nProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { ReactNode } from "react";

export function Providers({
  children,
  initialLocale = "en",
  persistLocale = true,
}: {
  children: ReactNode;
  initialLocale?: Locale;
  persistLocale?: boolean;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider initialLocale={initialLocale} persistLocale={persistLocale}>
        <TooltipPrimitive.Provider delayDuration={400} skipDelayDuration={200}>
          {children}
        </TooltipPrimitive.Provider>
      </I18nProvider>
    </ThemeProvider>
  );
}
