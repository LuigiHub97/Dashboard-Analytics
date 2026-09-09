import { FormEvent, useEffect, useRef, useState } from "react";
import { Ingredient, Pizza } from "../types";
import { PizzaInput } from "../services/pizzas.service";
import { computeLineCost } from "../utils/cmv";

interface PizzaCmvFormProps {
  ingredients: Ingredient[];
  defaultCosts: { packagingCost: number; energyCost: number; waterCost: number } | null;
  initial?: Pizza | null;
  onSubmit: (input: PizzaInput) => Promise<void>;
  onCancel?: () => void;
}

interface Line {
  ingredientId: string;
  quantity: string;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const QUANTITY_SUFFIX: Record<string, string> = {
  kg: "g",
  litro: "ml",
  unidade: "un",
};

function parseNumber(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

export function PizzaCmvForm({ ingredients, defaultCosts, initial, onSubmit, onCancel }: PizzaCmvFormProps) {
  const ingredientById = new Map(ingredients.map((i) => [i.id, i]));

  const initialLines: Line[] = initial
    ? initial.ingredients
        .filter((l) => l.ingredientId && ingredientById.has(l.ingredientId))
        .map((l) => ({ ingredientId: l.ingredientId as string, quantity: String(l.quantity) }))
    : [];
  const missingIngredientsCount = initial
    ? initial.ingredients.length - initialLines.length
    : 0;

  const [name, setName] = useState(initial?.name ?? "");
  const [lines, setLines] = useState<Line[]>(initialLines);
  const [packagingCost, setPackagingCost] = useState(initial ? String(initial.packagingCost) : "0");
  const [energyCost, setEnergyCost] = useState(initial ? String(initial.energyCost) : "0");
  const [waterCost, setWaterCost] = useState(initial ? String(initial.waterCost) : "0");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const prefilled = useRef(Boolean(initial));

  useEffect(() => {
    if (prefilled.current || !defaultCosts) return;
    prefilled.current = true;
    setPackagingCost(String(defaultCosts.packagingCost));
    setEnergyCost(String(defaultCosts.energyCost));
    setWaterCost(String(defaultCosts.waterCost));
  }, [defaultCosts]);

  function toggleIngredient(id: string) {
    setLines((prev) =>
      prev.some((l) => l.ingredientId === id)
        ? prev.filter((l) => l.ingredientId !== id)
        : [...prev, { ingredientId: id, quantity: "" }]
    );
  }

  function updateQuantity(id: string, quantity: string) {
    setLines((prev) => prev.map((l) => (l.ingredientId === id ? { ...l, quantity } : l)));
  }

  function lineCost(line: Line): number {
    const ingredient = ingredientById.get(line.ingredientId);
    const quantity = parseNumber(line.quantity);
    if (!ingredient || quantity <= 0) return 0;
    return computeLineCost(ingredient.unit, ingredient.pricePerUnit, quantity);
  }

  const ingredientsTotal = lines.reduce((sum, l) => sum + lineCost(l), 0);
  const totalCmv = ingredientsTotal + parseNumber(packagingCost) + parseNumber(energyCost) + parseNumber(waterCost);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Informe o nome da pizza.");
      return;
    }

    const validLines = lines
      .filter((l) => parseNumber(l.quantity) > 0)
      .map((l) => ({ ingredientId: l.ingredientId, quantity: parseNumber(l.quantity) }));

    if (validLines.length === 0) {
      setError("Clique nos ingredientes e informe a quantidade de pelo menos um.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        packagingCost: parseNumber(packagingCost),
        energyCost: parseNumber(energyCost),
        waterCost: parseNumber(waterCost),
        lines: validLines,
      });
      setName("");
      setLines([]);
    } catch {
      setError("Não foi possível salvar a pizza.");
    } finally {
      setSubmitting(false);
    }
  }

  if (ingredients.length === 0) {
    return (
      <p className="empty-state">
        Cadastre ingredientes primeiro na aba Ingredientes para poder montar uma pizza.
      </p>
    );
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <label>
        Nome da pizza
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Margherita" />
      </label>

      <span className="field-label">Clique nos ingredientes que entram nessa pizza</span>
      {missingIngredientsCount > 0 && (
        <p className="form-hint">
          {missingIngredientsCount} ingrediente(s) dessa pizza não estão mais cadastrados e foram removidos daqui —
          adicione de novo se precisar.
        </p>
      )}
      <div className="category-chips">
        {ingredients.map((i) => (
          <button
            type="button"
            key={i.id}
            className={"category-chip" + (lines.some((l) => l.ingredientId === i.id) ? " selected" : "")}
            onClick={() => toggleIngredient(i.id)}
          >
            {i.name}
          </button>
        ))}
      </div>

      {lines.length > 0 && (
        <div className="pizza-lines">
          {lines.map((line) => {
            const ingredient = ingredientById.get(line.ingredientId);
            if (!ingredient) return null;
            return (
              <div className="pizza-line" key={line.ingredientId}>
                <span className="pizza-line-name">{ingredient.name}</span>
                <div className="pizza-line-qty">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={line.quantity}
                    onChange={(e) => updateQuantity(line.ingredientId, e.target.value)}
                    placeholder="0"
                    autoFocus
                  />
                  <span className="pizza-line-suffix">{QUANTITY_SUFFIX[ingredient.unit]}</span>
                </div>
                <span className="num pizza-line-cost">{currencyFormatter.format(lineCost(line))}</span>
                <button type="button" className="btn-link btn-link-danger" onClick={() => toggleIngredient(line.ingredientId)}>
                  Remover
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="pizza-summary-row">
        <span>Custo dos ingredientes</span>
        <span className="num">{currencyFormatter.format(ingredientsTotal)}</span>
      </div>

      <span className="field-label">Custos adicionais</span>
      <div className="form-row">
        <label>
          Embalagem
          <input type="text" inputMode="decimal" value={packagingCost} onChange={(e) => setPackagingCost(e.target.value)} />
        </label>
        <label>
          Energia/gás
          <input type="text" inputMode="decimal" value={energyCost} onChange={(e) => setEnergyCost(e.target.value)} />
        </label>
        <label>
          Água
          <input type="text" inputMode="decimal" value={waterCost} onChange={(e) => setWaterCost(e.target.value)} />
        </label>
      </div>

      <div className="pizza-summary-row pizza-summary-total">
        <span>CMV total</span>
        <span className="num">{currencyFormatter.format(totalCmv)}</span>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {initial ? "Salvar alterações" : "Salvar pizza"}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
