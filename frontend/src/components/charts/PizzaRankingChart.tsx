import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PizzaSale } from "../../types";
import { rankPizzas } from "../../utils/pizzaRanking";

interface PizzaRankingChartProps {
  sales: PizzaSale[];
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const QUANTITY_COLOR = "#1a472a";
const PROFIT_COLOR = "#d4af37";

const tooltipStyle = {
  contentStyle: { background: "#1c2636", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#eef2f6" },
  itemStyle: { color: "#eef2f6" },
  labelStyle: { color: "#8a97a8" },
};

export function PizzaRankingChart({ sales }: PizzaRankingChartProps) {
  const ranked = rankPizzas(sales);

  if (ranked.length === 0) {
    return null;
  }

  const byQuantity = [...ranked].sort((a, b) => b.quantity - a.quantity);
  const byProfit = [...ranked].sort((a, b) => b.totalProfit - a.totalProfit);
  const chartHeight = Math.max(120, ranked.length * 42);

  return (
    <div className="pizza-ranking-charts">
      <div>
        <span className="field-label">Mais vendidas (quantidade)</span>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={byQuantity} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#8a97a8", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.12)" }} tickLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="pizzaName"
              tick={{ fill: "#c7cedb", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={false}
              width={140}
            />
            <Tooltip formatter={(value: number) => [`${value} pizzas`, "Quantidade"]} {...tooltipStyle} />
            <Bar dataKey="quantity" fill={QUANTITY_COLOR} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <span className="field-label">Mais lucrativas (total)</span>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart data={byProfit} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#8a97a8", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={false}
              tickFormatter={(value) => currencyFormatter.format(value)}
            />
            <YAxis
              type="category"
              dataKey="pizzaName"
              tick={{ fill: "#c7cedb", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={false}
              width={140}
            />
            <Tooltip formatter={(value: number) => currencyFormatter.format(value)} {...tooltipStyle} />
            <Bar dataKey="totalProfit" fill={PROFIT_COLOR} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
