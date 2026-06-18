# 工具栏布局重构方案 V3

## 现状分析

当前工具栏 (40px, `h-10`) 采用三区水平布局：

```
[Zone A: 内容源]  |  [Zone B: 输出配置]  |  [Zone C: 输出动作]
Templates Import Export Assets Status  |  Quote/Image ThemeSelect  |  Preflight Publish | CopyBody Nudge ... 
```

### 痛点

1. **信息密度过高** — 13+ 个控件挤在一行，小屏幕时靠隐藏文字 label 来适应，操作目标小
2. **心智模型不清** — "模板"和"导入"放一起有道理，但"资源面板"和"保存状态点"也夹在其中，逻辑跳跃
3. **优先级扁平** — Import/Export（低频）和 Copy Body（核心动作）视觉权重差别不够大
4. **分隔符弱** — 1px 竖线在小尺寸下几乎看不到，区域感不强
5. **上下文关联弱** — 代码主题选择器无论有无代码块都占位（虽然 V2 加了 opacity-40，但仍占空间）

## 设计原则

- **渐进式披露 (Progressive Disclosure)**: 高频操作始终可见，低频操作折叠
- **空间语义分组**: 左侧 = 输入相关（文档管理），右侧 = 输出相关（发布流程）
- **动作优先级金字塔**: Copy Body > Preflight/Publish > Code Mode > 其他
- **弹性布局**: 不同屏幕宽度下优雅降级，核心功能不丢失

## 新布局方案

### 整体结构：两端对齐 + 中间弹性间距

```
┌─────────────────────────────────────────────────────────────────┐
│ [左区: 文档管理]          [中区: 内容配置]           [右区: 发布流] │
│                                                                 │
│ 📄Template ▼Assets(3)    Quote|Image [Theme▾]     ✓Pre 📋Copy ▸│
│                                                                 │
│ (Saved●)                  ← 有代码块时展开 →                      │
└─────────────────────────────────────────────────────────────────┘
```

### 具体区域设计

#### 左区：文档管理 (flex-shrink-0)
- **Templates** — ghost 按钮 (保持 V2)
- **Assets** — badge 图标按钮 (保持 V2)
- **保存状态** — 绿点 (保持 V2)
- **overflow**: Import/Export 在小屏移入 overflow，大屏直接显示

#### 中区：内容配置 (flex-1, justify-center)
- **Code Mode 切换** — ToggleGroup (Quote / Image)
- **Theme 选择器** — 仅 Image 模式时展开
- **关键改进**: 当 `!hasCodeBlocks` 时这整个区域 **收起为单行提示** "No code blocks"（节省空间给两侧），而不是 opacity-40 的占位
- 在宽屏 (>=1024px) 时居中对齐，窄屏时左对齐紧跟左区

#### 右区：发布流 (flex-shrink-0)  
- **Preflight** — 图标按钮 (着色 + ring)
- **Publish** — 图标按钮 (边框强调)
- **分隔** — 细竖线
- **Copy Body** — 主 CTA 按钮 (accent 背景，最大视觉权重)
- **Nudge chip** — 复制成功后临时出现
- **Overflow (⋯)** — Copy Title + Import + Export

### 关键改进点

1. **中区弹性收缩**：无代码块时中区变成 `"No code blocks"` 小标签，释放空间给 Copy Body 按钮显示完整文字
2. **Copy Body 按钮升级**：
   - 默认态：pill 形状，更大 padding (`px-3 py-1.5`)，更明显的圆角
   - 成功态：绿色背景 + Check 图标 + "Copied" 文字（保持 V2）
   - 增加微妙的 shadow 让它在视觉上"浮起来"
3. **Preflight + Publish 合并为"发布准备组"**：
   - 用一个浅色背景框 `bg-[var(--fg-soft)]` 将二者包裹，形成视觉组
   - 暗示：这两个按钮是一套流程的入口
4. **左区精简**：
   - 大屏 (>=1024): Templates + Import + Export + Assets + Status
   - 中屏 (768-1024): Templates + Assets + Status（Import/Export 入 overflow）
   - 小屏 (<768): Assets + Status（Templates 入 overflow）
5. **中区自适应**：
   - 有代码块时：完整展示 ToggleGroup + Select
   - 无代码块时：隐藏整个配置区，只剩两端
   - 这样小屏不再有 opacity-40 的"灰色占位"问题
6. **Tooltip 增强**：每个按钮 tooltip 增加快捷键提示（如有）

## 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `components/editor-toolbar.tsx` | 重写 | 三区弹性布局、中区条件渲染、Copy Body 升级 |
| `app/globals.css` | 小改 | 可能新增 publish-group 背景样式（也可用 Tailwind 内联） |
| `lib/i18n.tsx` | 无变更 | 现有 key 足够 |

## 实现步骤

1. 重构 `editor-toolbar.tsx` — 将三区改为 flexbox justify-between 弹性布局
2. 中区改为条件渲染 — `hasCodeBlocks ? <配置面板> : null`
3. 右区 Copy Body 样式升级 — 更大的 pill + subtle shadow
4. Preflight + Publish 加背景框包裹
5. 响应式类调整 — 使用 `hidden sm:flex`、`hidden lg:flex` 控制各尺寸显示
6. 验证构建 + 浏览器测试

## 视觉示意

### 宽屏 (>=1024px), 有代码块:
```
[🗎Templates] [↑Import] [↓Export] [📄Assets③] ●    [Quote|Image] [Theme▾]    [🛡Pre 📋Pub] | [█ Copy Body] [⋯]
```

### 宽屏 (>=1024px), 无代码块:
```
[🗎Templates] [↑Import] [↓Export] [📄Assets③] ●                               [🛡Pre 📋Pub] | [█ Copy Body] [⋯]
```

### 中屏 (768-1024), 有代码块:
```
[🗎Templates] [📄③] ●    [Q|I] [Theme▾]    [🛡 📋] | [█ Copy] [⋯]
```

### 小屏 (<768):
```
[📄③] ●                                     [🛡 📋] | [█ 📋] [⋯]
```
