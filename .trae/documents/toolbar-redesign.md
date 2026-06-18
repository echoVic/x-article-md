# 工具栏布局优化

## Context

模板入口藏在 Import 下拉菜单的第二项里（需要两次点击），用户反馈入口太深。借此机会重新梳理工具栏的整体布局，让操作更符合用户心智模型。

## 设计思路

保持两栏结构不变（顶部文档栏 + 编辑器内的写作栏），重新组织顶部栏的布局：

- **左到右 = 时间线**：内容来源 → 输出配置 → 检查发布 → 最终操作
- **模板一键可达**：提升为左侧第一个独立按钮
- **Import 简化**：去掉下拉菜单，改为直接按钮（和 Export 对齐）

## 新布局

```
Document Bar (40px, full-width):
┌──────────────────────────────────────────────────────────────────────────────────┐
│ LEFT:                                                              RIGHT:         │
│ [★ Templates] | [↑Import] [↓Export] | [Assets❸] | ●Saved   [Q|I] Theme▾ | 🛡● Publish | CopyTitle [CopyBody] │
│  ─ 内容来源 ──   ─── 文件操作 ────   ─ 资产 ─    ─状态─   ── 输出配置 ── ── 检查发布 ── ── 最终操作 ────── │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 具体变更

| # | 变更 | 说明 |
|---|------|------|
| 1 | 模板按钮独立 | 第一个位置，LayoutTemplate 图标 + 文字，比其他按钮稍微突出（加一个淡色背景或边框） |
| 2 | Import 去下拉 | 从 DropdownMenu 改为普通 button，只做文件导入 |
| 3 | 右侧重新分组 | Code Mode + Theme → Preflight + Publish → Copy Title + Copy Body |
| 4 | Draft 状态保留 | 放在左侧组最后，作为被动信息 |

### 写作栏不变

编辑器内的格式工具栏（H2/Bold/Code/Link/List 等 + AI 润色/翻译 + Reset）已经够合理，不做调整。

## 修改文件

- `components/editor-toolbar.tsx` — 主要改动：
  - 新增独立 Templates 按钮（位于最左）
  - Import 从 DropdownMenu 改为直接 button
  - 右侧按钮重新排列分组
- `components/editor-page.tsx` — 无逻辑变动，props 不变

## 验证

1. `npm run build` 通过
2. 启动 production server，验证：
   - Templates 按钮一键打开模板选择器
   - Import 按钮触发文件导入
   - Export 按钮触发导出
   - 右侧所有按钮功能正常
   - 窄屏下不溢出（flex-shrink 正确）
