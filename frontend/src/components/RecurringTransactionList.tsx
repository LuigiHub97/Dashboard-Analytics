import { RecurringTransaction } from "../types";

interface RecurringTransactionListProps {
  items: RecurringTransaction[];
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
  onToggleActive: (item: RecurringTransaction) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function RecurringTransactionList({ items, onEdit, onDelete, onToggleActive }: RecurringTransactionListProps) {
  if (items.length === 0) {
    return <p className="empty-state">Nenhuma despesa ou receita fixa cadastrada ainda.</p>;
  }

  return (
    <table className="transaction-table">
      <thead>
        <tr>
          <th>Todo dia</th>
          <th>Categoria</th>
          <th>Descrição</th>
          <th>Valor</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.dayOfMonth}</td>
            <td>{item.category.name}</td>
            <td>{item.description || "—"}</td>
            <td className={item.type === "income" ? "amount-income" : "amount-expense"}>
              {item.type === "income" ? "+" : "-"}
              {currencyFormatter.format(item.amount)}
            </td>
            <td>
              <button type="button" className="btn-link" onClick={() => onToggleActive(item)}>
                {item.active ? "Ativa" : "Pausada"}
              </button>
            </td>
            <td className="row-actions">
              <button className="btn-link" onClick={() => onEdit(item)}>
                Editar
              </button>
              <button className="btn-link btn-link-danger" onClick={() => onDelete(item)}>
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
