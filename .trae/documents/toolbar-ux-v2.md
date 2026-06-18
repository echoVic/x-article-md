# 工具栏 UX 优化 V2：工作流 + 上下文感知 + 视觉层次

## 背景

上一轮完成了图标化 + 三区域 + 响应式布局的基础改造。本轮进一步优化三个方向：
1. **工作流优化** — 减少操作步骤，复制后自动引导下一步
2. **上下文感知** — 根据内容和操作状态智能调整 UI
3. **视觉层次再打磨** — 让主操作更醒目，层次更清晰

---

## 当前状态分析

| 问题 | 影响 |
|------|------|
| Copy Body 按钮永远是 accent 色，复制后 1.8s 回到 idle 没有后续引导 | 用户需要自己记住下一步操作 |
| Preflight 状态小点太小(5px)，容易忽略 | 有问题时用户可能直接复制发布 |
| 代码配置区(Zone B)在没有代码块时仍然占据中心位置 | 浪费空间，分散注意力 |
| Zone C 里 Preflight 和 Publish 是同等权重的图标按钮 | 但 Publish 是终点操作，应该更突出 |
| 复制标题和复制正文两个按钮，但 90% 场景是复制正文 | 标题复制的优先级不必这么高 |
| 模板按钮始终 accent 边框 | 使用过一次后不再高频，持续高亮干扰 |

---

## 设计方案

### 1. 工作流优化：Copy → Next Step 引导

**改动：Copy Body 按钮状态机扩展**

按钮有四个视觉态：
- `idle` → accent 实底 + "复制正文" 文字
- `copying` → accent 实底 + spinner (可选, 如果 copy 有延迟)
- `done` → success 色(绿) + ✓ 图标 + "已复制" 文字，2s 后自动切到 `nudge`
- `nudge` → 按钮恢复 idle 外观，但旁边出现一个轻量提示 chip："Paste into X Articles →" / 发布引导

**实现**：在 `EditorToolbar` 内部用 `useEffect` 监听 `copyState`，当变为 `body` 时显示 nudge chip，5s 后自动消失或点击关闭。

### 2. 上下文感知

#### 2a. 代码配置区根据内容条件显示

当文档中没有代码块时，Zone B 的 ToggleGroup + Select 区域淡化（更低 opacity）并附加一行 tooltip 提示 "No code blocks in document"。不完全隐藏以保持布局稳定。

**实现**：`EditorToolbar` 增加 prop `hasCodeBlocks: boolean`，由 `editor-page.tsx` 传入（从 `blocks` 数组中检测）。Zone B 容器增加 `opacity-40 pointer-events-none` 条件类。

#### 2b. Preflight 按钮上下文增强

- 从未运行 → 默认图标态（中性灰）
- 有 warning → 图标变为 warning 色(整个图标，不只是小点) + 微动画 pulse
- 有 blocked → 图标变为 danger 色 + 红色描边环
- 通过 → 图标变为 success 色

**实现**：根据 `preflightStatus` 对 ShieldCheck 图标本身上色，移除之前的 5px 小点。

#### 2c. Copy Body 成功后 Preflight 按钮视觉提示

如果用户在没有运行 Preflight 的情况下复制正文，Preflight 按钮产生一次 attention pulse（边框闪烁），提醒检查。这比 toast 更轻量。

**实现**：复用现有 `showPreflightHint` 逻辑，给 Preflight 按钮加 `animate-[ring-pulse]` class。

### 3. 视觉层次再打磨

#### 3a. 主按钮层次

| 按钮 | 当前 | 改进 |
|------|------|------|
| Copy Body | accent 实底, 永远 | accent 实底 → 成功态绿色 → nudge 态回 accent |
| Templates | accent 边框 | 改为 ghost 态（无边框，hover 时 accent 底色），降低视觉优先级 |
| Publish | 普通 iconBtn | 给一个微妙底色环(accent-soft border) 让它比其他图标稍突出 |
| Copy Title | 普通 iconBtn | 移入 overflow menu（Zone C 的 ···），减少主行密度 |

#### 3b. Zone 分隔符改进

当前 Zone B 用 `bg-[var(--fg-soft)]` 做面板背景。改为更明确的左右各一条 1px 竖线分隔 + zone 内无背景，让视觉更轻：

```
Zone A  │  Zone B  │  Zone C
```

但保留 Zone B 内部 ToggleGroup 的 pill 容器。

#### 3c. 间距调优

- 图标按钮从 `w-7 h-7`(28px) 增加到 `w-8 h-8`(32px)，点击目标更大
- 按钮间 `gap-1`(4px) 增加到 `gap-1.5`(6px)，减少拥挤感
- Zone C 的 Copy Body 按钮 padding 从 `px-2` 增加到 `px-2.5`，更舒展

---

## 改动文件清单

| 文件 | 改动 |
|------|------|
| `components/editor-toolbar.tsx` | 核心重构：新状态机、上下文感知、视觉层次调整 |
| `components/editor-page.tsx` | 传入 `hasCodeBlocks` prop；调整 nudge 消失逻辑 |
| `lib/i18n.tsx` | 新增 `nudgePublish` / `noCodeBlocks` 等 key |
| `app/globals.css` | 新增 `@keyframes ring-pulse` 动画 |

---

## 详细实现步骤

### Step 1: 新增 i18n keys

```
nudgePublish: "Paste into X →"  /  "粘贴到 X →"
noCodeBlocks: "No code blocks"  /  "无代码块"
```

### Step 2: 修改 `editor-page.tsx`

- 从 `blocks` 计算 `hasCodeBlocks`：`blocks.some(b => b.type === "code" || b.type === "mermaid")`
- 将 `hasCodeBlocks` 传给 `<EditorToolbar>`

### Step 3: 重构 `editor-toolbar.tsx`

1. Props 新增 `hasCodeBlocks: boolean`
2. 内部新增 `showNudge` state，在 `copyState === "body"` 后 2s 设置为 true，5s 后设置为 false
3. Templates 按钮样式从 accent 边框改为 ghost
4. Zone B 增加 `hasCodeBlocks` 条件淡化
5. Zone 分隔用竖线代替背景色
6. Preflight 按钮图标着色（整体）代替小点
7. Publish 按钮加 accent-soft 边框
8. Copy Title 移入 overflow menu
9. Copy Body 增加成功态(绿色)
10. Nudge chip 渲染

### Step 4: 新增 CSS keyframe

```css
@keyframes ring-pulse {
  0%, 100% { box-shadow: 0 0 0 0 var(--accent-soft); }
  50% { box-shadow: 0 0 0 3px var(--accent-soft); }
}
```

### Step 5: 构建验证

- `npm run build` 通过
- 浏览器测试：
  - 无代码块文档 → Zone B 淡化
  - 有代码块文档 → Zone B 正常
  - 点击 Copy Body → 绿色成功态 → nudge chip 出现 → 5s 消失
  - 未运行 Preflight 时 Copy Body → Preflight 按钮闪烁
  - Preflight 有 warning → 图标整体变橙色
  - Preflight 通过 → 图标整体变绿色
  - 窄屏时 Copy Title 在 overflow menu 中

---

## 假设与决策

1. `showPreflightHint` 逻辑已存在，复用它驱动 Preflight 按钮动画
2. 保持所有按钮始终在 DOM 中（不因状态变化而 mount/unmount），防止布局跳动
3. Nudge chip 是轻量 inline 元素，不是 toast，不会遮挡内容
4. Copy Title 移入 overflow 但保留 sm+ 下显示——改为仅在 overflow menu 中
5. `hasCodeBlocks` 用 useMemo 从 blocks 派生，不增加额外 state
