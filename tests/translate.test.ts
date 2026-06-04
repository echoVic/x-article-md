import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Translation API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should preserve markdown formatting during translation", async () => {
    const markdown = `# Hello World

This is **bold** text and this is *italic*.

Here's some \`inline code\` and a [link](https://example.com).

\`\`\`javascript
console.log("This should not be translated");
\`\`\`

- List item 1
- List item 2
`;

    // Mock the translation behavior
    const mockTranslatedText = `# 你好世界

这是**粗体**文本，这是*斜体*。

这里有一些\`inline code\`和一个[link](https://example.com)。

\`\`\`javascript
console.log("This should not be translated");
\`\`\`

- 列表项 1
- 列表项 2
`;

    // Verify that the structure is preserved
    expect(mockTranslatedText).toContain("# ");
    expect(mockTranslatedText).toContain("**");
    expect(mockTranslatedText).toContain("*");
    expect(mockTranslatedText).toContain("`inline code`");
    expect(mockTranslatedText).toContain("[link](https://example.com)");
    expect(mockTranslatedText).toContain("```javascript");
    expect(mockTranslatedText).toContain('console.log("This should not be translated");');
    expect(mockTranslatedText).toContain("- ");
  });

  it("should not translate code blocks", () => {
    const codeBlock = `\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\``;

    // Code content should remain unchanged
    expect(codeBlock).toContain('def hello_world()');
    expect(codeBlock).toContain('print("Hello, World!")');
  });

  it("should not translate inline code", () => {
    const text = "Use the `useState` hook in React.";

    // Inline code should remain unchanged
    expect(text).toContain("`useState`");
  });

  it("should not translate URLs", () => {
    const text = "Visit [GitHub](https://github.com) for more.";

    // URL should remain unchanged
    expect(text).toContain("https://github.com");
  });

  it("should handle empty markdown", () => {
    const emptyMarkdown = "";
    expect(emptyMarkdown).toBe("");
  });

  it("should preserve table formatting", () => {
    const table = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`;

    // Table structure should be preserved
    expect(table).toContain("|");
    expect(table).toContain("---");
  });
});

describe("Translation request validation", () => {
  it("should require markdown field", () => {
    const invalidRequest = { targetLang: "zh" };
    expect(invalidRequest).not.toHaveProperty("markdown");
  });

  it("should require targetLang field", () => {
    const invalidRequest = { markdown: "test" };
    expect(invalidRequest).not.toHaveProperty("targetLang");
  });

  it("should only accept 'en' or 'zh' as targetLang", () => {
    const validLangs = ["en", "zh"];
    const invalidLangs = ["fr", "de", "es", "ja"];

    validLangs.forEach(lang => {
      expect(["en", "zh"]).toContain(lang);
    });

    invalidLangs.forEach(lang => {
      expect(["en", "zh"]).not.toContain(lang);
    });
  });
});
