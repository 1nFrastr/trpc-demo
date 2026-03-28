# Vite + React SSR 流式渲染（Dashboard 示例）

本仓库已从「tRPC 全栈最小示例」演进为 **无 tRPC、无 Next** 的 **Vite middleware SSR + 流式 HTML** 演示，用于对照 Next.js App Router 中 `loading.tsx` / `Suspense` 的分段展示体验。

## 本分支做了什么

- **移除** `@trpc/server`、`@trpc/client`、`@trpc/react-query` 及原 `server/appRouter.ts`、`server/index.ts` 等 tRPC 栈。
- **新增** 纯 Node HTTP 路由：`GET /api/dashboard/cards`、`/revenue`、`/invoices`（见 `server/api-handlers.ts`），数据层在 `server/dashboard-data.ts`（含刻意延迟，模拟慢接口）。
- **前端** `client/App.tsx` 使用 React 19 `use()` + `Suspense`，为卡片、营收图、发票列表分别提供 **skeleton**，慢请求只阻塞对应区块。
- **SSR 数据路径** `client/loaders.ts`：服务端渲染时直接 `import` `dashboard-data`，并行拉取；流式边界结束后把快照注入 `window.__DASHBOARD__`，hydrate 后避免重复打 `/api`（或回退到 `/api`）。
- **脚本**：`npm run dev:web` 启动 Vite SSR（`server/ssr.ts`）；`npm run dev:cli` 保留 CLI 入口（若仍存在）。

若你需要合并回使用 tRPC 的 `main`，请在本分支外保留旧提交或从远程恢复。

## 技术栈

- React 19（`use` / `Suspense`）
- Vite 8（SSR middleware）
- TypeScript、`tsx` 运行

## 本地运行

```bash
npm install
npm run dev:web
```

浏览器访问终端输出地址（默认 `http://localhost:5173`）。

```bash
npm run typecheck
```

## 目录结构（要点）

| 路径 | 说明 |
|------|------|
| `server/ssr.ts` | Vite SSR 流式渲染与 `/api/*` 转发 |
| `server/api-handlers.ts` | Dashboard JSON API |
| `server/dashboard-data.ts` | 异步假数据与延迟 |
| `client/loaders.ts` | SSR/浏览器双路径数据加载与 `__DASHBOARD__` 注入协作 |
| `client/App.tsx` | Dashboard UI + Suspense 边界 |

## 与 Next.js Streaming 的对应关系

- 各区块独立 `Suspense` + fallback ≈ 页面级 `loading.tsx` + 组件级 `Suspense`。
- 慢接口不阻塞首屏 HTML 起始流，后续区块随数据就绪再填充（具体行为以 `server/ssr.ts` 实现为准）。
