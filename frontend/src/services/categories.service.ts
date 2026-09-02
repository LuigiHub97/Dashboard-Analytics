import { api } from "./api";
import { Category, TransactionType } from "../types";

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/categories");
  return data;
}

export async function createCategory(name: string, type: TransactionType): Promise<Category> {
  const { data } = await api.post<Category>("/categories", { name, type });
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
