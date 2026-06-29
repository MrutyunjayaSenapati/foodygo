import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { createPaymentOrderSchema, verifyPaymentSchema } from "../validators";
import * as paymentsController from "../controllers/payments.controller";

const router: Router = Router();

router.post("/create-order", authenticate, validate({ body: createPaymentOrderSchema }), asyncHandler(paymentsController.createPaymentOrder));
router.post("/verify", authenticate, validate({ body: verifyPaymentSchema }), asyncHandler(paymentsController.verifyPayment));
router.get("/order/:orderId", authenticate, asyncHandler(paymentsController.getPaymentByOrder));

export default router;
