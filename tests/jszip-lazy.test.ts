import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

// JSZip (~188KB gzip) must stay out of the editor's initial eager bundle.
// It is only needed when the user actually exports the assets ZIP, so it is
// loaded with a dynamic import inside downloadAllAssetsAsZip (same pattern as
// mermaid-block.tsx / image-copy.ts for mermaid). These tests guard both the
// source layout and the runtime behavior against regression.

vi.mock("@/lib/image-copy", () => ({
  downloadBlob: vi.fn(),
  renderCodeToPng: vi.fn(),
  renderMermaidToPng: vi.fn(),
  renderTableToPng: vi.fn(),
  copyPngBlob: vi.fn(),
}));

import { downloadAllAssetsAsZip } from "@/lib/asset-orchestrator";
import { downloadBlob } from "@/lib/image-copy";

const ROOT = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("JSZip lazy loading", () => {
  afterEach(() => vi.mocked(downloadBlob).mockClear());

  it("loads JSZip via dynamic import and has no static jszip import", () => {
    const src = readFileSync(join(ROOT, "lib/asset-orchestrator.ts"), "utf8");
    expect(src).toContain('await import("jszip")');
    // A static ESM import of jszip looks like `... from "jszip"` or
    // `require("jszip")`; the dynamic form above must be the only reference.
    expect(src).not.toContain('from "jszip"');
    expect(src).not.toContain('require("jszip")');
  });

  it("no editor-chained module (app/, components/, lib/) statically imports jszip", () => {
    for (const dir of ["app", "components", "lib"]) {
      for (const file of walk(join(ROOT, dir))) {
        const src = readFileSync(file, "utf8");
        expect(
          src.includes('from "jszip"') || src.includes('require("jszip")'),
          `${file.replace(ROOT, "")} must not statically import jszip`,
        ).toBe(false);
      }
    }
  });

  it("produces a real ZIP through the dynamically loaded JSZip", async () => {
    const png = new Blob(["png-bytes"], { type: "image/png" });
    const assets = [
      {
        id: "code-0",
        order: 0,
        type: "code" as const,
        label: "Hello World",
        sourceOffset: null,
        renderStatus: "ready" as const,
        themeId: null,
        renderedBlob: png,
      },
    ];
    await downloadAllAssetsAsZip(assets, { id: "theme" } as never, () => true);

    expect(downloadBlob).toHaveBeenCalledTimes(1);
    const [blob, filename] = vi.mocked(downloadBlob).mock.calls[0] as [Blob, string];
    expect(filename).toBe("x-article-assets.zip");
    expect(blob.type).toBe("application/zip");
    // jsdom's Blob lacks arrayBuffer(); read the header through FileReader.
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(blob);
    });
    const header = new Uint8Array(buffer).subarray(0, 2);
    expect(header[0]).toBe(0x50); // "P"
    expect(header[1]).toBe(0x4b); // "K"
  });
});
