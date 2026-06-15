# Radix UI 统一迁移计划（剩余阶段）

## 概要

将项目中所有自定义交互组件统一替换为已创建的 Radix UI 封装组件。已完成基础设施搭建（阶段 0-2），本计划覆盖剩余阶段 3-7 的具体实施步骤。

## 当前状态

| 已完成 | 内容 |
|--------|------|
| 阶段 0 | 安装依赖、`components/ui/` 目录、tailwind animate 插件、`TooltipProvider` |
| 阶段 1 | `Sheet` 替换 `editor-page.tsx` 中两个抽屉 |
| 阶段 2 | `Dialog` 替换 `markdown-editor.tsx` 中 Polish Comparison Overlay |

| 已创建但未集成 | 文件 |
|----------------|------|
| `Tooltip` | `components/ui/tooltip.tsx` |
| `Select` | `components/ui/select.tsx` |
| `ToggleGroup` | `components/ui/toggle-group.tsx` |
| `Accordion` | `components/ui/accordion.tsx` |
| `Collapsible` | `components/ui/collapsible.tsx` |

## 剩余实施步骤

---

### 阶段 3：Tooltip 替换

**目标文件：** `markdown-editor.tsx`、`theme-toggle.tsx`、`app-header.tsx`、`language-toggle.tsx`、`code-block.tsx`

**原则：** 仅对**纯图标按钮**（无可见文本标签的按钮）用 Tooltip 包裹。导航链接中已有可见文字的 `title=` 可直接删除（可见文字本身已足够），无需 Tooltip。

#### 3a. `markdown-editor.tsx`

1. 已添加 `import { Tooltip } from "./ui/tooltip"`
2. 工具栏按钮（循环渲染，约第 265-274 行）：
   - 删除 `title={...}`
   - 用 `<Tooltip content={item.shortcut ? \`${label} (${item.shortcut})\` : label}>` 包裹 `<button>`
3. Polish 按钮（约第 287-299 行）：
   - 删除 `title={t.toolPolish}`
   - 用 `<Tooltip content={t.toolPolish}>` 包裹 trigger `<button>`
4. Translate 按钮（约第 313-325 行）：
   - 删除 `title={t.toolTranslate}`
   - 用 `<Tooltip content={t.toolTranslate}>` 包裹 trigger `<button>`
5. Reset 按钮（约第 333-341 行）：
   - 删除 `title={t.toolReset}`
   - 用 `<Tooltip content={t.toolReset}>` 包裹 `<button>`

**注意：** DropdownMenu 的 trigger 按钮也需要 Tooltip 包裹。Radix DropdownMenu.Trigger 使用 `asChild`，因此 Tooltip 应包裹在 DropdownMenu 外层或用一层 `<span>` 作为 trigger 中间层。最简做法：删除这两个 trigger 按钮的 `title=`，不加 Tooltip（因为 DropdownMenu 打开时 Tooltip 会干扰）。

#### 3b. `theme-toggle.tsx`

1. 添加 `import { Tooltip } from "./ui/tooltip"`
2. 删除 `title={label}`
3. 用 `<Tooltip content={label}>` 包裹 `<button>`

#### 3c. `app-header.tsx`

- Logo 链接、导航链接已有可见文字 → 直接删除 `title=` 属性即可（不包 Tooltip）
- 语言切换（如果是纯图标）→ 看 `language-toggle.tsx` 实际渲染

#### 3d. `language-toggle.tsx`

1. 添加 `import { Tooltip } from "./ui/tooltip"`
2. 删除 `title={accessibleLabel}`
3. 用 `<Tooltip content={accessibleLabel}>` 包裹按钮/链接元素

#### 3e. `code-block.tsx`

1. 添加 `import { Tooltip } from "./ui/tooltip"`
2. 删除复制按钮的 `title={...}`
3. 用 `<Tooltip content={动态文本}>` 包裹按钮
   - 注意：`content` 随 state 动态变化（"复制为图片"/"已复制"/"复制失败"），Radix Tooltip 支持动态 content

---

### 阶段 4：Select 替换

**目标文件：** `editor-toolbar.tsx`

