import { absoluteUrl, githubRepoUrl, siteUrl } from "@/lib/seo";
import { getBlogPosts } from "@/lib/blog";
import { getAllFeatureLandings } from "@/lib/feature-landing-copy";

/**
 * llms.txt / llms-full.txt builders.
 *
 * Content is derived entirely from the real site constants (lib/seo.ts), the
 * feature landing definitions (lib/feature-landing-copy.ts) and the blog
 * frontmatter (content/blog/*.mdx). No feature list, price, or limitation is
 * hand-written here beyond what those sources already state.
 */

export const LLMS_TXT_CONTENT_TYPE = "text/plain; charset=utf-8";

const TOOL_LIMITS = [
  "Free to use, no account or sign-up required. There is no paid plan or pricing tier.",
  "Editing, preview and copying run entirely in the browser; your Markdown draft is not uploaded to a server.",
  "Optional AI features (text polish, translation, smart thread splitting, and AI cover images) require your own OpenAI-compatible API key — MD2X does not host model inference. The cover image generator calls an OpenAI-compatible /images/generations endpoint (default base URL https://api.openai.com/v1, default model gpt-image-2).",
  "Code blocks, Mermaid diagrams and tables are exported as high-resolution PNG images, not SVG.",
];

function featureLines(): string {
  return getAllFeatureLandings()
    .map((def) => {
      const url = absoluteUrl(`/${def.slug}`);
      return `- [${def.en.heroTitle}](${url}): ${def.en.metaDescription}`;
    })
    .join("\n");
}

function blogPostLines(): string {
  return getBlogPosts()
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      return `- [${post.title}](${url}) (${post.date}): ${post.description}`;
    })
    .join("\n");
}

function limitsLines(): string {
  return TOOL_LIMITS.map((line) => `- ${line}`).join("\n");
}

/** Compact discovery file: who this is, entry points, tools, limits. */
export function buildLlmsTxt(): string {
  return [
    "# MD2X",
    "",
    "> Markdown to X Articles converter. Write Markdown, copy clipboard-ready rich text, and paste into X Articles — code blocks become syntax-highlighted PNG images, Mermaid diagrams and tables export as images, and long drafts split into numbered X/Twitter threads. Free, no sign-up, runs in your browser.",
    "",
    `MD2X is a free, open-source, browser-based writing tool for publishing long-form Markdown on X (Twitter) Articles and as X/Twitter threads. It is bilingual (English and Simplified Chinese UI). Source code: ${githubRepoUrl}.`,
    "",
    "## Entry points",
    `- [Editor — Markdown to X Articles converter](${absoluteUrl("/editor")}): the main tool; paste or import Markdown, preview the X Articles output, and copy rich text plus generated image assets.`,
    `- [Thread generator](${absoluteUrl("/thread")}): split a Markdown draft into numbered, ~280-character X/Twitter tweets and copy them individually or all at once.`,
    `- [Blog](${absoluteUrl("/blog")}): tutorials and release notes.`,
    `- [Privacy policy](${absoluteUrl("/privacy")}): how drafts and optional AI calls are handled.`,
    "",
    "## Tools",
    featureLines(),
    "",
    "## Limits and notes",
    limitsLines(),
    "",
    `## Full context`,
    `- [llms-full.txt](${absoluteUrl("/llms-full.txt")}): this file plus every blog post listed with its description.`,
    "",
  ].join("\n");
}

/** Expanded discovery file: same as llms.txt plus the full blog index. */
export function buildLlmsFullTxt(): string {
  return [
    "# MD2X",
    "",
    "> Markdown to X Articles converter. Write Markdown, copy clipboard-ready rich text, and paste into X Articles — code blocks become syntax-highlighted PNG images, Mermaid diagrams and tables export as images, and long drafts split into numbered X/Twitter threads. Free, no sign-up, runs in your browser.",
    "",
    `MD2X is a free, open-source, browser-based writing tool for publishing long-form Markdown on X (Twitter) Articles and as X/Twitter threads. It preserves headings, links, lists, bold/italic and inline code as rich text, while code blocks, Mermaid diagrams and tables become pasteable PNG assets. It is bilingual (English and Simplified Chinese UI) and works offline as a PWA. Source code: ${githubRepoUrl}.`,
    "",
    "## Entry points",
    `- [Editor — Markdown to X Articles converter](${absoluteUrl("/editor")}): the main tool; paste or import Markdown, preview the X Articles output, and copy rich text plus generated image assets. Simplified Chinese UI: ${absoluteUrl("/zh/editor")}.`,
    `- [Thread generator](${absoluteUrl("/thread")}): split a Markdown draft into numbered, ~280-character X/Twitter tweets and copy them individually or all at once. Simplified Chinese UI: ${absoluteUrl("/zh/thread")}.`,
    `- [Home (English)](${absoluteUrl("/")}); [Home (Simplified Chinese)](${absoluteUrl("/zh")}).`,
    `- [Blog index](${absoluteUrl("/blog")}).`,
    `- [Privacy policy](${absoluteUrl("/privacy")}).`,
    "",
    "## Tools",
    featureLines(),
    "",
    "## Blog",
    blogPostLines(),
    "",
    "## Limits and notes",
    limitsLines(),
    "",
  ].join("\n");
}

export { siteUrl, githubRepoUrl };
