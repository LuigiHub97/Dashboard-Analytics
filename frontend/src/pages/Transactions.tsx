import { useEffect, useState } from "react";
import { Filters } from "../components/Filters";
import { Pagination } from "../components/Pagination";
import { RecurringTransactionForm } from "../components/RecurringTransactionForm";
import { RecurringTransactionList } from "../components/RecurringTransactionList";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionList } from "../components/TransactionList";
import * as categoriesService from "../services/categories.service";
import * as recurringService from "../services/recurringTransactions.service";
import * as transactionsService from "../services/transactions.service";
import {
  Category,
  Pagination as PaginationType,
  RecurringTransaction,
  Transaction,
  TransactionFilters,
  TransactionType,
} from "../types";

type NewEntryTab = "single" | "recurring";

interface TransactionsProps {
  fixedType?: TransactionType;
  title?: string;
}

const ENTITY_LABEL: Record<TransactionType | "all", string> = {
  expense: "despesa",
  income: "receita",
  all: "transação",
};

export function Transactions({ fixedType, title = "Transações" }: TransactionsProps) {
  const entity = ENTITY_LABEL[fixedType ?? "all"];

  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
    ...(fixedType ? { type: fixedType } : {}),
  });
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<NewEntryTab>("single");
  const [loading, setLoading] = useState(true);

  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([]);
  const [recurringEditing, setRecurringEditing] = useState<RecurringTransaction | null>(null);

  const visibleCategories = fixedType ? categories.filter((c) => c.type === fixedType) : categories;
  const visibleRecurring = fixedType ? recurringItems.filter((i) => i.type === fixedType) : recurringItems;

  useEffect(() => {
    categoriesService.getCategories().then(setCategories);
    reloadRecurring();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function reload() {
    setLoading(true);
    const res = await transactionsService.listTransactions(filters);
    setTransactions(res.items);
    setPagination(res.pagination);
    setLoading(false);
  }

  async function reloadRecurring() {
    const res = await recurringService.listRecurringTransactions();
    setRecurringItems(res);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function closeForm() {
    setShowForm(false);
    setActiveTab("single");
  }

  async function handleCreate(input: transactionsService.TransactionInput) {
    await transactionsService.createTransaction(input);
    closeForm();
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

  async function handleConvertToRecurring(dayOfMonth: number) {
    if (!editing) return;
    await transactionsService.convertTransactionToRecurring(editing.id, dayOfMonth);
    await reloadRecurring();
    await reload();
  }

  async function handleCreateRecurring(input: recurringService.RecurringTransactionInput) {
    await recurringService.createRecurringTransaction(input);
    closeForm();
    await reloadRecurring();
    await reload();
  }

  async function handleUpdateRecurring(input: recurringService.RecurringTransactionInput) {
    if (!recurringEditing) return;
    await recurringService.updateRecurringTransaction(recurringEditing.id, input);
    setRecurringEditing(null);
    await reloadRecurring();
  }

  async function handleDeleteRecurring(item: RecurringTransaction) {
    if (
      !confirm(`Excluir "${item.description || item.category.name}"? As transações já lançadas não serão removidas.`)
    )
      return;
    await recurringService.deleteRecurringTransaction(item.id);
    await reloadRecurring();
  }

  async function handleToggleRecurringActive(item: RecurringTransaction) {
    await recurringService.updateRecurringTransaction(item.id, { active: !item.active });
    await reloadRecurring();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{title}</h1>
        <button className="btn-primary" onClick={() => (showForm ? closeForm() : setShowForm(true))}>
          {showForm ? "Fechar" : `Nova ${entity}`}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="tab-toggle">
            <button
              type="button"
              className={activeTab === "single" ? "is-active" : ""}
              onClick={() => setActiveTab("single")}
            >
              Única
            </button>
            <button
              type="button"
              className={activeTab === "recurring" ? "is-active" : ""}
              onClick={() => setActiveTab("recurring")}
            >
              Recorrente
            </button>
          </div>

          {activeTab === "single" ? (
            <TransactionForm
              categories={categories}
              fixedType={fixedType}
              onSubmit={handleCreate}
              onCancel={closeForm}
            />
          ) : (
            <RecurringTransactionForm
              categories={categories}
              fixedType={fixedType}
              onSubmit={handleCreateRecurring}
              onCancel={closeForm}
            />
          )}
        </div>
      )}

      {editing && (
        <div className="card">
          <h2>Editar {entity}</h2>
          <TransactionForm
            categories={categories}
            initial={editing}
            fixedType={fixedType}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            onConvertToRecurring={handleConvertToRecurring}
          />
        </div>
      )}

      {recurringEditing && (
        <div className="card">
          <h2>Editar recorrência</h2>
          <RecurringTransactionForm
            categories={categories}
            initial={recurringEditing}
            fixedType={fixedType}
            onSubmit={handleUpdateRecurring}
            onCancel={() => setRecurringEditing(null)}
          />
        </div>
      )}

      <div className="card">
        <Filters categories={visibleCategories} filters={filters} onChange={setFilters} />
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

      {visibleRecurring.length > 0 && (
        <div className="card">
          <h2>Recorrências</h2>
          <RecurringTransactionList
            items={visibleRecurring}
            onEdit={setRecurringEditing}
            onDelete={handleDeleteRecurring}
            onToggleActive={handleToggleRecurringActive}
          />
        </div>
      )}
    </div>
  );
}
