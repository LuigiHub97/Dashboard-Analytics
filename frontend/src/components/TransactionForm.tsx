import { FormEvent, useEffect, useState } from "react";
import { Category, Transaction, TransactionType } from "../types";
import { TransactionInput } from "../services/transactions.service";

interface TransactionFormProps {
  categories: Category[];
  initial?: Transaction | null;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancel?: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({ categories, initial, onSubmit, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial ? initial.date.slice(0, 10) : todayISO());
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    if (!categoryId) {
      setError("Selecione uma categoria.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        type,
        amount: parsedAmount,
        date: new Date(date).toISOString(),
        description: description || undefined,
        categoryId,
      });
      if (!initial) {
        setAmount("");
        setDescription("");
        setDate(todayISO());
      }
    } catch {
      setError("Não foi possível salvar a transação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </label>

        <label>
          Categoria
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="" disabled>
              Selecione...
            </option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Valor
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
          />
        </label>

        <label>
          Data
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <label>
        Descrição
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
        />
      </label>

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
