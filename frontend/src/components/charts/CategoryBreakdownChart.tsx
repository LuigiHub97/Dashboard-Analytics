import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CategoryBreakdownItem } from "../../types";

const SERIES_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#e34948",
];
const OTHER_COLOR = "#898781";
const MAX_SLOTS = 8;

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CategoryBreakdownChart({ items }: { items: CategoryBreakdownItem[] }) {
  const expenses = items.filter((i) => i.type === "expense").sort((a, b) => b.total - a.total);

  if (expenses.length === 0) {
    return <p className="empty-state">Sem despesas no período.</p>;
  }

  const top = expenses.slice(0, MAX_SLOTS - 1);
  const rest = expenses.slice(MAX_SLOTS - 1);
  const restTotal = rest.reduce((sum, i) => sum + i.total, 0);

  const data = [
    ...top.map((i) => ({ name: i.categoryName, total: i.total })),
    ...(restTotal > 0 ? [{ name: "Outros", total: restTotal }] : []),
  ];

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 48, left: 8, bottom: 8 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "#52514e", fontSize: 13 }}
          axisLine={{ stroke: "#c3c2b7" }}
          tickLine={false}
        />
        <Tooltip formatter={(value: number) => currencyFormatter.format(value)} cursor={{ fill: "#f0efec" }} />
        <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={22}>
          {data.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={entry.name === "Outros" ? OTHER_COLOR : SERIES_COLORS[index % SERIES_COLORS.length]}
            />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            formatter={(value: number) => currencyFormatter.format(value)}
            style={{ fill: "#0b0b0b", fontSize: 12 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
