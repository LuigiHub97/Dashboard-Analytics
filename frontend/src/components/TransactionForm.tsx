import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Category, Transaction, TransactionType } from "../types";
import { TransactionInput } from "../services/transactions.service";

interface TransactionFormProps {
  categories: Category[];
  initial?: Transaction | null;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancel?: () => void;
  onConvertToRecurring?: (dayOfMonth: number) => Promise<void>;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function centsToDisplay(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function TransactionForm({ categories, initial, onSubmit, onCancel, onConvertToRecurring }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [amountCents, setAmountCents] = useState(initial ? Math.round(initial.amount * 100) : 0);
  const [date, setDate] = useState(initial ? initial.date.slice(0, 10) : todayISO());
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [showDetails, setShowDetails] = useState(Boolean(initial?.description));
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(initial ? new Date(initial.date).getUTCDate() : 5);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canOfferRecurring = Boolean(initial && onConvertToRecurring && !initial.recurringTransactionId);

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!filteredCategories.some((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, categories]);

  function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setAmountCents(digits ? parseInt(digits, 10) : 0);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (amountCents <= 0) {
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
        amount: amountCents / 100,
        date: new Date(date).toISOString(),
        description: description || undefined,
        categoryId,
      });
      if (canOfferRecurring && makeRecurring && onConvertToRecurring) {
        await onConvertToRecurring(recurringDay);
      }
      if (!initial) {
        setAmountCents(0);
        setDescription("");
        setDate(todayISO());
        setShowDetails(false);
      }
    } catch {
      setError("Não foi possível salvar a transação.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="type-toggle">
        <button
          type="button"
          className={type === "expense" ? "is-active-expense" : ""}
          onClick={() => setType("expense")}
        >
          Despesa
        </button>
        <button type="button" className={type === "income" ? "is-active-income" : ""} onClick={() => setType("income")}>
          Receita
        </button>
      </div>

      <div className="amount-field">
        <span className="amount-field-label">Valor</span>
        <div className="amount-input-wrap">
          <span className="amount-prefix">R$</span>
          <input
            type="text"
            inputMode="numeric"
            value={centsToDisplay(amountCents)}
            onChange={handleAmountChange}
            placeholder="0,00"
            autoFocus
          />
        </div>
      </div>

      <span className="field-label">Categoria</span>
      {filteredCategories.length === 0 ? (
        <p className="empty-state">Nenhuma categoria de {type === "expense" ? "despesa" : "receita"} cadastrada.</p>
      ) : (
        <div className="category-chips">
          {filteredCategories.map((c) => (
            <button
              type="button"
              key={c.id}
              className={"category-chip" + (categoryId === c.id ? " selected" : "")}
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {!showDetails && (
        <button type="button" className="form-secondary-toggle" onClick={() => setShowDetails(true)}>
          + Data e descrição (opcional)
        </button>
      )}

      {showDetails && (
        <div className="form-row">
          <label>
            Data
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Descrição
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcional"
            />
          </label>
        </div>
      )}

      {canOfferRecurring && (
        <div className="recurring-convert">
          <label className="checkbox-row">
            <input type="checkbox" checked={makeRecurring} onChange={(e) => setMakeRecurring(e.target.checked)} />
            Tornar recorrente (repetir todo mês)
          </label>
          {makeRecurring && (
            <label className="recurring-day-field">
              Todo dia
              <input
                type="number"
                min={1}
                max={31}
                value={recurringDay}
                onChange={(e) => setRecurringDay(Number(e.target.value))}
              />
            </label>
          )}
        </div>
      )}

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
