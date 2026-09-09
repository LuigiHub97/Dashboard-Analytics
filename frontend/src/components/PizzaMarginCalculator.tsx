import { useState } from "react";
import { SALES_CHANNELS } from "../constants/salesChannels";

interface PizzaMarginCalculatorProps {
  cmvTotal: number;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function parseNumber(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function PizzaMarginCalculator({ cmvTotal }: PizzaMarginCalculatorProps) {
  const [sellingPrice, setSellingPrice] = useState("");
  const [commissionPct, setCommissionPct] = useState("0");
  const [quantity, setQuantity] = useState("1");

  const price = parseNumber(sellingPrice);
  const qty = Math.max(1, parseNumber(quantity) || 1);
  const commissionValue = price * (parseNumber(commissionPct) / 100);
  const totalCost = cmvTotal + commissionValue;
  const totalCostPct = price > 0 ? (totalCost / price) * 100 : 0;
  const profit = price - totalCost;
  const hasPrice = price > 0;

  const qtyRevenue = price * qty;
  const qtyExpenses = totalCost * qty;
  const qtyProfit = profit * qty;

  return (
    <div className="pizza-margin">
      <span className="field-label">Simular preço de venda</span>
      <div className="category-chips">
        {SALES_CHANNELS.map((c) => (
          <button
            type="button"
            key={c.label}
            className={"category-chip" + (parseNumber(commissionPct) === c.commissionPct ? " selected" : "")}
            onClick={() => setCommissionPct(String(c.commissionPct))}
          >
            {c.label} ({c.commissionPct}%)
          </button>
        ))}
      </div>

      <div className="form-row pizza-margin-inputs">
        <label>
          Preço de venda
          <input
            type="text"
            inputMode="decimal"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            placeholder="0,00"
          />
        </label>
        <label>
          Comissão do app (%)
          <input
            type="text"
            inputMode="decimal"
            value={commissionPct}
            onChange={(e) => setCommissionPct(e.target.value)}
          />
        </label>
        <label>
          Quantidade vendida
          <input
            type="text"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
      </div>

      {!hasPrice && <p className="form-hint">Informe o preço de venda acima para calcular a comissão e o lucro.</p>}

      {hasPrice && (
        <>
          <div className="pizza-margin-result">
            <div className="pizza-summary-row">
              <span>Comissão do app (por pizza)</span>
              <span className="num">{currencyFormatter.format(commissionValue)}</span>
            </div>
            <div className="pizza-summary-row">
              <span>Custo total por pizza (CMV + comissão)</span>
              <span className="num">
                {currencyFormatter.format(totalCost)} ({totalCostPct.toFixed(1)}%)
              </span>
            </div>
            <div className={"pizza-summary-row " + (profit > 0 ? "pizza-margin-positive" : "pizza-margin-negative")}>
              <span>Lucro líquido por pizza</span>
              <span className="num">{currencyFormatter.format(profit)}</span>
            </div>
          </div>

          <div className="pizza-margin-result pizza-margin-totals">
            <span className="field-label">Total para {qty} pizza{qty === 1 ? "" : "s"} vendida{qty === 1 ? "" : "s"}</span>
            <div className="pizza-summary-row">
              <span>Despesas totais</span>
              <span className="num">{currencyFormatter.format(qtyExpenses)}</span>
            </div>
            <div className="pizza-summary-row">
              <span>Receita total</span>
              <span className="num">{currencyFormatter.format(qtyRevenue)}</span>
            </div>
            <div
              className={
                "pizza-summary-row pizza-summary-total " + (qtyProfit > 0 ? "pizza-margin-positive" : "pizza-margin-negative")
              }
            >
              <span>Lucro líquido total</span>
              <span className="num">{currencyFormatter.format(qtyProfit)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
