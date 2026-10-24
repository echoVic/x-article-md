# @echo_vic / MD2X attribution evidence (revised 2026-10-24)

## Authoritative source: site owner confirmation

- **User confirmation (2026-10-24, this session)**: `@echo_vic` is the account
  that publishes MD2X articles. This is the deciding evidence; no further
  back-link chain is required to establish the X account behind the site.

## Corroborating public evidence (supplementary only)

From https://github.com/echoVic (profile, fetched 2026-10-24):

- Display name **echoVic （青雲）**, "Agent Developer", ByteDance, Guangzhou.
- The profile README "Featured" list includes
  **"Markdown2X — Preview, format and publish long-form X Articles from
  Markdown (x-article-md)"**, and the repo lives at
  https://github.com/echoVic/x-article-md.
- The profile links X handle `@echo_vic` and personal site
  https://www.echovic.com/ as its own links.

These links are self-declared on the profile; we have **not** independently
verified that echovic.com is owned by the same person, and this document no
longer treats that as an open verification task.

## What this evidence supports — and what it does not

- **Supports `twitter:site = https://x.com/echo_vic`**: the confirmed
  publishing account. This is an *account/site association*, not an
  authorship claim.
- **Does NOT support stamping `creator` on the site or on every post**:
  account ownership of the project is not per-post authorship evidence.
  Post-level `creator` stays absent until a per-post byline/author field
  exists in frontmatter.
- **Do NOT attribute MD2X to ByteDance** anywhere in structured data; the
  employer line on the GitHub profile is incidental.
- Do **not** add `https://www.echovic.com/` as a `sameAs` link yet —
  unconfirmed ownership.

## Per-post author audit (read-only, HEAD 893c0f4, 2026-10-24)

Every blog post's frontmatter was enumerated. **None of them carries an
author / byline field**, and `lib/blog.ts` parses no author field. The
per-post Article JSON-LD (`lib/seo.ts:253`) does set an author — but it is a
**uniform Organization `MD2X`**, identical across all posts. That organization
author names the product, not a person; it does not establish that echoVic
wrote any specific post, and no `twitter:creator` is set anywhere
(`components/html-shell.tsx` deliberately sets the site account only).

| Slug | frontmatter author? | In-repo evidence written by echoVic |
| --- | --- | --- |
| changelog-v1 | none | none (uniform Organization author; account ≠ per-post authorship) |
| code-to-image-converter | none | none |
| markdown-table-to-image | none | none |
| markdown-to-x-articles (EN+ZH) | none | none |
| md2x-vs-carbon | none | none |
| md2x-vs-pandoc-typora | none | none |
| mermaid-in-x-articles | none | none |
| mermaid-to-png | none | none |
| paste-code-into-x-articles (EN+ZH) | none | none |
| thread-splitter-vs-manual-x-articles-ai | none | none |

**Conclusion from this audit: within this repo, zero slugs carry explicit
per-author evidence** (no byline; the JSON-LD author is the uniform MD2X
Organization). This audit scoped only the repository; it does **not** claim
anything about public sources beyond the GitHub profile already documented
above. The open question for the owner is exactly one: which slugs are
confirmed written by echoVic (or: does the owner confirm authorship of the
whole set)? Until that answer lands, no post-level `creator` is set.

## Earlier wording corrected

An earlier draft of this file implied that the GitHub self-link alone proved
"echovic.com / x.com / echoVic" are one verified identity and that a Person
`creator` block was justified. That was overstated: the GitHub profile is a
self-declared link, and the deciding fact comes from the site owner's
confirmation above. This revision narrows the conclusion to the
`twitter:site` association and leaves `creator` pending per-post bylines.
