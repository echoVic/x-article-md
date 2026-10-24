# SEO/AEO 审计验收清单（草稿，暂定待最终验收）

- 生成日期：2026-10-24（草稿修订同日）
- **状态：本地门已通过（build/tsc/eslint/vitest/HTTP 集成，HEAD 83bd64e），线上待部署复验 CLS。** GA async 特征已在线上 feature-match；等部署后线上 LH 复测 editor CLS 与逐篇 frontmatter author 输入。
- **重要原则：单测绿 ≠ 完成；本地实测通过 ≠ 线上通过。** 代码与本地构建验证已闭环的条目记"本地已修"，但线上部署/最终 HTTP 集成未做前，不得与"线上已验收"混列。

## 状态定义

| 标记 | 含义 |
| --- | --- |
| 本地已修 | 代码已提交，本地 build + 本地 HTTP / 浏览器实测通过；**线上未部署，待部署后复验** |
| 线上待部署 | 本地已修项部署到 markdown2x.com 后需复验的对应事项 |
| 未完成 | 工作未闭环，有明确剩余工作；**未出结果前不得写绿** |
| 待确认 | 事实已核到边界，结论需 owner 拍板或外部条件具备 |
| 有据不改 | 官方文档 / owner 决策后维持现状（审计结论，不是新增成果） |

---

## 一、本地已修（代码 + 本地实测通过；线上待部署复验）

| 项 | 原要求 | 本地实现 | 证据（提交 / 文件 / 测试） | 线上待部署复验点 |
| --- | --- | --- | --- | --- |
| **工具独立 OG** | 每个工具/索引路由独立 OG+Twitter 卡片，1200×630，不共用首页通用图 | 19 个非博客路由 colocated `opengraph-image.tsx`+`twitter-image.tsx`（EN+ZH），共享 `components/og-card.tsx` | `15b97b4`；`docs/seo-aeo/verify-og-images.py` + `og-images-verified.json` + `og-contact-sheet.png`：19 路由 HTTP 200、1200×630、**每张图唯一 SHA**、本地 origin 可复现脚本 | 部署后抽查 og:url/canonical 与 sitemap 根形式一致、图片哈希路由可达 |
| root canonical / sitemap / hreflang URL 一致性 | canonical、sitemap `<loc>`、og:url、hreflang 根形式统一 | `absoluteUrl("/")` 不带尾斜杠，统一为 `https://markdown2x.com` | `f0759d2`（本地验证 origin 说明 + URL 一致性映射）；sitemap/canonical 实际 JSON 快照 | 线上复测 root 无尾斜杠、无跨域回跳 |
| **指定 compare 内容** | /compare 按指定对象准确陈述，不编功能、不报价 | 四对象核实边界成文；xPoster 同名干扰项已消歧；Article Studio 官方 snapshot 已存、vendor self-stated、无 pricing、无负面，owner/affiliation 未独立确认（仅证据边界，不当 blocker）；footer compare label + deep-path locale switcher（`4181058`、`4bbb8b2`）；死代码清理（`e4ca01b`）；补 privacy/support/CWS 及测具体值（`3af7dc0`、`449e873`） | `compare-competitors.md`；`sources/article-studio-2026-10-24.html`；`3af7dc0`；`449e873`；`4181058`；`4bbb8b2`；`e4ca01b`；**真浏览器桌面+移动实测通过：`docs/seo-aeo/visual/2026-10-24-content-acceptance.md` + `final-*-compare-table.png`** | 部署后复验 compare 表在英文页同样渲染。 |
| **中文工具落地厚度** | zh 工具页每条示例/限制有源码证据支撑 | 逐条文案 ↔ 源码行号 ↔ 测试对照 | `zh-tool-landing-depth.md`；`842c776`、`51aba3c`；`tests/feature-landing-zh.test.ts`；**真浏览器实测：`final-zh-mermaid-example.png`、`desktop-zh-code-to-image-limitations.png`** | 部署后抽查 zh 页渲染与截图一致 |
| twitter:site 接线 | 站点级账号关联 @echo_vic，不设全局 creator | `groupBaseMetadata` 设 `twitter:site=@echo_vic`；全站无 creator | `15b97b4`；用户确认记录（`echo-vic-attribution.md`） | 部署后确认各页渲染 `twitter:site=@echo_vic` 且无 `twitter:creator` |
| robots 显式 AI Allow | 保留基线，对已核实 AI UA 显式 Allow | 多规则数组 7 UA Allow | `d8fbfb0`；`tests/robots.test.ts`（6 项断言）；**本地 HTTP 已验**：`next start` 显式 `-A GPTBot` / `-A ClaudeBot` 拉 `/robots.txt`，`*` + 7 AI UA 全 Allow、零 Disallow | 部署后线上 robots.txt 逐块渲染确认 |
| favicon 真实可用 | 构建后 /favicon.ico 可用 | 16/32/48 多尺寸 ico | `ef7972e`；`tests/favicon.test.ts` | 部署后复测 image/x-icon |
| 四个安全响应头 | nosniff / strict-origin-when-cross-origin / DENY / Permissions-Policy 禁 camera·mic·geo | `lib/security-headers.ts` | `ef7972e`；`tests/security-headers.test.ts` | 部署后复测四头 presence（注意 Cloudflare 边缘叠加） |
| sitemap lastModified | 烘焙静态日期表，/blog 索引取最新文章 frontmatter 日期 | `lib/sitemap-dates.ts`；`5c7c0bc` 按 2026-10-24 实际编辑路由 bump 日期 | `b44958f`；`5c7c0bc`；`tests/sitemap-dates.test.ts` | 部署后复测日期分布 |
| /~offline 无索引 | 离线页不被索引 | `app/(en)/~offline/layout.tsx` noindex,nofollow | `15b97b4` | 部署后确认 noindex 头/标签 |
| **最终全量集成门（产品 HEAD 83bd64e）** | 新 HEAD 全量 build + 本地 HTTP 抽查 | `next build --webpack` EXIT=0；`tsc --noEmit` EXIT=0；`eslint .` EXIT=0 / 0 error；`vitest run` **242/242 通过**（35 files，含新增 `tests/editor-mobile-cls.test.tsx` 3 cases）；`git diff --check origin/main..HEAD` 干净；本地 `next start -p 3458` 复跑 /editor、/zh/editor、/compare、/zh/compare、/robots.txt、/sitemap.xml 全 200 | `validation/build-final-83bd64e.log`、`tsc-final-83bd64e.log`、`eslint-final-83bd64e.log`、`vitest-final-83bd64e.log`、`diffcheck-final-83bd64e.log`；LH throttled mobile 证据见 `performance/2026-10-24/lh/` | 部署后线上复测 og:url/canonical、sitemap 日期、四安全头、twitter:site=@echo_vic 且无 creator。 |
| **editor mobile CLS 修复** | SSR→hydration 插入 mobile bar 导致 CLS 0.047 | `ee7fd61`：mobile tab strip (h-11) + bottom bar (h-[60px]) 改为始终渲染 + `md:hidden`，不再用 `{!isDesktop && ...}` 条件渲染；`e10a2b6`：回归测试钉住 DOM 节点 identity 在 matchMedia 翻转时不变 | `components/editor-page.tsx`；`tests/editor-mobile-cls.test.tsx`；`performance/2026-10-24/cls.md`；`performance/2026-10-24/lh/`（LH13.5 throttled mobile, n=3 EN + n=3 ZH, CLS 6/6 runs = 0, vs base 0.047） | 部署后线上 LH 复测 /editor 与 /zh/editor CLS。 |

