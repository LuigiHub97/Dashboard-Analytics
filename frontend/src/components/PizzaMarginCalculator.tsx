import { useState } from "react";

interface PizzaMarginCalculatorProps {
  cmvTotal: number;
}

interface Channel {
  label: string;
  commissionPct: number;
}

const CHANNELS: Channel[] = [
  { label: "Cardápio próprio", commissionPct: 0 },
  { label: "iFood", commissionPct: 23 },
  { label: "99Food", commissionPct: 10.9 },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function parseNumber(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function PizzaMarginCalculator({ cmvTotal }: PizzaMarginCalculatorProps) {
  const [sellingPrice, setSellingPrice] = useState("");
  const [commissionPct, setCommissionPct] = useState("0");

  const price = parseNumber(sellingPrice);
  const commissionValue = price * (parseNumber(commissionPct) / 100);
  const totalCost = cmvTotal + commissionValue;
  const totalCostPct = price > 0 ? (totalCost / price) * 100 : 0;
  const profit = price - totalCost;
  const hasPrice = price > 0;

  return (
    <div className="pizza-margin">
      <span className="field-label">Simular preço de venda</span>
      <div className="category-chips">
        {CHANNELS.map((c) => (
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
      </div>

      {!hasPrice && <p className="form-hint">Informe o preço de venda acima para calcular a comissão e o lucro.</p>}

      {hasPrice && (
        <div className="pizza-margin-result">
          <div className="pizza-summary-row">
            <span>Comissão do app</span>
            <span className="num">{currencyFormatter.format(commissionValue)}</span>
          </div>
          <div className="pizza-summary-row">
            <span>Custo total (CMV + comissão)</span>
            <span className="num">
              {currencyFormatter.format(totalCost)} ({totalCostPct.toFixed(1)}%)
            </span>
          </div>
          <div className={"pizza-summary-row pizza-summary-total " + (profit > 0 ? "pizza-margin-positive" : "pizza-margin-negative")}>
            <span>Lucro líquido</span>
            <span className="num">{currencyFormatter.format(profit)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
