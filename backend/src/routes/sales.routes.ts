import { Router } from "express";
import { createSale, deleteSale, getSalesSummary, listSales } from "../controllers/sales.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listSales));
router.get("/summary", asyncHandler(getSalesSummary));
router.post("/", asyncHandler(createSale));
router.delete("/:id", asyncHandler(deleteSale));

export default router;
