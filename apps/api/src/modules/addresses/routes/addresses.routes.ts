import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { asyncHandler } from "../../../middleware/async-handler";
import { createAddressSchema, updateAddressSchema } from "../validators";
import * as addressesController from "../controllers/addresses.controller";

const router: Router = Router();

router.get("/", authenticate, asyncHandler(addressesController.getAll));
router.get("/:id", authenticate, asyncHandler(addressesController.getById));
router.post("/", authenticate, validate({ body: createAddressSchema }), asyncHandler(addressesController.create));
router.patch("/:id", authenticate, validate({ body: updateAddressSchema }), asyncHandler(addressesController.update));
router.delete("/:id", authenticate, asyncHandler(addressesController.deleteAddress));

export default router;
