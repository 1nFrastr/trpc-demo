type Cards = {
  totalPaid: number;
  totalPending: number;
  invoiceCount: number;
  customerCount: number;
};

type Revenue = readonly { month: string; amount: number }[];

type Invoices = { id: string; name: string; email: string; amount: number }[];

export type DashboardPayload = {
  cards: Cards;
  revenue: Revenue;
  invoices: Invoices;
};

const CAPTURE_KEY = "__SSR_DASHBOARD_CAPTURE__" as const;

type Capture = {
  cards?: Cards;
  revenue?: Revenue;
  invoices?: Invoices;
};

function getCapture(): Capture {
  const g = globalThis as unknown as Record<string, Capture | undefined>;
  if (!g[CAPTURE_KEY]) {
    g[CAPTURE_KEY] = {};
  }
  return g[CAPTURE_KEY]!;
}

/** 每个 HTTP 请求在 streamRender 前调用，避免串请求 */
export function resetSsrDashboardCapture(): void {
  const g = globalThis as unknown as Record<string, Capture | undefined>;
  g[CAPTURE_KEY] = {};
}

/**
 * 流式 SSR 全部边界结束后，用本次渲染解析到的数据生成给浏览器用的快照（不写则 hydrate 会走 /api）。
 */
export function getSsrDashboardPayloadForScript(): DashboardPayload | null {
  const c = getCapture();
  if (c.cards !== undefined && c.revenue !== undefined && c.invoices !== undefined) {
    return { cards: c.cards, revenue: c.revenue, invoices: c.invoices };
  }
  return null;
}

function apiOrigin(): string {
  if (typeof window !== "undefined") return "";
  const g = globalThis as { __VITE_SSR_API_ORIGIN__?: string };
  return g.__VITE_SSR_API_ORIGIN__ ?? "http://127.0.0.1:5173";
}

async function getJson<T>(path: string): Promise<T> {
  const url = `${apiOrigin()}${path}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json() as Promise<T>;
}

const browserOnce = {
  cards: null as Promise<Cards> | null,
  revenue: null as Promise<Revenue> | null,
  invoices: null as Promise<Invoices> | null,
};

function hydrateBrowserFromWindow(): void {
  if (typeof window === "undefined") return;
  const w = window as Window & { __DASHBOARD__?: DashboardPayload };
  if (!w.__DASHBOARD__) return;
  const d = w.__DASHBOARD__;
  browserOnce.cards = Promise.resolve(d.cards);
  browserOnce.revenue = Promise.resolve(d.revenue);
  browserOnce.invoices = Promise.resolve(d.invoices);
  delete w.__DASHBOARD__;
}

/**
 * SSR：直接调 dashboard-data（并行 + 分段完成），不阻塞首字节；解析结果写入 capture 供 onAllReady 注入 window。
 * 浏览器：读 window.__DASHBOARD__，否则 /api。
 */
export function fetchDashboardCards(): Promise<Cards> {
  if (import.meta.env.SSR) {
    return import("../server/dashboard-data.js").then(async (m) => {
      const data = await m.getDashboardCards();
      getCapture().cards = data;
      return data;
    });
  }
  hydrateBrowserFromWindow();
  if (!browserOnce.cards) {
    browserOnce.cards = getJson<Cards>("/api/dashboard/cards");
  }
  return browserOnce.cards;
}

export function fetchDashboardRevenue(): Promise<Revenue> {
  if (import.meta.env.SSR) {
    return import("../server/dashboard-data.js").then(async (m) => {
      const data = await m.getDashboardRevenue();
      getCapture().revenue = data;
      return data;
    });
  }
  hydrateBrowserFromWindow();
  if (!browserOnce.revenue) {
    browserOnce.revenue = getJson<Revenue>("/api/dashboard/revenue");
  }
  return browserOnce.revenue;
}

export function fetchDashboardInvoices(): Promise<Invoices> {
  if (import.meta.env.SSR) {
    return import("../server/dashboard-data.js").then(async (m) => {
      const data = await m.getDashboardLatestInvoices();
      getCapture().invoices = data;
      return data;
    });
  }
  hydrateBrowserFromWindow();
  if (!browserOnce.invoices) {
    browserOnce.invoices = getJson<Invoices>("/api/dashboard/invoices");
  }
  return browserOnce.invoices;
}
