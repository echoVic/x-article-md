import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { buildPageMetadata, getHtmlLangForPath } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultMetadata = buildPageMetadata("home");

export const metadata: Metadata = {
  ...defaultMetadata,
  applicationName: "MD2X",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const htmlLang = getHtmlLangForPath(requestHeaders.get("x-pathname"));
  const initialLocale = htmlLang === "zh-CN" ? "zh" : "en";

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers
          initialLocale={initialLocale}
          persistLocale={initialLocale === "en"}
        >
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
