import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderSvgToPng } from "@/lib/image-copy";

// T1: Blob transport or lost HTML/Unicode labels. Browser origin-clean behavior
// is separately exercised in the real browser; this fake only models loading.
// T2: responsive dimensions silently fall back to 300px or distort aspect ratio.
// T3: invalid XML proceeds to drawing. T4: image errors never reject/clean up.
// T5: canvas failures get swallowed. T6: stalled image leaves handlers/timers alive.
const images: FakeImage[] = [];
let loadMode: "load" | "error" | "pending" = "load";
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 300;
  naturalHeight = 150;
  private value = "";
  constructor() { images.push(this); }
  get src() { return this.value; }
  set src(value: string) {
    this.value = value;
    if (!value) return;
    if (value.startsWith("data:")) {
      const root = new DOMParser().parseFromString(decodeURIComponent(value.split(",").slice(1).join(",")), "image/svg+xml").documentElement;
      this.naturalWidth = Number(root.getAttribute("width")) || 300;
      this.naturalHeight = Number(root.getAttribute("height")) || 150;
    }
    queueMicrotask(() => {
      if (loadMode === "load") this.onload?.();
      if (loadMode === "error") this.onerror?.();
    });
  }
}

const context = { scale: vi.fn(), fillRect: vi.fn(), drawImage: vi.fn(), fillStyle: "" };
const png = new Blob(["png"], { type: "image/png" });
let canvasSize: number[] = [];

beforeEach(() => {
  images.length = 0;
  loadMode = "load";
  canvasSize = [];
  vi.stubGlobal("Image", FakeImage);
  vi.stubGlobal("devicePixelRatio", 2);
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (this: HTMLCanvasElement, callback) {
    canvasSize = [this.width, this.height];
    callback(png);
  });
  context.scale.mockClear(); context.fillRect.mockClear(); context.drawImage.mockClear();
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("renderSvgToPng", () => {
  it("loads HTML labels through UTF-8 data URL without removing their content", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 778 382"><foreignObject width="150" height="80"><div xmlns="http://www.w3.org/1999/xhtml">中文 &amp; café #1</div></foreignObject></svg>';
    expect(await renderSvgToPng(svg)).toBe(png);
    expect(images[0].src).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    const loaded = decodeURIComponent(images[0].src.split(",").slice(1).join(","));
    expect(loaded).toContain("foreignObject");
    expect(loaded).toContain("中文 &amp; café #1");
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(canvasSize).toEqual([1556, 764]);
    expect(images[0].onload).toBeNull();
    expect(images[0].onerror).toBeNull();
  });

  it("preserves explicit sizes and derives missing dimensions without stretching small SVGs", async () => {
    for (const [attributes, expected] of [
      ['width="100%" viewBox="0 0 800 400"', [1600, 800]],
      ['width="400px" viewBox="0 0 800 400"', [800, 400]],
      ['height="100" viewBox="0 0 800 400"', [400, 200]],
      ['width="100" height="50" viewBox="0 0 800 400"', [200, 100]],
      ['width="100" height="50"', [200, 100]],
      ['viewBox="0 0 NaN -1"', [600, 300]],
    ] as const) {
      await renderSvgToPng(`<svg xmlns="http://www.w3.org/2000/svg" ${attributes}></svg>`);
      expect(canvasSize).toEqual(expected);
    }
  });

  it("rejects malformed or non-SVG input before starting an image load", async () => {
    for (const svg of ["", "<svg>", "<html/>"]) await expect(renderSvgToPng(svg)).rejects.toThrow("Invalid SVG");
    expect(images).toHaveLength(0);
    expect(context.drawImage).not.toHaveBeenCalled();
  });

  it("cleans up on image load failure and stops before drawing", async () => {
    loadMode = "error";
    await expect(renderSvgToPng('<svg xmlns="http://www.w3.org/2000/svg"/>')).rejects.toThrow("Unable to load SVG");
    expect(images[0].onload).toBeNull();
    expect(images[0].onerror).toBeNull();
    expect(context.drawImage).not.toHaveBeenCalled();
  });

  it("propagates canvas export rejection and handles a null PNG", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="50"/>';
    const error = new DOMException("tainted", "SecurityError");
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementationOnce(() => { throw error; });
    await expect(renderSvgToPng(svg)).rejects.toBe(error);
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementationOnce(callback => callback(null));
    await expect(renderSvgToPng(svg)).rejects.toThrow("Unable to render image");
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null);
    await expect(renderSvgToPng(svg)).rejects.toThrow("Canvas is unavailable");
  });

  it("bounds a stalled image load and clears callbacks before a late event", async () => {
    vi.useFakeTimers();
    loadMode = "pending";
    const result = renderSvgToPng('<svg xmlns="http://www.w3.org/2000/svg"/>');
    const failure = expect(result).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(15_000);
    await failure;
    expect(images[0].onload).toBeNull();
    expect(images[0].onerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    expect(context.drawImage).not.toHaveBeenCalled();
  });
});
