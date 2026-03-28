/** 纯异步数据层：由 HTTP handler 与（SSR 内）fetch 共用，无 tRPC */

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function getDashboardCards() {
  await sleep(500);
  return {
    totalPaid: 1250,
    totalPending: 800,
    invoiceCount: 12,
    customerCount: 8,
  };
}

export async function getDashboardRevenue() {
  await sleep(6500);
  return [
    { month: "Jan", amount: 1200 },
    { month: "Feb", amount: 1800 },
    { month: "Mar", amount: 900 },
    { month: "Apr", amount: 2100 },
    { month: "May", amount: 1600 },
    { month: "Jun", amount: 2400 },
  ] as const;
}

export async function getDashboardLatestInvoices() {
  await sleep(9500);
  return [
    { id: "inv_01", name: "Lee Robinson", email: "lee@example.com", amount: 199.0 },
    { id: "inv_02", name: "Delba de Oliveira", email: "delba@example.com", amount: 89.9 },
    { id: "inv_03", name: "Michael Novotny", email: "michael@example.com", amount: 420.0 },
    { id: "inv_04", name: "Steph Dietz", email: "steph@example.com", amount: 65.5 },
  ];
}
