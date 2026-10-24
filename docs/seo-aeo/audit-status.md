# SEO/AEO 审计验收清单（草稿，暂定待最终验收）

- 生成日期：2026-10-24（草稿修订同日）
- **状态：草稿，未最终验收。** 等最终测试数据回填后逐项定级；**未经用户提供数据前，本文件不 commit**。
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
| **指定 compare 内容** | /compare 按指定对象准确陈述，不编功能、不报价 | 四对象核实边界成文；xPoster 同名干扰项已消歧；Article Studio 标 unknown；footer compare label + deep-path locale switcher（`4181058`、`4bbb8b2`）；死代码清理（`e4ca01b`） | `compare-competitors.md`；`c4d5d5c`；`4181058`；`4bbb8b2`；`e4ca01b`；**真浏览器桌面+移动实测通过：`docs/seo-aeo/visual/2026-10-24-content-acceptance.md` + `final-zh-compare-unknown-column.png`、`final-*-compare-table.png`** | 部署后复验 unknown 列在英文页同样渲染 |
| **中文工具落地厚度** | zh 工具页每条示例/限制有源码证据支撑 | 逐条文案 ↔ 源码行号 ↔ 测试对照 | `zh-tool-landing-depth.md`；`842c776`、`51aba3c`；`tests/feature-landing-zh.test.ts`；**真浏览器实测：`final-zh-mermaid-example.png`、`desktop-zh-code-to-image-limitations.png`** | 部署后抽查 zh 页渲染与截图一致 |
| twitter:site 接线 | 站点级账号关联 @echo_vic，不设全局 creator | `groupBaseMetadata` 设 `twitter:site=@echo_vic`；全站无 creator | `15b97b4`；用户确认记录（`echo-vic-attribution.md`） | 部署后确认各页渲染 `twitter:site=@echo_vic` 且无 `twitter:creator` |
| robots 显式 AI Allow | 保留基线，对已核实 AI UA 显式 Allow | 多规则数组 7 UA Allow | `d8fbfb0`；`tests/robots.test.ts`（6 项断言） | **最终 HTTP 集成待跑**：线上 robots.txt 逐块渲染确认 |
| favicon 真实可用 | 构建后 /favicon.ico 可用 | 16/32/48 多尺寸 ico | `ef7972e`；`tests/favicon.test.ts` | 部署后复测 image/x-icon |
| 四个安全响应头 | nosniff / strict-origin-when-cross-origin / DENY / Permissions-Policy 禁 camera·mic·geo | `lib/security-headers.ts` | `ef7972e`；`tests/security-headers.test.ts` | 部署后复测四头 presence（注意 Cloudflare 边缘叠加） |
| sitemap lastModified | 烘焙静态日期表，/blog 索引取最新文章 frontmatter 日期 | `lib/sitemap-dates.ts`；`5c7c0bc` 按 2026-10-24 实际编辑路由 bump 日期 | `b44958f`；`5c7c0bc`；`tests/sitemap-dates.test.ts` | 部署后复测日期分布 |
| /~offline 无索引 | 离线页不被索引 | `app/(en)/~offline/layout.tsx` noindex,nofollow | `15b97b4` | 部署后确认 noindex 头/标签 |

## 二、未完成（工作未闭环；未出结果前不写绿）

| 项 | 原要求 | 现状 | 证据 | 剩余阻塞 |
| --- | --- | --- | --- | --- |
| 原审计截图条目复现 | 原截图条目可复现展示 | 截图条目文案保留；**截图 URL 从未获知** | 本清单批次记录 | **原审计报告托管于 pages.grok.bot，访问被认证阻挡（跳转 accounts.x.ai/Cursor）；截图未提供被测 URL/环境，故原条件无法确认。本轮线上首页测试可公开进行（被测站 markdown2x.com 本身不要求登录）。** |
| 性能补偿实验 | 导航资源、CLS、editReady 性能达标 | **已收敛**：GA 改 native async script（去 high-priority preload）落地 `184f3fa`（本地已修）；`prefetch=off` 因 warm editReady 回退被拒绝、landing/intent/Mono 变更已撤回；legacy-javascript 22KiB 未修、原审计截图未闭环 | `measurement/`（base/cand/candfont/candga/gabase 原始 JSON）、`performance/`（diag_lcp.cjs、original-audit-page.html、README.md）；`184f3fa` | **GA 单变量待线上复验；prefetch 已回退不闭环；legacy 22KiB 与截图项未修，保持"未完成"。** |
| 最终全量集成门 | 新 HEAD 全量 build + 本地/线上 HTTP 抽查 | 旧基线曾 190 单测通过；含 OG/visual 新提交的 HEAD 尚未跑最终门 | 待用户提供测试数据 | 覆盖：/zh lang、博客唯一 H1 与 OG、llms.txt content-type、favicon、四安全头、canonical/hreflang、sitemap 日期、robots 渲染 |

## 三、待确认（事实已核到边界，等 owner 或外部条件）

| 项 | 原要求 | 本地实现 | 证据 | 剩余阻塞 |
| --- | --- | --- | --- | --- |
| twitter:creator 逐篇署名 | 不自动给全部文章加 creator | 全站未设置 creator | `15b97b4` 明确不设全局 creator；`echo-vic-attribution.md` | **待逐篇 frontmatter author 字段确认**；确认前不得批量上线 |
| Article Studio 对比对象 | 保留该条目，仅陈述可核实事实 | 页面标 "unknown"，无功能/负面断言 | `compare-competitors.md` | **官方产品链接未核实**：找到可信官方页面前维持 unknown |
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

# 3. 本地生产预览
npx next start -p 3456        # 视觉验收报告用的是 3456
lsof -tiTCP:3456 -sTCP:LISTEN | xargs kill

# 4. OG 可复现核验脚本（本地 origin，核对 19 路由 200 / 1200x630 / 唯一 SHA）
python3 docs/seo-aeo/verify-og-images.py http://localhost:3456

# 5. 其他 HTTP 抽查
curl -sI http://localhost:3456/favicon.ico | grep -i content-type
curl -sI http://localhost:3456/ | grep -iE 'x-content-type-options|referrer-policy|x-frame-options|permissions-policy'
curl -s  http://localhost:3456/robots.txt
curl -s  http://localhost:3456/sitemap.xml
curl -sI http://localhost:3456/llms.txt | grep -i content-type
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
| `measurement/` | base/cand 移动端性能原始 JSON（补偿实验进行中，结论未定稿） |
| `performance/` | LCP 诊断脚本、原始审计页 HTML 与说明 |

> 本文件为草稿：等用户提供最终测试数据后回填证据列，并把"本地已修"项按线上复验结果改判。
