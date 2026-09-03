import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

const createTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.string().min(1)),
  description: z.string().optional(),
  categoryId: z.string().min(1),
});

const updateTransactionSchema = createTransactionSchema.partial();

const convertToRecurringSchema = z.object({
  dayOfMonth: z.number().int().min(1).max(31),
});

const listQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  minValue: z.coerce.number().optional(),
  maxValue: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export async function listTransactions(req: AuthRequest, res: Response) {
  const query = listQuerySchema.parse(req.query);
  const { startDate, endDate, categoryId, minValue, maxValue, page, limit } = query;

  const where: Record<string, unknown> = { userId: req.userId };

  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lte: new Date(endDate) } : {}),
    };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (minValue !== undefined || maxValue !== undefined) {
    where.amount = {
      ...(minValue !== undefined ? { gte: minValue } : {}),
      ...(maxValue !== undefined ? { lte: maxValue } : {}),
    };
  }

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return res.json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
}

export async function createTransaction(req: AuthRequest, res: Response) {
  const data = createTransactionSchema.parse(req.body);

  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, userId: req.userId },
  });
  if (!category) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const transaction = await prisma.transaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      date: new Date(data.date),
      description: data.description,
      categoryId: data.categoryId,
      userId: req.userId as string,
    },
    include: { category: true },
  });

  return res.status(201).json(transaction);
}

export async function updateTransaction(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = updateTransactionSchema.parse(req.body);

  const existing = await prisma.transaction.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId: req.userId },
    });
    if (!category) {
      return res.status(400).json({ error: "Invalid category" });
    }
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...(data.type ? { type: data.type } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.date ? { date: new Date(data.date) } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
    },
    include: { category: true },
  });

  return res.json(transaction);
}

export async function convertTransactionToRecurring(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { dayOfMonth } = convertToRecurringSchema.parse(req.body);

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId: req.userId },
  });
  if (!transaction) {
    return res.status(404).json({ error: "Transaction not found" });
  }
  if (transaction.recurringTransactionId) {
    return res.status(409).json({ error: "Transaction is already linked to a recurring rule" });
  }

  const monthKey = `${transaction.date.getUTCFullYear()}-${String(transaction.date.getUTCMonth() + 1).padStart(2, "0")}`;

  const result = await prisma.$transaction(async (tx) => {
    const rule = await tx.recurringTransaction.create({
      data: {
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        dayOfMonth,
        categoryId: transaction.categoryId,
        userId: req.userId as string,
        lastGeneratedMonth: monthKey,
      },
    });

    const updated = await tx.transaction.update({
      where: { id: transaction.id },
      data: { recurringTransactionId: rule.id },
      include: { category: true },
    });

    return { transaction: updated, recurring: rule };
  });

  return res.status(201).json(result);
}

export async function deleteTransaction(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const existing = await prisma.transaction.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  await prisma.transaction.delete({ where: { id } });
  return res.status(204).send();
}
