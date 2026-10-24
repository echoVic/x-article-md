import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/google-analytics";
import { OfflineIndicator } from "@/components/offline-indicator";
import { Providers } from "@/components/providers";
import type { Locale } from "@/lib/i18n";
import { buildPageMetadata, siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial display serif — used only for landing headlines & pull-quotes.
// Loading a single weight + italic keeps payload minimal.
const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

/**
 * Shared document shell for the two root layouts (route groups).
 * `lang` is server-rendered per group so English routes emit `en` and every
 * `/zh*` route emits `zh-CN` in the served HTML — no client-side patch.
 */
export function HtmlShell({
  lang,
  initialLocale,
  children,
}: {
  lang: string;
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      >
        <Providers initialLocale={initialLocale}>{children}</Providers>
        <OfflineIndicator />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

const sharedIcons = {
  icon: "/icon",
  apple: "/apple-icon",
} as const;

/** Base metadata inherited by every route in a locale group (icons/manifest). */
export function buildGroupMetadata(homePage: "home" | "zhHome"): Metadata {
  return {
    ...buildPageMetadata(homePage),
    applicationName: "MD2X",
    manifest: "/manifest.webmanifest",
    icons: sharedIcons,
  };
}

/** Metadata for the group that has no home fallback to inherit from. */
export const groupBaseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "MD2X",
  manifest: "/manifest.webmanifest",
  icons: sharedIcons,
  // Site-level associated account only; no creator — per-post authorship is not
  // assumed site-wide (see docs/seo-aeo/echo-vic-attribution.md).
  twitter: { site: "@echo_vic" },
};
