# Header 统一重构计划

## Context

当前三个页面各自实现了导航栏，全局功能（logo、页面切换、语言切换、主题切换）与页面特定功能（import/export/copy 等）混在同一行，职责不清。需要将全局导航统一为一个共享组件，编辑器功能按钮下移到编辑器内容区域。

## 设计决策

- **Landing Page** — 保持独立 header 不动（有锚点导航和 CTA，风格特殊）
- **Editor + Thread** — 共用统一的 `AppHeader` 全局导航
- **Editor 工具栏** — 从 header 移到编辑器区域内部（作为编辑区顶部工具栏）

## 目标布局

### Editor 页面：
```
┌─────────────────────────────────────────────────────┐
│ [MD→X] | Editor  Thread |        🌙 EN             │  ← 全局 AppHeader
├─────────────────────────────────────────────────────┤
│ Import Export | Assets Cover | ●Saved | Copy Title Copy Body │  ← 编辑器内部工具栏
├────────────────────────┬────────────────────────────┤
│                        │                            │
│    Editor 编辑区        │    Preview 预览区           │
│                        │                            │
└────────────────────────┴────────────────────────────┘
```

### Thread 页面：
```
┌─────────────────────────────────────────────────────┐
│ [MD→X] | Editor  Thread |        🌙 EN             │  ← 同一个 AppHeader
├─────────────────────────────────────────────────────┤
│ Thread 内容区                                        │
└─────────────────────────────────────────────────────┘
```

## 实施步骤

### 1. 修改 AppHeader — 移除页面特定逻辑
- 文件：`components/app-header.tsx`
- 确保只包含：Logo + Editor/Thread 导航 + ThemeToggle + LanguageToggle
- 目前已经是这样，无需大改，只需确认对 Editor 页面也适用

### 2. 创建 EditorToolbar 组件
- 新文件：`components/editor-toolbar.tsx`
- 从 `editor-page.tsx` 的 header 中提取出编辑功能按钮
- 内容：代码模式切换 (Quote/Image) + Import + Export + Assets + Cover Image + 草稿状态 + Copy Title + Copy Body
- 样式：紧凑的一行工具栏（h-10），灰色底边框分隔，位于编辑器内容区顶部

### 3. 重构 editor-page.tsx
- 移除现有的内联 header（整个 `<header>` 区域）
- 顶部替换为 `<AppHeader activePage="editor" />`
- 编辑器内容区（grid 双栏区域）上方插入 `<EditorToolbar />`
- 将 Logo、导航、ThemeToggle、LanguageToggle 的代码删除（由 AppHeader 提供）

### 4. 传递状态给 EditorToolbar
- EditorToolbar 需要接收的 props：
  - `onImport`, `onExport` — 文件操作回调
  - `onCopyTitle`, `onCopyBody` — 复制回调
  - `onToggleAssets`, `onToggleCover` — 面板切换
  - `codeMode`, `onCodeModeChange` — Quote/Image 切换
  - `draftStatus` — "Saved" / "Loading"
  - `assetsCount` — Assets badge 数字

## 关键文件
- `components/app-header.tsx` — 统一全局 header（已有，微调）
- `components/editor-toolbar.tsx` — 新建，编辑器功能工具栏
- `components/editor-page.tsx` — 重构，删除内联 header，加入 AppHeader + EditorToolbar

## 验证
1. `pnpm build` 无报错
2. 浏览器验证 Editor 页面：全局 header 一行 + 工具栏一行 + 编辑区
3. Thread 页面：全局 header 一行 + 内容区（与之前一致）
4. 页面切换：Editor ↔ Thread 导航正常
5. 语言/主题切换在两个页面行为一致
6. Editor 工具栏功能（import/export/copy/assets/cover）全部正常
