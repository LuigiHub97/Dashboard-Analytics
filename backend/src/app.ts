import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import categoriesRoutes from "./routes/categories.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import ingredientsRoutes from "./routes/ingredients.routes";
import pizzasRoutes from "./routes/pizzas.routes";
import recurringTransactionsRoutes from "./routes/recurringTransactions.routes";
import salesRoutes from "./routes/sales.routes";
import transactionsRoutes from "./routes/transactions.routes";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

const localOrigins = ["http://localhost:5173", "http://localhost:5174"];
const configuredOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...localOrigins, ...configuredOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/recurring-transactions", recurringTransactionsRoutes);
app.use("/api/ingredients", ingredientsRoutes);
app.use("/api/pizzas", pizzasRoutes);
app.use("/api/sales", salesRoutes);

app.use(errorHandler);
