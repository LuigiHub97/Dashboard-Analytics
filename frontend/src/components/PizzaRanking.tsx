import { PizzaSale } from "../types";
import { rankPizzas } from "../utils/pizzaRanking";

interface PizzaRankingProps {
  sales: PizzaSale[];
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

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
