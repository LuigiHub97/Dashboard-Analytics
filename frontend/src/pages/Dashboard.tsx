import { useEffect, useState } from "react";
import { CategoryBreakdownChart } from "../components/charts/CategoryBreakdownChart";
import { SummaryCards } from "../components/charts/SummaryCards";
import { TrendChart } from "../components/charts/TrendChart";
import * as dashboardService from "../services/dashboard.service";
import { CategoryBreakdownItem, MonthlySummary, TrendItem } from "../types";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [trend, setTrend] = useState<TrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([
      dashboardService.getSummary(month),
      dashboardService.getByCategory(month),
      dashboardService.getTrend(6),
    ]).then(([summaryRes, breakdownRes, trendRes]) => {
      if (cancelled) return;
      setSummary(summaryRes);
      setBreakdown(breakdownRes);
      setTrend(trendRes);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [month]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      {loading || !summary ? (
        <p className="empty-state">Carregando...</p>
      ) : (
        <>
          <SummaryCards summary={summary} />

          <div className="dashboard-grid">
            <section className="card">
              <h2>Despesas por categoria</h2>
              <CategoryBreakdownChart items={breakdown} />
            </section>

            <section className="card">
              <h2>Tendência (últimos 6 meses)</h2>
              <TrendChart items={trend} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}
