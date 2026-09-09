import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { round2 } from "../utils/cmv";

function endOfDayExclusive(dateStr: string): Date {
  const parsed = new Date(dateStr);
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    parsed.setUTCDate(parsed.getUTCDate() + 1);
  }
  return parsed;
}

function monthRange(month?: string): { start: Date; end: Date } {
  const now = month ? new Date(`${month}-01T00:00:00.000Z`) : new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

function toMonthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

const createSaleSchema = z.object({
  pizzaId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  commissionPct: z.number().min(0).max(100).default(0),
  date: z.string().optional(),
});

const listQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export async function listSales(req: AuthRequest, res: Response) {
  const { startDate, endDate } = listQuerySchema.parse(req.query);

  const where: Record<string, unknown> = { userId: req.userId };
  if (startDate || endDate) {
    where.date = {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lt: endOfDayExclusive(endDate) } : {}),
    };
  }

  const sales = await prisma.pizzaSale.findMany({
    where,
    orderBy: { date: "desc" },
  });
  return res.json(sales);
}

export async function createSale(req: AuthRequest, res: Response) {
  const data = createSaleSchema.parse(req.body);

  const pizza = await prisma.pizza.findFirst({ where: { id: data.pizzaId, userId: req.userId } });
  if (!pizza) {
    return res.status(400).json({ error: "Invalid pizza" });
  }

  const unitCmv = pizza.totalCost;
  const unitCommission = round2(data.unitPrice * (data.commissionPct / 100));
  const totalRevenue = round2(data.unitPrice * data.quantity);
  const totalCost = round2((unitCmv + unitCommission) * data.quantity);
  const totalProfit = round2(totalRevenue - totalCost);

  const sale = await prisma.pizzaSale.create({
    data: {
      userId: req.userId as string,
      pizzaId: pizza.id,
      pizzaName: pizza.name,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      commissionPct: data.commissionPct,
      unitCmv,
      totalRevenue,
      totalCost,
      totalProfit,
      date: data.date ? new Date(data.date) : new Date(),
    },
  });

  return res.status(201).json(sale);
}

export async function deleteSale(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const existing = await prisma.pizzaSale.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Sale not found" });
  }

  await prisma.pizzaSale.delete({ where: { id } });
  return res.status(204).send();
}

export async function getSalesSummary(req: AuthRequest, res: Response) {
  const { month } = monthQuerySchema.parse(req.query);
  const { start, end } = monthRange(month);

  const sales = await prisma.pizzaSale.findMany({
    where: { userId: req.userId, date: { gte: start, lt: end } },
    select: { quantity: true, totalRevenue: true, totalCost: true, totalProfit: true },
  });

  const summary = sales.reduce(
    (acc, s) => ({
      quantity: acc.quantity + s.quantity,
      totalRevenue: acc.totalRevenue + s.totalRevenue,
      totalCost: acc.totalCost + s.totalCost,
      totalProfit: acc.totalProfit + s.totalProfit,
    }),
    { quantity: 0, totalRevenue: 0, totalCost: 0, totalProfit: 0 }
  );

  return res.json({ month: toMonthKey(start), ...summary });
}