## 二、未完成（工作未闭环；未出结果前不写绿）

| 项 | 原要求 | 现状 | 证据 | 剩余阻塞 |
| --- | --- | --- | --- | --- |
| 原审计截图条目复现 | 原截图条目可复现展示 | 截图条目文案保留；**截图 URL 从未获知** | 本清单批次记录 | **原审计报告托管于 pages.grok.bot，访问被认证阻挡（跳转 accounts.x.ai/Cursor）；截图未提供被测 URL/环境，故原条件无法确认。本轮线上首页测试可公开进行（被测站 markdown2x.com 本身不要求登录）。** |
| 性能补偿实验 | 导航资源、CLS、editReady 性能达标 | **CLS 已修（`ee7fd61`），GA async 单变量已落地（`184f3fa`）且线上 feature-match 已确认**；`prefetch=off` 因 warm editReady 回退被拒绝、landing/intent/Mono 变更已撤回（历史，不复活）；legacy-javascript-insight ~12KiB（Lighthouse 估算）已溯源为 Next 内置 polyfill（Object.fromEntries/Array.at 等生产路径依赖），有据不删；Lighthouse 报告的 12KiB savings 是估算、不是真实 gzip 固定税，指标未消除但无安全 delta；LCP ~3.3s / TBT 114–281ms / unused JS / 传输体积未整体闭环 | `performance/2026-10-24/`（base/prod 原始 JSON、`legacy.md`、`cls.md`、`lh/` candidate 证据）；`184f3fa`；`ee7fd61` | **CLS 本地已修，线上待部署 LH 复验；GA async 线上已 feature-match；prefetch rejected（历史）；legacy 有据不改；LCP/TBT/unused/transfer 未闭环。** |

## 三、待确认（事实已核到边界，等 owner 或外部条件）

