import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { allowRoles } from "../../../middleware/rbac";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { uploadDocument } from "../../../middleware/upload";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateRestaurantStatusSchema,
  listRestaurantsQuerySchema,
  verifyDocumentSchema,
} from "../validators";
import * as restaurantsController from "../controllers/restaurants.controller";

const router: Router = Router();

router.get("/", validate({ query: listRestaurantsQuerySchema }), asyncHandler(restaurantsController.listRestaurants));
router.get("/my", authenticate, allowRoles("RESTAURANT_OWNER"), asyncHandler(restaurantsController.getMyRestaurants));
router.get("/:id", asyncHandler(restaurantsController.getRestaurant));
router.post("/", authenticate, allowRoles("RESTAURANT_OWNER"), validate({ body: createRestaurantSchema }), asyncHandler(restaurantsController.createRestaurant));
router.patch("/:id", authenticate, allowRoles("RESTAURANT_OWNER", "ADMIN"), validate({ body: updateRestaurantSchema }), asyncHandler(restaurantsController.updateRestaurant));
router.delete("/:id", authenticate, allowRoles("RESTAURANT_OWNER", "ADMIN"), asyncHandler(restaurantsController.deleteRestaurant));
router.patch("/:id/status", authenticate, allowRoles("ADMIN"), validate({ body: updateRestaurantStatusSchema }), asyncHandler(restaurantsController.updateStatus));
router.get("/admin/all", authenticate, allowRoles("ADMIN"), validate({ query: listRestaurantsQuerySchema }), asyncHandler(restaurantsController.adminListRestaurants));
router.get("/:id/documents", authenticate, allowRoles("RESTAURANT_OWNER", "ADMIN"), asyncHandler(restaurantsController.getDocuments));
router.post("/:id/documents", authenticate, allowRoles("RESTAURANT_OWNER"), uploadDocument, asyncHandler(restaurantsController.uploadDocument));
router.patch("/documents/:documentId/verify", authenticate, allowRoles("ADMIN"), validate({ body: verifyDocumentSchema }), asyncHandler(restaurantsController.verifyDocument));
router.delete("/documents/:documentId", authenticate, allowRoles("RESTAURANT_OWNER"), asyncHandler(restaurantsController.deleteDocument));

export default router;
