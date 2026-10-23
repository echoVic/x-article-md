import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "" }),
  Geist_Mono: () => ({ variable: "" }),
  Instrument_Serif: () => ({ variable: "" }),
}));

// The shell test only asserts the server-rendered <html lang>; the provider
// chain (theme/i18n) is orthogonal and pulls in browser-only APIs.
vi.mock("@/components/providers", () => ({
  Providers: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { HtmlShell } from "@/components/html-shell";

describe("HtmlShell", () => {
  it("server-renders zh-CN lang for localized routes", () => {
    const markup = renderToStaticMarkup(
      <HtmlShell lang="zh-CN" initialLocale="zh">
        <div>zh</div>
      </HtmlShell>,
    );
    expect(markup).toContain('<html lang="zh-CN"');
  });

  it("keeps English routes on en", () => {
    const markup = renderToStaticMarkup(
      <HtmlShell lang="en" initialLocale="en">
        <div>en</div>
      </HtmlShell>,
    );
    expect(markup).toContain('<html lang="en"');
  });
});
