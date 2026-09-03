import { NextFunction, Response } from "express";
import { prisma } from "../config/prisma";
import { AuthRequest } from "./auth";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export async function generateDueRecurring(req: AuthRequest, res: Response, next: NextFunction) {
  const userId = req.userId as string;
  const monthKey = currentMonthKey();

  const due = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      active: true,
      OR: [{ lastGeneratedMonth: null }, { lastGeneratedMonth: { not: monthKey } }],
    },
  });

  if (due.length > 0) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const lastDay = daysInMonth(year, month);

    for (const rule of due) {
      const day = Math.min(rule.dayOfMonth, lastDay);
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
          data: { lastGeneratedMonth: monthKey },
        }),
      ]);
    }
  }

  next();
}
