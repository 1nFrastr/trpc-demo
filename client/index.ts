const apiOrigin = process.env.API_ORIGIN ?? "http://127.0.0.1:5173";

async function main() {
  try {
    console.log("GET /api/dashboard/cards …");
    console.log(await (await fetch(`${apiOrigin}/api/dashboard/cards`)).json());

    console.log("\nGET /api/dashboard/revenue …");
    console.log(await (await fetch(`${apiOrigin}/api/dashboard/revenue`)).json());

    console.log("\nGET /api/dashboard/invoices …");
    console.log(await (await fetch(`${apiOrigin}/api/dashboard/invoices`)).json());
  } catch (e) {
    console.error("❌", e);
    console.error("请先在本机运行: npm run dev:web");
  }
}

void main();
