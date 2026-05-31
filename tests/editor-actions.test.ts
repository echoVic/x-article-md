import { describe, expect, it } from "vitest";
import { applyMarkdownAction, handleMarkdownEnter, insertTab } from "@/lib/editor-actions";

describe("applyMarkdownAction", () => {
  it("wraps selected text in bold markers and keeps the text selected", () => {
    expect(
      applyMarkdownAction(
        { value: "ship fast", selectionStart: 0, selectionEnd: 4 },
        "bold",
      ),
    ).toEqual({
      value: "**ship** fast",
      selectionStart: 2,
      selectionEnd: 6,
    });
  });

  it("turns selected text into a markdown link and selects the URL placeholder", () => {
    expect(
      applyMarkdownAction(
        { value: "Visit x.com", selectionStart: 6, selectionEnd: 11 },
        "link",
      ),
    ).toEqual({
      value: "Visit [x.com](https://)",
      selectionStart: 14,
      selectionEnd: 22,
    });
  });

  it("prefixes every selected line when creating a bullet list", () => {
    expect(
      applyMarkdownAction(
        { value: "Alpha\nBeta", selectionStart: 0, selectionEnd: 10 },
        "bulletList",
      ).value,
    ).toBe("- Alpha\n- Beta");
  });

  it("inserts a code fence around selected text", () => {
    expect(
      applyMarkdownAction(
        { value: "const ship = true;", selectionStart: 0, selectionEnd: 18 },
        "codeFence",
      ).value,
    ).toBe("```ts\nconst ship = true;\n```");
  });

  it("inserts a useful table scaffold at the cursor", () => {
    expect(
      applyMarkdownAction(
        { value: "Intro\n", selectionStart: 6, selectionEnd: 6 },
        "table",
      ).value,
    ).toBe("Intro\n| Name | Value |\n| --- | --- |\n| Item | Detail |");
  });
});

describe("keyboard helpers", () => {
  it("continues an unordered list on Enter", () => {
    expect(
      handleMarkdownEnter({
        value: "- First item",
        selectionStart: 12,
        selectionEnd: 12,
      }),
    ).toEqual({
      value: "- First item\n- ",
      selectionStart: 15,
      selectionEnd: 15,
    });
  });

  it("exits an empty list item on Enter", () => {
    expect(
      handleMarkdownEnter({
        value: "- ",
        selectionStart: 2,
        selectionEnd: 2,
      }),
    ).toEqual({
      value: "",
      selectionStart: 0,
      selectionEnd: 0,
    });
  });

  it("indents the current line with two spaces on Tab", () => {
    expect(
      insertTab({
        value: "Alpha\nBeta",
        selectionStart: 8,
        selectionEnd: 8,
      }),
    ).toEqual({
      value: "Alpha\n  Beta",
      selectionStart: 10,
      selectionEnd: 10,
    });
  });
});
