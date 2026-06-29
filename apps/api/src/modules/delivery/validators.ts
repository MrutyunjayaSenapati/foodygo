import { z } from "zod";

export const registerPartnerSchema = z.object({
  vehicleType: z.string(),
  licenseNumber: z.string().min(1).max(100),
});

export const updatePartnerSchema = z.object({
  vehicleType: z.string().optional(),
  licenseNumber: z.string().min(1).max(100).optional(),
});

export const acceptDeliverySchema = z.object({
  orderId: z.string().uuid(),
});
