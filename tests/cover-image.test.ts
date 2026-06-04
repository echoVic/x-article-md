import { describe, expect, it } from "vitest";
import {
  buildCoverImagePrompt,
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
