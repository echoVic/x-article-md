# Radix UI 统一迁移计划

## Context

项目中所有交互组件（下拉菜单、抽屉、模态框、Select、折叠面板等）均为手写实现，存在以下问题：
- mousedown/click 事件竞态导致下拉菜单选项无法触发（已修复的 bug）
- 缺少焦点管理、ESC 关闭、无障碍属性
- 原生 `<select>` 不可定制样式
- 原生 `<details>` 无法实现平滑过渡动画

目标：统一使用 Radix UI 原语，创建 `components/ui/` 目录放置封装组件。

---

## 需安装的依赖

```bash
pnpm add @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-accordion @radix-ui/react-collapsible @radix-ui/react-toggle-group @radix-ui/react-tooltip
pnpm add -D tailwindcss-animate
```

已有：`@radix-ui/react-dropdown-menu`

---

## 实施阶段

### 阶段 0：基础设施

1. **创建 `components/ui/` 目录**，将 `components/dropdown-menu.tsx` → `components/ui/dropdown-menu.tsx`，更新 `markdown-editor.tsx` 的 import
2. **安装 `tailwindcss-animate`**，在 `tailwind.config.ts` 的 plugins 中添加，并添加 accordion 动画 keyframes
3. **在 `components/providers.tsx` 中加入 `<TooltipPrimitive.Provider>`**

### 阶段 1：Sheet（右侧抽屉）

新建 `components/ui/sheet.tsx`，基于 `@radix-ui/react-dialog`，从右侧滑入。

替换 `editor-page.tsx` 中的：
- Cover Image Drawer（`coverOpen` state）
- Assets Drawer（`assetsOpen` state）

**不迁移 Manual Copy Panel**——需要用户手动选中文本，focus trap 会干扰。

### 阶段 2：Dialog（居中弹窗）

新建 `components/ui/dialog.tsx`，基于 `@radix-ui/react-dialog`，居中 + 遮罩。

替换 `markdown-editor.tsx` 中的 Polish Comparison Overlay（`polishComparison` state）。

### 阶段 3：Tooltip

新建 `components/ui/tooltip.tsx`，基于 `@radix-ui/react-tooltip`。

只迁移**纯图标按钮**（无可见文字标签的按钮），约 5-6 处：
- `markdown-editor.tsx` 工具栏图标按钮（Polish、Translate、Reset + format buttons）
- `theme-toggle.tsx`

有文字标签的按钮（language-toggle、app-header nav links 等）保持 `title` 属性。

### 阶段 4：Select

新建 `components/ui/select.tsx`，基于 `@radix-ui/react-select`。

替换 `editor-toolbar.tsx` 中的原生 `<select>`（代码主题选择器）。

### 阶段 5：ToggleGroup

新建 `components/ui/toggle-group.tsx`，基于 `@radix-ui/react-toggle-group`。

替换 `editor-toolbar.tsx` 中的代码模式切换（quote/image 分段按钮）。

### 阶段 6：Accordion + Collapsible

新建 `components/ui/accordion.tsx`，基于 `@radix-ui/react-accordion`。
新建 `components/ui/collapsible.tsx`，基于 `@radix-ui/react-collapsible`。

替换：
- `editor-faq.tsx` 的 `<details>/<summary>`
- `cover-image-panel.tsx` standalone 模式的展开/收起

---

## 文件清单

| 操作 | 路径 |
|------|------|
| 新增 | `components/ui/sheet.tsx` |
| 新增 | `components/ui/dialog.tsx` |
| 新增 | `components/ui/tooltip.tsx` |
| 新增 | `components/ui/select.tsx` |
| 新增 | `components/ui/toggle-group.tsx` |
| 新增 | `components/ui/accordion.tsx` |
| 新增 | `components/ui/collapsible.tsx` |
| 移动 | `components/dropdown-menu.tsx` → `components/ui/dropdown-menu.tsx` |
| 修改 | `tailwind.config.ts`（plugins + keyframes） |
| 修改 | `components/providers.tsx`（TooltipProvider） |
| 修改 | `components/editor-page.tsx`（Sheet 替换 drawer） |
| 修改 | `components/markdown-editor.tsx`（Dialog + Tooltip + import 路径） |
| 修改 | `components/editor-toolbar.tsx`（Select + ToggleGroup） |
| 修改 | `components/editor-faq.tsx`（Accordion） |
| 修改 | `components/cover-image-panel.tsx`（Collapsible） |
| 修改 | `components/theme-toggle.tsx`（Tooltip） |

---

## 不迁移的组件

| 组件 | 理由 |
|------|------|
| Manual Copy Panel | focus trap 会干扰文本选中和系统复制 |
| language-toggle | 简单按钮/Link 切换，有文字标签，不需要 Radix |
| app-header nav | 路由级 Link 导航，不是 widget |

---

## 验证方式

每个阶段完成后：
1. `npx tsc --noEmit` 确认无类型错误
2. 浏览器中测试对应功能的打开/关闭/选择/键盘导航
3. 确认 ESC 关闭、Tab 焦点管理、aria 属性正确
4. 确认主题切换后样式无异常
