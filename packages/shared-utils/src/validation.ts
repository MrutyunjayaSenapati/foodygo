import { z } from "zod";
import { EMAIL_REGEX, PHONE_REGEX, PASSWORD_REGEX, PINCODE_REGEX } from "@foodygo/shared-constants";

export const emailSchema = z.string().regex(EMAIL_REGEX, "Invalid email address");

export const phoneSchema = z.string().regex(PHONE_REGEX, "Invalid phone number");

export const passwordSchema = z
  .string()
  .regex(PASSWORD_REGEX, "Password must be at least 8 characters with uppercase, lowercase, and a number");

export const pincodeSchema = z.string().regex(PINCODE_REGEX, "Invalid pincode");

export const uuidSchema = z.string().uuid("Invalid UUID");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export const addressSchema = z.object({
  label: z.string().max(100).optional(),
  addressLine1: z.string().min(1, "Address is required").max(255),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postalCode: pincodeSchema,
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
