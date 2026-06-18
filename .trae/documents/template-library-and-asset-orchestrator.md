# 模块四（模板库）+ 模块六（资产编排器）实现计划

## Context

用户需要两个功能提升编辑器的工作台能力：
1. **模板库**：解决"空白页恐惧"，提供 6 个高频文章模板快速起步
2. **资产编排器**：将散落的 code image / mermaid / table / cover image 统一为一个资产面板，支持逐项操作和批量操作

---

## 当前状态

- 只有一个硬编码的 `sampleMarkdown`（`lib/sample.ts`），无模板系统
- 资产分两个独立面板：Assets Sheet（`ArticleAssets` 组件）和 Cover Image Sheet（`CoverImagePanel` 组件）
- 每个资产仅有 Copy Image + Download PNG 两个操作
- 无 zip 批量下载能力
- `XArticleAsset` 类型没有 source offset 信息

---

## 一、模板库

### 新建文件

| 文件 | 职责 |
|------|------|
| `lib/templates.ts` | 模板数据定义（`ArticleTemplate` 类型 + 6 个模板内容） |
| `components/template-picker.tsx` | 模板选择 Dialog（Grid 布局展示 6 个卡片） |

### 修改文件

| 文件 | 变更 |
|------|------|
| `lib/i18n.tsx` | 新增 ~15 个 key（模板名称、描述、确认文案） |
| `components/editor-toolbar.tsx` | Import 按钮改为 DropdownMenu，包含"导入文件"和"使用模板"两项 |
| `components/editor-page.tsx` | 新增 `templatePickerOpen` state + `handleTemplateSelect` handler |
| `lib/analytics.ts` | 新增 `"template_select"` 事件 |

### 数据模型

```typescript
// lib/templates.ts
export type ArticleTemplate = {
  id: string;
  icon: string;           // lucide icon name
  nameKey: string;        // i18n key
  descriptionKey: string; // i18n key
  content: { en: string; zh: string };
};

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [/* 6 templates */];
```

### 6 个模板结构

1. **technical-tutorial**：Title / TL;DR / Prerequisites / Step 1-3 / Common Pitfalls / Conclusion + CTA
2. **build-in-public**：Title / Context & Why / What I Built / Key Decisions / Metrics / What's Next / CTA
3. **architecture-analysis**：Title / System Overview / Architecture (mermaid) / Components / Trade-offs Table / Lessons
4. **changelog**：Title + Version / Highlights / Breaking Changes / Features / Fixes / Migration Guide
5. **thread-to-article**：Title / Hook Paragraph / 3 Expanded Sections / Evidence / Conclusion / Original Thread Link
6. **tool-introduction**：Title / Problem / Solution Overview / Quick Start Code / Comparison Table / When to Use / Links

### UI 交互

- 点击 toolbar 的 Import DropdownMenu → "使用模板" → 打开 Dialog
- Dialog 显示 6 个卡片（icon + 名称 + 一句话描述）
- 点击卡片直接应用（如果当前内容非空且非 sample，弹 `window.confirm` 确认）
- 应用后关闭 Dialog，editor 内容替换为对应 locale 的模板文本

### 关键设计决策

- 模板内容按 locale 分开存储（`content.en` / `content.zh`），不做运行时翻译
- 不做预览面板（模板短且结构清晰，卡片描述足够判断）
- 使用 Dialog 而非 Sheet（选择类 UI 更适合居中 modal）

---

## 二、资产编排器

### 新建文件

| 文件 | 职责 |
|------|------|
| `lib/asset-orchestrator.ts` | `OrchestrationAsset` 类型定义 + `buildOrchestrationAssets()` + `downloadAllAssetsAsZip()` |
| `components/asset-orchestrator.tsx` | 统一资产面板 UI（批量操作栏 + 资产列表 + Cover 区域） |

### 修改文件

| 文件 | 变更 |
|------|------|
| `lib/i18n.tsx` | 新增 ~12 个 key |
| `lib/markdown.ts` | `toXArticleClipboard` 返回值新增 `assetOffsets: number[]` |
| `components/editor-toolbar.tsx` | 合并 Assets + Cover 为单个 "Assets & Media" 按钮 |
| `components/editor-page.tsx` | 移除 `coverOpen` state，合并为统一的 `orchestratorOpen`；集成 cover 生成逻辑到资产面板 |
| `package.json` | 新增 `jszip` 依赖 |

### 数据模型

