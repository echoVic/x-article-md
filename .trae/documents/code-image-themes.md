# 代码图片多主题支持

## Context
当前代码块和表格渲染为 PNG 图片时只有一种浅色风格（硬编码颜色）。用户希望支持多种经典主题风格（GitHub、Monokai、Atom、VS Code、Xcode），表格保持不变。

## 方案

### 1. 新建 `lib/code-themes.ts`

定义 `CodeImageTheme` 类型（id, name, cardBg, panelBg, headerBg, textColor, lineNumberColor, borderColor, labelColor, controlColor, shadowColor）和 6 个主题对象：

- **GitHub Light** — 当前默认（白底灰面板）
- **GitHub Dark** — #0d1117 底，#161b22 面板，#e6edf3 文字
- **Monokai** — #272822 底，#1e1f1c 面板，#f8f8f2 文字，#a6e22e 行号
- **Atom One Dark** — #282c34 底，#21252b 面板，#abb2bf 文字
- **VS Code Dark** — #1e1e1e 底，#252526 面板，#d4d4d4 文字
- **Xcode Dark** — #292a30 底，#1f2024 面板，#ffffff 文字

导出 `CODE_THEMES` 数组和 `getDefaultThemeId(isDark)` 辅助函数。

### 2. 参数化 `lib/image-copy.ts`

- `renderCodeToPng(code, language, theme?)` — 不传时默认 GitHub Light
- 所有硬编码颜色替换为 `theme.xxx`
- `copyCodeImage` / `downloadCodeImage` 透传 theme

### 3. 状态放在 `editor-page.tsx`

- `const [codeThemeId, setCodeThemeId] = useState("auto")`
- "auto" 根据系统 prefers-color-scheme 自动选 GitHub Light / VS Code Dark
- 解析后的 `resolvedTheme` 传给 EditorToolbar、ArticleAssets、CodeBlock

### 4. UI 选择器在 EditorToolbar

- 仅在 `codeMode === "image"` 时显示
- 原生 `<select>` 下拉，选项: Auto / GitHub Light / GitHub Dark / Monokai / Atom One Dark / VS Code Dark / Xcode Dark
- 放在 Code Quote/Code Image 切换器右侧

### 5. 下游透传

- `ArticleAssets` 接收 `codeTheme` prop，传给 copy/download 函数
- `CodeBlock` 接收 `codeTheme` prop，传给 `copyCodeImage`

### 6. i18n

补充 `codeTheme` / `codeThemeAuto` 翻译键。

## 涉及文件

| 文件 | 操作 |
|------|------|
| `lib/code-themes.ts` | 新建 |
| `lib/image-copy.ts` | 参数化颜色 |
| `components/editor-page.tsx` | 新增 state + 传递 |
| `components/editor-toolbar.tsx` | 新增 select UI |
| `components/article-assets.tsx` | 接收 prop 传递 |
| `components/code-block.tsx` | 接收 prop 传递 |
| `lib/i18n.tsx` | 补翻译 |

## 验证

1. `pnpm build` 通过
2. 启动 dev server，切换不同主题，在 Assets 面板点 "Copy Image"，确认图片颜色正确
3. 切到 "auto"，切换系统暗色模式，验证自动切换生效
