import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { addCartItemSchema, updateCartItemSchema } from "../validators";
import * as cartController from "../controllers/cart.controller";

const router: Router = Router();

router.get("/", authenticate, asyncHandler(cartController.getCart));
router.post("/items", authenticate, validate({ body: addCartItemSchema }), asyncHandler(cartController.addItem));
router.patch("/items/:itemId", authenticate, validate({ body: updateCartItemSchema }), asyncHandler(cartController.updateItem));
router.delete("/items/:itemId", authenticate, asyncHandler(cartController.removeItem));
router.delete("/", authenticate, asyncHandler(cartController.clearCart));

export default router;
