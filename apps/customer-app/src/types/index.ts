export type {
  UserResponse,
  TokenPair,
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  GoogleLoginDTO,
  Restaurant,
  Food,
  FoodCategory,
  Cart,
  CartItem,
  AddCartItemDTO,
  UpdateCartItemDTO,
  Order,
  OrderItem,
  OrderStatusHistory,
  CreateOrderDTO,
  Address,
  CreateAddressDTO,
  Review,
  CreateReviewDTO,
  Notification,
  Coupon,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  CreatePaymentOrderDTO,
  PaymentOrderResponse,
} from "@foodygo/shared-types";

export {
  OrderStatus,
  PaymentStatus,
  RestaurantStatus,
  Role,
} from "@foodygo/shared-types";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
