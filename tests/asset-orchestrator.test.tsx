import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AssetOrchestrator } from "@/components/asset-orchestrator";
import { I18nProvider } from "@/lib/i18n";
import { toXArticleClipboard } from "@/lib/markdown";
import { THEME_GITHUB_LIGHT } from "@/lib/code-themes";
import { renderAssetToBlob, downloadAllAssetsAsZip } from "@/lib/asset-orchestrator";
import { copyPngBlob, downloadBlob } from "@/lib/image-copy";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/asset-orchestrator", async importOriginal => ({
  ...await importOriginal<typeof import("@/lib/asset-orchestrator")>(),
  renderAssetToBlob: vi.fn(), downloadAllAssetsAsZip: vi.fn(),
}));
vi.mock("@/lib/image-copy", () => ({ copyPngBlob: vi.fn(), downloadBlob: vi.fn() }));

const png = new Blob(["png"], { type: "image/png" });
const doc = "```mermaid\nflowchart LR\nA-->B\n```";
function view(source = doc, theme = THEME_GITHUB_LIGHT) {
  const { assets, assetOffsets } = toXArticleClipboard(source, { codeMode: "image" });
  return <I18nProvider initialLocale="zh" persistLocale={false}><AssetOrchestrator assets={assets} assetOffsets={assetOffsets} codeTheme={theme} coverBlob={null} onJumpToSource={vi.fn()} /></I18nProvider>;
}

// T5: swallowed render failure; T6: stale async side effects; T7: stale blob cache;
// T8: hidden clipboard rejection; T9: partial ZIP silently downloaded; T10: forever pending.
describe("asset recovery", () => {
  beforeEach(() => {
    vi.mocked(renderAssetToBlob).mockReset().mockResolvedValue(png);
    vi.mocked(copyPngBlob).mockReset().mockResolvedValue(true);
    vi.mocked(downloadBlob).mockReset();
    vi.mocked(downloadAllAssetsAsZip).mockReset().mockResolvedValue(undefined);
  });

  it("exposes failure details and source, and succeeds on explicit retry", async () => {
    vi.mocked(renderAssetToBlob).mockRejectedValueOnce(new Error("Parse error on line 2"));
    render(view());
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "复制图片" })); });
    expect(screen.getByRole("alert")).toHaveTextContent("Parse error on line 2");
    expect(screen.getByLabelText("源码（可选中手动复制）")).toHaveValue("flowchart LR\nA-->B");
    expect(copyPngBlob).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "重试渲染" })); });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "下载 PNG" })); });
    expect(renderAssetToBlob).toHaveBeenCalledTimes(2);
    expect(downloadBlob).toHaveBeenCalledWith(png, "Mermaid-image-1.png");
  });

  it("does not download an old render after document changes and prevents overlapping actions", async () => {
    let resolve!: (value: Blob) => void;
    vi.mocked(renderAssetToBlob).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    const { rerender } = render(view());
    fireEvent.click(screen.getByRole("button", { name: "下载 PNG" }));
    fireEvent.click(screen.getByRole("button", { name: "复制图片" }));
    expect(renderAssetToBlob).toHaveBeenCalledTimes(1);
    rerender(view(doc.replace("B", "C")));
    await act(async () => { resolve(png); });
    expect(downloadBlob).not.toHaveBeenCalled();
    expect(copyPngBlob).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "下载 PNG" })).toBeEnabled();
  });

  it("invalidates cached blobs on a theme change", async () => {
    const { rerender } = render(view());
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "复制图片" })); });
    const changed = { ...THEME_GITHUB_LIGHT, id: "test-dark", cardBg: "#111111" };
    rerender(view(doc, changed));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "复制图片" })); });
    expect(renderAssetToBlob).toHaveBeenCalledTimes(2);
    expect(renderAssetToBlob).toHaveBeenLastCalledWith(expect.any(Object), changed);
  });

  it("retains the PNG for download after clipboard failure", async () => {
    vi.mocked(copyPngBlob).mockResolvedValue(false);
    render(view());
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "复制图片" })); });
    expect(screen.getByText("剪贴板被阻止，请改用下载 PNG 或复制源码。")).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "下载 PNG" })); });
    expect(renderAssetToBlob).toHaveBeenCalledTimes(1);
    expect(downloadBlob).toHaveBeenCalledTimes(1);
  });

  it("shows the failed asset and never downloads an incomplete ZIP", async () => {
    vi.mocked(renderAssetToBlob).mockRejectedValueOnce(new Error("bad syntax"));
    render(view(doc + "\n\n```ts\nconst a = 1;\n```"));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "全部下载 (ZIP)" })); });
    expect(within(screen.getByRole("region", { name: "Mermaid image 1" })).getByRole("alert")).toHaveTextContent("bad syntax");
    expect(renderAssetToBlob).toHaveBeenCalledTimes(2);
    expect(downloadAllAssetsAsZip).not.toHaveBeenCalled();
    expect(screen.getByText("部分资源失败，未下载 ZIP。请修复或重试失败的资源。")).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "全部下载 (ZIP)" })); });
    expect(downloadAllAssetsAsZip).toHaveBeenCalledTimes(1);
    expect(renderAssetToBlob).toHaveBeenCalledTimes(3);
  });

  it("times out stalled renders, then permits retry without late side effects", async () => {
    vi.useFakeTimers();
    try {
      let resolve!: (value: Blob) => void;
      vi.mocked(renderAssetToBlob).mockImplementationOnce(() => new Promise(done => { resolve = done; }));
      render(view());
      fireEvent.click(screen.getByRole("button", { name: "下载 PNG" }));
      await act(async () => { await vi.advanceTimersByTimeAsync(20_000); });
      expect(screen.getByRole("alert")).toHaveTextContent("timed out");
      await act(async () => { fireEvent.click(screen.getByRole("button", { name: "重试渲染" })); });
      await act(async () => { resolve(png); });
      expect(downloadBlob).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    } finally { vi.useRealTimers(); }
  });
});
