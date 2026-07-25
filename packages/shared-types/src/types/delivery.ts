import { VehicleType, OrderStatus } from "../enums";

export interface DeliveryPartner {
  id: string;
  userId: string;
  vehicleType: VehicleType;
  licenseNumber: string;
}

export interface DeliveryPartnerProfile extends DeliveryPartner {
  fullName: string;
  avatarUrl: string | null;
  email: string;
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

export interface AvailableDeliveryItem {
  id: string;
  orderId: string;
  status: string;
  assignedAt: Date;
  restaurant: {
    id: string;
    name: string;
    address: string;
    logoUrl: string | null;
    latitude: number;
    longitude: number;
  };
  order: {
    grandTotal: number;
    itemCount: number;
    deliveryFee: number;
  };
}

export interface DeliveryAssignmentDetail {
  id: string;
  orderId: string;
  status: string;
  assignedAt: Date;
  acceptedAt: Date | null;
  pickedUpAt: Date | null;
  completedAt: Date | null;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    logoUrl: string | null;
    latitude: number;
    longitude: number;
  };
  order: {
    grandTotal: number;
    itemCount: number;
    deliveryFee: number;
    tip: number;
  };
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
  };
  deliveryAddress: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
  };
  items: Array<{
    id: string;
    foodId: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl: string | null;
  }>;
  statusHistory: Array<{
    status: string;
    createdAt: Date;
  }>;
}
