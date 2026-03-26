import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './appRouter.js';

const server = createHTTPServer({
  router: appRouter,
  middleware: (req, res, next) => {
    // 启用 CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-trpc-source');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    next();
  }
});

server.listen(3000, () => {
  console.log('🚀 tRPC server running on http://localhost:3000');
});
