import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { updateProfileSchema, listUsersQuerySchema, updateUserStatusSchema, updateFcmTokenSchema } from "../validators";
import * as usersController from "../controllers/users.controller";

const router: Router = Router();

router.get("/", authenticate, allowRoles("ADMIN"), validate({ query: listUsersQuerySchema }), asyncHandler(usersController.listUsers));
router.get("/:id", authenticate, asyncHandler(usersController.getProfile));
router.patch("/:id", authenticate, validate({ body: updateProfileSchema }), asyncHandler(usersController.updateProfile));
router.patch("/:id/status", authenticate, allowRoles("ADMIN"), validate({ body: updateUserStatusSchema }), asyncHandler(usersController.updateStatus));
router.patch("/fcm-token", authenticate, validate({ body: updateFcmTokenSchema }), asyncHandler(usersController.updateFcmToken));

export default router;
