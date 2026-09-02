import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "../controllers/transactions.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listTransactions));
router.post("/", asyncHandler(createTransaction));
router.put("/:id", asyncHandler(updateTransaction));
router.delete("/:id", asyncHandler(deleteTransaction));

export default router;