**当前代码（约第 80-92 行）：**
```tsx
<select value={codeThemeId} onChange={(e) => onCodeThemeChange(e.target.value)} className="...">
  <option value="auto">{t.codeThemeAuto}</option>
  {CODE_THEMES.map(...)}
</select>
```

**替换为：**
```tsx
import { Select } from "./ui/select";

<Select
  value={codeThemeId}
  onValueChange={onCodeThemeChange}
  options={[
    { value: "auto", label: t.codeThemeAuto },
    ...CODE_THEMES.map(theme => ({ value: theme.id, label: theme.name }))
  ]}
/>
```

---

### 阶段 5：ToggleGroup 替换

**目标文件：** `editor-toolbar.tsx`

**当前代码（约第 52-77 行）：** 手写分段控件 `<div><button>Quote</button><button>Image</button></div>`

**替换为：**
```tsx
import { ToggleGroup } from "./ui/toggle-group";
import { AlignLeft, Image } from "lucide-react";

<ToggleGroup
  value={codeMode}
  onValueChange={onCodeModeChange}
  items={[
    { value: "quote", label: <><AlignLeft size={12} /> {t.codeQuote}</> },
    { value: "image", label: <><Image size={12} /> {t.codeImage}</> },
  ]}
/>
```

---

### 阶段 6：Accordion 替换

**目标文件：** `editor-faq.tsx`、`landing-page.tsx`

#### 6a. `editor-faq.tsx`

**当前代码（约第 20-30 行）：**
```tsx
<details key={i} className="...">
  <summary className="...">{faq.question}<ChevronDown .../></summary>
  <div className="...">{faq.answer}</div>
</details>
```

**替换为：**
```tsx
import { Accordion } from "./ui/accordion";

<Accordion items={faqItems} />
```

其中 `faqItems` 已经是 `{ question: string; answer: string }[]` 格式。

#### 6b. `landing-page.tsx`

**当前代码（约第 232-240 行）：**
```tsx
<details key={i} className="faq-item">
  <summary className="faq-question">{faq.question}</summary>
  <p className="faq-answer">{faq.answer}</p>
</details>
```

**替换为：**
```tsx
import { Accordion } from "./ui/accordion";

<Accordion items={t.faqs} />
```

注意：`landing-page.tsx` 使用了 CSS class（`faq-item`、`faq-question`、`faq-answer`），替换后需要确认这些 class 是否有全局样式影响。如果有，需要在 Accordion 组件中 或通过额外 className prop 保持外观。

---

### 阶段 7：Collapsible 替换

**目标文件：** `cover-image-panel.tsx`

**当前代码（约第 210-236 行，standalone 模式）：**
```tsx
const [expanded, setExpanded] = useState(false);
// ...
<aside className="...">
  <button onClick={() => setExpanded(!expanded)} className="...">
    <span>{t.coverTitle}</span>
    <ChevronDown className={`... ${expanded ? "rotate-180" : ""}`} />
  </button>
  {expanded && <div className="...">{formContent}</div>}
</aside>
```

**替换为：**
```tsx
import { Collapsible } from "./ui/collapsible";

<aside className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)]">
  <Collapsible title={t.coverTitle}>
    <div className="border-t border-[var(--border)] p-4">
      {formContent}
    </div>
  </Collapsible>
</aside>
```

删除 `expanded` state 和手写的 toggle 逻辑。

---

## 清理

- 删除所有已无用的 `import { ChevronDown }` (在不再使用的文件中)
- 验证 `landing-page.tsx` 中 `.faq-item` / `.faq-question` / `.faq-answer` 全局 CSS 是否存在且需要保留

## 验证步骤

1. `npm run build` — 确认无 TypeScript 编译错误
2. 浏览器手动测试：
   - 工具栏按钮 hover 显示 Tooltip
   - 代码主题 Select 可打开和选择
   - 代码模式 ToggleGroup 切换正常
   - FAQ Accordion 展开/折叠有动画
   - Cover Image Panel 折叠正常
   - 翻译/润色 DropdownMenu 功能正常（回归测试）
3. 确认暗色模式下所有 Radix 弹出层样式正常
