import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";
import { computeLineCost, round2 } from "../utils/cmv";

const pizzaLineSchema = z.object({
  ingredientId: z.string().min(1),
  quantity: z.number().positive(),
});

const createPizzaSchema = z.object({
  name: z.string().min(1),
  packagingCost: z.number().nonnegative(),
  energyCost: z.number().nonnegative(),
  waterCost: z.number().nonnegative(),
  lines: z.array(pizzaLineSchema).min(1),
});

export async function listPizzas(req: AuthRequest, res: Response) {
  const pizzas = await prisma.pizza.findMany({
    where: { userId: req.userId },
    include: { ingredients: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json(pizzas);
}

export async function getPizza(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const pizza = await prisma.pizza.findFirst({
    where: { id, userId: req.userId },
    include: { ingredients: true },
  });
  if (!pizza) {
    return res.status(404).json({ error: "Pizza not found" });
  }
  return res.json(pizza);
}

async function resolvePizzaCosts(userId: string, data: z.infer<typeof createPizzaSchema>) {
  const ingredientIds = data.lines.map((l) => l.ingredientId);
  const ingredients = await prisma.ingredient.findMany({
    where: { id: { in: ingredientIds }, userId },
  });
  const ingredientById = new Map(ingredients.map((i) => [i.id, i]));

  for (const line of data.lines) {
    if (!ingredientById.has(line.ingredientId)) {
      return { error: "Invalid ingredient" as const };
    }
  }

  const lineData = data.lines.map((line) => {
    const ingredient = ingredientById.get(line.ingredientId)!;
    const lineCost = round2(computeLineCost(ingredient.unit, ingredient.pricePerUnit, line.quantity));
    return {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      unit: ingredient.unit,
      quantity: line.quantity,
      pricePerUnitAtUse: ingredient.pricePerUnit,
      lineCost,
    };
  });

  const ingredientsCost = round2(lineData.reduce((sum, l) => sum + l.lineCost, 0));
  const packagingCost = round2(data.packagingCost);
  const energyCost = round2(data.energyCost);
  const waterCost = round2(data.waterCost);
  const totalCost = round2(ingredientsCost + packagingCost + energyCost + waterCost);

  return { lineData, ingredientsCost, packagingCost, energyCost, waterCost, totalCost };
}

export async function createPizza(req: AuthRequest, res: Response) {
  const data = createPizzaSchema.parse(req.body);

  const resolved = await resolvePizzaCosts(req.userId as string, data);
  if ("error" in resolved) {
    return res.status(400).json({ error: resolved.error });
  }
  const { lineData, ingredientsCost, packagingCost, energyCost, waterCost, totalCost } = resolved;

  const pizza = await prisma.$transaction(async (tx) => {
    const created = await tx.pizza.create({
      data: {
        name: data.name,
        packagingCost,
        energyCost,
        waterCost,
        ingredientsCost,
        totalCost,
        userId: req.userId as string,
        ingredients: { create: lineData },
      },
      include: { ingredients: true },
    });
    return created;
  });

  return res.status(201).json(pizza);
}

export async function updatePizza(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = createPizzaSchema.parse(req.body);

  const existing = await prisma.pizza.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Pizza not found" });
  }

  const resolved = await resolvePizzaCosts(req.userId as string, data);
  if ("error" in resolved) {
    return res.status(400).json({ error: resolved.error });
  }
  const { lineData, ingredientsCost, packagingCost, energyCost, waterCost, totalCost } = resolved;

  const pizza = await prisma.$transaction(async (tx) => {
    await tx.pizzaIngredient.deleteMany({ where: { pizzaId: id } });
    const updated = await tx.pizza.update({
      where: { id },
      data: {
        name: data.name,
        packagingCost,
        energyCost,
        waterCost,
        ingredientsCost,
        totalCost,
        ingredients: { create: lineData },
      },
      include: { ingredients: true },
    });
    return updated;
  });

  return res.json(pizza);
}

export async function deletePizza(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const existing = await prisma.pizza.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Pizza not found" });
  }

  await prisma.pizza.delete({ where: { id } });
  return res.status(204).send();
}
