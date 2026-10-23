// Low-risk baseline security headers applied to every route.
// HSTS is intentionally omitted: Cloudflare already terminates TLS and sends
// Strict-Transport-Security at the edge, so a duplicate would only conflict.
// CSP is intentionally omitted: the editor ships inline scripts/styles and
// third-party widgets that are not yet covered by a locked-down policy.
export const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
