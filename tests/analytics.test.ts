import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const trackMock = vi.fn();
vi.mock("@vercel/analytics", () => ({ track: (...args: unknown[]) => trackMock(...args) }));

import { trackEvent } from "@/lib/analytics";

type WindowWithGtag = Window & { gtag?: (...args: unknown[]) => void };

describe("trackEvent", () => {
  beforeEach(() => {
    trackMock.mockReset();
  });

  afterEach(() => {
    delete (window as WindowWithGtag).gtag;
  });

  it("sends the event to Vercel and GA4 with the same name and props", () => {
    const gtag = vi.fn();
    (window as WindowWithGtag).gtag = gtag;

    trackEvent("asset_copy", { type: "code", ok: true });

    expect(trackMock).toHaveBeenCalledWith("asset_copy", { type: "code", ok: true });
    expect(gtag).toHaveBeenCalledWith("event", "asset_copy", { type: "code", ok: true });
  });

  it("still reaches Vercel when GA4 is not loaded", () => {
    trackEvent("copy_body");

    expect(trackMock).toHaveBeenCalledWith("copy_body", undefined);
  });

  it("still reaches GA4 when the Vercel tracker throws", () => {
    trackMock.mockImplementation(() => {
      throw new Error("blocked");
    });
    const gtag = vi.fn();
    (window as WindowWithGtag).gtag = gtag;

    expect(() => trackEvent("copy_body", { ok: true })).not.toThrow();
    expect(gtag).toHaveBeenCalledWith("event", "copy_body", { ok: true });
  });

  it("never throws when gtag itself throws", () => {
    (window as WindowWithGtag).gtag = () => {
      throw new Error("gtag broken");
    };

    expect(() => trackEvent("asset_download", { ok: true })).not.toThrow();
  });
});
