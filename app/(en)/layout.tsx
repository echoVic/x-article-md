import "./../globals.css";
import { HtmlShell, buildGroupMetadata } from "@/components/html-shell";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = buildGroupMetadata("home");

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#171613" },
  ],
};

export default function EnRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HtmlShell lang="en" initialLocale="en">
      {children}
    </HtmlShell>
  );
}
