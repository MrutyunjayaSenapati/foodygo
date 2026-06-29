import { VehicleType, OrderStatus } from "../enums";

export interface DeliveryPartner {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  licenseNumber: string;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  deliveryPartnerId: string;
  status: string;
  assignedAt: Date;
  acceptedAt: Date | null;
  pickedUpAt: Date | null;
  completedAt: Date | null;
}

export interface AcceptDeliveryDTO {
  orderId: string;
}

export interface UpdateDeliveryStatusDTO {
  status: OrderStatus;
}
