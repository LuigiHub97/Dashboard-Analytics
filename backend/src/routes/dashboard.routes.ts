import { Router } from "express";
import { getByCategory, getSummary, getTrend } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/summary", asyncHandler(getSummary));
router.get("/by-category", asyncHandler(getByCategory));
router.get("/trend", asyncHandler(getTrend));

export default router;
