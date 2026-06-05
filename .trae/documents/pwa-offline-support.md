# PWA 离线支持完善计划

## Context

任务 #14：项目已有基础 manifest 和动态图标，但缺少 Service Worker 和合规尺寸图标，无法安装到桌面且无离线能力。需要补齐 PWA 基础设施，使编辑器核心功能离线可用。

## 方案

使用 `@serwist/next`（next-pwa 的继任者，基于 Workbox），配合 Next.js App Router 的 Service Worker 集成。

## 实施步骤

### 1. 安装依赖
```bash
pnpm add @serwist/next serwist
```

### 2. 生成 PWA 必需图标
创建两个 Route Handler（复用现有 icon.tsx 的动态生成模式）：
- `app/icon-192/route.tsx` — 192×192 PNG
- `app/icon-512/route.tsx` — 512×512 PNG

### 3. 更新 manifest.ts
添加 192/512 图标引用 + `purpose: "any maskable"` + `id: "/"`

### 4. 创建 Service Worker — `app/sw.ts`
缓存策略：
- `/api/*` → `NetworkOnly`（AI 调用不缓存）
- 其余 → `defaultCache`（JS/CSS: StaleWhileRevalidate, 图片: CacheFirst, HTML: NetworkFirst）
- `skipWaiting: true` + `clientsClaim: true`（新版本立即激活）

### 5. 修改 next.config.ts
用 `withSerwistInit` 包裹配置：
- `swSrc: "app/sw.ts"`
- `swDest: "public/sw.js"`
- `disable: process.env.NODE_ENV === "development"`

### 6. Theme Color Meta — `app/layout.tsx`
在 metadata 中添加 `themeColor` 数组（light/dark）

### 7. 离线指示器 — `components/offline-indicator.tsx`
轻量 banner：监听 online/offline 事件，离线时显示 "You are offline. AI features unavailable."

### 8. 离线回退页 — `app/~offline/page.tsx`
简单提示页面，未缓存的路由离线时显示

### 9. .gitignore
添加 `public/sw.js` 和 `public/sw.js.map`

## 关键文件
- `next.config.ts` — serwist 插件包裹
- `app/sw.ts` — Service Worker 源码
- `app/manifest.ts` — 图标和 manifest 完善
- `app/layout.tsx` — theme-color meta
- `app/icon-192/route.tsx` + `app/icon-512/route.tsx` — PWA 图标

## 验证方式
1. `pnpm build` 无错误，`public/sw.js` 生成
2. Chrome DevTools → Application → Manifest 面板绿色
3. Chrome DevTools → Network → Offline 模式下刷新页面，App Shell 正常加载
4. AI 功能离线时报错（不返回缓存旧数据）
5. Lighthouse PWA 审计通过
