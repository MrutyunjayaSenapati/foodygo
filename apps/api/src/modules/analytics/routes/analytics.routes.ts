import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { asyncHandler } from "../../../middleware/async-handler";
import * as analyticsController from "../controllers/analytics.controller";

const router: Router = Router();

router.get("/restaurant/:id", authenticate, allowRoles("RESTAURANT_OWNER", "ADMIN"), asyncHandler(analyticsController.restaurantAnalytics));
router.get("/admin", authenticate, allowRoles("ADMIN"), asyncHandler(analyticsController.adminAnalytics));
router.get("/admin/revenue-trend", authenticate, allowRoles("ADMIN"), asyncHandler(analyticsController.revenueTrend));
router.get("/admin/order-trend", authenticate, allowRoles("ADMIN"), asyncHandler(analyticsController.orderTrend));
router.get("/admin/top-restaurants", authenticate, allowRoles("ADMIN"), asyncHandler(analyticsController.topRestaurants));

export default router;
