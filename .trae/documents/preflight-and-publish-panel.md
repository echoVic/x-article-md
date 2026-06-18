# 发布预检 & 发布清单实现方案

## Context

用户在编辑器中写完 Markdown 后，需要将内容分步复制到 X Articles。当前痛点是：复制后才发现格式丢失（如远程图片、LaTeX 等不支持的内容），且散落的 Copy Title / Copy Body / Assets 按钮缺乏引导。

本方案实现两个模块：
1. **Preflight Check** — 在 Copy 前分析 AST 输出结构化预检报告
2. **Publish Checklist** — 将散落操作升级为顺序化发布流程面板

---

## 新建文件

| 文件 | 用途 |
|------|------|
| `lib/preflight.ts` | 纯函数 `runPreflight()` + 类型定义 + `computeBlockOffsets()` |
| `components/preflight-panel.tsx` | 预检报告 UI（Sheet 内容） |
| `components/publish-panel.tsx` | 发布清单 UI（Sheet 内容） |

---

## 修改文件

### 1. `lib/preflight.ts`（新建）

```typescript
export type PreflightLevel = 'info' | 'warning' | 'error'
export type PreflightKind = 'heading' | 'paragraph' | 'list' | 'blockquote' | 'code' | 'table' | 'mermaid' | 'tweet' | 'image' | 'latex' | 'footnote' | 'hr' | 'strikethrough' | 'html'

export type PreflightItem = {
  id: string
  level: PreflightLevel
  kind: PreflightKind
  message: string
  blockIndex?: number
  sourceOffset?: number
}

export type PreflightReport = {
  status: 'ok' | 'warning' | 'blocked'
  summary: { readyCount: number; assetCount: number; warningCount: number; unsupportedCount: number }
  items: PreflightItem[]
}

export function runPreflight(blocks, rawMarkdown, codeMode): PreflightReport
export function computeBlockOffsets(rawMarkdown: string): number[]
```

**逻辑要点：**
- 遍历 `blocks[]`，分类为 ready（heading/paragraph/blockquote/list/code-quote 模式）或 asset（code-image/mermaid/table/tweet）
- 检查 inline tokens 中的 `image` 类型 → 生成 warning（远程图片）
- 检查 heading 内容长度 > 100 → warning
- Regex 扫描 `rawMarkdown` 检测不支持内容：`[^...]`（footnote）、`$$...$$` / `$...$`（LaTeX）、`<iframe`（html）、`^---$`（hr）、`~~...~~`（strikethrough）
- `computeBlockOffsets()` 复用 parseMarkdown 的行扫描逻辑，只记录每个 block 的起始字符偏移量

### 2. `components/codemirror-editor.tsx`

在 `CodeMirrorEditorHandle` 中新增方法：

```typescript
jumpToOffset: (offset: number) => void
```

实现：
```typescript
jumpToOffset: (offset: number) => {
  const view = viewRef.current;
  if (!view) return;
  const pos = Math.min(offset, view.state.doc.length);
  view.dispatch({
    selection: { anchor: pos },
    effects: EditorView.scrollIntoView(pos, { y: 'center' }),
  });
  view.focus();
}
```

需在文件顶部 import 中确认 `EditorView` 已经导入（已导入）。

### 3. `components/markdown-editor.tsx`

- 用 `forwardRef` + `useImperativeHandle` 包装组件，暴露 `jumpToOffset` 方法
- 将内部的 `editorRef` 转发给外部调用者

改动点：
```typescript
export type MarkdownEditorHandle = {
  jumpToOffset: (offset: number) => void;
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(...)
```

### 4. `components/editor-toolbar.tsx`

新增 props：
```typescript
onPreflight: () => void
onPublish: () => void
preflightStatus?: 'ok' | 'warning' | 'blocked' | null
```

新增两个按钮（在 Assets/Cover 按钮之后，Copy 按钮之前）：
- **Check 按钮**：`ShieldCheck` 图标，点击触发 `onPreflight`。根据 `preflightStatus` 显示彩色圆点指示器
- **Publish 按钮**：`ListChecks` 图标，点击触发 `onPublish`

### 5. `components/preflight-panel.tsx`（新建）

使用 `Collapsible` 分组展示预检结果：
- 概览栏：status badge + 数字统计
- 4 个 Collapsible 分组：Ready / Assets / Warnings / Unsupported
- Warning/Error 项显示 "Jump" 按钮，调用 `onJump(sourceOffset)`
- Info 分组默认折叠，Warning/Error 默认展开

### 6. `components/publish-panel.tsx`（新建）

5 步顺序流程：
```typescript
type PublishStep = {
  id: 'preflight' | 'title' | 'body' | 'assets' | 'verify'
  status: 'pending' | 'active' | 'done' | 'skipped'
}
```

- 每步有状态图标（circle/check/dot）+ 标签 + 操作按钮
- Step 4 (assets) 展开为子项列表，每个 asset 可单独打勾
- 点击步骤中的按钮直接触发对应操作（如 Copy Title），完成后自动推进状态
- 状态通过 `useReducer` 管理，action 包括：`PREFLIGHT_DONE` / `TITLE_COPIED` / `BODY_COPIED` / `ASSET_COPIED` / `VERIFY_DONE` / `RESET`

