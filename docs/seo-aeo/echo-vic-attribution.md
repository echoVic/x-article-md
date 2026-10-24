# @echo_vic / MD2X public attribution evidence (gathered 2026-10-24)

## What is publicly verifiable

From https://github.com/echoVic (profile, fetched 2026-10-24):

- Display name: **echoVic （青雲）**, self-described "Agent Developer",
  organization listed as **ByteDance**, location **Guangzhou**.
- Personal site: https://www.echovic.com/ ; X/Twitter handle: **@echo_vic**.
- The profile README "Featured" list explicitly includes
  **"Markdown2X — Preview, format and publish long-form X Articles from
  Markdown (x-article-md)"**, i.e. this repository is listed as his own
  featured project.
- The repo itself lives at https://github.com/echoVic/x-article-md — the
  same identity — and `lib/seo.ts` points `githubRepoUrl` there as the only
  `sameAs` link.

## Implications for structured data

- **Site-level creator/publisher = echoVic (Person)** is supported: his own
  public profile names the project as his. If metadata later adds a Person
  creator, a defensible minimal block is:
  `{"@type": "Person", "name": "echoVic", "sameAs": ["https://github.com/echoVic", "https://x.com/echo_vic", "https://www.echovic.com/"]}`.
- **Do NOT retroactively stamp every blog post with `creator = echoVic`**:
  publishing/owning a repo is not per-post authorship evidence, and several
  posts (comparison pages, tutorials) have no explicit byline in their
  frontmatter. Wait for a per-post author field before adding post-level
  `creator`; otherwise leave it absent.
- His employer (ByteDance) appears on the GitHub profile but there is no
  public ByteDance/MD2X affiliation — **do not** attribute MD2X to
  ByteDance anywhere in structured data.

## Open questions for the metadata owner

1. Confirm "name" spelling: GitHub shows `echoVic （青雲）` — use the handle
   verbatim unless the owner confirms a preferred display name.
2. Whether echovic.com / x.com/echo_vic are owned by the same person
   (profile links them; no independent verification performed here).
