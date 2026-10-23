import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS } from "@/lib/security-headers";

describe("security headers baseline", () => {
  it("sets exactly the four agreed low-risk headers", () => {
    expect(SECURITY_HEADERS).toEqual({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
  });

  it("never duplicates Cloudflare HSTS or adds a CSP here", () => {
    for (const name of Object.keys(SECURITY_HEADERS)) {
      expect(name.toLowerCase()).not.toBe("strict-transport-security");
      expect(name.toLowerCase()).not.toBe("content-security-policy");
    }
  });

  it("disables camera, microphone and geolocation in Permissions-Policy", () => {
    const policy = SECURITY_HEADERS["Permissions-Policy"];
    expect(policy).toContain("camera=()");
    expect(policy).toContain("microphone=()");
    expect(policy).toContain("geolocation=()");
  });
});
