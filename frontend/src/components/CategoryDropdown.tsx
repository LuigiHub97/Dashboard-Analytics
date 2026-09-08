import { useEffect, useRef, useState } from "react";
import { Category, TransactionType } from "../types";

interface CategoryDropdownProps {
  categories: Category[];
  type: TransactionType;
  value: Category;
  onSelect: (categoryId: string) => void | Promise<void>;
  onCreate: (name: string, type: TransactionType) => Promise<Category>;
}

export function CategoryDropdown({ categories, type, value, onSelect, onCreate }: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const options = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setNewName("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSelect(id: string) {
    setOpen(false);
    if (id !== value.id) {
      await onSelect(id);
    }
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const category = await onCreate(name, type);
      setNewName("");
      setOpen(false);
      if (category.id !== value.id) {
        await onSelect(category.id);
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="category-dropdown" ref={rootRef}>
      <button type="button" className="category-dropdown-trigger" onClick={() => setOpen((o) => !o)}>
        <span>{value.name}</span>
        <svg
          className={"category-dropdown-chevron" + (open ? " expanded" : "")}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="category-dropdown-menu">
          <ul className="category-dropdown-list">
            {options.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={"category-dropdown-item" + (c.id === value.id ? " selected" : "")}
                  onClick={() => handleSelect(c.id)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="category-dropdown-create">
            <input
              type="text"
              placeholder="Nova categoria..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreate();
                }
              }}
            />
            <button type="button" onClick={handleCreate} disabled={!newName.trim() || creating}>
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