```typescript
// lib/asset-orchestrator.ts
export type AssetRenderStatus = "idle" | "rendering" | "ready" | "error";

export type OrchestrationAsset = {
  id: string;                    // "code-0", "mermaid-1", "table-2", "cover"
  order: number;
  type: "code" | "mermaid" | "table" | "tweet" | "cover";
  label: string;
  sourceOffset: number | null;   // for jump-to-source
  renderStatus: AssetRenderStatus;
  themeId: string | null;        // per-asset theme override
  // Payload (matches existing XArticleAsset fields)
  code?: string;
  language?: string;
  headers?: string[];
  rows?: string[][];
  url?: string;
  // Cached output
  renderedBlob?: Blob;
};
```

### 组件层级

```
Sheet (title="Assets & Media", titleRight=badge with count)
  └─ AssetOrchestrator
       ├─ BatchActionsBar
       │    ├─ "Download All (ZIP)" button
       │    └─ "Re-render All" button
       ├─ CoverSection (嵌入 CoverImagePanel，精简模式)
       └─ AssetList
            └─ AssetRow × N
                 ├─ Status dot (idle/rendering/ready/error)
                 ├─ Label + type badge
                 └─ Actions: Copy | Download | Re-render | Theme (DropdownMenu) | Jump
```

### 计算 source offsets

复用已有的 `computeBlockOffsets()` from `lib/preflight.ts`。在 `toXArticleClipboard` 中，每当生成一个 asset 时记录对应 block 的字符偏移量，追加到返回值的 `assetOffsets[]` 数组。

### 批量 ZIP 下载

```typescript
import JSZip from "jszip";
export async function downloadAllAssetsAsZip(
  assets: OrchestrationAsset[],
  renderFn: (asset: OrchestrationAsset) => Promise<Blob>,
): Promise<void> {
  const zip = new JSZip();
  for (const asset of assets) {
    const blob = asset.renderedBlob ?? await renderFn(asset);
    zip.file(`${asset.label.replace(/\s+/g, "-")}.png`, blob);
  }
  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, "x-article-assets.zip");
}
```

### 关键设计决策

- **Cover image 集成**：Cover 作为资产列表第一项展示，但保留现有 `CoverImagePanel` 的生成表单（嵌入为 Collapsible section），生成后 cover 变为 ready 状态
- **不移除 CoverImagePanel 组件**：仅改变它在 editor-page 中的宿主（从独立 Sheet 移入 AssetOrchestrator）
- **Theme 切换**：每个 code/mermaid 资产显示 theme 选择器（DropdownMenu），选择后自动 re-render
- **Re-render 逻辑**：调用已有的 `renderCodeToPng` / `renderMermaidToPng` / `copyTableImage` 等函数，将结果缓存到 `renderedBlob`
- **兼容 PublishPanel**：`clipboard.assets` 不变，OrchestrationAsset 只是 UI 层包装

---

## 依赖新增

```json
"jszip": "^3.10.1"
```

---

## 实施顺序

1. `lib/templates.ts` — 定义 6 个模板
2. `lib/i18n.tsx` — 新增所有 i18n key（两个模块一起加）
3. `lib/analytics.ts` — 新增 `template_select` 事件
4. `components/template-picker.tsx` — 模板选择 Dialog
5. `components/editor-toolbar.tsx` — Import → DropdownMenu，合并 Assets+Cover
6. `components/editor-page.tsx` — 模板 state + handler
7. 安装 `jszip`
8. `lib/markdown.ts` — `toXArticleClipboard` 返回 `assetOffsets`
9. `lib/asset-orchestrator.ts` — 类型 + buildOrchestrationAssets + zip 下载
10. `components/asset-orchestrator.tsx` — 统一资产面板 UI
11. `components/editor-page.tsx` — 资产编排器集成
12. 构建验证 + 浏览器测试

---

## 验证

### 模板库
1. toolbar Import → 出现 DropdownMenu 有"导入文件"和"使用模板"
2. 点击"使用模板" → 弹出 Dialog 显示 6 个卡片
3. 点击卡片 → 编辑器内容替换为模板（当前为空/sample 时直接替换）
4. 当前有修改内容时 → 弹确认框
5. 切换语言 → 卡片标题和模板内容都跟随切换

### 资产编排器
1. toolbar 只有一个 "Assets & Media" 按钮（合并了原来的 Assets + Cover）
2. 打开面板 → 看到 Cover 区域 + 按文档顺序排列的内容资产
3. 每个资产有 5 个操作按钮（Copy / Download / Re-render / Theme / Jump）
4. "Jump to Source" → 编辑器滚动到对应位置，面板关闭
5. "Re-render" → 状态变 rendering → ready
6. "Download All (ZIP)" → 下载 zip 包含所有 PNG
7. PublishPanel 工作流不受影响
