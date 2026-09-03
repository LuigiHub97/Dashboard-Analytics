import { api } from "./api";
import { RecurringTransaction, TransactionType } from "../types";

export interface RecurringTransactionInput {
  type: TransactionType;
  amount: number;
  description?: string;
  dayOfMonth: number;
  categoryId: string;
  active?: boolean;
}

export async function listRecurringTransactions(): Promise<RecurringTransaction[]> {
  const { data } = await api.get<RecurringTransaction[]>("/recurring-transactions");
  return data;
}

export async function createRecurringTransaction(
  input: RecurringTransactionInput
): Promise<RecurringTransaction> {
  const { data } = await api.post<RecurringTransaction>("/recurring-transactions", input);
  return data;
}

export async function updateRecurringTransaction(
  id: string,
  input: Partial<RecurringTransactionInput>
): Promise<RecurringTransaction> {
  const { data } = await api.put<RecurringTransaction>(`/recurring-transactions/${id}`, input);
  return data;
}

export async function deleteRecurringTransaction(id: string): Promise<void> {
  await api.delete(`/recurring-transactions/${id}`);
}
