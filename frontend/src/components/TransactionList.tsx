import { CategoryDropdown } from "./CategoryDropdown";
import { PayButton } from "./PayButton";
import { Category, Transaction, TransactionType } from "../types";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onTogglePaid: (transaction: Transaction) => Promise<void>;
  onChangeCategory: (transaction: Transaction, categoryId: string) => Promise<void>;
  onCreateCategory: (name: string, type: TransactionType) => Promise<Category>;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
  onTogglePaid,
  onChangeCategory,
  onCreateCategory,
}: TransactionListProps) {
  if (transactions.length === 0) {
    return <p className="empty-state">Nenhuma transação encontrada.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td data-label="Data">{dateFormatter.format(new Date(t.date))}</td>
              <td data-label="Categoria" className="category-cell">
                <CategoryDropdown
                  categories={categories}
                  type={t.type}
                  value={t.category}
                  onSelect={(categoryId) => onChangeCategory(t, categoryId)}
                  onCreate={onCreateCategory}
                />
              </td>
              <td data-label="Descrição">
                {t.description || "—"}
                {t.recurringTransactionId && <span className="badge-recurring">Fixa</span>}
              </td>
              <td
                data-label="Valor"
                className={t.type === "income" ? "amount-income" : t.paid ? "amount-paid" : "amount-expense"}
              >
                {t.type === "income" ? "+" : "-"}
                {currencyFormatter.format(t.amount)}
                {t.type === "expense" && <PayButton paid={t.paid} onToggle={() => onTogglePaid(t)} />}
              </td>
              <td data-label="" className="row-actions">
                <button className="btn-link" onClick={() => onEdit(t)}>
                  Editar
                </button>
                <button className="btn-link btn-link-danger" onClick={() => onDelete(t)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
