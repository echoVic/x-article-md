# 暗色模式切换实现计划

## Context

任务清单 #11：当前项目只有亮色模式（`color-scheme: light`），所有颜色通过 CSS 变量（oklch）定义在 `:root` 中。需要添加亮/暗/跟随系统三态切换，持久化用户选择。

## 方案

使用 `next-themes` + CSS 变量覆盖 + class 策略。

## 实施步骤

### 1. 安装依赖
```bash
pnpm add next-themes
```

### 2. Tailwind 配置 — `tailwind.config.ts`
添加 `darkMode: "class"`

### 3. 暗色 CSS 变量 — `app/globals.css`
在 `:root` 块之后添加 `.dark {}` 选择器，覆盖所有颜色变量：

| 变量 | Light | Dark |
|------|-------|------|
| --bg | 97% | 14% |
| --surface | 100% | 18% |
| --fg | 16% | 92% |
| --muted | 50% | 58% |
| --border | 91% | 26% |
| --accent | 55% | 68% |
| shadow opacity | 4-10% | 20-40% |

### 4. ThemeProvider — `components/providers.tsx`
包裹 `<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>`

### 5. ThemeToggle 组件（新建）— `components/theme-toggle.tsx`
- 三态循环：light → dark → system → light
- 图标：太阳 / 月亮 / 显示器
- SSR 安全（mounted 状态）
- 样式与 LanguageToggle 一致

### 6. 集成 — `components/app-header.tsx` + `components/landing-page.tsx`
在语言切换按钮旁边放置 ThemeToggle

### 7. Editor header — `components/editor-page.tsx`
同样在右侧操作区添加 ThemeToggle

## 不需要改动的部分

- **CodeMirror**：已全部使用 CSS 变量，自动适应
- **代码块**：硬编码深色背景在两种模式下都合理，保持不变
- **FOUC**：`next-themes` 内置阻塞 script + `suppressHydrationWarning` 已存在

## 验证方式

1. `pnpm build` 无报错
2. 启动 dev server，在 editor/thread/landing 三个页面验证：
   - 点击切换按钮，三态循环正常
   - 刷新页面不闪烁，主题持久化
   - 系统模式下修改系统偏好自动切换
3. CodeMirror 编辑器在暗色下可读性正常
