# 工具栏 UX 重设计方案

## 摘要

重新设计 `EditorToolbar`，将 10+ 个平铺按钮精简为"图标 + Tooltip"模式，按工作流阶段划分为三个清晰区域，增加响应式折叠能力。目标：减少视觉噪音、强化操作阶段感、适配不同屏宽。

---

## 当前痛点

1. **全文字标签 + 图标**占用横向空间过多，中文 locale 更严重（"资源与媒体"、"代码引用" 等较长）
2. **11 个操作按钮** + 1 个 Toggle + 1 个 Select 全部平铺在一行 40px 里，视觉密度高
3. **分组仅靠 1px 分割线**，肉眼很难区分"内容准备"vs"输出配置"vs"发布动作"
4. **无响应式处理**，窄屏直接溢出
5. **视觉层级弱**——除 "Copy Body"(filled) 和 "Templates"(outlined accent) 外全是同一灰色按钮，重要动作不突出
6. **代码主题 Select 有条件出现**，导致布局跳动

---

## 设计原则

| 原则 | 落地 |
|------|------|
| **图标优先，Tooltip 补充** | 常规操作改为 icon-only 28×28 按钮，hover 出 Tooltip |
| **区域化分组** | 用微弱背景色（fg-soft）包裹每个功能区域，而非仅靠 1px 线 |
| **时间轴从左到右** | 左=内容来源(模板/导入) → 中=配置(代码模式/主题) → 右=输出(检查/发布/复制) |
| **主 CTA 最右最突出** | "复制正文"作为终极目标保持 filled accent 样式 |
| **响应式降级** | ≤768px：所有文字隐藏变纯图标；≤640px：低频按钮折叠入 overflow "..." 菜单 |

---

## 新布局 (从左到右)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [区域A: 内容来源]     [区域B: 配置]      ←stretch→  [区域C: 输出]    │
│                                                                      │
│  📄模板 ⬆导入 ⬇导出 🗂资源  │  ☰Quote ▣Image [Theme▾]  │  ✓检查 📋发 │
│                    ●已保存   │                          │  布 📋标题   │
│                              │                          │  [复制正文]  │
└──────────────────────────────────────────────────────────────────────┘
```

### 区域 A — 内容来源 (Content)

| 按钮 | 图标 | 模式 | 说明 |
|------|------|------|------|
| 模板 | `LayoutTemplate` | **图标+文字** (保留文字，因为是主入口) | accent-outlined 样式不变 |
| 导入 | `Upload` | 图标-only | Tooltip: "导入 Markdown" |
| 导出 | `Download` | 图标-only | Tooltip: "导出 Markdown" |
| 资源 | `FileText` | 图标-only + badge | Tooltip: "资源与媒体" + 数字 badge |
| 状态 | green dot | 纯指示器 | "●已保存" 缩为绿点 + Tooltip "草稿已保存" |

区域包裹：不加背景（因为是最左起始区域，自然归属）。按钮间距 2px，区域之间间距更大(12px) + 更高的分割线(18px)。

### 区域 B — 输出配置 (Config)

| 控件 | 类型 | 说明 |
|------|------|------|
| 代码模式 | ToggleGroup (保持不变) | "引用"/"图片" 两段切换 |
| 代码主题 | Select (保持不变) | **始终显示**（设为 disabled + 显示 "—" 当 mode=quote），避免布局跳动 |

区域包裹：用 `bg-[var(--fg-soft)] rounded-[var(--radius-sm)] px-1.5 py-0.5` 微弱背景色块包起来，视觉上形成一个小面板。

### 区域 C — 输出动作 (Actions)

| 按钮 | 图标 | 模式 | 说明 |
|------|------|------|------|
| 检查 | `ShieldCheck` | 图标-only + 状态点 | Tooltip: "预飞检查" |
| 发布 | `ListChecks` | 图标-only | Tooltip: "发布清单" |
| 复制标题 | `ClipboardCopy` | 图标-only | Tooltip: "复制标题" |
| 复制正文 | `ClipboardCopy` | **图标+文字** (filled accent CTA) | 保留文字，因为是终极 CTA |

区域靠右对齐，"复制正文"用 filled accent 是最大视觉权重。

---

## 响应式策略

| 断点 | 行为 |
|------|------|
| ≥1024px | 完整布局：模板按钮带文字 + 复制正文带文字 + ToggleGroup 带文字 |
| 768-1023px | 模板和复制正文仍带文字，ToggleGroup 改为图标-only |
| ≤767px | 全部改为图标-only（包括模板和复制正文），Tooltip 补充 |
| ≤640px | 低频按钮（导入、导出、复制标题）折叠进 overflow DropdownMenu（`MoreHorizontal` 图标触发） |

实现方式：使用 Tailwind 的 `hidden sm:inline` / `lg:inline` + 一个简单的 `useMediaQuery` 或纯 CSS 隐藏/显示。

---

## 详细改动

### 文件 1: `components/editor-toolbar.tsx` (重写)

**改动:**
1. 所有普通操作按钮 → icon-only (28×28) + `<Tooltip>`
2. 模板按钮和复制正文保留文字（加 responsive class：`<span className="hidden lg:inline ml-1">{label}</span>`）
3. 区域 B 包裹一个带 `bg-[var(--fg-soft)]` 的容器
4. 代码主题 Select 在 quote 模式下改为 disabled 而非隐藏
5. 区域间分隔改用更大间距(gap-3) + 更高分割线(h-[18px])
6. 引入 `<Tooltip>` (已有组件)
7. 新增 overflow menu：窄屏时 `导入`/`导出`/`复制标题` 折叠到 DropdownMenu 中
8. 引入 `MoreHorizontal` icon from lucide-react

**结构（伪码）:**
```tsx
<div className="flex h-10 items-center justify-between px-4 ...">
  {/* 区域A: 内容来源 */}
  <div className="flex items-center gap-1">
    <Tooltip content={t.templatePickerTitle}>
      <button accent-outlined>{icon}<span className="hidden lg:inline">{text}</span></button>
    </Tooltip>
    <Tooltip content={t.importFile}><button icon-only>{Upload}</button></Tooltip>
    <Tooltip content={t.exportFile}><button icon-only>{Download}</button></Tooltip>
    <Tooltip content={t.orchestratorTitle}>
      <button icon-only>{FileText}{badge}</button>
    </Tooltip>
    {/* Draft status: just a dot, tooltip shows text */}
    <Tooltip content={draftReady ? t.saved : t.loading}>
      <span className="dot" />
    </Tooltip>
  </div>

  {/* 区域B: 配置 - 有微弱背景 */}
  <div className="flex items-center gap-1 bg-[var(--fg-soft)] rounded-[var(--radius-sm)] px-1.5 py-0.5">
    <ToggleGroup ... />
    <Select disabled={codeMode !== "image"} ... />
  </div>

  {/* 区域C: 输出动作 */}
  <div className="flex items-center gap-1">
    <Tooltip content={t.preflightRun}><button icon-only>{ShieldCheck}{dot}</button></Tooltip>
    <Tooltip content={t.publishTitle}><button icon-only>{ListChecks}</button></Tooltip>
    <div className="w-px h-[18px] bg-[var(--border)]" />
    <Tooltip content={t.copyTitle}><button icon-only>{ClipboardCopy}</button></Tooltip>
    <button CTA-filled>{ClipboardCopy}<span className="hidden lg:inline">{text}</span></button>
    {/* Overflow menu for narrow screens */}
    <div className="lg:hidden">
      <DropdownMenu trigger={MoreHorizontal}>
        <Item onClick={onImport}>{t.importFile}</Item>
        <Item onClick={onExport}>{t.exportFile}</Item>
        <Item onClick={onCopyTitle}>{t.copyTitle}</Item>
      </DropdownMenu>
    </div>
  </div>
