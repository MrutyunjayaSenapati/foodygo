import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from "../validators";
import * as couponsController from "../controllers/coupons.controller";

const router: Router = Router();

router.get("/", authenticate, allowRoles("ADMIN"), asyncHandler(couponsController.listCoupons));
router.post(
  "/",
  authenticate,
  allowRoles("ADMIN"),
  validate({ body: createCouponSchema }),
  asyncHandler(couponsController.createCoupon),
);
router.patch(
  "/:id",
  authenticate,
  allowRoles("ADMIN"),
  validate({ body: updateCouponSchema }),
  asyncHandler(couponsController.updateCoupon),
);
router.delete(
  "/:id",
  authenticate,
  allowRoles("ADMIN"),
  asyncHandler(couponsController.deleteCoupon),
);
router.post(
  "/validate",
  authenticate,
  validate({ body: validateCouponSchema }),
  asyncHandler(couponsController.validateCoupon),
);

export default router;
