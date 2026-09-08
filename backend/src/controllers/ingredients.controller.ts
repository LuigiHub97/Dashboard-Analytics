import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

const createIngredientSchema = z.object({
  name: z.string().min(1),
  unit: z.enum(["kg", "litro", "unidade"]),
  pricePerUnit: z.number().positive(),
});

const updateIngredientSchema = createIngredientSchema.partial();

export async function listIngredients(req: AuthRequest, res: Response) {
  const ingredients = await prisma.ingredient.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
  });
  return res.json(ingredients);
}

export async function createIngredient(req: AuthRequest, res: Response) {
  const data = createIngredientSchema.parse(req.body);

  const existing = await prisma.ingredient.findUnique({
    where: { userId_name: { userId: req.userId as string, name: data.name } },
  });
  if (existing) {
    return res.status(409).json({ error: "Ingredient already exists" });
  }

  const ingredient = await prisma.ingredient.create({
    data: { ...data, userId: req.userId as string },
  });
  return res.status(201).json(ingredient);
}

export async function updateIngredient(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = updateIngredientSchema.parse(req.body);

  const existing = await prisma.ingredient.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Ingredient not found" });
  }

  const ingredient = await prisma.ingredient.update({
    where: { id },
    data,
  });
  return res.json(ingredient);
}

export async function deleteIngredient(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const existing = await prisma.ingredient.findFirst({
    where: { id, userId: req.userId },
  });
  if (!existing) {
    return res.status(404).json({ error: "Ingredient not found" });
  }

  await prisma.ingredient.delete({ where: { id } });
  return res.status(204).send();
}
