import { useMemo, useState } from "react";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import type { AppRouter } from "../server/appRouter.js";

const trpc = createTRPCReact<AppRouter>();

function AppInner() {
  const [userIdInput, setUserIdInput] = useState("1");
  const [selectedUserId, setSelectedUserId] = useState("1");
  const [name, setName] = useState("Bob");
  const [age, setAge] = useState("22");

  const parsedAge = useMemo(() => Number(age), [age]);

  const userListQuery = trpc.userList.useQuery(undefined);

  const userByIdQuery = trpc.userById.useQuery(selectedUserId, {
    enabled: selectedUserId.trim().length > 0,
  });

  const utils = trpc.useUtils();

  const createUserMutation = trpc.userCreate.useMutation({
    // 简化版乐观更新：
    // - 请求发出前，先把“新用户”塞进 userList 缓存
    // - 请求失败时回滚到之前的缓存（没有就直接 invalidate）
    // - 请求成功后再 invalidate，确保最终以服务端为准
    onMutate: async (input) => {
      await utils.userList.cancel();

      const previous = utils.userList.getData();
      const previousList = previous ?? [];
      const optimisticUser = {
        // 这里只是 demo 场景的简化做法：用当前 length 生成一个“可能”的 id
        // 请求最终成功后会 invalidate 回服务端真实数据。
        id: String(previousList.length + 1),
        name: input.name,
        age: input.age,
      };

      utils.userList.setData(undefined, (old = []) => [...old, optimisticUser]);
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (!ctx) return;
      if (ctx.previous) {
        utils.userList.setData(undefined, ctx.previous);
      } else {
        utils.userList.invalidate();
      }
    },
    onSuccess: () => {
      utils.userList.invalidate();
      if (selectedUserId.trim().length > 0) utils.userById.invalidate(selectedUserId);
    },
  });

  const resetUserMutation = trpc.userReset.useMutation({
    // 乐观地先清空列表；失败回滚；成功以 invalidate 为准
    onMutate: async () => {
      await utils.userList.cancel();

      const previous = utils.userList.getData();
      utils.userList.setData(undefined, []);
      return { previous };
    },
    onError: (_err, _input, ctx) => {
      if (!ctx) return;
      if (ctx.previous) {
        utils.userList.setData(undefined, ctx.previous);
      } else {
        utils.userList.invalidate();
      }
    },
    onSuccess: () => {
      utils.userList.invalidate();
      if (selectedUserId.trim().length > 0) utils.userById.invalidate(selectedUserId);
    },
  });

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", margin: 24, lineHeight: 1.5 }}>
      <h1 style={{ marginBottom: 8 }}>tRPC React 调试页</h1>
      <div style={{ color: "#666", marginBottom: 12 }}>
        打开 DevTools 的 Network / Console 可以直接看请求与响应。
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button disabled={userListQuery.isFetching} onClick={() => userListQuery.refetch()}>
          获取用户列表
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={userIdInput} onChange={(e) => setUserIdInput(e.target.value)} placeholder="输入用户 ID" />
        <button
          disabled={createUserMutation.isPending}
          onClick={() => setSelectedUserId(userIdInput.trim())}
        >
          按 ID 查询
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="姓名" />
        <input value={age} onChange={(e) => setAge(e.target.value)} type="number" min="1" placeholder="年龄" />
        <button
          disabled={createUserMutation.isPending}
          onClick={() => createUserMutation.mutate({ name: name.trim(), age: parsedAge })}
        >
          创建用户
        </button>
        <button
          disabled={createUserMutation.isPending || resetUserMutation.isPending}
          onClick={() => resetUserMutation.mutate()}
        >
          重置数据
        </button>
      </div>

      <style>{`
        .resultsGrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        /* 大屏时把 4 个区块分成 2x2，更符合“列表/详情 + 创建/重置”的阅读顺序 */
        @media (min-width: 900px) {
          .resultsGrid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
      <div className="resultsGrid">
        <section>
          <h2 style={{ margin: "0 0 6px", fontSize: 14, color: "#ddd" }}>用户列表</h2>
          <pre
            style={{
              background: "#111",
              color: "#f4f4f4",
              padding: 12,
              borderRadius: 6,
              height: 220,
              boxSizing: "border-box",
              overflow: "auto",
            }}
          >
            {userListQuery.isLoading
              ? "加载中..."
              : userListQuery.error
                ? `请求失败：${userListQuery.error.message}`
                : JSON.stringify(userListQuery.data, null, 2)}
          </pre>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px", fontSize: 14, color: "#ddd" }}>用户详情</h2>
          <pre
            style={{
              background: "#111",
              color: "#f4f4f4",
              padding: 12,
              borderRadius: 6,
              height: 220,
              boxSizing: "border-box",
              overflow: "auto",
            }}
          >
            {userByIdQuery.isLoading
              ? `加载中...（id=${selectedUserId}）`
              : userByIdQuery.error
                ? `请求失败：${userByIdQuery.error.message}`
                : JSON.stringify(userByIdQuery.data, null, 2)}
          </pre>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px", fontSize: 14, color: "#ddd" }}>创建结果</h2>
          <pre
            style={{
              background: "#111",
              color: "#f4f4f4",
              padding: 12,
              borderRadius: 6,
              height: 220,
              boxSizing: "border-box",
              overflow: "auto",
            }}
          >
            {createUserMutation.isPending
              ? "创建中..."
              : createUserMutation.error
                ? `请求失败：${createUserMutation.error.message}`
                : createUserMutation.data
                  ? JSON.stringify(createUserMutation.data, null, 2)
                  : "尚未创建"}
          </pre>
        </section>

        <section>
          <h2 style={{ margin: "0 0 6px", fontSize: 14, color: "#ddd" }}>重置结果</h2>
          <pre
            style={{
              background: "#111",
              color: "#f4f4f4",
              padding: 12,
              borderRadius: 6,
              height: 220,
              boxSizing: "border-box",
              overflow: "auto",
            }}
          >
            {resetUserMutation.isPending
              ? "重置中..."
              : resetUserMutation.error
                ? `请求失败：${resetUserMutation.error.message}`
                : resetUserMutation.data
                  ? JSON.stringify(resetUserMutation.data, null, 2)
                  : "尚未重置"}
          </pre>
        </section>
      </div>
    </main>
  );
}

type AppProps = {
  dehydratedState?: DehydratedState;
};

export default function App({ dehydratedState }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  const client = useMemo(
    () =>
      trpc.createClient({
        links: [httpBatchLink({ url: "http://localhost:3000" })],
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={client} queryClient={queryClient}>
        <HydrationBoundary state={dehydratedState}>
          <AppInner />
        </HydrationBoundary>
      </trpc.Provider>
    </QueryClientProvider>
  );
}
