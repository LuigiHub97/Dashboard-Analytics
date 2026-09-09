import { SalesSummary } from "../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function EmpresaSummaryCards({ summary }: { summary: SalesSummary }) {
  const profitPositive = summary.totalProfit >= 0;

  return (
    <div className="summary-cards">
      <div className="stat-card">
        <div className="stat-icon stat-icon-balance">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <path d="M3 3v18h18" />
            <path d="M7 15l4-4 3 3 5-6" />
          </svg>
        </div>
        <span className="stat-label">Pizzas vendidas</span>
        <span className="stat-value">{summary.quantity}</span>
      </div>
      <div className="stat-card">
        <div className="stat-icon stat-icon-income">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2.2">
            <path d="M12 19V5" />
            <path d="M6 11l6-6 6 6" />
          </svg>
        </div>
        <span className="stat-label">Receita</span>
        <span className="stat-value">{currencyFormatter.format(summary.totalRevenue)}</span>
      </div>
      <div className="stat-card">
        <div className="stat-icon stat-icon-expense">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--critical)" strokeWidth="2.2">
            <path d="M12 5v14" />
            <path d="M6 13l6 6 6-6" />
          </svg>
        </div>
        <span className="stat-label">Despesas</span>
        <span className="stat-value">{currencyFormatter.format(summary.totalCost)}</span>
      </div>
      <div className="stat-card">
        <div className="stat-icon stat-icon-balance">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
            <circle cx="17" cy="14.5" r="1.2" fill="var(--accent)" stroke="none" />
          </svg>
        </div>
        <span className="stat-label">Lucro líquido</span>
        <span className={`stat-value ${profitPositive ? "stat-positive" : "stat-negative"}`}>
          {currencyFormatter.format(summary.totalProfit)}
        </span>
      </div>
    </div>
  );
}
