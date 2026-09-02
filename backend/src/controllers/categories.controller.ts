import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthRequest } from "../middleware/auth";

const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["income", "expense"]),
});

export async function listCategories(req: AuthRequest, res: Response) {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
  });
  return res.json(categories);
}

export async function createCategory(req: AuthRequest, res: Response) {
  const { name, type } = createCategorySchema.parse(req.body);

  const existing = await prisma.category.findUnique({
    where: { userId_name: { userId: req.userId as string, name } },
  });
  if (existing) {
    return res.status(409).json({ error: "Category already exists" });
  }

  const category = await prisma.category.create({
    data: { name, type, userId: req.userId as string },
  });
  return res.status(201).json(category);
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const category = await prisma.category.findFirst({
    where: { id, userId: req.userId },
  });
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  await prisma.category.delete({ where: { id } });
  return res.status(204).send();
}
