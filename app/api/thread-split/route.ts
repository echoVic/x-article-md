import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const systemPrompt = `You are a Twitter thread splitter. Your ONLY job is to decide where to split the user's text into tweets.

Rules:
- Each tweet MUST be ≤ 280 characters (including the numbering suffix like "1/N" that will be added later, so leave ~5 chars margin)
- Do NOT rewrite, rephrase, summarize, or alter the user's text in any way
- Do NOT add emojis, hashtags, or any content not in the original
- Split at natural semantic boundaries: paragraph breaks, sentence endings, or clause boundaries
- Preserve the reading flow and logical coherence between tweets
- If a single sentence exceeds ~275 characters, split at a clause boundary (comma, semicolon, dash)
- Strip Markdown formatting (headings, bold, links, code blocks) — output plain text only
- Omit the numbering suffix — the caller will add it

Return ONLY a valid JSON object with a "tweets" array of strings. No other text.
Example: {"tweets": ["first tweet", "second tweet"]}`;

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(req);
    if (rateLimitResult.limited) return rateLimitResult.response;

    const { markdown, apiKey, baseUrl, model } = await req.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json(
        { error: "markdown field is required" },
        { status: 400 },
      );
    }

    const resolvedApiKey = apiKey || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;
    if (!resolvedApiKey) {
      return NextResponse.json(
        { error: "No API key configured. Set DEEPSEEK_API_KEY in environment or pass apiKey in request body." },
        { status: 401 },
      );
    }

    const resolvedBaseUrl = baseUrl || process.env.DEEPSEEK_BASE_URL || undefined;
    const resolvedModel = model || process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

    const provider = createDeepSeek({
      apiKey: resolvedApiKey,
      ...(resolvedBaseUrl && { baseURL: resolvedBaseUrl }),
    });

    const { text } = await generateText({
      model: provider(resolvedModel),
      system: systemPrompt,
      prompt: markdown.slice(0, 8000),
      temperature: 0.3,
    });

    const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
    return NextResponse.json({ tweets: parsed.tweets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
