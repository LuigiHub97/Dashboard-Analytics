import { Ingredient } from "../types";

interface IngredientListProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const UNIT_LABELS: Record<string, string> = {
  kg: "kg",
  litro: "litro",
  unidade: "unidade",
};

export function IngredientList({ ingredients, onEdit, onDelete }: IngredientListProps) {
  if (ingredients.length === 0) {
    return <p className="empty-state">Nenhum ingrediente cadastrado.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Unidade</th>
            <th>Preço</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((i) => (
            <tr key={i.id}>
              <td data-label="Nome">{i.name}</td>
              <td data-label="Unidade">{UNIT_LABELS[i.unit] ?? i.unit}</td>
              <td data-label="Preço">
                {currencyFormatter.format(i.pricePerUnit)} / {UNIT_LABELS[i.unit] ?? i.unit}
              </td>
              <td data-label="" className="row-actions">
                <button className="btn-link" onClick={() => onEdit(i)}>
                  Editar
                </button>
                <button className="btn-link btn-link-danger" onClick={() => onDelete(i)}>
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
