import { Router } from "express";
import { createCategory, deleteCategory, listCategories } from "../controllers/categories.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listCategories));
router.post("/", asyncHandler(createCategory));
router.delete("/:id", asyncHandler(deleteCategory));

export default router;
