import fs from "node:fs/promises";
import path from "node:path";
import { createServer } from "node:http";
import { createServer as createViteServer } from "vite";

const projectRoot = process.cwd();
const webPort = Number(process.env.WEB_PORT ?? process.env.PORT ?? "5173");
const hmrPort = Number(process.env.HMR_PORT ?? "24679");

async function start() {
  const vite = await createViteServer({
    root: projectRoot,
    appType: "custom",
    server: {
      middlewareMode: true,
      hmr: {
        port: hmrPort,
      },
    },
  });

  const server = createServer((req, res) => {
    vite.middlewares(req, res, async () => {
      const url = req.url ?? "/";

      try {
        const templatePath = path.resolve(projectRoot, "client/index.html");
        let template = await fs.readFile(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);

        const { render } = await vite.ssrLoadModule("/client/entry-server.tsx");
        const { appHtml, dehydratedState } = await render(url);
        const dehydratedScript = `<script>window.__TRPC_DEHYDRATED_STATE__=${JSON.stringify(
          dehydratedState,
        ).replace(/</g, "\\u003c")}</script>`;
        const html = template
          .replace("<!--ssr-outlet-->", appHtml)
          .replace("</body>", `${dehydratedScript}</body>`);

        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        const message = error instanceof Error ? error.stack ?? error.message : "SSR Error";
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(message);
      }
    });
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`端口 ${webPort} 已被占用，请换一个端口重试。`);
      console.error(`示例: WEB_PORT=5174 HMR_PORT=24680 npm run dev:web`);
      return;
    }
    console.error(error);
  });

  server.listen(webPort, () => {
    console.log(`🌐 SSR web server running on http://localhost:${webPort}`);
    console.log(`♻️  Vite HMR websocket port: ${hmrPort}`);
  });
}

void start();
