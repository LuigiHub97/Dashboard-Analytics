import { useEffect, useState } from "react";
import { PizzaCmvForm } from "../components/PizzaCmvForm";
import { PizzaHistoryTable } from "../components/PizzaHistoryTable";
import * as ingredientsService from "../services/ingredients.service";
import * as pizzasService from "../services/pizzas.service";
import { Ingredient, Pizza } from "../types";

export function EmpresaPizzas() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [editing, setEditing] = useState<Pizza | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    setLoading(true);
    const [ingredientItems, pizzaItems] = await Promise.all([
      ingredientsService.getIngredients(),
      pizzasService.getPizzas(),
    ]);
    setIngredients(ingredientItems);
    setPizzas(pizzaItems);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleCreate(input: pizzasService.PizzaInput) {
    await pizzasService.createPizza(input);
    await reload();
  }

  async function handleUpdate(input: pizzasService.PizzaInput) {
    if (!editing) return;
    await pizzasService.updatePizza(editing.id, input);
    setEditing(null);
    await reload();
  }

  function handleEdit(pizza: Pizza) {
    setEditing(pizza);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(pizza: Pizza) {
    if (!confirm(`Excluir a pizza "${pizza.name}" do histórico?`)) return;
    await pizzasService.deletePizza(pizza.id);
    await reload();
  }

  const defaultCosts = pizzas[0]
    ? { packagingCost: pizzas[0].packagingCost, energyCost: pizzas[0].energyCost, waterCost: pizzas[0].waterCost }
    : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Pizzas — CMV</h1>
      </div>

      {loading ? (
        <p className="empty-state">Carregando...</p>
      ) : (
        <>
          <div className="card">
            <h2>{editing ? "Editar pizza" : "Nova pizza"}</h2>
            <PizzaCmvForm
              key={editing?.id ?? "new"}
              ingredients={ingredients}
              defaultCosts={defaultCosts}
              initial={editing}
              onSubmit={editing ? handleUpdate : handleCreate}
              onCancel={editing ? () => setEditing(null) : undefined}
            />
          </div>

          <div className="card">
            <h2>Histórico</h2>
            <PizzaHistoryTable pizzas={pizzas} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </>
      )}
    </div>
  );
}
