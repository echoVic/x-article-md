import { describe, expect, it } from "vitest";
import { swapLocalePath } from "@/lib/locale-path";

describe("swapLocalePath", () => {
  it("swaps home paths", () => {
    expect(swapLocalePath("/")).toEqual({ href: "/zh", to: "zh" });
    expect(swapLocalePath("/zh")).toEqual({ href: "/", to: "en" });
  });

  it("preserves deep paths for translated routes (compare + tools)", () => {
    expect(swapLocalePath("/compare").href).toBe("/zh/compare");
    expect(swapLocalePath("/zh/compare").href).toBe("/compare");
    expect(swapLocalePath("/editor").href).toBe("/zh/editor");
    expect(swapLocalePath("/zh/editor").href).toBe("/editor");
    expect(swapLocalePath("/thread").href).toBe("/zh/thread");
    expect(swapLocalePath("/code-to-image").href).toBe("/zh/code-to-image");
    expect(swapLocalePath("/mermaid-to-png").href).toBe("/zh/mermaid-to-png");
    expect(swapLocalePath("/markdown-table-to-image").href).toBe(
      "/zh/markdown-table-to-image",
    );
    expect(swapLocalePath("/markdown-to-x-articles").href).toBe(
      "/zh/markdown-to-x-articles",
    );
  });

  it("preserves blog deep paths", () => {
    expect(swapLocalePath("/blog").href).toBe("/zh/blog");
    expect(swapLocalePath("/zh/blog/my-post").href).toBe("/blog/my-post");
  });

  it("falls back to the other home when no translated counterpart exists", () => {
    expect(swapLocalePath("/privacy").href).toBe("/zh");
  });
});
