import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// app/favicon.ico is a Next.js metadata convention: it is served at
// /favicon.ico after build. This test pins the binary structure so a
// corrupted or placeholder ico cannot slip through.
const ICO_PATH = resolve(__dirname, "..", "app", "favicon.ico");

function parseIco(buf: Buffer) {
  expect(buf.readUInt16LE(0)).toBe(0); // reserved
  expect(buf.readUInt16LE(2)).toBe(1); // type: icon
  const count = buf.readUInt16LE(4);
  expect(count).toBeGreaterThan(0);
  const sizes: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    const dir = 6 + i * 16;
    const w = buf.readUInt8(dir);
    const h = buf.readUInt8(dir + 1);
    sizes.push([w === 0 ? 256 : w, h === 0 ? 256 : h]);
  }
  return sizes;
}

describe("app/favicon.ico", () => {
  it("exists as a real ICO file", () => {
    const buf = readFileSync(ICO_PATH);
    expect(buf.length).toBeGreaterThan(100);
    const sizes = parseIco(buf);
    const dims = new Set(sizes.map(([w, h]) => `${w}x${h}`));
    expect(dims.has("16x16")).toBe(true);
    expect(dims.has("32x32")).toBe(true);
  });
});
