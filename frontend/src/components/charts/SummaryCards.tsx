import { MonthlySummary } from "../../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function SummaryCards({ summary }: { summary: MonthlySummary }) {
  const balancePositive = summary.balance >= 0;

  return (
    <div className="summary-cards">
      <div className="stat-card">
        <span className="stat-label">Receita</span>
        <span className="stat-value">{currencyFormatter.format(summary.income)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Despesa</span>
        <span className="stat-value">{currencyFormatter.format(summary.expense)}</span>
      </div>
      <div className="stat-card">
        <span className="stat-label">Saldo</span>
        <span className={`stat-value ${balancePositive ? "stat-positive" : "stat-negative"}`}>
          {currencyFormatter.format(summary.balance)}
        </span>
      </div>
    </div>
  );
}
