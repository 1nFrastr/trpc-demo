import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/appRouter.js';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({ url: 'http://localhost:3000' }),
  ],
});

async function main() {
  try {
    // 1. 查询所有用户
    console.log('📋 获取用户列表...');
    const users = await trpc.userList.query();
    console.log('用户列表:', users);

    // 2. 根据 ID 查询用户
    console.log('\n🔍 查询用户 ID=1...');
    const user = await trpc.userById.query('1');
    console.log('用户详情:', user);

    // 3. 创建新用户
    console.log('\n✨ 创建新用户...');
    const newUser = await trpc.userCreate.mutate({ name: 'Bob', age: 22 });
    console.log('创建成功:', newUser);
    
    // 4. 再次查询所有用户
    console.log('\n📋 更新后的用户列表...');
    const updatedUsers = await trpc.userList.query();
    console.log('用户列表:', updatedUsers);

  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

main();
