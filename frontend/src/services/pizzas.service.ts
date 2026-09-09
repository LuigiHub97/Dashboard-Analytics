import { api } from "./api";
import { Pizza } from "../types";

export interface PizzaLineInput {
  ingredientId: string;
  quantity: number;
}

export interface PizzaInput {
  name: string;
  packagingCost: number;
  energyCost: number;
  waterCost: number;
  lines: PizzaLineInput[];
}

export async function getPizzas(): Promise<Pizza[]> {
  const { data } = await api.get<Pizza[]>("/pizzas");
  return data;
}

export async function createPizza(input: PizzaInput): Promise<Pizza> {
  const { data } = await api.post<Pizza>("/pizzas", input);
  return data;
}

export async function updatePizza(id: string, input: PizzaInput): Promise<Pizza> {
  const { data } = await api.put<Pizza>(`/pizzas/${id}`, input);
  return data;
}

export async function deletePizza(id: string): Promise<void> {
  await api.delete(`/pizzas/${id}`);
}
