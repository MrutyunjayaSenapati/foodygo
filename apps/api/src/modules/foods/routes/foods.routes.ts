import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import {
  createFoodSchema,
  updateFoodSchema,
  createCategorySchema,
  listFoodsQuerySchema,
} from "../validators";
import * as foodsController from "../controllers/foods.controller";

const router: Router = Router();

router.get("/", validate({ query: listFoodsQuerySchema }), asyncHandler(foodsController.listFoods));
router.get("/:id", asyncHandler(foodsController.getFood));

router.get("/restaurant/:restaurantId", asyncHandler(foodsController.getRestaurantFoods));

router.post("/restaurant/:restaurantId", authenticate, allowRoles("RESTAURANT_OWNER"), validate({ body: createFoodSchema }), asyncHandler(foodsController.createFood));
router.patch("/:id/restaurant/:restaurantId", authenticate, allowRoles("RESTAURANT_OWNER"), validate({ body: updateFoodSchema }), asyncHandler(foodsController.updateFood));
router.delete("/:id/restaurant/:restaurantId", authenticate, allowRoles("RESTAURANT_OWNER"), asyncHandler(foodsController.deleteFood));

router.post("/restaurant/:restaurantId/category", authenticate, allowRoles("RESTAURANT_OWNER"), validate({ body: createCategorySchema }), asyncHandler(foodsController.createCategory));
router.patch("/category/:id/restaurant/:restaurantId", authenticate, allowRoles("RESTAURANT_OWNER"), validate({ body: createCategorySchema }), asyncHandler(foodsController.updateCategory));
router.delete("/category/:id/restaurant/:restaurantId", authenticate, allowRoles("RESTAURANT_OWNER"), asyncHandler(foodsController.deleteCategory));

export default router;
