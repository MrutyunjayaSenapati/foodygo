import * as deliveryRepository from "../repositories/delivery.repository";
import * as orderRepository from "../../orders/repositories/orders.repository";
import * as notificationService from "../../notifications/services/notifications.service";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { AcceptDeliveryDTO } from "@foodygo/shared-types";
import { emitToUser, emitToRestaurant } from "../../../lib/events";

export async function registerPartner(
  userId: string,
  dto: { vehicleType: string; licenseNumber: string },
) {
  const existing = await deliveryRepository.findPartnerByUserId(userId);
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, "Already registered as delivery partner");
  }
  return deliveryRepository.createPartner(userId, dto);
}

export async function updatePartner(
  id: string,
  dto: { vehicleType?: string; licenseNumber?: string },
) {
  const partner = await deliveryRepository.updatePartner(id, dto);
  if (!partner) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery partner not found");
  }
  return partner;
}

export async function getAvailableDeliveries() {
  return deliveryRepository.getAvailableDeliveries();
}

export async function acceptDelivery(
  assignmentId: string,
  userId: string,
  _dto: AcceptDeliveryDTO,
) {
  const partner = await deliveryRepository.findPartnerByUserId(userId);
  if (!partner) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery partner not found");
  }
  const assignment = await deliveryRepository.acceptAssignment(assignmentId, partner.id);
  if (!assignment) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }

  const order = await orderRepository.getOrderById(assignment.orderId);
  if (order) {
    emitToUser(order.userId, "delivery:accepted", { orderId: assignment.orderId });
    emitToRestaurant(order.restaurantId, "delivery:accepted", { orderId: assignment.orderId });
    await notificationService.create(order.userId, "Delivery Partner Assigned", "A delivery partner has accepted your order and is on the way.");
  }

  return assignment;
}

export async function markPickedUp(assignmentId: string, userId: string) {
  const partner = await deliveryRepository.findPartnerByUserId(userId);
  if (!partner) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery partner not found");
  }
  const assignment = await deliveryRepository.markPickedUp(assignmentId);
  if (!assignment) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }

  const order = await orderRepository.getOrderById(assignment.orderId);
  if (order) {
    emitToUser(order.userId, "delivery:picked-up", { orderId: assignment.orderId });
    emitToRestaurant(order.restaurantId, "delivery:picked-up", { orderId: assignment.orderId });
    await notificationService.create(order.userId, "Order Picked Up", "Your food has been picked up and is on its way!");
  }

  return assignment;
}

export async function markCompleted(assignmentId: string, userId: string) {
  const partner = await deliveryRepository.findPartnerByUserId(userId);
  if (!partner) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery partner not found");
  }
  const assignment = await deliveryRepository.markCompleted(assignmentId);
  if (!assignment) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }

  const order = await orderRepository.getOrderById(assignment.orderId);
  if (order) {
    emitToUser(order.userId, "delivery:completed", { orderId: assignment.orderId });
    emitToRestaurant(order.restaurantId, "delivery:completed", { orderId: assignment.orderId });
    await notificationService.create(order.userId, "Order Delivered", "Your order has been delivered. Enjoy your meal!");
  }

  return assignment;
}

export async function getMyAssignments(userId: string) {
  const partner = await deliveryRepository.findPartnerByUserId(userId);
  if (!partner) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery partner not found");
  }
  return deliveryRepository.getAssignmentsByPartner(partner.id);
}
