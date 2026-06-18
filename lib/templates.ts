export type ArticleTemplate = {
  id: string;
  icon: string;
  nameKey: string;
  descriptionKey: string;
  content: { en: string; zh: string };
};

export const ARTICLE_TEMPLATES: ArticleTemplate[] = [
  {
    id: "technical-tutorial",
    icon: "BookOpen",
    nameKey: "templateTechTutorial",
    descriptionKey: "templateTechTutorialDesc",
    content: {
      en: `# How to [Do X] with [Tool Y]

## TL;DR

One or two sentences summarizing the key takeaway.

## Prerequisites

- Requirement 1
- Requirement 2
- Familiarity with [concept]

## Step 1: Setup

Describe the initial setup or installation.

\`\`\`bash
# installation command
npm install example-package
\`\`\`

## Step 2: Implementation

Walk through the core implementation.

\`\`\`ts
// core logic here
function main() {
  console.log("Hello");
}
\`\`\`

## Step 3: Verification

How to confirm everything works.

## Common Pitfalls

- Pitfall 1: description and fix
- Pitfall 2: description and fix

## Conclusion

Summarize what was achieved. Link to the repo or tool for readers to try it themselves.

[Try it out →](https://github.com/your/repo)
`,
      zh: `# 如何使用 [工具Y] 实现 [功能X]

## 摘要

一两句话总结核心要点。

## 前置条件

- 条件 1
- 条件 2
- 熟悉 [某个概念]

## 第一步：环境搭建

描述初始安装或配置。

\`\`\`bash
# 安装命令
npm install example-package
\`\`\`

## 第二步：核心实现

逐步讲解核心实现逻辑。

\`\`\`ts
// 核心逻辑
function main() {
  console.log("Hello");
}
\`\`\`

## 第三步：验证

如何确认一切正常工作。

## 常见问题

- 问题 1：描述和解决方案
- 问题 2：描述和解决方案

## 总结

概括所完成的事情。附上仓库或工具链接让读者自行尝试。

[立即体验 →](https://github.com/your/repo)
`,
    },
  },
  {
    id: "build-in-public",
    icon: "Hammer",
    nameKey: "templateBuildInPublic",
    descriptionKey: "templateBuildInPublicDesc",
    content: {
      en: `# Building [Product Name]: [Specific Milestone]

## Context

Why I started this project and who it's for.

## What I Built This Week

Brief description of the feature or milestone completed.

## Key Decisions

| Decision | Chosen | Alternative | Why |
| --- | --- | --- | --- |
| Database | PostgreSQL | MongoDB | Relational data model fits better |
| Framework | Next.js | Remix | Familiarity + Vercel hosting |

## Metrics So Far

- Users: [number]
- Key metric: [number]
- Feedback: [summary]

## What's Next

- [ ] Next milestone 1
- [ ] Next milestone 2
- [ ] Next milestone 3

## Follow Along

Building this in public. Follow for updates → [your X handle]
`,
      zh: `# 构建 [产品名称]：[具体里程碑]

## 背景

为什么开始这个项目，目标用户是谁。

## 本周完成的内容

简要描述完成的功能或里程碑。

## 关键决策

| 决策 | 选择 | 备选方案 | 原因 |
| --- | --- | --- | --- |
| 数据库 | PostgreSQL | MongoDB | 关系模型更合适 |
| 框架 | Next.js | Remix | 熟悉度 + Vercel 部署 |

## 目前的数据

- 用户数：[数字]
- 核心指标：[数字]
- 用户反馈：[摘要]

## 下一步计划

- [ ] 下一个里程碑 1
- [ ] 下一个里程碑 2
- [ ] 下一个里程碑 3

## 关注我

正在公开构建中，关注获取更新 → [你的 X 账号]
`,
    },
  },
  {
    id: "architecture-analysis",
    icon: "Network",
    nameKey: "templateArchitecture",
    descriptionKey: "templateArchitectureDesc",
    content: {
      en: `# [System Name] Architecture Deep Dive

## System Overview

One paragraph explaining what the system does and its scale.

## Architecture Diagram

\`\`\`mermaid
graph TD
  Client[Client App] --> API[API Gateway]
  API --> Auth[Auth Service]
  API --> Core[Core Service]
  Core --> DB[(Database)]
  Core --> Cache[(Redis Cache)]
  Core --> Queue[Message Queue]
  Queue --> Worker[Background Worker]
\`\`\`

## Key Components

### Component A
Purpose, responsibilities, and tech stack.

### Component B
Purpose, responsibilities, and tech stack.

### Component C
Purpose, responsibilities, and tech stack.

## Trade-offs

| Aspect | Current Choice | Trade-off |
| --- | --- | --- |
| Consistency | Eventual | Higher availability, but stale reads possible |
| Scaling | Horizontal | More operational complexity |
| Storage | SQL | ACID guarantees, harder to shard |

## Lessons Learned

1. Lesson one with context
2. Lesson two with context
3. Lesson three with context

## Further Reading

- [Link to doc 1]
- [Link to doc 2]
`,
      zh: `# [系统名称] 架构深度解析

## 系统概述

一段话说明系统做什么，以及它的规模。

## 架构图

\`\`\`mermaid
graph TD
  Client[客户端] --> API[API 网关]
  API --> Auth[认证服务]
  API --> Core[核心服务]
  Core --> DB[(数据库)]
  Core --> Cache[(Redis 缓存)]
  Core --> Queue[消息队列]
  Queue --> Worker[后台任务]
\`\`\`

## 核心组件

### 组件 A
用途、职责和技术栈。

### 组件 B
用途、职责和技术栈。

### 组件 C
用途、职责和技术栈。

## 取舍

| 方面 | 当前选择 | 代价 |
| --- | --- | --- |
| 一致性 | 最终一致 | 可用性更高，但可能读到旧数据 |
| 扩展 | 水平扩展 | 运维复杂度更高 |
| 存储 | SQL | ACID 保证，但分片困难 |

## 经验教训

1. 教训一及其背景
2. 教训二及其背景
3. 教训三及其背景

## 延伸阅读

- [文档链接 1]
- [文档链接 2]
`,
    },
  },
  {
    id: "changelog",
    icon: "Tag",
    nameKey: "templateChangelog",
    descriptionKey: "templateChangelogDesc",
    content: {
      en: `# [Product Name] v[X.Y.Z] Release Notes

## Highlights

The big story of this release in 2-3 sentences.

## Breaking Changes

- **[Feature]**: Description of what changed and how to migrate

## New Features

- **[Feature A]**: What it does and why it matters
- **[Feature B]**: What it does and why it matters

## Bug Fixes

- Fixed [issue description] (#123)
- Fixed [issue description] (#456)

## Migration Guide

### From v[old] to v[new]

\`\`\`diff
- oldConfig({ legacy: true })
+ newConfig({ modern: true })
\`\`\`

## Links

- [Full changelog](https://github.com/org/repo/compare/v0.1.0...v0.2.0)
- [Documentation](https://docs.example.com)
- [Report issues](https://github.com/org/repo/issues)
`,
      zh: `# [产品名称] v[X.Y.Z] 发布说明

## 亮点

2-3 句话概括本次发布的核心变化。

## 破坏性变更

- **[功能]**：变更内容及迁移方式说明

## 新功能

- **[功能 A]**：做了什么，为什么重要
- **[功能 B]**：做了什么，为什么重要

## Bug 修复

- 修复了 [问题描述] (#123)
- 修复了 [问题描述] (#456)

## 迁移指南

### 从 v[旧版本] 升级到 v[新版本]

\`\`\`diff
- oldConfig({ legacy: true })
+ newConfig({ modern: true })
\`\`\`

## 链接

- [完整变更日志](https://github.com/org/repo/compare/v0.1.0...v0.2.0)
- [文档](https://docs.example.com)
- [报告问题](https://github.com/org/repo/issues)
`,
    },
  },
  {
    id: "thread-to-article",
    icon: "MessageSquareText",
    nameKey: "templateThreadExpand",
    descriptionKey: "templateThreadExpandDesc",
    content: {
      en: `# [Compelling Title That Hooks the Reader]

## The Short Version

Your thread hook — the one tweet that grabbed attention — expanded into a paragraph.

## [Point 1 from Thread]

Expand your first thread point into a full section. Add context, examples, and nuance that 280 characters couldn't capture.

## [Point 2 from Thread]

Expand your second point. Include data, code samples, or visuals.

\`\`\`ts
// Example code supporting your point
const result = await doSomething();
\`\`\`

## [Point 3 from Thread]

Expand your third point. Address counterarguments or edge cases.

## Evidence & References

- Source 1: [link]
- Source 2: [link]
- Data point: [stat]

## Conclusion

Tie it all together. What should the reader take away?

---

*This article expands on my thread: [link to original thread]*
`,
      zh: `# [吸引读者的标题]

## 简短版本

你 thread 中最抓人的那条推文，展开为一段话。

## [Thread 要点 1]

将第一个要点展开为完整章节，补充 280 字无法容纳的上下文、案例和细节。

## [Thread 要点 2]

展开第二个要点，加入数据、代码示例或图表。

\`\`\`ts
// 支撑观点的代码示例
const result = await doSomething();
\`\`\`

## [Thread 要点 3]

展开第三个要点，回应反对意见或边界情况。

## 证据与参考

- 来源 1：[链接]
- 来源 2：[链接]
- 数据点：[统计]

## 总结

串联全文，读者应该带走什么？

---

*本文扩写自我的 thread：[原始 thread 链接]*
`,
    },
  },
  {
    id: "tool-introduction",
    icon: "Wrench",
    nameKey: "templateToolIntro",
    descriptionKey: "templateToolIntroDesc",
    content: {
      en: `# [Tool Name]: [One-line Value Proposition]

## The Problem

Describe the pain point this tool solves. Be specific.

## The Solution

What the tool does, in 2-3 sentences.

## Quick Start

\`\`\`bash
# Install
npm install tool-name

# Basic usage
npx tool-name init
\`\`\`

\`\`\`ts
import { tool } from "tool-name";

const result = tool.run({ input: "example" });
console.log(result);
\`\`\`

## Feature Comparison

| Feature | This Tool | Alternative A | Alternative B |
| --- | --- | --- | --- |
| Speed | Fast | Medium | Slow |
| Config | Zero-config | Heavy | Medium |
| Size | 12kb | 45kb | 120kb |

## When to Use This

- Use case 1
- Use case 2
- Use case 3

## When NOT to Use This

- Anti-pattern 1
- Anti-pattern 2

## Links

- [GitHub](https://github.com/org/tool)
- [Documentation](https://tool.dev/docs)
- [Playground](https://tool.dev/play)
`,
      zh: `# [工具名称]：[一句话价值主张]

## 问题

描述这个工具要解决的痛点，越具体越好。

## 解决方案

2-3 句话说明工具做了什么。

## 快速上手

\`\`\`bash
# 安装
npm install tool-name

# 基本用法
npx tool-name init
\`\`\`

\`\`\`ts
import { tool } from "tool-name";

const result = tool.run({ input: "example" });
console.log(result);
\`\`\`

## 功能对比

| 特性 | 本工具 | 替代方案 A | 替代方案 B |
| --- | --- | --- | --- |
| 速度 | 快 | 中等 | 慢 |
| 配置 | 零配置 | 繁琐 | 中等 |
| 体积 | 12kb | 45kb | 120kb |

## 适用场景

- 场景 1
- 场景 2
- 场景 3

## 不适用场景

- 反模式 1
- 反模式 2

## 链接

- [GitHub](https://github.com/org/tool)
- [文档](https://tool.dev/docs)
- [在线体验](https://tool.dev/play)
`,
    },
  },
];
