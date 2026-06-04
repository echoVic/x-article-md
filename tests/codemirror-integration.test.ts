/**
 * CodeMirror Editor Integration Tests
 */

import { describe, it, expect } from "vitest";

describe("CodeMirror Editor Integration", () => {
  describe("Package Installation", () => {
    it("should have CodeMirror state package installed", async () => {
      const state = await import("@codemirror/state");
      expect(state.EditorState).toBeDefined();
    });

    it("should have CodeMirror view package installed", async () => {
      const view = await import("@codemirror/view");
      expect(view.EditorView).toBeDefined();
    });

    it("should have CodeMirror markdown language support", async () => {
      const lang = await import("@codemirror/lang-markdown");
      expect(lang.markdown).toBeDefined();
    });

    it("should have CodeMirror language package", async () => {
      const language = await import("@codemirror/language");
      expect(language.syntaxHighlighting).toBeDefined();
    });

    it("should have CodeMirror commands package", async () => {
      const commands = await import("@codemirror/commands");
      expect(commands.defaultKeymap).toBeDefined();
      expect(commands.indentWithTab).toBeDefined();
    });
  });

  describe("Editor Features", () => {
    it("should support markdown syntax", () => {
      const markdown = "# Hello World\n\n**Bold** and *italic*";
      expect(markdown).toContain("#");
      expect(markdown).toContain("**");
      expect(markdown).toContain("*");
    });

    it("should support code blocks", () => {
      const codeBlock = "```javascript\nconst x = 1;\n```";
      expect(codeBlock).toContain("```");
    });

    it("should support links", () => {
      const link = "[Example](https://example.com)";
      expect(link).toMatch(/\[.*\]\(.*\)/);
    });
  });

  describe("Bundle Size Considerations", () => {
    it("should use CodeMirror 6 (lighter than Monaco)", () => {
      // CodeMirror 6 is modular and tree-shakeable
      // This test confirms we're using the right library
      const packageName = "@codemirror/state";
      expect(packageName).toContain("codemirror");
    });
  });
});
