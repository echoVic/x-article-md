import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

// Explicit AI-crawler ALLOW list. Each token below was verified against the
// vendor's own robots documentation on 2026-10-24 (see docs/seo-aeo/):
// - GPTBot          OpenAI model training crawler
// - OAI-SearchBot   ChatGPT web search indexing
// - ChatGPT-User    user-initiated browsing through ChatGPT
// - ClaudeBot       Anthropic model training crawler
// - Claude-User     user-initiated retrieval through Claude
// - Claude-SearchBot Claude web search indexing
// - PerplexityBot   Perplexity search indexing
//
// Deliberately NOT listed:
// - Google-Extended is not a crawler UA — it only honors Disallow (Gemini
//   training opt-out), so an "Allow" entry for it would be meaningless.
// - Perplexity-User generally ignores robots.txt, so it cannot be opened or
//   closed from this file.
// Next.js supports multiple rule blocks (rules as an array), which is what
// we use here.
const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      ...AI_CRAWLER_USER_AGENTS.map((ua) => ({
        userAgent: ua,
        allow: "/",
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
