import { useState } from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { CategoryBreakdownItem, Transaction } from "../../types";

const SERIES_COLORS = [
  "oklch(74% 0.16 150)",
  "oklch(74% 0.16 195)",
  "oklch(74% 0.16 240)",
  "oklch(74% 0.16 285)",
  "oklch(74% 0.16 330)",
  "oklch(74% 0.16 15)",
  "oklch(74% 0.16 60)",
  "oklch(74% 0.16 105)",
];
const OTHER_COLOR = "oklch(55% 0.01 262)";
const MAX_SLOTS = 8;
const SIZE = 168;

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

interface CategoryBreakdownChartProps {
  items: CategoryBreakdownItem[];
  transactions?: Transaction[];
}

export function CategoryBreakdownChart({ items, transactions = [] }: CategoryBreakdownChartProps) {
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const expenses = items.filter((i) => i.type === "expense").sort((a, b) => b.total - a.total);

  if (expenses.length === 0) {
    return <p className="empty-state">Sem despesas no período.</p>;
  }

  const top = expenses.slice(0, MAX_SLOTS - 1);
  const rest = expenses.slice(MAX_SLOTS - 1);
  const restTotal = rest.reduce((sum, i) => sum + i.total, 0);

  const data = [
    ...top.map((i) => ({ name: i.categoryName, total: i.total, categoryIds: [i.categoryId] })),
    ...(restTotal > 0 ? [{ name: "Outros", total: restTotal, categoryIds: rest.map((i) => i.categoryId) }] : []),
  ];
  const total = data.reduce((sum, i) => sum + i.total, 0);
  const colorFor = (name: string, index: number) =>
    name === "Outros" ? OTHER_COLOR : SERIES_COLORS[index % SERIES_COLORS.length];

  function toggle(name: string) {
    setExpandedName((current) => (current === name ? null : name));
  }

  return (
    <div className="donut-chart">
      <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
        <PieChart width={SIZE} height={SIZE}>
          <Pie data={data} dataKey="total" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={2} stroke="none">
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colorFor(entry.name, index)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => currencyFormatter.format(value)}
            contentStyle={{
              background: "#1c2636",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              color: "#eef2f6",
              fontSize: 13,
            }}
            itemStyle={{ color: "#eef2f6" }}
          />
        </PieChart>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total
          </span>
          <span className="num" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            {currencyFormatter.format(total)}
          </span>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((entry, index) => {
          const expanded = expandedName === entry.name;
          const entryTransactions = transactions.filter((t) => entry.categoryIds.includes(t.categoryId));

          return (
            <div className="donut-legend-row" key={entry.name}>
              <button type="button" className="donut-legend-row-btn" onClick={() => toggle(entry.name)}>
                <svg
                  className={"donut-legend-chevron" + (expanded ? " expanded" : "")}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span className="donut-legend-dot" style={{ background: colorFor(entry.name, index) }} />
                <span className="donut-legend-label">{entry.name}</span>
                <span className="donut-legend-value">{currencyFormatter.format(entry.total)}</span>
              </button>

              {expanded && (
                <div className="donut-legend-detail">
                  {entryTransactions.length === 0 ? (
                    <p className="donut-legend-detail-empty">Nenhum lançamento encontrado.</p>
                  ) : (
                    entryTransactions.map((t) => (
                      <div className="donut-legend-detail-row" key={t.id}>
                        <span>
                          {t.description || "Sem descrição"} · {dateFormatter.format(new Date(t.date))}
                        </span>
                        <span className="num">{currencyFormatter.format(t.amount)}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
