import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { createReviewSchema, listReviewsQuerySchema } from "../validators";
import * as reviewsController from "../controllers/reviews.controller";

const router: Router = Router();

router.get("/restaurant/:restaurantId", validate({ query: listReviewsQuerySchema }), asyncHandler(reviewsController.listByRestaurant));
router.post("/", authenticate, validate({ body: createReviewSchema }), asyncHandler(reviewsController.create));
router.delete("/:id", authenticate, asyncHandler(reviewsController.deleteReview));

export default router;
