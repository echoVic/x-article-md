import { describe, expect, it, vi } from "vitest";
import {
  buildCoverImagePrompt,
  generateCoverImage,
  normalizeCoverImageConfig,
} from "@/lib/cover-image";

describe("normalizeCoverImageConfig", () => {
  it("trims user settings and supplies sensible defaults", () => {
    expect(
      normalizeCoverImageConfig({
        apiKey: "  sk-test  ",
        baseUrl: "  https://api.example.com/v1/  ",
        model: "  gpt-image-2  ",
      }),
    ).toEqual({
      apiKey: "sk-test",
      baseUrl: "https://api.example.com/v1",
      model: "gpt-image-2",
    });
  });

  it("defaults base URL and model while requiring an API key", () => {
    expect(
      normalizeCoverImageConfig({
        apiKey: "sk-test",
        baseUrl: "",
        model: "",
      }),
    ).toEqual({
      apiKey: "sk-test",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-image-2",
    });

    expect(() =>
      normalizeCoverImageConfig({ apiKey: "", baseUrl: "", model: "" }),
    ).toThrow("API Key");
  });
});

describe("buildCoverImagePrompt", () => {
  it("builds an editorial cover prompt from the article title and body", () => {
    const prompt = buildCoverImagePrompt(`# Launch Notes

This release turns Markdown into **X Articles** copy with generated assets.

## Details

- Code cards
- Mermaid diagrams
`);

    expect(prompt).toContain("Launch Notes");
    expect(prompt).toContain("This release turns Markdown into X Articles");
    expect(prompt).toContain("editorial cover image");
    expect(prompt).toContain("Do not include readable text");
  });
});

describe("generateCoverImage", () => {
  it("calls an OpenAI-compatible Images API and returns base64 image data", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: [{ b64_json: "aW1hZ2U=", revised_prompt: "rewritten" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await generateCoverImage(
      "# Launch Notes\n\nShip the Markdown workflow.",
      {
        apiKey: "sk-test",
        baseUrl: "https://api.example.com/v1/",
        model: "gpt-image-2",
      },
      { fetcher },
    );

    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0][0]).toBe(
      "https://api.example.com/v1/images/generations",
    );
    expect(fetcher.mock.calls[0][1]?.headers).toEqual({
      Authorization: "Bearer sk-test",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body))).toMatchObject({
      model: "gpt-image-2",
      size: "1536x1024",
      quality: "medium",
      output_format: "png",
      response_format: "b64_json",
      n: 1,
    });
    expect(result).toEqual({
      src: "data:image/png;base64,aW1hZ2U=",
      revisedPrompt: "rewritten",
    });
  });

  it("accepts URL image responses from compatible providers", async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ data: [{ url: "https://cdn.example/1.png" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      generateCoverImage(
        "# Launch Notes",
        { apiKey: "sk-test", baseUrl: "", model: "" },
        { fetcher },
      ),
    ).resolves.toEqual({
      src: "https://cdn.example/1.png",
      revisedPrompt: undefined,
    });
  });

  it("surfaces provider error messages", async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ error: { message: "bad key" } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      generateCoverImage(
        "# Launch Notes",
        { apiKey: "sk-test", baseUrl: "", model: "" },
        { fetcher },
      ),
    ).rejects.toThrow("bad key");
  });
});
