import { useEffect, useState } from "react";
import { PizzaRankingChart } from "../components/charts/PizzaRankingChart";
import { EmpresaSummaryCards } from "../components/EmpresaSummaryCards";
import { PizzaRanking } from "../components/PizzaRanking";
import { SaleForm } from "../components/SaleForm";
import { SaleList } from "../components/SaleList";
import * as pizzasService from "../services/pizzas.service";
import * as salesService from "../services/sales.service";
import { Pizza, PizzaSale, SalesSummary } from "../types";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthRange(month: string): { start: string; end: string } {
  const [year, m] = month.split("-").map(Number);
  const lastDay = new Date(year, m, 0).getDate();
  return { start: `${month}-01`, end: `${month}-${String(lastDay).padStart(2, "0")}` };
}

function sumSales(sales: PizzaSale[]) {
  return sales.reduce(
    (acc, s) => ({
      quantity: acc.quantity + s.quantity,
      totalRevenue: acc.totalRevenue + s.totalRevenue,
      totalCost: acc.totalCost + s.totalCost,
      totalProfit: acc.totalProfit + s.totalProfit,
    }),
    { quantity: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0 }
  );
}

export function EmpresaDashboard() {
  const [month, setMonth] = useState(currentMonth());
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [monthSales, setMonthSales] = useState<PizzaSale[]>([]);
  const [todaySales, setTodaySales] = useState<PizzaSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRankingChart, setShowRankingChart] = useState(false);

  async function reload() {
    setLoading(true);
    const { start, end } = monthRange(month);
    const today = todayISO();
    const [pizzaItems, summaryRes, monthSalesRes, todaySalesRes] = await Promise.all([
      pizzasService.getPizzas(),
      salesService.getSalesSummary(month),
      salesService.listSales({ startDate: start, endDate: end }),
      salesService.listSales({ startDate: today, endDate: today }),
    ]);
    setPizzas(pizzaItems);
    setSummary(summaryRes);
    setMonthSales(monthSalesRes);
    setTodaySales(todaySalesRes);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function handleCreateSale(input: salesService.SaleInput) {
    await salesService.createSale(input);
    await reload();
  }

  async function handleDeleteSale(sale: PizzaSale) {
    if (!confirm(`Excluir a venda de "${sale.pizzaName}"?`)) return;
    await salesService.deleteSale(sale.id);
    await reload();
  }

  const todayTotals = sumSales(todaySales);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>

      {loading ? (
        <p className="empty-state">Carregando...</p>
      ) : (
        <>
          <div className="card">
            <h2>Hoje</h2>
            <div className="pizza-summary-row">
              <span>Pizzas vendidas</span>
              <span className="num">{todayTotals.quantity}</span>
            </div>
            <div className="pizza-summary-row">
              <span>Receita de hoje</span>
              <span className="num">{currencyFormatter.format(todayTotals.totalRevenue)}</span>
            </div>
            <div
              className={
                "pizza-summary-row pizza-summary-total " +
                (todayTotals.totalProfit >= 0 ? "pizza-margin-positive" : "pizza-margin-negative")
              }
            >
              <span>Lucro de hoje</span>
              <span className="num">{currencyFormatter.format(todayTotals.totalProfit)}</span>
            </div>
          </div>

          {summary && (
            <>
              <h2>Fechamento do mês</h2>
              <EmpresaSummaryCards summary={summary} />
            </>
          )}

          <div className="card">
            <h2>Ranking de pizzas do mês</h2>
            <PizzaRanking sales={monthSales} />

            <button
              type="button"
              className="form-secondary-toggle"
              onClick={() => setShowRankingChart((v) => !v)}
            >
              {showRankingChart ? "Ocultar gráfico" : "+ Ver gráfico"}
            </button>
            {showRankingChart && <PizzaRankingChart sales={monthSales} />}
          </div>

          <div className="card">
            <h2>Registrar venda</h2>
            <SaleForm pizzas={pizzas} onSubmit={handleCreateSale} />
          </div>

          <div className="card">
            <h2>Vendas do mês</h2>
            <SaleList sales={monthSales} onDelete={handleDeleteSale} />
          </div>
        </>
      )}
    </div>
  );
}
