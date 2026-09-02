import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendItem } from "../../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function TrendChart({ items }: { items: TrendItem[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={items} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="#e1e0d9" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "#52514e", fontSize: 12 }} axisLine={{ stroke: "#c3c2b7" }} tickLine={false} />
        <YAxis
          tick={{ fill: "#52514e", fontSize: 12 }}
          axisLine={{ stroke: "#c3c2b7" }}
          tickLine={false}
          tickFormatter={(value) => currencyFormatter.format(value)}
          width={90}
        />
        <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          name="Receita"
          stroke="#2a78d6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="expense"
          name="Despesa"
          stroke="#e34948"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
