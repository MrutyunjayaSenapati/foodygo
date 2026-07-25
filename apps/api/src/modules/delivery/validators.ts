import { z } from "zod";
import { VehicleType } from "@foodygo/shared-types";

const vehicleTypeEnum = z.enum([VehicleType.BIKE, VehicleType.SCOOTER, VehicleType.CAR]);

export const registerPartnerSchema = z.object({
  vehicleType: vehicleTypeEnum,
  licenseNumber: z.string().min(1).max(100),
});

export const updatePartnerSchema = z.object({
  vehicleType: vehicleTypeEnum.optional(),
  licenseNumber: z.string().min(1).max(100).optional(),
});

export const acceptDeliverySchema = z.object({
  orderId: z.string().uuid(),
});
