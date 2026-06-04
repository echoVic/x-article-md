import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const systemPrompt = `You are a professional writing assistant specializing in polishing and improving text quality.

Rules:
- Improve the text to make it clearer, more engaging, and more professional
- Fix grammar, spelling, and punctuation errors
- Enhance sentence structure and flow
- Make the text more concise where appropriate
- Keep the original meaning and intent intact
- MUST preserve ALL Markdown formatting exactly: headings (#, ##), bold (**text**), italic (*text*), links ([text](url)), code blocks (\`\`\`), inline code (\`code\`), lists (-, 1.), tables, etc.
- Do NOT translate the text - keep it in the original language
- Do NOT change:
  - Code blocks content (inside \`\`\`)
  - Inline code (inside \`code\`)
  - URLs
  - HTML tags
  - Technical identifiers (variable names, function names, etc.)
- Preserve line breaks and paragraph structure
- Return ONLY the polished text, no explanations or meta-commentary

Focus on:
- Clarity: Make complex ideas easier to understand
- Conciseness: Remove redundancy without losing meaning
- Flow: Ensure smooth transitions between sentences and paragraphs
- Engagement: Make the text more interesting to read
- Professionalism: Use appropriate tone and vocabulary`;

export async function POST(req: NextRequest) {
  try {
    const rateLimitResult = await checkRateLimit(req);
    if (rateLimitResult.limited) return rateLimitResult.response;

    const { text, style, apiKey, baseUrl, model } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text field is required" },
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

    // Build style-specific instruction
    let styleInstruction = "";
    if (style === "concise") {
      styleInstruction = "\n\nStyle: Make the text more concise and direct. Remove unnecessary words and phrases.";
    } else if (style === "professional") {
      styleInstruction = "\n\nStyle: Make the text more formal and professional. Use sophisticated vocabulary and clear structure.";
    } else if (style === "casual") {
      styleInstruction = "\n\nStyle: Make the text more casual and conversational. Use simpler language and a friendly tone.";
    } else if (style === "engaging") {
      styleInstruction = "\n\nStyle: Make the text more engaging and compelling. Use vivid language and strong hooks.";
    }

    const prompt = `Polish and improve the following text${styleInstruction ? ` (${style} style)` : ""}:\n\n${text}`;

    const { text: polishedText } = await generateText({
      model: provider(resolvedModel),
      system: systemPrompt + styleInstruction,
      prompt,
      temperature: 0.5,
    });

    return NextResponse.json({ polishedText: polishedText.trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
