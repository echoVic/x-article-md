# ee7fd61 editor SSR bars CLS 修复 GUI 验收（2026-10-24）

## 环境
- source HEAD：**ee7fd61**（fix(editor): eliminate mobile CLS from SSR→hydration layout flip）
- 服务：localhost:3458（用户重 build）
- 视口：桌面 967×937；移动 CDP 390×844@DPR3

## 验证结果

**桌面 ≥768px**
- 移动 tab strip（h-11, role=tablist）：`display:none` ✅
- 移动底 bar（h-[60px]）：`display:none` ✅
- md:hidden 在首屏即生效，无布局回归

**移动 390×844**
- tab strip 可见（h=44px）：手稿 / 实时预览 两 tab ✅
- 底 bar 可见（h=60px）：检查 / 发布 / 复制正文 ✅
- 切「实时预览」：右侧 article 正常渲染（标题/列表/表格/TS 块）✅

**回归**
- 专注模式：进入 `?focus=1`/data-focus=true；单次 Esc 退出 ✅
- quote/image 模式：仅 GUI 切换准（保留前轮结论），PNG 产物不判通过
- table/Mermaid 真实渲染：前轮已证

## 证据
- `2026-10-24-continuation-mobile-editor-tabs.png` — 移动手稿 tab
- `2026-10-24-continuation-mobile-editor-preview-tab.png` — 移动切实时预览
