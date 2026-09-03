import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

const createRecurringSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  description: z.string().optional(),
  dayOfMonth: z.number().int().min(1).max(31),
  categoryId: z.string().min(1),
});

const updateRecurringSchema = createRecurringSchema.partial().extend({
  active: z.boolean().optional(),
});

export async function listRecurring(req: AuthRequest, res: Response) {
  const items = await prisma.recurringTransaction.findMany({
    where: { userId: req.userId },
    include: { category: true },
    orderBy: { dayOfMonth: "asc" },
  });
  return res.json(items);
}

export async function createRecurring(req: AuthRequest, res: Response) {
  const data = createRecurringSchema.parse(req.body);

  const category = await prisma.category.findFirst({
    where: { id: data.categoryId, userId: req.userId },
  });
  if (!category) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const rule = await prisma.recurringTransaction.create({
    data: {
      type: data.type,
      amount: data.amount,
      description: data.description,
      dayOfMonth: data.dayOfMonth,
      categoryId: data.categoryId,
      userId: req.userId as string,
    },
    include: { category: true },
  });

  return res.status(201).json(rule);
}

export async function updateRecurring(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = updateRecurringSchema.parse(req.body);

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Recurring transaction not found" });
  }

  if (data.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, userId: req.userId },
    });
    if (!category) {
      return res.status(400).json({ error: "Invalid category" });
    }
  }

  const rule = await prisma.recurringTransaction.update({
    where: { id },
    data: {
      ...(data.type ? { type: data.type } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.dayOfMonth !== undefined ? { dayOfMonth: data.dayOfMonth } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
    include: { category: true },
  });

  return res.json(rule);
}

export async function deleteRecurring(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Recurring transaction not found" });
  }

  await prisma.recurringTransaction.delete({ where: { id } });
  return res.status(204).send();
}
