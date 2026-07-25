import type { AxiosResponse } from "axios";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export type ApiResponse<T> = AxiosResponse<ApiEnvelope<T>>;

export type {
  UserResponse,
  TokenPair,
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  DeliveryPartner,
  DeliveryPartnerProfile,
  DeliveryAssignment,
  AvailableDeliveryItem,
  DeliveryAssignmentDetail,
  AcceptDeliveryDTO,
  UpdateDeliveryStatusDTO,
  Order,
  OrderItem,
  OrderStatusHistory,
  Address,
  Notification,
  Restaurant,
} from "@foodygo/shared-types";

export { OrderStatus, VehicleType, Role } from "@foodygo/shared-types";
