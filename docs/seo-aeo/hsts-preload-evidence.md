# HSTS preload decision: do not preload (verified 2026-10-24)

## Official stance (hstspreload.org, the Chromium project submission page)

Quoted directly from https://hstspreload.org/ on 2026-10-24:

> "The benefits provided by HSTS preloading are minimal compared to the
> benefits provided by HSTS. While HSTS is recommended, **HSTS *preloading* is
> not recommended**."

> "Don't request inclusion unless you're sure that you can support HTTPS for
> **your entire site and all its subdomains** in the long term."

Submission requirements that make preload a long-term lock-in:

1. Serve a valid certificate.
2. HTTP→HTTPS redirect on the same host.
3. **Serve all subdomains over HTTPS** — explicitly "including internal
   subdomains that are not publicly accessible".
4. HSTS header with `max-age >= 31536000` (1 year), **`includeSubDomains`**,
   and **`preload`**.

Removal is the reverse problem: "inclusion in the preload list cannot easily
be undone… it takes months for a change to reach users", and the page tells
HTTPS-advice project authors: "**do not include the `preload` directive by
default**" because site operators later find themselves stuck with subdomains
that cannot serve HTTPS.

## Decision (有据不改)

- The site already receives a basic `Strict-Transport-Security` header from
  the **Cloudflare edge**. That stays as-is — no changes to Cloudflare, no
  `preload` directive, no `includeSubDomains`, no submission to the list.
- Rationale: markdown2x.com has no demonstrated need for first-load
  preprotection, internal/dev subdomains are not under a verified-HTTPS
  guarantee, and the official page itself says preloading is not recommended.
- No changes in this repo touch HSTS; the repo intentionally does not emit
  HSTS at the app level (avoid duplicating the edge header).
