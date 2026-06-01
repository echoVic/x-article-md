import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GoogleAnalytics } from "@/components/google-analytics";

vi.mock("next/script", () => ({
  default: ({
    children,
    src,
    id,
  }: {
    children?: React.ReactNode;
    src?: string;
    id?: string;
  }) => (
    <div data-testid={id ?? "external-script"} data-src={src}>
      {children}
    </div>
  ),
}));

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

  it("renders the Google tag in production with the configured measurement id", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "G-6PCZ5398F1");

    render(<GoogleAnalytics />);

    const externalScript = screen.getByTestId("external-script");
    expect(externalScript).toHaveAttribute(
      "data-src",
      "https://www.googletagmanager.com/gtag/js?id=G-6PCZ5398F1",
    );

    expect(screen.getByTestId("google-analytics")).toHaveTextContent(
      "gtag('config', 'G-6PCZ5398F1')",
    );
  });

  it("does not render the Google tag in production without a measurement id", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_GA_ID", "");

    const { container } = render(<GoogleAnalytics />);

    expect(container).toBeEmptyDOMElement();
  });
});
