export type TransactionType = "income" | "expense";

export interface User {
  id: string;
  email: string;
  name?: string | null;
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
  type?: TransactionType;
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
