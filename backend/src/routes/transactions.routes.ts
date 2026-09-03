import { Router } from "express";
import {
  convertTransactionToRecurring,
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "../controllers/transactions.controller";
import { requireAuth } from "../middleware/auth";
import { generateDueRecurring } from "../middleware/generateDueRecurring";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);
router.use(asyncHandler(generateDueRecurring));

router.get("/", asyncHandler(listTransactions));
router.post("/", asyncHandler(createTransaction));
router.put("/:id", asyncHandler(updateTransaction));
router.post("/:id/recurring", asyncHandler(convertTransactionToRecurring));
router.delete("/:id", asyncHandler(deleteTransaction));

export default router;
