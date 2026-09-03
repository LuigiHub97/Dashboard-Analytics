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
    <div className="table-scroll">
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
              <td data-label="Todo dia">{item.dayOfMonth}</td>
              <td data-label="Categoria">{item.category.name}</td>
              <td data-label="Descrição">{item.description || "—"}</td>
              <td data-label="Valor" className={item.type === "income" ? "amount-income" : "amount-expense"}>
                {item.type === "income" ? "+" : "-"}
                {currencyFormatter.format(item.amount)}
              </td>
              <td data-label="Status">
                <button type="button" className="btn-link" onClick={() => onToggleActive(item)}>
                  {item.active ? "Ativa" : "Pausada"}
                </button>
              </td>
              <td data-label="" className="row-actions">
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
    </div>
  );
}
