import { OrderStatus, PaymentStatus } from "../enums";

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  addressId: string;
  subtotal: number;
  discount: number;
  packingFee: number;
  platformFee: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  estimatedDeliveryTime: Date | null;
  actualDeliveryTime: Date | null;
  createdAt: Date;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  foodId: string;
  quantity: number;
  price: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  createdAt: Date;
}

export interface CreateOrderDTO {
  addressId: string;
  couponCode?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
}
