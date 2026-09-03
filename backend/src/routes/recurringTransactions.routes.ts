import { Router } from "express";
import {
  createRecurring,
  deleteRecurring,
  listRecurring,
  updateRecurring,
} from "../controllers/recurringTransactions.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listRecurring));
router.post("/", asyncHandler(createRecurring));
router.put("/:id", asyncHandler(updateRecurring));
router.delete("/:id", asyncHandler(deleteRecurring));

export default router;
