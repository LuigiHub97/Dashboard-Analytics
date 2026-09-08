import { useEffect, useState } from "react";
import { IngredientForm } from "../components/IngredientForm";
import { IngredientList } from "../components/IngredientList";
import * as ingredientsService from "../services/ingredients.service";
import { Ingredient } from "../types";

export function EmpresaIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    const items = await ingredientsService.getIngredients();
    setIngredients(items);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(input: ingredientsService.IngredientInput) {
    await ingredientsService.createIngredient(input);
    await reload();
  }

  async function handleUpdate(input: ingredientsService.IngredientInput) {
    if (!editing) return;
    await ingredientsService.updateIngredient(editing.id, input);
    setEditing(null);
    await reload();
  }

  async function handleDelete(ingredient: Ingredient) {
    if (!confirm(`Excluir o ingrediente "${ingredient.name}"?`)) return;
    await ingredientsService.deleteIngredient(ingredient.id);
    await reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Ingredientes</h1>
      </div>

      <div className="card">
        <h2>{editing ? "Editar ingrediente" : "Novo ingrediente"}</h2>
        <IngredientForm
          key={editing?.id ?? "new"}
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={editing ? () => setEditing(null) : undefined}
        />
      </div>

      <div className="card">
        {loading ? (
          <p className="empty-state">Carregando...</p>
        ) : (
          <IngredientList ingredients={ingredients} onEdit={setEditing} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
