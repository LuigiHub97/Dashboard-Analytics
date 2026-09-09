import { PizzaSale } from "../types";

interface SaleListProps {
  sales: PizzaSale[];
  onDelete: (sale: PizzaSale) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function SaleList({ sales, onDelete }: SaleListProps) {
  if (sales.length === 0) {
    return <p className="empty-state">Nenhuma venda registrada nesse período.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Pizza</th>
            <th>Qtd</th>
            <th>Receita</th>
            <th>Lucro</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td data-label="Data">{dateFormatter.format(new Date(s.date))}</td>
              <td data-label="Pizza">{s.pizzaName}</td>
              <td data-label="Qtd">{s.quantity}</td>
              <td data-label="Receita">{currencyFormatter.format(s.totalRevenue)}</td>
              <td data-label="Lucro" className={s.totalProfit >= 0 ? "amount-income" : "amount-expense"}>
                {currencyFormatter.format(s.totalProfit)}
              </td>
              <td data-label="" className="row-actions">
                <button className="btn-link btn-link-danger" onClick={() => onDelete(s)}>
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
