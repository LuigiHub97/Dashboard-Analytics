import { api } from "./api";
import { Ingredient, IngredientUnit } from "../types";

export interface IngredientInput {
  name: string;
  unit: IngredientUnit;
  pricePerUnit: number;
}

export async function getIngredients(): Promise<Ingredient[]> {
  const { data } = await api.get<Ingredient[]>("/ingredients");
  return data;
}

export async function createIngredient(input: IngredientInput): Promise<Ingredient> {
  const { data } = await api.post<Ingredient>("/ingredients", input);
  return data;
}

export async function updateIngredient(id: string, input: Partial<IngredientInput>): Promise<Ingredient> {
  const { data } = await api.patch<Ingredient>(`/ingredients/${id}`, input);
  return data;
}

export async function deleteIngredient(id: string): Promise<void> {
  await api.delete(`/ingredients/${id}`);
}
