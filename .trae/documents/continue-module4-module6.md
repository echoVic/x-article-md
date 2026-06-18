# 继续实现模块 4（模板库）和模块 6（资产编排器）

## 当前状态

模块 4（模板库）已基本完成（Tasks #10-15），模块 6（资产编排器）正在进行中。

### 已完成
- `lib/templates.ts` — 6 个模板数据定义
- `lib/i18n.tsx` — 所有 i18n key（模板 + 资产编排器）
- `lib/analytics.ts` — 新增 `template_select` 事件
- `components/template-picker.tsx` — 模板选择 Dialog UI
- `components/editor-toolbar.tsx` — Import DropdownMenu + "Assets & Media" 按钮
- `components/editor-page.tsx` — 模板 picker 集成
- `lib/asset-orchestrator.ts` — 核心逻辑（buildOrchestrationAssets, renderAssetToBlob, downloadAllAssetsAsZip）
- `jszip` 已安装

### 剩余任务

#### Task #17: 修改 `lib/markdown.ts` — `toXArticleClipboard` 返回 `assetOffsets`
- `XArticleClipboard` 类型已新增 `assetOffsets: number[]` 字段
- **待实现**: 在 `toXArticleClipboard` 中调用 `computeBlockOffsets(source)` 获取完整偏移量数组
- 修改 `blocksToXArticleBody` 签名接受 `blockOffsets` 参数和 `bodyStartIndex`
- 在 `blocksToXArticleBody` 每次创建 asset（case "code" fallthrough / "table" / "mermaid" / "tweet"）时，用 `blockOffsets[bodyStartIndex + blockIndex]` 记录对应偏移量到 `assetOffsets[]`
- 在 `toXArticleClipboard` 返回值中包含 `assetOffsets`

#### Task #18: 创建 `components/asset-orchestrator.tsx`
- Sheet 面板 UI，分为 Cover 区域和 Content Assets 区域
- 每个资产卡片显示：类型图标 + label + 状态指示器
- 操作按钮：复制/下载/重新生成/跳回源 block
- 底部：全部下载 ZIP / 全部重新渲染
- 使用 `buildOrchestrationAssets` + `renderAssetToBlob` + `downloadAllAssetsAsZip`
- 接收 props: `assets`, `assetOffsets`, `codeTheme`, `coverBlob`, `onJumpToSource`

#### Task #19: 修改 `editor-page.tsx` — 资产编排器集成
- 替换现有的 Assets Drawer（保留 Sheet 容器）
- 将 `assetsOpen` 状态用于资产编排器面板
- 移除独立的 Cover Drawer（Cover 集成到资产编排器中）
- 传递 `clipboard.assetOffsets` 到编排器组件

#### Task #20: 构建验证 + 浏览器测试
- `npm run build` 确认无类型错误
- 启动 dev server 验证功能

## 技术决策
- 使用现有 `computeBlockOffsets`（from preflight.ts）而非重复实现
- `blocksToXArticleBody` 需要知道 body blocks 在完整 blocks 数组中的起始索引（如果有 title block 则为 1，否则为 0）
- 资产编排器 UI 复用现有 Sheet 组件
- Cover image 保留在编排器面板顶部作为第一个资产
