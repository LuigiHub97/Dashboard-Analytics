import { Transaction } from "../types";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
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
              <td>{dateFormatter.format(new Date(t.date))}</td>
              <td>{t.category.name}</td>
              <td>
                {t.description || "—"}
                {t.recurringTransactionId && <span className="badge-recurring">Fixa</span>}
              </td>
              <td className={t.type === "income" ? "amount-income" : "amount-expense"}>
                {t.type === "income" ? "+" : "-"}
                {currencyFormatter.format(t.amount)}
              </td>
              <td className="row-actions">
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
