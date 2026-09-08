import { Router } from "express";
import { login, register, updateProfile } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.patch("/me", requireAuth, asyncHandler(updateProfile));

export default router;
