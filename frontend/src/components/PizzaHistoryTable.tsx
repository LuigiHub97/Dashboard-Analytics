import { useState } from "react";
import { Pizza } from "../types";
import { PizzaMarginCalculator } from "./PizzaMarginCalculator";

interface PizzaHistoryTableProps {
  pizzas: Pizza[];
  onEdit: (pizza: Pizza) => void;
  onDelete: (pizza: Pizza) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

const QUANTITY_SUFFIX: Record<string, string> = {
  kg: "g",
  litro: "ml",
  unidade: "un",
};

export function PizzaHistoryTable({ pizzas, onEdit, onDelete }: PizzaHistoryTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (pizzas.length === 0) {
    return <p className="empty-state">Nenhuma pizza calculada ainda.</p>;
  }

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <div className="donut-legend">
      {pizzas.map((pizza) => {
        const expanded = expandedId === pizza.id;
        return (
          <div className="donut-legend-row" key={pizza.id}>
            <button type="button" className="donut-legend-row-btn" onClick={() => toggle(pizza.id)}>
              <svg
                className={"donut-legend-chevron" + (expanded ? " expanded" : "")}
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
              <span className="donut-legend-label">
                {pizza.name} <span className="pizza-history-date">· {dateFormatter.format(new Date(pizza.createdAt))}</span>
              </span>
              <span className="donut-legend-value">{currencyFormatter.format(pizza.totalCost)}</span>
            </button>

            {expanded && (
              <div className="donut-legend-detail">
                {pizza.ingredients.map((line) => (
                  <div className="donut-legend-detail-row" key={line.id}>
                    <span>
                      {line.ingredientName} · {line.quantity}
                      {QUANTITY_SUFFIX[line.unit] ?? ""}
                    </span>
                    <span className="num">{currencyFormatter.format(line.lineCost)}</span>
                  </div>
                ))}
                <div className="donut-legend-detail-row">
                  <span>Embalagem</span>
                  <span className="num">{currencyFormatter.format(pizza.packagingCost)}</span>
                </div>
                <div className="donut-legend-detail-row">
                  <span>Energia/gás</span>
                  <span className="num">{currencyFormatter.format(pizza.energyCost)}</span>
                </div>
                <div className="donut-legend-detail-row">
                  <span>Água</span>
                  <span className="num">{currencyFormatter.format(pizza.waterCost)}</span>
                </div>
                <PizzaMarginCalculator cmvTotal={pizza.totalCost} />

                <div className="pizza-history-actions">
                  <button type="button" className="btn-link" onClick={() => onEdit(pizza)}>
                    Editar pizza
                  </button>
                  <button type="button" className="btn-link btn-link-danger" onClick={() => onDelete(pizza)}>
                    Excluir pizza
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
