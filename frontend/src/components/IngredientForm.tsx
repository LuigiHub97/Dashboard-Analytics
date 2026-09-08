import { FormEvent, useState } from "react";
import { Ingredient, IngredientUnit } from "../types";
import { IngredientInput } from "../services/ingredients.service";

interface IngredientFormProps {
  initial?: Ingredient | null;
  onSubmit: (input: IngredientInput) => Promise<void>;
  onCancel?: () => void;
}

const UNIT_LABELS: Record<IngredientUnit, string> = {
  kg: "Quilo (kg)",
  litro: "Litro (l)",
  unidade: "Unidade",
};

export function IngredientForm({ initial, onSubmit, onCancel }: IngredientFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [unit, setUnit] = useState<IngredientUnit>(initial?.unit ?? "kg");
  const [price, setPrice] = useState(initial ? String(initial.pricePerUnit) : "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const pricePerUnit = Number(price.replace(",", "."));
    if (!name.trim()) {
      setError("Informe o nome do ingrediente.");
      return;
    }
    if (!Number.isFinite(pricePerUnit) || pricePerUnit <= 0) {
      setError("Informe um preço válido.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), unit, pricePerUnit });
      if (!initial) {
        setName("");
        setPrice("");
      }
    } catch {
      setError("Não foi possível salvar o ingrediente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Nome
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Queijo mussarela" />
        </label>
        <label>
          Unidade
          <select value={unit} onChange={(e) => setUnit(e.target.value as IngredientUnit)}>
            {(Object.keys(UNIT_LABELS) as IngredientUnit[]).map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS[u]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Preço por {unit === "unidade" ? "unidade" : unit}
          <input
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0,00"
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {initial ? "Salvar" : "Adicionar"}
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
