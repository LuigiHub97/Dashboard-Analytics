import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import categoriesRoutes from "./routes/categories.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import transactionsRoutes from "./routes/transactions.routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use(errorHandler);
