import { Suspense, use, useMemo, type CSSProperties } from "react";
import {
  fetchDashboardCards,
  fetchDashboardInvoices,
  fetchDashboardRevenue,
} from "./loaders.js";

const sk = {
  pulse: {
    background: "linear-gradient(90deg,#e5e7eb 0%,#f3f4f6 50%,#e5e7eb 100%)",
    backgroundSize: "200% 100%",
    animation: "dashSk 1.2s ease-in-out infinite",
  } as CSSProperties,
};

function CardsSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 16,
      }}
      aria-busy="true"
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: 8,
            padding: 16,
            background: "#fff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ ...sk.pulse, height: 12, width: "55%", borderRadius: 4, marginBottom: 12 }} />
          <div style={{ ...sk.pulse, height: 28, width: "40%", borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

function RevenueChartSkeleton() {
  return (
    <div
      style={{
        borderRadius: 8,
        padding: 20,
        background: "#fff",
        border: "1px solid #e5e7eb",
        minHeight: 280,
      }}
      aria-busy="true"
    >
      <div style={{ ...sk.pulse, height: 14, width: "35%", borderRadius: 4, marginBottom: 20 }} />
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 200 }}>
        {[40, 65, 35, 80, 55, 90].map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: 4,
              ...sk.pulse,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function LatestInvoicesSkeleton() {
  return (
    <div
      style={{
        borderRadius: 8,
        padding: 16,
        background: "#fff",
        border: "1px solid #e5e7eb",
        minHeight: 280,
      }}
      aria-busy="true"
    >
      <div style={{ ...sk.pulse, height: 14, width: "45%", borderRadius: 4, marginBottom: 16 }} />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
          <div style={{ ...sk.pulse, width: 40, height: 40, borderRadius: "50%" }} />
          <div style={{ flex: 1 }}>
            <div style={{ ...sk.pulse, height: 10, width: "50%", borderRadius: 4, marginBottom: 8 }} />
            <div style={{ ...sk.pulse, height: 8, width: "35%", borderRadius: 4 }} />
          </div>
          <div style={{ ...sk.pulse, height: 14, width: 56, borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

function CardWrapper() {
  const data = use(useMemo(() => fetchDashboardCards(), []));
  const items = [
    { title: "Collected", value: `$${data.totalPaid}` },
    { title: "Pending", value: `$${data.totalPending}` },
    { title: "Total Invoices", value: String(data.invoiceCount) },
    { title: "Total Customers", value: String(data.customerCount) },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: 16,
      }}
    >
      {items.map((item) => (
        <div
          key={item.title}
          style={{
            borderRadius: 8,
            padding: 16,
            background: "#fff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>{item.title}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function RevenueChart() {
  const rows = use(useMemo(() => fetchDashboardRevenue(), []));
  const max = Math.max(...rows.map((r) => r.amount), 1);
  return (
    <div style={{ borderRadius: 8, padding: 20, background: "#fff", border: "1px solid #e5e7eb" }}>
      <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
        Recent Revenue
      </h2>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 220, paddingTop: 8 }}>
        {rows.map((r) => (
          <div key={r.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: "100%",
                maxWidth: 48,
                height: `${Math.round((r.amount / max) * 180)}px`,
                minHeight: 8,
                background: "linear-gradient(180deg,#3b82f6,#1d4ed8)",
                borderRadius: 4,
              }}
            />
            <span style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>{r.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatestInvoices() {
  const list = use(useMemo(() => fetchDashboardInvoices(), []));
  return (
    <div style={{ borderRadius: 8, padding: 16, background: "#fff", border: "1px solid #e5e7eb" }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 600, color: "#111827" }}>
        Latest Invoices
      </h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {list.map((inv) => (
          <li
            key={inv.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#e0e7ff",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                fontWeight: 600,
                color: "#3730a3",
              }}
            >
              {inv.name.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500, color: "#111827", fontSize: 14 }}>{inv.name}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis" }}>
                {inv.email}
              </div>
            </div>
            <div style={{ fontWeight: 600, color: "#111827" }}>${inv.amount.toFixed(2)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f9fafb" }}>
      <style>{`
        @keyframes dashSk {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (min-width: 900px) {
          .dashLower { grid-template-columns: 1.4fr 1fr !important; }
        }
      `}</style>

      <aside
        style={{
          width: 200,
          flexShrink: 0,
          background: "#1e293b",
          color: "#e2e8f0",
          padding: 24,
          fontSize: 14,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 24, fontSize: 16 }}>Acme</div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Dashboard", "Invoices", "Customers"].map((label, i) => (
            <div
              key={label}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: i === 0 ? "rgba(255,255,255,0.1)" : "transparent",
              }}
            >
              {label}
            </div>
          ))}
        </nav>
      </aside>

      <div style={{ flex: 1, padding: "32px 40px", maxWidth: 1100 }}>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 28,
            fontWeight: 700,
            color: "#111827",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          Dashboard
        </h1>
        <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: 14, maxWidth: 720, lineHeight: 1.65 }}>
          <strong>不</strong>在发 HTML 前阻塞拉齐全部数据：各区块在 SSR 里并行 <code style={{ fontSize: 13 }}>import</code>{" "}
          <code style={{ fontSize: 13 }}>dashboard-data</code>，先流式出壳与骨架，再分段补全。流结束后在{" "}
          <code style={{ fontSize: 13 }}>onAllReady</code> 把本次解析结果写入{" "}
          <code style={{ fontSize: 13 }}>window.__DASHBOARD__</code>，hydrate 时<strong>首屏 0 次</strong>{" "}
          <code style={{ fontSize: 13 }}>/api</code>（无快照时才回退 fetch）。
        </p>

        <section style={{ marginBottom: 24 }}>
          <Suspense fallback={<CardsSkeleton />}>
            <CardWrapper />
          </Suspense>
        </section>

        <div className="dashLower" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <Suspense fallback={<RevenueChartSkeleton />}>
            <RevenueChart />
          </Suspense>
          <Suspense fallback={<LatestInvoicesSkeleton />}>
            <LatestInvoices />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
