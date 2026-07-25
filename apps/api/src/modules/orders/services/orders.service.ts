import { db } from "../../../lib/db";
import { orders } from "../../../db/schema/orders";
import { orderItems } from "../../../db/schema/order-items";
import { orderStatusHistory } from "../../../db/schema/order-status-history";
import { cartItems } from "../../../db/schema/cart-items";
import { eq } from "drizzle-orm";
import * as orderRepository from "../repositories/orders.repository";
import * as cartRepository from "../../cart/repositories/cart.repository";
import * as notificationService from "../../notifications/services/notifications.service";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import { OrderStateMachine } from "../domain/OrderStateMachine";
import type { CreateOrderDTO, OrderStatus } from "@foodygo/shared-types";
import { emitToUser, emitToRestaurant } from "../../../lib/events";

export async function createOrder(userId: string, dto: CreateOrderDTO) {
  const cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    throw new AppError(ErrorCode.NOT_FOUND, "Cart not found");
  }

  const cartItemsData = await cartRepository.getCartItems(cart.id);
  if (cartItemsData.length === 0) {
    throw new AppError(ErrorCode.VALIDATION_ERROR, "Cart is empty");
  }

  let subtotal = 0;
  let restaurantId = "";
  const itemsToInsert: { foodId: string; quantity: number; price: string }[] = [];

  for (const row of cartItemsData) {
    const cartItem = row.cart_items;
    const food = row.foods;
    const foodPrice = Number(food.price);
    subtotal += foodPrice * cartItem.quantity;
    restaurantId = food.restaurantId;
    itemsToInsert.push({
      foodId: cartItem.foodId,
      quantity: cartItem.quantity,
      price: food.price,
    });
  }

  const tax = subtotal * 0.08;
  const packingFee = subtotal * 0.02;
  const deliveryFee = 0;
  const platformFee = 0;
  const discount = 0;
  const tip = 0;
  const grandTotal = subtotal + tax + deliveryFee + packingFee + platformFee;

  const order = await db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(orders)
      .values({
        userId,
        restaurantId,
        addressId: dto.addressId,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        packingFee: packingFee.toFixed(2),
        platformFee: platformFee.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        tax: tax.toFixed(2),
        tip: tip.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        status: "PENDING",
        paymentStatus: "UNPAID",
      })
      .returning();

    if (!createdOrder) {
      throw new AppError(ErrorCode.INTERNAL_ERROR, "Failed to create order");
    }

    const items = itemsToInsert.map((item) => ({
      ...item,
      orderId: createdOrder.id,
    }));
    await tx.insert(orderItems).values(items);

    await tx.insert(orderStatusHistory).values({
      orderId: createdOrder.id,
      status: "PENDING",
    });

    await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return createdOrder;
  });

  const items = await orderRepository.getOrderItems(order.id);
  const result = { ...order, items };

  emitToUser(userId, "order:created", result);
  emitToRestaurant(restaurantId, "order:created", result);

  await notificationService.create(userId, "Order Placed", `Your order #${order.id.slice(0, 8)} has been placed successfully.`);

  return result;
}

export async function getOrder(userId: string, orderId: string) {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) {
    throw new AppError(ErrorCode.NOT_FOUND, "Order not found");
  }
  if (order.userId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, "This order does not belong to you");
  }
  const [items, statusHistory] = await Promise.all([
    orderRepository.getOrderItems(orderId),
    orderRepository.getOrderStatusHistory(orderId),
  ]);
  return { ...order, items, statusHistory };
}

export async function listOrders(userId: string, params: { page: number; pageSize: number }) {
  return orderRepository.getOrdersByUser(userId, params.page, params.pageSize);
}

export async function listRestaurantOrders(
  restaurantId: string,
  params: { page: number; pageSize: number; status?: string },
) {
  return orderRepository.getOrdersByRestaurant(
    restaurantId,
    params.page,
    params.pageSize,
    params.status,
  );
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  _userId: string,
  _userRoles: string[],
) {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) {
    throw new AppError(ErrorCode.NOT_FOUND, "Order not found");
  }

  const sm = new OrderStateMachine(order.status as OrderStatus);
  if (!sm.canTransitionTo(status)) {
    throw new AppError(ErrorCode.INVALID_STATUS_TRANSITION);
  }

  const updatedOrder = await orderRepository.updateOrderStatus(orderId, status);
  await orderRepository.addStatusHistory(orderId, status);

  emitToUser(order.userId, "order:status-changed", { orderId, status });
  emitToRestaurant(order.restaurantId, "order:status-changed", { orderId, status });

  const statusMessages: Record<string, string> = {
    RESTAURANT_ACCEPTED: "The restaurant has accepted your order.",
    PREPARING: "Your food is being prepared.",
    READY_FOR_PICKUP: "Your order is ready for pickup.",
    PICKED_UP: "Your order has been picked up.",
    OUT_FOR_DELIVERY: "Your driver is on the way!",
    DELIVERED: "Your order has been delivered. Enjoy!",
  };
  const message = statusMessages[status];
  if (message) {
    await notificationService.create(order.userId, "Order Update", message);
  }

  return updatedOrder;
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await orderRepository.getOrderById(orderId);
  if (!order) {
    throw new AppError(ErrorCode.NOT_FOUND, "Order not found");
  }
  if (order.userId !== userId) {
    throw new AppError(ErrorCode.FORBIDDEN, "This order does not belong to you");
  }
  const sm = new OrderStateMachine(order.status as OrderStatus);
  if (!sm.isCancellable()) {
    throw new AppError(ErrorCode.ORDER_NOT_CANCELLABLE);
  }

  const updatedOrder = await orderRepository.cancelOrder(orderId);
  await orderRepository.addStatusHistory(orderId, "CANCELLED");

  emitToUser(order.userId, "order:cancelled", { orderId });
  emitToRestaurant(order.restaurantId, "order:cancelled", { orderId });

  await notificationService.create(order.userId, "Order Cancelled", "Your order has been cancelled.");

  return updatedOrder;
}
