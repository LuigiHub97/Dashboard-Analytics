import { Router } from "express";
import {
  createIngredient,
  deleteIngredient,
  listIngredients,
  updateIngredient,
} from "../controllers/ingredients.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listIngredients));
router.post("/", asyncHandler(createIngredient));
router.patch("/:id", asyncHandler(updateIngredient));
router.delete("/:id", asyncHandler(deleteIngredient));

export default router;
