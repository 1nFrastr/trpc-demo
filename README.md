# tRPC Demo

一个最小可运行的 tRPC 全栈示例，包含 Node 服务端、React 客户端，以及基于 Vite middleware 的 SSR 开发流程。

## 技术栈

- tRPC v11（`@trpc/server` / `@trpc/client` / `@trpc/react-query`）
- React 19
- TanStack React Query
- TypeScript
- Vite（SSR middleware 模式）
- `tsx`（本地开发时运行 TS）

## 关键技术要点

- **端到端类型安全**：服务端通过 `AppRouter` 导出路由类型，客户端直接复用类型调用接口。
- **查询 + 变更组合**：示例覆盖 `query`（列表、按 ID 查）与 `mutation`（创建、重置）两类场景。
- **乐观更新**：`userCreate` 和 `userReset` 在前端实现了 `onMutate / onError / onSuccess` 的经典流程（先改缓存、失败回滚、成功失效重拉）。
- **SSR + Hydration**：
  - 服务端用 `createServerSideHelpers` 预取查询并 `dehydrate`
  - HTML 注入 `dehydratedState`
  - 客户端用 `HydrationBoundary` 进行缓存接管，减少首屏重复请求
- **开发体验**：SSR 页面通过 Vite HMR 热更新，API 服务与 Web 服务分开启动，便于调试。

## 本地运行

```bash
npm install
```

启动 tRPC API 服务（默认 `http://localhost:3000`）：

```bash
npm run dev:server
```

启动 SSR Web 服务（默认 `http://localhost:5173`）：

```bash
npm run dev:web
```

可选：运行命令行客户端演示：

```bash
npm run dev:client
```

## 脚本说明

- `npm run dev:server`：运行服务端 tRPC API
- `npm run dev:web`：运行 SSR Web 服务（Vite middleware）
- `npm run dev:client`：运行 Node 命令行客户端示例
- `npm run typecheck`：TypeScript 类型检查
