import { FormEvent, useState } from "react";
import { SALES_CHANNELS } from "../constants/salesChannels";
import { SaleInput } from "../services/sales.service";
import { Pizza } from "../types";

interface SaleFormProps {
  pizzas: Pizza[];
  onSubmit: (input: SaleInput) => Promise<void>;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseNumber(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function SaleForm({ pizzas, onSubmit }: SaleFormProps) {
  const [pizzaId, setPizzaId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [commissionPct, setCommissionPct] = useState("0");
  const [date, setDate] = useState(todayISO());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!pizzaId) {
      setError("Selecione a pizza vendida.");
      return;
    }
    const qty = parseNumber(quantity);
    const price = parseNumber(unitPrice);
    if (qty <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }
    if (price <= 0) {
      setError("Informe o preço de venda.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        pizzaId,
        quantity: qty,
        unitPrice: price,
        commissionPct: parseNumber(commissionPct),
        date: new Date(date).toISOString(),
      });
      setPizzaId("");
      setQuantity("1");
      setUnitPrice("");
      setDate(todayISO());
    } catch {
      setError("Não foi possível registrar a venda.");
    } finally {
      setSubmitting(false);
    }
  }

  if (pizzas.length === 0) {
    return <p className="empty-state">Cadastre uma pizza primeiro para poder registrar vendas.</p>;
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <span className="field-label">Qual pizza foi vendida?</span>
      <div className="category-chips">
        {pizzas.map((p) => (
          <button
            type="button"
            key={p.id}
            className={"category-chip" + (pizzaId === p.id ? " selected" : "")}
            onClick={() => setPizzaId(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="form-row">
        <label>
          Quantidade
          <input type="text" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        <label>
          Preço de venda (por pizza)
          <input
            type="text"
            inputMode="decimal"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            placeholder="0,00"
          />
        </label>
        <label>
          Data
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <span className="field-label">Canal de venda</span>
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

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          Registrar venda
        </button>
      </div>
    </form>
  );
}
