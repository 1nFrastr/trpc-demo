import fs from "node:fs/promises";
import path from "node:path";
import { createServer } from "node:http";
import { createServer as createViteServer } from "vite";
import { handleApi } from "./api-handlers.js";

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
    const url = req.url ?? "/";
    const pathname = new URL(url, "http://127.0.0.1").pathname;

    if (pathname.startsWith("/api/")) {
      void (async () => {
        try {
          const handled = await handleApi(req, res, pathname);
          if (!handled) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not Found");
          }
        } catch (e) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
          res.end(e instanceof Error ? e.message : "error");
        }
      })();
      return;
    }

    vite.middlewares(req, res, async () => {
      try {
        const templatePath = path.resolve(projectRoot, "client/index.html");
        let template = await fs.readFile(templatePath, "utf-8");
        template = await vite.transformIndexHtml(url, template);

        const marker = "<!--ssr-outlet-->";
        const i = template.indexOf(marker);
        if (i === -1) {
          throw new Error("client/index.html 缺少 <!--ssr-outlet-->");
        }
        const shellBefore = template.slice(0, i);
        const shellAfter = template.slice(i + marker.length);

        const { resetSsrDashboardCapture } = await vite.ssrLoadModule("/client/loaders.ts");
        resetSsrDashboardCapture();

        const { streamRender } = await vite.ssrLoadModule("/client/entry-server.tsx");
        await streamRender(res, shellBefore, shellAfter);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        const message = error instanceof Error ? error.stack ?? error.message : "SSR Error";
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        }
        res.end(message);
      } finally {
        const g = globalThis as unknown as Record<string, unknown>;
        delete g.__SSR_DASHBOARD_CAPTURE__;
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
    console.log(`🌐 Vite SSR（HTML 流式） http://127.0.0.1:${webPort}`);
    console.log(`♻️  Vite HMR websocket port: ${hmrPort}`);
  });
}

void start();