### 7. `components/editor-page.tsx`

新增状态：
```typescript
const [preflightOpen, setPreflightOpen] = useState(false)
const [publishOpen, setPublishOpen] = useState(false)
const [preflightReport, setPreflightReport] = useState<PreflightReport | null>(null)
const [publishState, dispatchPublish] = useReducer(publishReducer, initialPublishState)
const [showPreflightHint, setShowPreflightHint] = useState(false)
const markdownEditorRef = useRef<MarkdownEditorHandle>(null)
```

新增逻辑：
- `handlePreflight()`：调用 `runPreflight(blocks, markdown, codeMode)`，存结果，打开预检面板，dispatch `PREFLIGHT_DONE`
- `handleJumpToSource(offset)`：调用 `markdownEditorRef.current.jumpToOffset(offset)`，关闭预检面板
- 在 `copyBody()` 中：若 `preflightReport === null`，设置 `showPreflightHint = true`（5 秒后自动消失），copy 照常执行不阻塞
- 在 `markCopied('title')` 中额外 dispatch `TITLE_COPIED`
- 在 `markCopied('body')` 中额外 dispatch `BODY_COPIED`

新增 Sheet 面板（加在 Assets Sheet 后面）：
```tsx
<Sheet open={preflightOpen} onOpenChange={setPreflightOpen} title={t.preflightTitle}>
  <PreflightPanel report={preflightReport} onJump={handleJumpToSource} />
</Sheet>

<Sheet open={publishOpen} onOpenChange={setPublishOpen} title={t.publishTitle}>
  <PublishPanel
    state={publishState}
    assets={clipboard.assets}
    onPreflight={handlePreflight}
    onCopyTitle={copyTitle}
    onCopyBody={copyBody}
    onAssetCopied={(index) => dispatchPublish({ type: 'ASSET_COPIED', assetIndex: index })}
    onVerifyDone={() => dispatchPublish({ type: 'VERIFY_DONE' })}
  />
</Sheet>
```

预检提示 toast（非阻塞）：
```tsx
{showPreflightHint && (
  <div className="fixed top-14 right-4 z-50 ...">
    建议先运行预检 · <button onClick={handlePreflight}>立即检查</button>
  </div>
)}
```

### 8. `lib/i18n.tsx`

新增翻译 key（en/zh），包括：
- `preflightTitle` / `preflightRun` / `preflightReady` / `preflightAssets` / `preflightWarnings` / `preflightUnsupported` / `preflightOk` / `preflightHasWarnings` / `preflightHasErrors` / `preflightJump` / `preflightHint`
- `publishTitle` / `publishStepPreflight` / `publishStepTitle` / `publishStepBody` / `publishStepAssets` / `publishStepVerify` / `publishDone` / `publishReset`
- 各种 item message 模板

---

## 状态流概述

```
用户编辑 markdown
  → blocks = parseMarkdown(markdown)  [已有 useMemo]
  → 点击 Check 按钮
    → report = runPreflight(blocks, markdown, codeMode)
    → 打开 Preflight Sheet
    → dispatch PREFLIGHT_DONE

用户点击 Publish 按钮
  → 打开 Publish Sheet
  → 面板内按顺序操作各步骤
  → copyTitle/copyBody 执行时更新 publishState
  → Asset 列表中每项 Copy Image 后手动打勾
  → 最终确认完成
```

---

## Jump-to-Source 数据流

```
lib/preflight.ts: computeBlockOffsets(rawMarkdown) → number[]
  ↓ 每个 PreflightItem 带 sourceOffset
preflight-panel.tsx: "Jump" 按钮 onClick → onJump(sourceOffset)
  ↓
editor-page.tsx: handleJumpToSource(offset)
  ↓ markdownEditorRef.current.jumpToOffset(offset)
markdown-editor.tsx → editorRef.current.jumpToOffset(offset)
  ↓
codemirror-editor.tsx: view.dispatch({ selection, effects: scrollIntoView })
```

---

## 验证计划

1. `bun test` — 运行 preflight 单元测试
2. `bun dev` → 浏览器打开编辑器
3. 测试预检：写入含远程图片、LaTeX、code block 的 markdown → 点 Check → 确认 4 类分组正确显示
4. 测试 Jump：点击 warning/error 项的 Jump 按钮 → 确认光标跳到对应位置
5. 测试发布清单：打开 Publish 面板 → 按顺序操作 → 确认状态自动推进
6. 测试轻量提示：不运行预检直接 Copy Body → 确认 toast 出现并自动消失
7. 确认现有 Copy Title / Copy Body / Assets 按钮行为不受影响

---

## 实现顺序

1. `lib/preflight.ts` — 核心逻辑
2. `components/codemirror-editor.tsx` — 新增 `jumpToOffset`
3. `components/markdown-editor.tsx` — forwardRef 暴露 handle
4. `lib/i18n.tsx` — 新增翻译 key
5. `components/preflight-panel.tsx` — 预检 UI
6. `components/publish-panel.tsx` — 发布清单 UI
7. `components/editor-toolbar.tsx` — 新增按钮
8. `components/editor-page.tsx` — 集成所有模块
