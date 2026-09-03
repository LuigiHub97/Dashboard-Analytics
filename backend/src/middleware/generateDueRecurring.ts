import { NextFunction, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "./auth";

const LOOKAHEAD_MONTHS = 1;

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parseMonthKey(key: string): { year: number; month: number } {
  const [year, month] = key.split("-").map(Number);
  return { year, month };
}

function totalMonths(year: number, month: number): number {
  return year * 12 + (month - 1);
}

function fromTotalMonths(total: number): { year: number; month: number } {
  return { year: Math.floor(total / 12), month: (total % 12) + 1 };
}

function currentMonthParts(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export async function generateDueRecurring(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.userId as string;
  const { year: curYear, month: curMonth } = currentMonthParts();
  const curTotal = totalMonths(curYear, curMonth);
  const targetTotal = curTotal + LOOKAHEAD_MONTHS;
  const target = fromTotalMonths(targetTotal);
  const targetKey = monthKey(target.year, target.month);

  const rules = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      active: true,
      OR: [{ lastGeneratedMonth: null }, { lastGeneratedMonth: { lt: targetKey } }],
    },
  });

  for (const rule of rules) {
    const lastTotal = rule.lastGeneratedMonth
      ? totalMonths(parseMonthKey(rule.lastGeneratedMonth).year, parseMonthKey(rule.lastGeneratedMonth).month)
      : null;

    // Never backfill months before the current one (a paused-then-resumed rule, or a
    // rule created from converting an old transaction, shouldn't spawn past occurrences).
    const startTotal = lastTotal !== null ? Math.max(lastTotal + 1, curTotal) : curTotal;

    for (let t = startTotal; t <= targetTotal; t++) {
      const { year, month } = fromTotalMonths(t);
      const day = Math.min(rule.dayOfMonth, daysInMonth(year, month));
      const date = new Date(Date.UTC(year, month - 1, day));

      await prisma.$transaction([
        prisma.transaction.create({
          data: {
            type: rule.type,
            amount: rule.amount,
            date,
            description: rule.description,
            categoryId: rule.categoryId,
            userId,
            recurringTransactionId: rule.id,
          },
        }),
        prisma.recurringTransaction.update({
          where: { id: rule.id },
          data: { lastGeneratedMonth: monthKey(year, month) },
        }),
      ]);
    }
  }

  next();
}
