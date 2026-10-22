import { describe, expect, it } from "vitest";
import { parseMarkdown } from "@/lib/markdown";
import { runPreflight } from "@/lib/preflight";

// T1: token warnings missing/incorrectly blocking; T2: raw regex warns inside fences/tables.
describe("inline code preflight", () => {
  it("warns on inline tokens without blocking and preserves source locations", () => {
    const source = "# Use `api`\n\nRun `npm test`.\n\n> Read `config`\n\n- Try `one`\n- Try `two`";
    const report = runPreflight(parseMarkdown(source), source, "image");
    const warnings = report.items.filter(item => item.kind === "inline-code");
    expect(warnings).toHaveLength(5);
    expect(warnings.every(item => item.level === "warning")).toBe(true);
    expect(warnings.map(item => item.sourceOffset)).toEqual([0, source.indexOf("Run"), source.indexOf(">"), source.indexOf("- Try"), source.indexOf("- Try")]);
    expect(report.status).toBe("warning");
    expect(report.summary.unsupportedCount).toBe(0);
  });

  it("does not warn for image-bound tables, fenced source or ordinary text", () => {
    const source = "Plain text\n\n```ts\nconst x = `value`;\n```\n\n| A | B |\n| --- | --- |\n| `one` | two |";
    const report = runPreflight(parseMarkdown(source), source, "image");
    expect(report.items.filter(item => item.kind === "inline-code")).toEqual([]);
  });
});
