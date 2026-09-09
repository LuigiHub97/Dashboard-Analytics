import { Router } from "express";
import { createPizza, deletePizza, getPizza, listPizzas, updatePizza } from "../controllers/pizzas.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listPizzas));
router.get("/:id", asyncHandler(getPizza));
router.post("/", asyncHandler(createPizza));
router.put("/:id", asyncHandler(updatePizza));
router.delete("/:id", asyncHandler(deletePizza));

export default router;
