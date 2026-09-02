import { Category, TransactionFilters } from "../types";

interface FiltersProps {
  categories: Category[];
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
}

export function Filters({ categories, filters, onChange }: FiltersProps) {
  function update(partial: Partial<TransactionFilters>) {
    onChange({ ...filters, ...partial, page: 1 });
  }

  return (
    <div className="filters">
      <label>
        De
        <input
          type="date"
          value={filters.startDate ?? ""}
          onChange={(e) => update({ startDate: e.target.value || undefined })}
        />
      </label>

      <label>
        Até
        <input
          type="date"
          value={filters.endDate ?? ""}
          onChange={(e) => update({ endDate: e.target.value || undefined })}
        />
      </label>

      <label>
        Categoria
        <select
          value={filters.categoryId ?? ""}
          onChange={(e) => update({ categoryId: e.target.value || undefined })}
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Valor mín.
        <input
          type="number"
          min="0"
          step="0.01"
          value={filters.minValue ?? ""}
          onChange={(e) => update({ minValue: e.target.value ? Number(e.target.value) : undefined })}
        />
      </label>

      <label>
        Valor máx.
        <input
          type="number"
          min="0"
          step="0.01"
          value={filters.maxValue ?? ""}
          onChange={(e) => update({ maxValue: e.target.value ? Number(e.target.value) : undefined })}
        />
      </label>

      <button
        type="button"
        className="btn-secondary"
        onClick={() => onChange({ page: 1, limit: filters.limit })}
      >
        Limpar filtros
      </button>
    </div>
  );
}
