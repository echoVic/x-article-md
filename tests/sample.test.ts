import { describe, expect, it } from "vitest";
import {
  getSampleMarkdown,
  sampleMarkdown,
  sampleMarkdownZh,
} from "@/lib/sample";

describe("editor default sample", () => {
  it("resolves the localized sample for each locale", () => {
    expect(getSampleMarkdown("en")).toBe(sampleMarkdown);
    expect(getSampleMarkdown("zh")).toBe(sampleMarkdownZh);
  });

  it("never starts with an H1, so the editor page keeps a single H1", () => {
    for (const sample of [sampleMarkdown, sampleMarkdownZh]) {
      const hasH1 = sample
        .split("\n")
        .some((line) => /^#\s/.test(line));
      expect(hasH1).toBe(false);
    }
  });

  it("ships English copy for en and Chinese copy for zh", () => {
    expect(sampleMarkdown).toContain("From Markdown to X Articles");
    expect(sampleMarkdownZh).toContain("从 Markdown 到 X Articles");
  });
});
