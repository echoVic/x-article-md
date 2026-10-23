import "./../globals.css";
import { HtmlShell, groupBaseMetadata } from "@/components/html-shell";
import type { Metadata } from "next";

export const metadata: Metadata = groupBaseMetadata;

export default function ZhRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HtmlShell lang="zh-CN" initialLocale="zh">
      {children}
    </HtmlShell>
  );
}
