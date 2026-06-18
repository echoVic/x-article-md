import type { CodeImageTheme } from "@/lib/code-themes";
import { downloadBlob, renderCodeToPng, renderMermaidToPng, renderTableToPng } from "@/lib/image-copy";
import type { XArticleAsset } from "@/lib/markdown";
import JSZip from "jszip";

export type AssetRenderStatus = "idle" | "rendering" | "ready" | "error";

export type OrchestrationAsset = {
  id: string;
  order: number;
  type: "code" | "mermaid" | "table" | "tweet" | "cover";
  label: string;
  sourceOffset: number | null;
  renderStatus: AssetRenderStatus;
  themeId: string | null;
  code?: string;
  language?: string;
  headers?: string[];
  rows?: string[][];
  url?: string;
  renderedBlob?: Blob;
};

export function buildOrchestrationAssets(
  assets: XArticleAsset[],
  assetOffsets: number[],
  coverBlob: Blob | null,
): OrchestrationAsset[] {
  const result: OrchestrationAsset[] = [];

  if (coverBlob) {
    result.push({
      id: "cover",
      order: 0,
      type: "cover",
      label: "Cover Image",
      sourceOffset: null,
      renderStatus: "ready",
      themeId: null,
      renderedBlob: coverBlob,
    });
  }

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const base: Pick<OrchestrationAsset, "id" | "order" | "label" | "sourceOffset" | "renderStatus" | "themeId"> = {
      id: `${asset.type}-${i}`,
      order: (coverBlob ? 1 : 0) + i,
      label: asset.label,
      sourceOffset: assetOffsets[i] ?? null,
      renderStatus: "idle",
      themeId: null,
    };

    if (asset.type === "code" || asset.type === "mermaid") {
      result.push({ ...base, type: asset.type, code: asset.code, language: "language" in asset ? asset.language : undefined });
    } else if (asset.type === "table") {
      result.push({ ...base, type: "table", headers: asset.headers, rows: asset.rows });
    } else if (asset.type === "tweet") {
      result.push({ ...base, type: "tweet", url: asset.url });
    }
  }

  return result;
}

export async function renderAssetToBlob(
  asset: OrchestrationAsset,
  codeTheme: CodeImageTheme,
): Promise<Blob> {
  switch (asset.type) {
    case "code":
      return renderCodeToPng(asset.code ?? "", asset.language ?? "", codeTheme);
    case "mermaid":
      return renderMermaidToPng(asset.code ?? "", codeTheme);
    case "table":
      return renderTableToPng(asset.headers ?? [], asset.rows ?? []);
    case "cover":
      if (asset.renderedBlob) return asset.renderedBlob;
      throw new Error("Cover image has no blob");
    case "tweet":
      throw new Error("Tweet assets cannot be rendered to PNG");
  }
}

export async function downloadAllAssetsAsZip(
  assets: OrchestrationAsset[],
  codeTheme: CodeImageTheme,
): Promise<void> {
  const zip = new JSZip();
  const renderableAssets = assets.filter((a) => a.type !== "tweet");

  for (const asset of renderableAssets) {
    const blob = asset.renderedBlob ?? await renderAssetToBlob(asset, codeTheme);
    const filename = asset.label.replace(/[^a-zA-Z0-9_-]/g, "-") + ".png";
    zip.file(filename, blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, "x-article-assets.zip");
}
