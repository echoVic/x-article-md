import { describe, expect, it } from "vitest";

import {
  buildDateRange,
  formatRowsForConsole,
  parseDimensions,
  toGscRequest,
} from "../scripts/gsc-utils.mjs";

describe("GSC utility helpers", () => {
  it("builds a complete-day date range ending yesterday", () => {
    expect(buildDateRange(28, new Date("2026-07-08T12:00:00.000Z"))).toEqual({
      startDate: "2026-06-10",
      endDate: "2026-07-07",
    });
  });

  it("parses comma-separated dimensions with a sensible default", () => {
    expect(parseDimensions()).toEqual(["date"]);
    expect(parseDimensions(" page, query,device ")).toEqual(["page", "query", "device"]);
  });

  it("creates a Search Analytics API request body", () => {
    expect(
      toGscRequest({
        startDate: "2026-06-10",
        endDate: "2026-07-07",
        dimensions: ["page", "query"],
        rowLimit: 50,
      }),
    ).toEqual({
      startDate: "2026-06-10",
      endDate: "2026-07-07",
      dimensions: ["page", "query"],
      rowLimit: 50,
      searchType: "web",
    });
  });

  it("formats rows with CTR and position for quick chat analysis", () => {
    const output = formatRowsForConsole([
      {
        keys: ["/editor", "markdown to x"],
        clicks: 10,
        impressions: 200,
        ctr: 0.05,
        position: 8.4,
      },
    ]);

    expect(output).toContain("/editor | markdown to x");
    expect(output).toContain("clicks=10");
    expect(output).toContain("impressions=200");
    expect(output).toContain("ctr=5.00%");
    expect(output).toContain("position=8.4");
  });
});
