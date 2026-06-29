import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { listNotificationsQuerySchema } from "../validators";
import * as notificationsController from "../controllers/notifications.controller";

const router: Router = Router();

router.get(
  "/",
  authenticate,
  validate({ query: listNotificationsQuerySchema }),
  asyncHandler(notificationsController.listNotifications),
);
router.patch(
  "/:id/read",
  authenticate,
  asyncHandler(notificationsController.markAsRead),
);
router.patch(
  "/read-all",
  authenticate,
  asyncHandler(notificationsController.markAllAsRead),
);
router.get(
  "/unread-count",
  authenticate,
  asyncHandler(notificationsController.getUnreadCount),
);
router.delete(
  "/:id",
  authenticate,
  asyncHandler(notificationsController.deleteNotification),
);

export default router;
