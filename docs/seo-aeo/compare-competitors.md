# /compare competitor verification (Markdown → X Articles)

Check date: **2026-10-24**.
Scope: entities named on `/compare` and `/zh/compare` as alternatives to MD2X.
Rule applied: only state what an official/vendor source supports; unknowns are marked unknown; same-name lookalikes are explicitly disambiguated; no prices, tiers, or unobserved numbers are quoted.

## Entities

### MD2X (the product being compared)
- Web app at https://markdown2x.com/editor.
- Browser-based Markdown to X Articles: rich text on the clipboard; code blocks can render as PNG images (toggleable, not the default paste behavior), tables and Mermaid diagrams render to images; thread splitter; optional AI cover image; no sign-up; drafts stay local; PWA.
- Source: this repo + https://markdown2x.com/editor.

### X Article Markdown Paste
- Chrome extension that runs on `x.com/compose/articles` and intercepts paste; converts Markdown to the editor's own block structure; uploads images through X's media pipeline; tables → HiDPI images; code blocks stay native X code blocks; tweet links become embedded cards; drag a `.md` file in to start a draft.
- Vendor site: https://xmdpaste.icy-cat.com/
- Vendor comparison: https://xmdpaste.icy-cat.com/compare.html
- Note: this is the vendor's own description; we report it as such. Free/pro tiers exist but **prices are intentionally not quoted** on the page.

### xPoster (Chrome extension)
- Chrome MV3 extension; side panel; paste/choose/drop Markdown; preview recognized blocks; writes into the active X Article draft; handles web images and authorized local image folders; queues multiple `.md` files; local-first, no backend, no account.
- Chrome Web Store: https://chromewebstore.google.com/detail/xposter/iimkimodgdjnnmdopeolboakhjmhfbbj
- GitHub: https://github.com/ginobefun/xposter
- Privacy policy: https://nevertoday.github.io/xposter-privacy/

#### Same-name lookalike (NOT the compared product)
- **WordPress "XPoster" / "WP to Twitter"** by Joe Dolson (https://xposterpro.com) crossposts WordPress blog posts to X. It is unrelated to the Chrome extension above. Disambiguated on the page.

### Article Studio (md2xarticle.com)
- Verified 2026-10-24 at https://md2xarticle.com/ (self-branded "Article Studio").
- Web app that previews Markdown locally; attach local images from a chosen folder; Mermaid → PNG at 2x; tables stay native or render to image.
- Two output paths: (a) Copy title + body for manual paste; (b) optional Chrome companion creates an unpublished X Article draft with images placed; you review and publish from X.
- Local-first; content stays in the browser until draft creation.
- Vendor self-stated; we report it as such. No price numbers quoted.
- Same-name lookalike (NOT this product): https://www.article-studio.com/ — a UK photography/studio business. Disambiguated on the page.

## External reference
- X Articles official help: https://help.x.com/en/using-x/articles

## What the page intentionally does NOT state
- No prices, subscription tiers, or currency figures (including the vendor's own Pro pricing).
- No character-limit numbers.
- No maintenance/speculation claims about the extensions beyond what their own pages state.
