import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TableImageTool } from "@/components/table-image-tool";
import { trackEvent } from "@/lib/analytics";
import { copyPngBlob, downloadBlob, renderTableToPng } from "@/lib/image-copy";
import { parseMarkdownTable } from "@/lib/markdown";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/image-copy", () => ({
  renderTableToPng: vi.fn(),
  copyPngBlob: vi.fn(),
  downloadBlob: vi.fn(),
}));

describe("parseMarkdownTable", () => {
  it("parses headers, alignments and rows, reducing inline Markdown to text", () => {
    const table = parseMarkdownTable(
      [
        "Intro paragraph",
        "",
        "| **Plan** | Price | Link |",
        "| :--- | ---: | :---: |",
        "| `Free` | $0 | [docs](https://x.com) |",
        "| Pro | $12 |",
      ].join("\n"),
    );

    expect(table).toEqual({
      headers: ["Plan", "Price", "Link"],
      alignments: ["left", "right", "center"],
      rows: [
        ["Free", "$0", "docs"],
        ["Pro", "$12", ""],
      ],
    });
  });

  it("returns null when there is no separator row", () => {
    expect(parseMarkdownTable("| a | b |\n| c | d |")).toBeNull();
    expect(parseMarkdownTable("just text")).toBeNull();
  });
});

describe("TableImageTool", () => {
  const blob = new Blob(["png"], { type: "image/png" });

  beforeEach(() => {
    vi.mocked(renderTableToPng).mockReset().mockResolvedValue(blob);
    vi.mocked(copyPngBlob).mockReset();
    vi.mocked(downloadBlob).mockReset();
    vi.mocked(trackEvent).mockReset();
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  it("renders the sample table and copies the image with table_tool tracking", async () => {
    vi.mocked(copyPngBlob).mockResolvedValue(true);
    render(<TableImageTool />);

    const preview = await screen.findByRole("img", { name: "Image preview" });
    expect(preview).toHaveAttribute("src", "blob:preview");
    expect(renderTableToPng).toHaveBeenLastCalledWith(
      ["Plan", "Price", "Seats", "Support"],
      expect.any(Array),
      { alignments: ["left", "right", "center", "left"], theme: "light" },
    );

    fireEvent.click(screen.getByRole("button", { name: /Copy image/ }));

    await screen.findByRole("button", { name: /Copied/ });
    expect(copyPngBlob).toHaveBeenCalledWith(blob);
    expect(trackEvent).toHaveBeenCalledWith("asset_copy", {
      type: "table",
      theme: "light",
      surface: "table_tool",
      cols: 4,
      rows: 3,
      ok: true,
    });
  });

  it("re-renders in dark theme and downloads a PNG", async () => {
    render(<TableImageTool />);
    await screen.findByRole("img", { name: "Image preview" });

    fireEvent.click(screen.getByRole("radio", { name: "Dark" }));
    await waitFor(() =>
      expect(renderTableToPng).toHaveBeenLastCalledWith(
        expect.any(Array),
        expect.any(Array),
        expect.objectContaining({ theme: "dark" }),
      ),
    );

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Download PNG/ })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: /Download PNG/ }));
    expect(downloadBlob).toHaveBeenCalledWith(blob, "markdown-table.png");
    expect(trackEvent).toHaveBeenCalledWith(
      "asset_download",
      expect.objectContaining({ theme: "dark", surface: "table_tool", ok: true }),
    );
  });

  it("shows a fallback hint when the clipboard rejects the image", async () => {
    vi.mocked(copyPngBlob).mockResolvedValue(false);
    render(<TableImageTool />);
    await screen.findByRole("img", { name: "Image preview" });

    fireEvent.click(screen.getByRole("button", { name: /Copy image/ }));

    await screen.findByRole("button", { name: /Copy blocked/ });
    expect(trackEvent).toHaveBeenCalledWith(
      "asset_copy",
      expect.objectContaining({ ok: false }),
    );
  });

  it("shows an error instead of spinning forever when rendering fails", async () => {
    vi.mocked(renderTableToPng).mockRejectedValue(new Error("canvas"));
    render(<TableImageTool />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not render this table");
    expect(screen.getByRole("button", { name: /Copy image/ })).toBeDisabled();
  });

  it("explains the expected format and disables actions for invalid input", async () => {
    render(<TableImageTool locale="zh" />);
    await screen.findByRole("img", { name: "图片预览" });

    await act(async () => {
      fireEvent.change(screen.getByLabelText("Markdown 表格"), {
        target: { value: "not a table" },
      });
    });

    expect(screen.getByRole("alert")).toHaveTextContent("没有识别到表格");
    expect(screen.getByRole("button", { name: /复制图片/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /下载 PNG/ })).toBeDisabled();
  });
});
