import { api } from "./api";
import { CategoryBreakdownItem, MonthlySummary, TrendItem } from "../types";

export async function getSummary(month?: string): Promise<MonthlySummary> {
  const { data } = await api.get<MonthlySummary>("/dashboard/summary", { params: { month } });
  return data;
}

export async function getByCategory(month?: string): Promise<CategoryBreakdownItem[]> {
  const { data } = await api.get<CategoryBreakdownItem[]>("/dashboard/by-category", { params: { month } });
  return data;
}

export async function getTrend(months = 6): Promise<TrendItem[]> {
  const { data } = await api.get<TrendItem[]>("/dashboard/trend", { params: { months } });
  return data;
}
