import { StrictMode } from "react";
import { renderToPipeableStream } from "react-dom/server";
import type { ServerResponse } from "node:http";
import App from "./App.js";
import { getSsrDashboardPayloadForScript } from "./loaders.js";

/**
 * 将 React 树以流的形式写入 HTTP 响应：Suspense 边界先出 fallback，就绪后再追加 HTML 片段（同一连接）。
 * onAllReady 再写入 window.__DASHBOARD__（来自本次 SSR 各边界解析到的数据），保证首字节不被「先等全部数据」阻塞。
 */
export function streamRender(res: ServerResponse, shellBefore: string, shellAfter: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const { pipe } = renderToPipeableStream(
      <StrictMode>
        <App />
      </StrictMode>,
      {
        onShellReady() {
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.write(shellBefore);
          pipe(res);
        },
        onShellError(err) {
          reject(err);
        },
        onAllReady() {
          try {
            const payload = getSsrDashboardPayloadForScript();
            if (payload) {
              const json = JSON.stringify(payload).replace(/</g, "\\u003c");
              res.write(`<script>window.__DASHBOARD__=${json}</script>`);
            }
            res.write(shellAfter);
            res.end();
          } catch {
            /* 可能已由 pipe 结束 */
          }
          resolve();
        },
        onError(error) {
          console.error("[SSR stream]", error);
        },
      },
    );
  });
}
