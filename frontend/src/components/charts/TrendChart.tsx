import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendItem } from "../../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const INCOME_COLOR = "oklch(78% 0.19 150)";
const EXPENSE_COLOR = "oklch(70% 0.19 22)";

export function TrendChart({ items }: { items: TrendItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={items} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <defs>
          <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.3} />
            <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#8a97a8", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} />
        <YAxis
          tick={{ fill: "#8a97a8", fontSize: 12 }}
          axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
          tickLine={false}
          tickFormatter={(value) => currencyFormatter.format(value)}
          width={90}
        />
        <Tooltip
          formatter={(value: number) => currencyFormatter.format(value)}
          contentStyle={{ background: "#1c2636", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#eef2f6" }}
          itemStyle={{ color: "#eef2f6" }}
          labelStyle={{ color: "#8a97a8" }}
        />
        <Legend wrapperStyle={{ fontSize: 13, color: "#c7cedb" }} />
        <Area
          type="monotone"
          dataKey="income"
          name="Receita"
          stroke={INCOME_COLOR}
          strokeWidth={2.5}
          fill="url(#incomeFill)"
          dot={{ r: 3, fill: INCOME_COLOR, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Despesa"
          stroke={EXPENSE_COLOR}
          strokeWidth={2.5}
          strokeDasharray="5 5"
          dot={{ r: 3, fill: EXPENSE_COLOR, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
