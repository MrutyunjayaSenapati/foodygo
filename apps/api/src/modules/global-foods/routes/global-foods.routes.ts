import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import {
  createGlobalCategorySchema,
  updateGlobalCategorySchema,
  createGlobalFoodSchema,
  updateGlobalFoodSchema,
} from "../validators";
import * as globalFoodsController from "../controllers/global-foods.controller";

const router: Router = Router();

router.get("/categories", authenticate, allowRoles("ADMIN", "RESTAURANT_OWNER"), asyncHandler(globalFoodsController.listCategories));
router.post("/categories", authenticate, allowRoles("ADMIN"), validate({ body: createGlobalCategorySchema }), asyncHandler(globalFoodsController.createCategory));
router.patch("/categories/:id", authenticate, allowRoles("ADMIN"), validate({ body: updateGlobalCategorySchema }), asyncHandler(globalFoodsController.updateCategory));
router.delete("/categories/:id", authenticate, allowRoles("ADMIN"), asyncHandler(globalFoodsController.deleteCategory));

router.get("/foods", authenticate, allowRoles("ADMIN"), asyncHandler(globalFoodsController.listFoods));
router.post("/foods", authenticate, allowRoles("ADMIN"), validate({ body: createGlobalFoodSchema }), asyncHandler(globalFoodsController.createFood));
router.patch("/foods/:id", authenticate, allowRoles("ADMIN"), validate({ body: updateGlobalFoodSchema }), asyncHandler(globalFoodsController.updateFood));
router.delete("/foods/:id", authenticate, allowRoles("ADMIN"), asyncHandler(globalFoodsController.deleteFood));

export default router;
