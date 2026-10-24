import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleAnalytics } from "@/components/google-analytics";

describe("GoogleAnalytics", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalGaId = process.env.NEXT_PUBLIC_GA_ID;

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", originalNodeEnv);
    if (originalGaId === undefined) {
      vi.stubEnv("NEXT_PUBLIC_GA_ID", undefined);
    } else {
      vi.stubEnv("NEXT_PUBLIC_GA_ID", originalGaId);
    }
  });

  it("does not render the Google tag outside production", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-6PCZ5398F1");
    const { container } = render(<GoogleAnalytics />);
    expect(container).toBeEmptyDOMElement();
  });

  it("hoists one external async gtag script + one inline config into document.head", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-6PCZ5398F1");

    render(<GoogleAnalytics />);

    // React 19 hoists the external <script src> into document.head.
    const ext = document.head.querySelector('script[src*="gtag/js"]');
    expect(ext).not.toBeNull();
    expect(ext).toHaveAttribute(
      "src",
      "https://www.googletagmanager.com/gtag/js?id=G-6PCZ5398F1",
    );
    expect(ext).toHaveAttribute("async");
    expect(document.head.querySelectorAll('script[src*="gtag/js"]').length).toBe(1);

    // inline pageview config appears somewhere in the document.
    const inline = document.querySelector("script:not([src])");
    expect(inline?.innerHTML).toContain("gtag('config', 'G-6PCZ5398F1'");
    cleanup();
  });

  it("does not render the Google tag in production without a measurement id", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "");
    const { container } = render(<GoogleAnalytics />);
    expect(container).toBeEmptyDOMElement();
  });
});
