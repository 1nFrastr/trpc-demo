import type { IncomingMessage, ServerResponse } from "node:http";
import {
  getDashboardCards,
  getDashboardLatestInvoices,
  getDashboardRevenue,
} from "./dashboard-data.js";

function json(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

export async function handleApi(req: IncomingMessage, res: ServerResponse, pathname: string) {
  try {
    if (pathname === "/api/dashboard/cards" && req.method === "GET") {
      json(res, await getDashboardCards());
      return true;
    }
    if (pathname === "/api/dashboard/revenue" && req.method === "GET") {
      json(res, await getDashboardRevenue());
      return true;
    }
    if (pathname === "/api/dashboard/invoices" && req.method === "GET") {
      json(res, await getDashboardLatestInvoices());
      return true;
    }
  } catch (e) {
    json(res, { error: e instanceof Error ? e.message : "error" }, 500);
    return true;
  }
  return false;
}
