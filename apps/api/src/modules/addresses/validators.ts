import { z } from "zod";

export const createAddressSchema = z.object({
  label: z.string().optional(),
  addressLine1: z.string().min(1).max(255),
  addressLine2: z.string().optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateAddressSchema = z.object({
  label: z.string().optional(),
  addressLine1: z.string().min(1).max(255).optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
