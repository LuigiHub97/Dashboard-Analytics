import { PizzaSale } from "../types";

interface PizzaRankingProps {
  sales: PizzaSale[];
}

interface RankedPizza {
  pizzaName: string;
  quantity: number;
  totalRevenue: number;
  totalProfit: number;
  profitPerUnit: number;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function rankPizzas(sales: PizzaSale[]): RankedPizza[] {
  const byName = new Map<string, { quantity: number; totalRevenue: number; totalProfit: number }>();

  for (const s of sales) {
    const existing = byName.get(s.pizzaName);
    if (existing) {
      existing.quantity += s.quantity;
      existing.totalRevenue += s.totalRevenue;
      existing.totalProfit += s.totalProfit;
    } else {
      byName.set(s.pizzaName, { quantity: s.quantity, totalRevenue: s.totalRevenue, totalProfit: s.totalProfit });
    }
  }

  return Array.from(byName.entries())
    .map(([pizzaName, v]) => ({ pizzaName, ...v, profitPerUnit: v.quantity > 0 ? v.totalProfit / v.quantity : 0 }))
    .sort((a, b) => b.quantity - a.quantity);
}

export function PizzaRanking({ sales }: PizzaRankingProps) {
  const ranked = rankPizzas(sales);

  if (ranked.length === 0) {
    return <p className="empty-state">Nenhuma venda registrada nesse período ainda.</p>;
  }

  const mostSoldName = ranked[0].pizzaName;
  const mostProfitableName = [...ranked].sort((a, b) => b.totalProfit - a.totalProfit)[0].pizzaName;

  return (
    <div className="table-scroll">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Pizza</th>
            <th>Qtd vendida</th>
            <th>Receita</th>
            <th>Lucro total</th>
            <th>Lucro/pizza</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((p) => (
            <tr key={p.pizzaName}>
              <td data-label="Pizza">
                {p.pizzaName}
                {p.pizzaName === mostSoldName && <span className="ranking-badge">🏆 Mais vendida</span>}
                {p.pizzaName === mostProfitableName && <span className="ranking-badge">💰 Mais lucrativa</span>}
              </td>
              <td data-label="Qtd vendida">{p.quantity}</td>
              <td data-label="Receita">{currencyFormatter.format(p.totalRevenue)}</td>
              <td data-label="Lucro total" className={p.totalProfit >= 0 ? "amount-income" : "amount-expense"}>
                {currencyFormatter.format(p.totalProfit)}
              </td>
              <td data-label="Lucro/pizza">{currencyFormatter.format(p.profitPerUnit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
