import * as deliveryRepository from "../repositories/delivery.repository";
import * as orderRepository from "../../orders/repositories/orders.repository";
import * as notificationService from "../../notifications/services/notifications.service";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { AcceptDeliveryDTO } from "@foodygo/shared-types";
import { Role } from "@foodygo/shared-types";
import { emitToUser, emitToRestaurant, emitToDeliveryPartner } from "../../../lib/events";
import { db } from "../../../lib/db";
import { userRoles } from "../../../db/schema/user-roles";
import { roles } from "../../../db/schema/roles";
import { users } from "../../../db/schema/users";
import { eq } from "drizzle-orm";

export async function registerPartner(
  userId: string,
  dto: { vehicleType: string; licenseNumber: string },
) {
  const existing = await deliveryRepository.findPartnerByUserId(userId);
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, "Already registered as delivery partner");
  }

  return db.transaction(async (tx) => {
    const partner = await deliveryRepository.createPartner(userId, dto);

    const deliveryRole = await tx
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, Role.DELIVERY_PARTNER))
      .limit(1)
      .then((r) => r[0]);

    if (deliveryRole) {
      await tx.insert(userRoles).values({ userId, roleId: deliveryRole.id });
    }

    const roleNames = await tx
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .then((r) => r.map((row) => row.name));

    const [userData] = await tx
      .select({ id: users.id, email: users.email, fullName: users.fullName, avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData) {
      throw new AppError(ErrorCode.NOT_FOUND, "User not found");
    }

    return { partner, user: userData, roleNames };
  });
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

export async function getMyProfile(userId: string) {
  const partner = await deliveryRepository.getPartnerByUserId(userId);
  if (!partner) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery partner not found");
  }
  return partner;
}

export async function getAvailableDeliveries() {
  return deliveryRepository.getAvailableDeliveriesEnriched();
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

  const existing = await deliveryRepository.getAssignmentByIdSimple(assignmentId);
  if (!existing) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }
  if (existing.status !== "ASSIGNED") {
    throw new AppError(ErrorCode.CONFLICT, "Delivery assignment has already been accepted");
  }

  const assignment = await deliveryRepository.acceptAssignment(assignmentId, partner.id);
  if (!assignment) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }

  emitToDeliveryPartner(partner.id, "delivery:accepted", { orderId: assignment.orderId });

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

  const existing = await deliveryRepository.getAssignmentByIdSimple(assignmentId);
  if (!existing) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }
  if (existing.deliveryPartnerId !== partner.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "This delivery is not assigned to you");
  }

  const assignment = await deliveryRepository.markPickedUp(assignmentId);
  if (!assignment) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }

  emitToDeliveryPartner(partner.id, "delivery:picked-up", { orderId: assignment.orderId });

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

  const existing = await deliveryRepository.getAssignmentByIdSimple(assignmentId);
  if (!existing) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }
  if (existing.deliveryPartnerId !== partner.id) {
    throw new AppError(ErrorCode.FORBIDDEN, "This delivery is not assigned to you");
  }

  const assignment = await deliveryRepository.markCompleted(assignmentId);
  if (!assignment) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }

  emitToDeliveryPartner(partner.id, "delivery:completed", { orderId: assignment.orderId });

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

export async function getAssignmentById(assignmentId: string, userId: string) {
  const partner = await deliveryRepository.findPartnerByUserId(userId);
  if (!partner) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery partner not found");
  }

  const detail = await deliveryRepository.getAssignmentById(assignmentId);
  if (!detail) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery assignment not found");
  }

  return detail;
}

export async function getDeliveryByOrder(orderId: string) {
  const assignment = await deliveryRepository.getAssignmentByOrderId(orderId);
  if (!assignment) return null;

  const partner = assignment.deliveryPartnerId
    ? await deliveryRepository.getPartnerById(assignment.deliveryPartnerId)
    : null;

  return { assignment, partner };
}

export async function getMyStats(userId: string) {
  const partner = await deliveryRepository.findPartnerByUserId(userId);
  if (!partner) {
    throw new AppError(ErrorCode.NOT_FOUND, "Delivery partner not found");
  }
  return deliveryRepository.getMyStats(partner.id);
}

export async function listPartners(params: { page: number; pageSize: number }) {
  return deliveryRepository.listPartners(params);
}

export async function listAssignments(params: { page: number; pageSize: number }) {
  return deliveryRepository.listAssignments(params);
}
