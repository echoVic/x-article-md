# AI crawler robots.txt allow-list (verified 2026-10-24)

Policy applied in `app/robots.ts`: keep the baseline `User-agent: * Allow: /`
and add an explicit `Allow: /` block for each verified AI crawler UA.
This is an open policy — **no Disallow anywhere**.

## UA tokens and their official purposes

| UA token | Vendor | Official purpose | Source |
| --- | --- | --- | --- |
| `GPTBot` | OpenAI | Public-web content collection for model training | help.openai.com/en/articles/... (OpenAI crawler docs; respects robots.txt) |
| `OAI-SearchBot` | OpenAI | Indexes pages so they surface in ChatGPT search | OpenAI "Search | OpenAI" + Publisher FAQ: needs explicit access for ChatGPT discoverability |
| `ChatGPT-User` | OpenAI | On-demand browsing by ChatGPT users/plugins | OpenAI frontier-risk paper; documented UA |
| `ClaudeBot` | Anthropic | Web content collection for model training/safety | support.claude.com article 8896518 (updated 2026-04-07) |
| `Claude-User` | Anthropic | Retrieves sites at a Claude user's request | support.claude.com article 8896518 |
| `Claude-SearchBot` | Anthropic | Indexes content to improve Claude search results | support.claude.com article 8896518 |
| `PerplexityBot` | Perplexity | Indexes web pages for Perplexity search results | Perplexity bot docs; UA string contains `perplexity.ai/perplexitybot` |

## Deliberately NOT listed

- `Google-Extended` — **not a crawler UA**. It only honors `Disallow:` (Gemini
  training opt-out). An `Allow:` entry would be meaningless; we add nothing.
- `Perplexity-User` — Perplexity's own docs state this agent generally ignores
  robots.txt, so it cannot be opened or blocked from this file.
- No other invented/third-party tokens (Bytespider etc.) — out of scope.

## Next.js capability note

`MetadataRoute.Robots.rules` accepts **either a single object or an array of
rule objects** — Next.js does support multiple rule blocks; we use the array
form.

## Tests

`tests/robots.test.ts` (6 cases) pins: multi-rule array shape, baseline `*`
allow, every verified UA has its own `Allow: /`, zero `disallow` keys, absence
of Google-Extended / Perplexity-User / stray tokens, and the sitemap URL.
`tests/seo.test.ts` was adjusted off the old exact-equality robots assertion.
