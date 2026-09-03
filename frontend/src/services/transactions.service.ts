import { api } from "./api";
import { RecurringTransaction, Transaction, TransactionFilters, TransactionListResponse, TransactionType } from "../types";

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  date: string;
  description?: string;
  categoryId: string;
}

export async function listTransactions(filters: TransactionFilters): Promise<TransactionListResponse> {
  const { data } = await api.get<TransactionListResponse>("/transactions", { params: filters });
  return data;
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const { data } = await api.post<Transaction>("/transactions", input);
  return data;
}

export async function updateTransaction(id: string, input: Partial<TransactionInput>): Promise<Transaction> {
  const { data } = await api.put<Transaction>(`/transactions/${id}`, input);
  return data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

export async function convertTransactionToRecurring(
  id: string,
  dayOfMonth: number
): Promise<{ transaction: Transaction; recurring: RecurringTransaction }> {
  const { data } = await api.post(`/transactions/${id}/recurring`, { dayOfMonth });
  return data;
}
