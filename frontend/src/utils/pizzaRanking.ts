import { PizzaSale } from "../types";

export interface RankedPizza {
  pizzaName: string;
  quantity: number;
  totalRevenue: number;
  totalProfit: number;
  profitPerUnit: number;
}

export function rankPizzas(sales: PizzaSale[]): RankedPizza[] {
  const byName = new Map<string, { quantity: number; totalRevenue: number; totalProfit: number }>();

  for (const s of sales) {
    const existing = byName.get(s.pizzaName);
    if (existing) {
      existing.quantity += s.quantity;
      existing.totalRevenue += s.totalRevenue;
      existing.totalProfit += s.totalProfit;
    } else {
      byName.set(s.pizzaName, { quantity: s.quantity, totalRevenue: s.totalRevenue, totalProfit: s.totalProfit });
    }
  }

  return Array.from(byName.entries())
    .map(([pizzaName, v]) => ({ pizzaName, ...v, profitPerUnit: v.quantity > 0 ? v.totalProfit / v.quantity : 0 }))
    .sort((a, b) => b.quantity - a.quantity);
}
