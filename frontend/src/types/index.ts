export type TransactionType = "income" | "expense";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  businessName?: string | null;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  userId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string | null;
  paid: boolean;
  categoryId: string;
  category: Category;
  userId: string;
  recurringTransactionId?: string | null;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description?: string | null;
  dayOfMonth: number;
  active: boolean;
  categoryId: string;
  category: Category;
  userId: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionListResponse {
  items: Transaction[];
  pagination: Pagination;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  minValue?: number;
  maxValue?: number;
  page?: number;
  limit?: number;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  type: TransactionType;
  total: number;
}

export interface TrendItem {
  month: string;
  income: number;
  expense: number;
}

export type IngredientUnit = "kg" | "litro" | "unidade";

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  pricePerUnit: number;
  userId: string;
  createdAt: string;
}

export interface PizzaIngredientLine {
  id: string;
  ingredientId: string | null;
  ingredientName: string;
  unit: IngredientUnit;
  quantity: number;
  pricePerUnitAtUse: number;
  lineCost: number;
}

export interface Pizza {
  id: string;
  name: string;
  packagingCost: number;
  energyCost: number;
  waterCost: number;
  ingredientsCost: number;
  totalCost: number;
  ingredients: PizzaIngredientLine[];
  userId: string;
  createdAt: string;
}

export interface PizzaSale {
  id: string;
  pizzaId: string | null;
  pizzaName: string;
  quantity: number;
  unitPrice: number;
  commissionPct: number;
  unitCmv: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  date: string;
  userId: string;
  createdAt: string;
}

export interface SalesSummary {
  month: string;
  quantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}