</div>
```

### 文件 2: `components/ui/select.tsx` (小改)

**改动:** 添加 `disabled` prop 支持。当 disabled 时显示占位符 "—"，背景变灰，不可交互。（检查是否 Radix Select 原生支持 disabled——是的，`Select.Root` 接受 `disabled` prop）

### 文件 3: `lib/i18n.tsx` (小改)

**改动:** 添加 overflow menu 的 Tooltip 和按钮 aria-label 所需的新 key（可选，如果现有 key 已够用则不需要）。检查后现有 key 已经覆盖所有需求——无需新增。

---

## 视觉样式细节

### Icon-only 按钮统一样式
```
inline-flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)]
text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--fg-soft)]
transition-all active:scale-[0.97]
```

### 区域 B 面板样式
```
flex items-center gap-1.5 bg-[var(--fg-soft)] rounded-[var(--radius)] px-1.5 py-[3px]
```

### 区域间分隔
```
mx-2 w-px h-[18px] bg-[var(--border)] opacity-60
```
比之前更高 (18px vs 14px)，加 opacity 让分隔更柔和。

### CTA 按钮不变
```
bg-[var(--accent)] text-white text-[11px] font-medium
hover:bg-[var(--accent-hover)] active:scale-[0.97]
```

---

## 假设与决策

| 决策 | 原因 |
|------|------|
| 模板按钮保留文字 | 用户明确表示模板是高频入口，需要一眼看到 |
| 复制正文保留文字 | 终极 CTA，需要最大视觉权重 |
| 代码主题 Select 始终显示(disabled) | 避免布局跳动，用户选 image 模式时更容易找到 |
| 不做溢出横向滚动 | Toolbar scrolling 体验差，改用 DropdownMenu 折叠 |
| 三段式而非两段式 | 四个方向用户都选了，说明配置区域需要独立辨识度 |
| 响应式用 Tailwind class 而非 JS | 减少 JS bundle，CSS 媒体查询足够 |

---

## 验证步骤

1. `npm run build` 确保编译通过
2. 启动 dev server，手动测试：
   - 宽屏 (≥1024px)：模板和复制正文显示文字
   - 中屏 (768-1023px)：ToggleGroup 文字隐藏
   - 窄屏 (≤767px)：全图标模式
   - 极窄 (≤640px)：overflow menu 出现，低频按钮折入
3. 验证 Tooltip 在每个 icon-only 按钮上正常显示
4. 验证 Code Theme Select disabled 状态视觉正确
5. 验证 Templates 和 Copy Body 在各断点的样式
6. Dark mode 下检查区域 B 的背景色是否过于突兀
