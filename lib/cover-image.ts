import { inlineToText, parseMarkdown, toXArticleText } from "@/lib/markdown";

export type CoverImageConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export type GeneratedCoverImage = {
  src: string;
  revisedPrompt?: string;
};

const defaultBaseUrl = "https://api.openai.com/v1";
const defaultModel = "gpt-image-2";

export function normalizeCoverImageConfig(
  config: CoverImageConfig,
): CoverImageConfig {
  const apiKey = config.apiKey.trim();
  if (!apiKey) {
    throw new Error("API Key is required.");
  }

  return {
    apiKey,
    baseUrl: (config.baseUrl.trim() || defaultBaseUrl).replace(/\/+$/, ""),
    model: config.model.trim() || defaultModel,
  };
}

export function buildCoverImagePrompt(markdown: string): string {
  const blocks = parseMarkdown(markdown);
  const titleBlock = blocks.find((block) => block.type === "heading");
  const title = titleBlock ? inlineToText(titleBlock.content) : "Untitled article";
  const summary = compactWhitespace(toXArticleText(markdown)).slice(0, 1600);

  return [
    "Create a landscape editorial cover image for an X Article.",
    "The image will be cropped to a 5:2 aspect ratio (wide banner), so keep the focal point centered and avoid important details near the top/bottom edges.",
    "The image should feel modern, sharp, and publication-ready, with strong composition and clear visual hierarchy.",
    "Do not include readable text, captions, logos, UI chrome, watermarks, or social media branding.",
    `Article title: ${title}`,
    `Article content summary: ${summary || title}`,
  ].join("\n");
}

export async function generateCoverImage(
  markdown: string,
  rawConfig: CoverImageConfig,
): Promise<GeneratedCoverImage> {
  const config = normalizeCoverImageConfig(rawConfig);
  const prompt = buildCoverImagePrompt(markdown);

  const res = await fetch(`${config.baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      prompt,
      n: 1,
      size: "1792x1024",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Image generation failed (${res.status}): ${body}`);
  }

  const json = await res.json();
  const imageData = json.data?.[0];

  if (!imageData) {
    throw new Error("No image returned from API.");
  }

  const src = imageData.b64_json
    ? `data:image/png;base64,${imageData.b64_json}`
    : imageData.url || "";

  if (!src) {
    throw new Error("No image data in API response.");
  }

  return { src, revisedPrompt: imageData.revised_prompt };
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
