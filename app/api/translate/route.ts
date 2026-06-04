import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const systemPrompt = `You are a professional translator specializing in technical content and Markdown documents.

Rules:
- Translate the text accurately while preserving the original meaning and tone
- MUST preserve ALL Markdown formatting exactly: headings (#, ##), bold (**text**), italic (*text*), links ([text](url)), code blocks (\`\`\`), inline code (\`code\`), lists (-, 1.), tables, etc.
- Do NOT translate:
  - Code blocks content (inside \`\`\`)
  - Inline code (inside \`code\`)
  - URLs
  - HTML tags
  - Technical identifiers (variable names, function names, etc.)
- Preserve line breaks and paragraph structure
- Return ONLY the translated text, no explanations or meta-commentary

For Chinese to English:
- Use clear, professional English
- Maintain technical accuracy

For English to Chinese:
- Use natural, professional Chinese (简体中文)
- Keep technical terms in English when appropriate (e.g., API, Markdown, GitHub)`;

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(req);
    if (rateLimitResult.limited) return rateLimitResult.response;

    const { markdown, targetLang, apiKey, baseUrl, model } = await req.json();

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json(
        { error: "markdown field is required" },
        { status: 400 },
      );
    }

    if (!targetLang || (targetLang !== "en" && targetLang !== "zh")) {
      return NextResponse.json(
        { error: "targetLang must be 'en' or 'zh'" },
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

    const targetLanguage = targetLang === "zh" ? "Chinese (Simplified Chinese)" : "English";
    const prompt = `Translate the following Markdown text to ${targetLanguage}:\n\n${markdown}`;

    const { text } = await generateText({
      model: provider(resolvedModel),
      system: systemPrompt,
      prompt,
      temperature: 0.3,
    });

    return NextResponse.json({ translatedText: text.trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
