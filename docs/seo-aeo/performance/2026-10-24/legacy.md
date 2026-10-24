# legacy-javascript-insight 溯源结论（HEAD 449e873）

## 证据
- Lighthouse `legacy-javascript-insight`（`docs/seo-aeo/performance/2026-10-24/base/home-mobile-1.json`）：
  - chunk `/_next/static/chunks/6183-5ddd305acef9c1b9.js`
  - `wastedBytes = 12352`（Lighthouse 自报 "Est savings of 12 KiB"，是**估算**，不是实际线上传输字节）
  - 7 个 signal：`Array.prototype.at`、`Array.prototype.flat`、`Array.prototype.flatMap`、`Object.fromEntries`、`Object.hasOwn`、`String.prototype.trimEnd`、`String.prototype.trimStart`
  - signal 在 chunk 内列号范围 38484–39574（同一 webpack module 内）

## 字节口径（实测 module 27920 边界，非 Lighthouse 列号推断）
实测 chunk 6183 内 webpack module `27920` 的真实起止：
- 起始列 **38440**（`27920:()=>{`）
- 结束列 **39828**（下一个 module `28385:` 前）
- module 长度 **1388 B**（source `polyfill-module.js` 1380 B + webpack wrapper `27920:()=>{...}` 8 B）

| 口径 | 字节 | 说明 |
|---|---|---|
| `polyfill-module.js` 源文件 | **1380 B** | `node_modules/next/dist/build/polyfills/polyfill-module.js`（minified 单行） |
| module 27920 在 chunk 6183 内实测 | **1388 B** | 列 38440–39828，含 webpack wrapper |
| Lighthouse `wastedBytes` | **12352 B** | Lighthouse 基于 7 个 signal 的**估算值**，不是 polyfill 模块本身的字节；它把"legacy 代码 + 相关运行时/transpile 开销"打包估算 |
| chunk 6183 整文件 | 227,473 B（gzip 62,819 B） | 内含数十个 webpack module，polyfill 只是其中一个 |

> 观察事实：polyfill 模块实测 1388 B。Lighthouse 报 12352 B 是它对"legacy JS savings"的估算口径，不是 gzip 固定税。推断：gzip 后真实省流远小于 12 KiB。

## 源模块文本映射（1380 B 内按 feature 拆分）
| feature | 源文件偏移 | 字节 |
|---|---|---|
| trimStart + trimEnd | 0–170 | ~170 B |
| Symbol.description | 171–352 | ~182 B |
| Array.flat + flatMap | 353–556 | ~204 B |
| Promise.finally | 557–843 | ~287 B |
| Object.fromEntries | 844–966 | ~123 B |
| Array.at | 967–1106 | ~140 B |
| Object.hasOwn | 1107–1286 | ~180 B |
| URL.canParse | 1287–1379 | ~93 B |

全部 feature-detect（`"x" in Y.prototype || (Y.x = polyfill)`），modern browser 上是 no-op。

## 溯源
- 入口：`node_modules/next/dist/client/app-globals.js` 硬编码 `require("../build/polyfills/polyfill-module")`。
- 不读 browserslist；`.browserslistrc` / package.json browserslist 对该文件无效。
- Next 16.2.6 config schema `experimental` 里只有 `fallbackNodePolyfills`（Node buffer/process 用），**没有** legacy/browserslist/modern 开关。

## 为什么不能删
Next client 自身在生产路径直接用这些 API（删 polyfill = 在不支持这些 API 的浏览器上跑 Next 直接抛 TypeError）：
- `route-params.js:185` `Object.fromEntries(new URLSearchParams(...))`
- `redirect.js:82` / `redirect-error.js:32` `digest.split(';').at(-2)`
- `segment-cache/scheduler.js:1104` `Object.fromEntries(...)`

> 注：`URL.canParse` 仅在 `dev/hot-reloader/get-socket-url.js:23` 使用，是 dev-only 路径，**不作为生产需要的证据**。

Next 16 官方浏览器要求为 modern evergreen（具体 Safari 最低版本以 Next 官方 docs 为准，不在本文件断言）。本仓库不主动降低该运行时保障。

## 本仓库 app client 代码
不直接用这些 API；`flatMap` 仅出现在 `app/sitemap.ts`（server-only，不进 client bundle）。

## 备选（非安全修复，仅风险记录）
`NormalModuleReplacementPlugin` 把 `next/dist/build/polyfills/polyfill-module` 替换为空 stub —— **会降低 Next 16 提供的运行时保障**，可能在 Next 官方仍支持的旧浏览器上触发 TypeError。不作为默认修复，仅在 owner 明确决定收紧兼容目标后才考虑。预计 gzip 收益远小于 Lighthouse 12 KiB 估值（实际 polyfill 源码 1.4 KB）。

## 结论
有据不改：12 KiB 是 Lighthouse 对 Next 自带 polyfill 的估算口径，真实源码 1.4 KB；删除会降低 Next 16 运行时保障，违反"兼容范围不提高"。不提交 patch，不推荐 stub。
