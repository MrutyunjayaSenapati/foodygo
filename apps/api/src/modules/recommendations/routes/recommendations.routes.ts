import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { asyncHandler } from "../../../middleware/async-handler";
import * as recommendationsController from "../controllers/recommendations.controller";

const router: Router = Router();

router.get("/", authenticate, asyncHandler(recommendationsController.list));

export default router;
