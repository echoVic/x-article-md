import { parseMarkdown, inlineToText, toXArticleText } from "@/lib/markdown";

export type CoverImageConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export type GeneratedCoverImage = {
  src: string;
  revisedPrompt?: string;
};

export type GenerateCoverImageOptions = {
  fetcher?: typeof fetch;
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
    "The image should feel modern, sharp, and publication-ready, with strong composition and clear visual hierarchy.",
    "Do not include readable text, captions, logos, UI chrome, watermarks, or social media branding.",
    `Article title: ${title}`,
    `Article content summary: ${summary || title}`,
  ].join("\n");
}

export async function generateCoverImage(
  markdown: string,
  rawConfig: CoverImageConfig,
  options: GenerateCoverImageOptions = {},
): Promise<GeneratedCoverImage> {
  const config = normalizeCoverImageConfig(rawConfig);
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher(`${config.baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      model: config.model,
      prompt: buildCoverImagePrompt(markdown),
      size: "1536x1024",
      quality: "medium",
      output_format: "png",
      response_format: "b64_json",
      n: 1,
    }),
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  const payload = (await response.json()) as {
    data?: Array<{
      b64_json?: string;
      url?: string;
      revised_prompt?: string;
    }>;
  };
  const image = payload.data?.[0];
  if (!image) {
    throw new Error("The image API did not return image data.");
  }

  const src = image.b64_json
    ? normalizeBase64Image(image.b64_json, "image/png")
    : image.url;

  if (!src) {
    throw new Error("The image API response did not include b64_json or url.");
  }

  return {
    src,
    revisedPrompt: image.revised_prompt,
  };
}

function normalizeBase64Image(value: string, mime: string): string {
  return value.startsWith("data:") ? value : `data:${mime};base64,${value}`;
}

function compactWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

async function getApiErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (typeof payload?.error?.message === "string") {
      return payload.error.message;
    }
    if (typeof payload?.message === "string") {
      return payload.message;
    }
    if (typeof payload?.error === "string") {
      return payload.error;
    }
  } catch {
    try {
      const text = await response.text();
      if (text.trim()) {
        return text.trim();
      }
    } catch {
      // Fall through to the HTTP status when the response body is unavailable.
    }
  }

  return `Image API request failed with HTTP ${response.status}.`;
}
