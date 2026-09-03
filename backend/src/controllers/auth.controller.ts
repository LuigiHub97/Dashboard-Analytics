import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { signToken } from "../utils/jwt";

const DEFAULT_CATEGORIES = [
  { name: "Salário", type: "income" },
  { name: "Freelance", type: "income" },
  { name: "Alimentação", type: "expense" },
  { name: "Transporte", type: "expense" },
  { name: "Moradia", type: "expense" },
  { name: "Lazer", type: "expense" },
  { name: "Saúde", type: "expense" },
  { name: "Estudos", type: "expense" },
  { name: "Cartão", type: "expense"},
];

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response) {
  const { email, password, name } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      categories: { create: DEFAULT_CATEGORIES },
    },
  });

  const token = signToken({ userId: user.id });
  return res.status(201).json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ userId: user.id });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
}
