import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { asyncHandler } from "../../../middleware/async-handler";
import * as analyticsController from "../controllers/analytics.controller";

const router: Router = Router();

router.get("/restaurant/:id", authenticate, allowRoles("RESTAURANT_OWNER"), asyncHandler(analyticsController.restaurantAnalytics));
router.get("/admin", authenticate, allowRoles("ADMIN"), asyncHandler(analyticsController.adminAnalytics));

export default router;
