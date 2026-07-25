import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { registerSchema, loginSchema, refreshSchema, googleLoginSchema, registerRestaurantSchema } from "../validators";
import * as authController from "../controllers/auth.controller";

const router: Router = Router();

router.post("/register", validate({ body: registerSchema }), asyncHandler(authController.register));
router.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
router.post("/google", validate({ body: googleLoginSchema }), asyncHandler(authController.googleLogin));
router.post("/register-restaurant", validate({ body: registerRestaurantSchema }), asyncHandler(authController.registerRestaurant));
router.post("/refresh", validate({ body: refreshSchema }), asyncHandler(authController.refresh));
router.post("/logout", authenticate, asyncHandler(authController.logout));
router.get("/me", authenticate, asyncHandler(authController.me));

export default router;
