import { useEffect, useState } from "react";
import { Filters } from "../components/Filters";
import { Pagination } from "../components/Pagination";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionList } from "../components/TransactionList";
import * as categoriesService from "../services/categories.service";
import * as transactionsService from "../services/transactions.service";
import { Category, Pagination as PaginationType, Transaction, TransactionFilters } from "../types";

export function Transactions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 10 });
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesService.getCategories().then(setCategories);
  }, []);

  async function reload() {
    setLoading(true);
    const res = await transactionsService.listTransactions(filters);
    setTransactions(res.items);
    setPagination(res.pagination);
    setLoading(false);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function handleCreate(input: transactionsService.TransactionInput) {
    await transactionsService.createTransaction(input);
    setShowForm(false);
    await reload();
  }

  async function handleUpdate(input: transactionsService.TransactionInput) {
    if (!editing) return;
    await transactionsService.updateTransaction(editing.id, input);
    setEditing(null);
    await reload();
  }

  async function handleDelete(transaction: Transaction) {
    if (!confirm(`Excluir a transação "${transaction.description || transaction.category.name}"?`)) return;
    await transactionsService.deleteTransaction(transaction.id);
    await reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transações</h1>
        <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Fechar" : "Nova transação"}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <TransactionForm categories={categories} onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editing && (
        <div className="card">
          <h2>Editar transação</h2>
          <TransactionForm
            categories={categories}
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="card">
        <Filters categories={categories} filters={filters} onChange={setFilters} />
      </div>

      <div className="card">
        {loading ? (
          <p className="empty-state">Carregando...</p>
        ) : (
          <>
            <TransactionList transactions={transactions} onEdit={setEditing} onDelete={handleDelete} />
            {pagination && (
              <Pagination pagination={pagination} onPageChange={(page) => setFilters({ ...filters, page })} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
