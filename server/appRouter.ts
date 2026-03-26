import { publicProcedure, router } from './trpc.js';
import { z } from 'zod';

type User = {
   id: string,
   name: string,
   age: number
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

// 模拟数据库（内存数组 + 重置用初始数据快照）
const initialUserList: User[] = [
  { id: "1", name: "Katt", age: 20 },
  { id: "2", name: "Alice", age: 21 },
];

const userList: User[] = [...initialUserList];

export const appRouter = router({
  // 查询所有用户
  userList: publicProcedure
    .query(async () => {
      return userList;
    }),

  // 根据 ID 查询用户
  userById: publicProcedure
    .input(z.string())
    .query(async (opts) => {
      const { input } = opts;
      const user = userList.find(u => u.id === input);
      return user ?? null;
    }),

  // 创建用户
  userCreate: publicProcedure
    .input(z.object({ name: z.string().min(1), age: z.number().min(1) }))
    .mutation(async (opts) => {
      // 给前端乐观更新一点“可见时间”，否则请求太快就看不到效果
      await sleep(800);
      const { input } = opts;
      const newUser: User = {
        id: String(userList.length + 1),
        name: input.name,
        age: input.age
      };
      userList.push(newUser);
      return newUser;
    }),

  // 重置用户数据
  userReset: publicProcedure
    .mutation(async () => {
      // 给前端乐观更新一点“可见时间”，否则请求太快就看不到效果
      await sleep(800);
      userList.length = 0;
      userList.push(...initialUserList);
      return { ok: true };
    }),
});

export type AppRouter = typeof appRouter;
