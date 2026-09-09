import { api } from "./api";
import { PizzaSale, SalesSummary } from "../types";

export interface SaleInput {
  pizzaId: string;
  quantity: number;
  unitPrice: number;
  commissionPct: number;
  date?: string;
}

export interface SaleFilters {
  startDate?: string;
  endDate?: string;
}

export async function listSales(filters: SaleFilters = {}): Promise<PizzaSale[]> {
  const { data } = await api.get<PizzaSale[]>("/sales", { params: filters });
  return data;
}

export async function createSale(input: SaleInput): Promise<PizzaSale> {
  const { data } = await api.post<PizzaSale>("/sales", input);
  return data;
}

export async function deleteSale(id: string): Promise<void> {
  await api.delete(`/sales/${id}`);
}

export async function getSalesSummary(month: string): Promise<SalesSummary> {
  const { data } = await api.get<SalesSummary>("/sales/summary", { params: { month } });
  return data;
}
