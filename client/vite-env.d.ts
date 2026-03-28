/// <reference types="vite/client" />

import type { DashboardPayload } from "./loaders.js";

declare global {
  interface Window {
    /** SSR 内联脚本注入，供 hydrate 与 loaders 对齐 */
    __DASHBOARD__?: DashboardPayload;
  }
}

export {};
