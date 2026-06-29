import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import {
  registerPartnerSchema,
  updatePartnerSchema,
  acceptDeliverySchema,
} from "../validators";
import * as deliveryController from "../controllers/delivery.controller";

const router: Router = Router();

router.post(
  "/partners/register",
  authenticate,
  allowRoles("DELIVERY_PARTNER"),
  validate({ body: registerPartnerSchema }),
  asyncHandler(deliveryController.registerPartner),
);
router.patch(
  "/partners/:id",
  authenticate,
  allowRoles("DELIVERY_PARTNER", "ADMIN"),
  validate({ body: updatePartnerSchema }),
  asyncHandler(deliveryController.updatePartner),
);
router.get(
  "/assignments/available",
  authenticate,
  allowRoles("DELIVERY_PARTNER"),
  asyncHandler(deliveryController.getAvailableDeliveries),
);
router.post(
  "/assignments/:id/accept",
  authenticate,
  allowRoles("DELIVERY_PARTNER"),
  validate({ body: acceptDeliverySchema }),
  asyncHandler(deliveryController.acceptDelivery),
);
router.post(
  "/assignments/:id/pickup",
  authenticate,
  allowRoles("DELIVERY_PARTNER"),
  asyncHandler(deliveryController.markPickedUp),
);
router.post(
  "/assignments/:id/complete",
  authenticate,
  allowRoles("DELIVERY_PARTNER"),
  asyncHandler(deliveryController.markCompleted),
);
router.get(
  "/assignments/my",
  authenticate,
  allowRoles("DELIVERY_PARTNER"),
  asyncHandler(deliveryController.getMyAssignments),
);

export default router;
