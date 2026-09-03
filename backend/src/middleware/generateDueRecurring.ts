import { Prisma } from "@prisma/client";
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

function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
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

    // Tracks the lastGeneratedMonth value this loop expects to still be in the DB, so each
    // step below is a compare-and-swap: it only proceeds if nobody else (a concurrent
    // request racing this same middleware) has already advanced the rule past that point.
    let expectedPrev = rule.lastGeneratedMonth;

    for (let t = startTotal; t <= targetTotal; t++) {
      const { year, month } = fromTotalMonths(t);
      const newKey = monthKey(year, month);

      try {
        const created = await prisma.$transaction(async (tx) => {
          const cas = await tx.recurringTransaction.updateMany({
            where: { id: rule.id, lastGeneratedMonth: expectedPrev },
            data: { lastGeneratedMonth: newKey },
          });
          if (cas.count === 0) {
            return null;
          }

          const day = Math.min(rule.dayOfMonth, daysInMonth(year, month));
          const date = new Date(Date.UTC(year, month - 1, day));
          return tx.transaction.create({
            data: {
              type: rule.type,
              amount: rule.amount,
              date,
              description: rule.description,
              categoryId: rule.categoryId,
              userId,
              recurringTransactionId: rule.id,
            },
          });
        });

        if (!created) {
          // Another request already advanced this rule past our expected state; stop
          // here rather than continuing with a stale view of it.
          break;
        }

        expectedPrev = newKey;
      } catch (err) {
        if (isUniqueConstraintError(err)) {
          // Belt-and-suspenders: the DB-level unique index already blocked a duplicate
          // that the CAS check above somehow missed. Treat it the same as losing the race.
          break;
        }
        throw err;
      }
    }
  }

  next();
}
