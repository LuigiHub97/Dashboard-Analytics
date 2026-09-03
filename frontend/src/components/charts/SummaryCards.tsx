import { useState } from "react";
import { CategoryBreakdownItem, MonthlySummary, Transaction } from "../../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

interface SummaryCardsProps {
  summary: MonthlySummary;
  expenseBreakdown?: CategoryBreakdownItem[];
  expenseTransactions?: Transaction[];
}

export function SummaryCards({ summary, expenseBreakdown = [], expenseTransactions = [] }: SummaryCardsProps) {
  const balancePositive = summary.balance >= 0;
  const sortedExpenses = [...expenseBreakdown].sort((a, b) => b.total - a.total);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  function toggleCategory(categoryId: string) {
    setExpandedCategoryId((current) => (current === categoryId ? null : categoryId));
  }

  return (
    <div className="summary-cards">
      <div className="stat-card">
        <div className="stat-icon stat-icon-balance">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
            <rect x="2" y="6" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
            <circle cx="17" cy="14.5" r="1.2" fill="var(--accent)" stroke="none" />
          </svg>
        </div>
        <span className="stat-label">Saldo do mês</span>
        <span className={`stat-value ${balancePositive ? "stat-positive" : "stat-negative"}`}>
          {currencyFormatter.format(summary.balance)}
        </span>
      </div>
      <div className="stat-card">
        <div className="stat-icon stat-icon-income">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2.2">
            <path d="M12 19V5" />
            <path d="M6 11l6-6 6 6" />
          </svg>
        </div>
        <span className="stat-label">Receita</span>
        <span className="stat-value">{currencyFormatter.format(summary.income)}</span>
      </div>

      <div className="stat-card stat-card-hoverable">
        <div className="stat-icon stat-icon-expense">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--critical)" strokeWidth="2.2">
            <path d="M12 5v14" />
            <path d="M6 13l6 6 6-6" />
          </svg>
        </div>
        <span className="stat-label">Despesa</span>
        <span className="stat-value">{currencyFormatter.format(summary.expense)}</span>

        <div className="stat-popover">
          <div className="stat-popover-title">Despesas por categoria</div>
          {sortedExpenses.length === 0 ? (
            <p className="stat-popover-empty">Sem despesas no período.</p>
          ) : (
            sortedExpenses.map((item) => {
              const expanded = expandedCategoryId === item.categoryId;
              const items = expenseTransactions.filter((t) => t.categoryId === item.categoryId);

              return (
                <div className="stat-popover-row" key={item.categoryId}>
                  <button type="button" className="stat-popover-row-btn" onClick={() => toggleCategory(item.categoryId)}>
                    <svg
                      className={"stat-popover-chevron" + (expanded ? " expanded" : "")}
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                    <span className="stat-popover-row-label">{item.categoryName}</span>
                    <span className="num">{currencyFormatter.format(item.total)}</span>
                  </button>

                  {expanded && (
                    <div className="stat-popover-detail">
                      {items.length === 0 ? (
                        <p className="stat-popover-detail-empty">Nenhum lançamento encontrado.</p>
                      ) : (
                        items.map((t) => (
                          <div className="stat-popover-detail-row" key={t.id}>
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