| 项 | 原要求 | 本地实现 | 证据 | 剩余阻塞 |
| --- | --- | --- | --- | --- |
| twitter:creator 逐篇署名 | 不自动给全部文章加 creator | 全站未设置 creator | `15b97b4` 明确不设全局 creator；`echo-vic-attribution.md` | **待逐篇 frontmatter author 字段确认**；确认前不得批量上线 |
| Article Studio 对比对象 | 保留该条目，仅陈述可核实事实 | 官方 snapshot `sources/article-studio-2026-10-24.html` + md 映射已补；vendor self-stated，无 pricing、无负面，同名 UK 摄影工作室辨析保留；owner/affiliation 未独立确认（不强制查清才描述功能） | `compare-competitors.md`；`449e873` | **官方 snapshot 已存；vendor/owner 归属仍未独立确认，文案按"self-stated"最小陈述。** |
| echovic.com 作为 sameAs | 不把未核实归属写进结构化数据 | 未加入 sameAs | attribution 修订版（`dbf52f1`） | 待 owner 确认同人后再议 |

## 四、有据不改（审计结论，维持现状；不作为新增成果）

| 项 | 原要求 | 结论 | 证据 |
| --- | --- | --- | --- |
| HSTS preload | 核查 hstspreload.org 后决定 | 官网明说 "HSTS *preloading* is not recommended" 且要求全子域 HTTPS、移除需数月；不加 preload、不改 Cloudflare、不提交名单 | `hsts-preload-evidence.md` |
| AI Allow 范围取舍 | 只列 robots 实际可控 UA | 不列 Google-Extended（非爬虫 UA，只认 Disallow）、不列 Perplexity-User（官方称忽略 robots.txt） | `ai-crawlers-robots.md` |

> 说明：不新增 CSP、不在 app 层重复发 HSTS 等属于本次审计的**范围边界**（原本就不在交付清单内），不计入成果。

---

## 复现指南（从干净环境到可验收状态）

```bash
# 1. 安装与测试
pnpm install
npx vitest run

# 2. 类型检查（必须先 build，否则 .next/types 过期会报 TS6053 误报）
npx next build
npx tsc --noEmit

# 3. 本地生产预览（端口任选，下方示例用 3457；若占用先 kill）
PORT=${PORT:-3457}
npx next start -p "$PORT"
lsof -tiTCP:$PORT -sTCP:LISTEN | xargs kill

# 4. OG 可复现核验脚本（本地 origin，核对 19 路由 200 / 1200x630 / 唯一 SHA）
python3 docs/seo-aeo/verify-og-images.py "http://localhost:$PORT"

# 5. 其他 HTTP 抽查
curl -sI "http://localhost:$PORT/favicon.ico" | grep -i content-type
curl -sI "http://localhost:$PORT/" | grep -iE 'x-content-type-options|referrer-policy|x-frame-options|permissions-policy'
curl -s  "http://localhost:$PORT/robots.txt"
curl -s  "http://localhost:$PORT/sitemap.xml"
curl -sI "http://localhost:$PORT/llms.txt" | grep -i content-type
```

## 目录导航（本文件夹下证据索引）

| 文件 | 内容 |
| --- | --- |
| `audit-status.md`（本文件） | 总入口：验收清单草稿 |
| `visual/` | 视觉验收：`2026-10-24-content-acceptance.md`、`2026-10-24-final-navigation-og.md` + 桌面/移动实拍截图 |
| `ai-crawlers-robots.md` | 7 个 AI UA 官方用途核验、不列 Google-Extended/Perplexity-User 的理由 |
| `hsts-preload-evidence.md` | hstspreload.org 官方"不推荐 preload"原话与维持现状依据 |
| `echo-vic-attribution.md` | @echo_vic 归属：用户确认为主、GitHub 自链为辅；仅支撑 twitter:site |
| `compare-competitors.md` | /compare 指定对象核实边界与同名干扰项排除 |
| `zh-tool-landing-depth.md` | 中文工具落地页每条文案 ↔ 源码行号 ↔ 测试证据 |
| `per-page-og-images.md` | 每页独立 OG/Twitter 卡片拆分、twitter:site 接线（实现沿革） |
| `verify-og-images.py` + `og-images-verified.json` + `og-contact-sheet.png` | 19 路由 OG 可复现核验脚本、实测 JSON、联系表 |
| `measurement/` + `performance/2026-10-24/` | base/cand 移动端性能原始 JSON；GA 单变量已落地 `184f3fa` 且线上 feature-match；prefetch 历史 rejected（不复活）；legacy polyfill 有据不删；editor CLS 修复 `ee7fd61` + LH candidate 证据 `lh/` |

> 本文件为验收清单：本地门已通过（HEAD `83bd64e`，日志见 `validation/*-final-83bd64e.log`）；Article Studio 官方 snapshot 已存（`sources/article-studio-2026-10-24.html`），不再等外部链接。等部署到 markdown2x.com 后回填线上 LH CLS 复验数据；剩余外部输入仅逐篇 frontmatter author（twitter:creator 策略）。
