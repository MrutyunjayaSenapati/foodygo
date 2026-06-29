import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  listOrdersQuerySchema,
} from "../validators";
import * as ordersController from "../controllers/orders.controller";

const router: Router = Router();

router.get("/", authenticate, validate({ query: listOrdersQuerySchema }), asyncHandler(ordersController.listOrders));
router.get("/restaurant/:restaurantId", authenticate, allowRoles("RESTAURANT_OWNER"), asyncHandler(ordersController.listRestaurantOrders));
router.get("/:id", authenticate, asyncHandler(ordersController.getOrder));
router.post("/", authenticate, validate({ body: createOrderSchema }), asyncHandler(ordersController.createOrder));
router.patch("/:id/status", authenticate, allowRoles("ADMIN", "RESTAURANT_OWNER"), validate({ body: updateOrderStatusSchema }), asyncHandler(ordersController.updateOrderStatus));
router.post("/:id/cancel", authenticate, asyncHandler(ordersController.cancelOrder));

export default router;
