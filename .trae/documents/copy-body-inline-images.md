# Copy Body 内联图片方案

## Context

当前 Copy Body 在 image 模式下，代码块/表格/Mermaid 仅输出文字占位符（如 `XIMGPH_1`），粘贴到 X Articles 后没有图片。用户需要手动去 Assets 面板逐个复制图片再替换。

目标：Copy Body 时自动将所有可渲染 asset 渲染为 PNG base64，嵌入 `<img>` 到剪贴板 HTML 中，粘贴到 X 即有图片。

## 实现步骤

### 1. 提取 `renderMermaidToPng` 到 `lib/image-copy.ts`

- 将 `components/article-assets.tsx` 第 218-237 行的 `renderMermaidToPng` 函数移动到 `lib/image-copy.ts` 并导出
- `article-assets.tsx` 改为从 `@/lib/image-copy` 导入

### 2. 新建 `lib/asset-embed.ts`

核心函数 `enrichHtmlWithAssetImages(html, assets)`：
- 接收占位符 HTML 和 `XArticleAsset[]`
- 并行渲染所有 code/table/mermaid asset 为 PNG Blob → base64 data URL
- 用正则替换 `<span data-x-asset-placeholder="XIMGPH_N">` 为 `<img src="data:image/png;base64,...">`
- 单个 asset 渲染失败时保留占位符不变（`Promise.allSettled`）

### 3. 修改 `components/editor-page.tsx` 的 `copyBody`

- 当 `codeMode === "image"` 且有可渲染 assets 时，先调用 `enrichHtmlWithAssetImages`
- 复制期间设置 `copyState = "rendering"` 显示加载状态
- 完成后正常调 `copyRichText`

### 4. 更新 `components/editor-toolbar.tsx`

- `copyState` 类型新增 `"rendering"`
- Copy Body 按钮在 rendering 时显示 "渲染中..." 并 disabled

### 5. 添加 i18n 文案

- `rendering` / "渲染中..."

## 关键文件

- `lib/image-copy.ts` — 添加导出 `renderMermaidToPng`
- `lib/asset-embed.ts` — 新建
- `components/editor-page.tsx` — 修改 `copyBody`
- `components/editor-toolbar.tsx` — 支持 rendering 状态
- `components/article-assets.tsx` — 删除本地 `renderMermaidToPng`，改用 import
- `lib/i18n.tsx` — 添加 rendering 文案

## 验证

1. 切换到 image 模式，写一段包含代码块和表格的 Markdown
2. 点击 Copy Body，观察按钮显示"渲染中..."
3. 粘贴到任意富文本编辑器（如 Google Docs），确认图片内联显示
4. 故意写一个错误 Mermaid 语法，确认 Copy Body 仍可完成（失败 asset 保留占位符）
5. `pnpm build` 验证无类型错误
