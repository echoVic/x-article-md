import { describe, expect, it } from "vitest";
import { previewScrollTop } from "@/lib/scroll-sync";

// T11: percentage-only alignment ignores unequal block heights; T12: boundary NaN/overflow.
describe("source to preview scroll mapping", () => {
  it("interpolates between corresponding source blocks, including changed image heights", () => {
    const position = { offset: 150, atStart: false, atEnd: false };
    expect(previewScrollTop(position, [0, 100, 200], [0, 800, 900], 300, 1500, 1000)).toBe(850);
    expect(previewScrollTop(position, [0, 100, 200], [0, 1100, 1200], 300, 2000, 1500)).toBe(1150);
  });
  it("clamps first/last positions and handles empty or short content", () => {
    for (const [position, expected] of [
      [{ offset: 0, atStart: true, atEnd: false }, 0],
      [{ offset: 250, atStart: false, atEnd: true }, 500],
      [{ offset: 999, atStart: false, atEnd: false }, 500],
    ] as const) {
      expect(previewScrollTop(position, [0, 100], [24, 200], 300, 800, 500)).toBe(expected);
    }
    expect(previewScrollTop({ offset: 0, atStart: false, atEnd: false }, [], [], 0, 100, 0)).toBe(0);
  });
});
