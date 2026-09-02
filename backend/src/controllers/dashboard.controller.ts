import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

function monthRange(month?: string): { start: Date; end: Date } {
  const now = month ? new Date(`${month}-01T00:00:00.000Z`) : new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

const trendQuerySchema = z.object({
  months: z.coerce.number().int().positive().max(24).default(6),
});

export async function getSummary(req: AuthRequest, res: Response) {
  const { month } = monthQuerySchema.parse(req.query);
  const { start, end } = monthRange(month);

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: start, lt: end } },
    select: { type: true, amount: true },
  });

  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  return res.json({
    month: toMonthKey(start),
    income,
    expense,
    balance: income - expense,
  });
}

export async function getByCategory(req: AuthRequest, res: Response) {
  const { month } = monthQuerySchema.parse(req.query);
  const { start, end } = monthRange(month);

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: start, lt: end } },
    include: { category: true },
  });

  const totals = new Map<string, { categoryId: string; categoryName: string; type: string; total: number }>();

  for (const t of transactions) {
    const key = t.categoryId;
    const existing = totals.get(key);
    if (existing) {
      existing.total += t.amount;
    } else {
      totals.set(key, {
        categoryId: t.categoryId,
        categoryName: t.category.name,
        type: t.type,
        total: t.amount,
      });
    }
  }

  return res.json(Array.from(totals.values()).sort((a, b) => b.total - a.total));
}

export async function getTrend(req: AuthRequest, res: Response) {
  const { months } = trendQuerySchema.parse(req.query);

  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

  const transactions = await prisma.transaction.findMany({
    where: { userId: req.userId, date: { gte: start } },
    select: { type: true, amount: true, date: true },
  });

  const byMonth = new Map<string, { month: string; income: number; expense: number }>();
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const key = toMonthKey(d);
    byMonth.set(key, { month: key, income: 0, expense: 0 });
  }

  for (const t of transactions) {
    const key = toMonthKey(t.date);
    const bucket = byMonth.get(key);
    if (!bucket) continue;
    if (t.type === "income") bucket.income += t.amount;
    else bucket.expense += t.amount;
  }

  return res.json(Array.from(byMonth.values()));
}
