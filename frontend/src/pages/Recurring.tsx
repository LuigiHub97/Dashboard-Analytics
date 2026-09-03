import { useEffect, useState } from "react";
import { RecurringTransactionForm } from "../components/RecurringTransactionForm";
import { RecurringTransactionList } from "../components/RecurringTransactionList";
import * as categoriesService from "../services/categories.service";
import * as recurringService from "../services/recurringTransactions.service";
import { Category, RecurringTransaction } from "../types";

export function Recurring() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesService.getCategories().then(setCategories);
  }, []);

  async function reload() {
    setLoading(true);
    const res = await recurringService.listRecurringTransactions();
    setItems(res);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(input: recurringService.RecurringTransactionInput) {
    await recurringService.createRecurringTransaction(input);
    setShowForm(false);
    await reload();
  }

  async function handleUpdate(input: recurringService.RecurringTransactionInput) {
    if (!editing) return;
    await recurringService.updateRecurringTransaction(editing.id, input);
    setEditing(null);
    await reload();
  }

  async function handleDelete(item: RecurringTransaction) {
    if (
      !confirm(
        `Excluir "${item.description || item.category.name}"? As transações já lançadas não serão removidas.`
      )
    )
      return;
    await recurringService.deleteRecurringTransaction(item.id);
    await reload();
  }

  async function handleToggleActive(item: RecurringTransaction) {
    await recurringService.updateRecurringTransaction(item.id, { active: !item.active });
    await reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Recorrentes</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Fechar" : "Nova recorrência"}
        </button>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: -12, marginBottom: 20 }}>
        Cadastre despesas e receitas fixas (aluguel, assinaturas, salário) e elas entram sozinhas todo mês, sem
        precisar adicionar de novo.
      </p>

      {showForm && (
        <div className="card">
          <RecurringTransactionForm categories={categories} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editing && (
        <div className="card">
          <h2>Editar recorrência</h2>
          <RecurringTransactionForm
            categories={categories}
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="empty-state">Carregando...</p>
        ) : (
          <RecurringTransactionList
            items={items}
            onEdit={setEditing}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>
    </div>
  );
}
