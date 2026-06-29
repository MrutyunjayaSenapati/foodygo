import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { toggleFavoriteSchema } from "../validators";
import * as favoritesController from "../controllers/favorites.controller";

const router: Router = Router();

router.get("/", authenticate, asyncHandler(favoritesController.getFavorites));
router.post("/", authenticate, validate({ body: toggleFavoriteSchema }), asyncHandler(favoritesController.toggleFavorite));

export default router;
