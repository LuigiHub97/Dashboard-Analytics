import { Pagination as PaginationType } from "../types";

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, total } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button className="btn-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {totalPages} ({total} itens)
      </span>
      <button className="btn-secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        Próxima
      </button>
    </div>
  );
}
