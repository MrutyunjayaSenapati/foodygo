import * as restaurantRepository from "../repositories/restaurants.repository";
import * as documentRepository from "../repositories/restaurant-documents.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { CreateRestaurantDTO, UpdateRestaurantDTO } from "@foodygo/shared-types";

export async function getRestaurant(id: string) {
  const restaurant = await restaurantRepository.findById(id);
  if (!restaurant) {
    throw new AppError(ErrorCode.NOT_FOUND, "Restaurant not found");
  }
  return restaurant;
}

export async function createRestaurant(ownerUserId: string, dto: CreateRestaurantDTO) {
  return restaurantRepository.create(ownerUserId, dto);
}

export async function updateRestaurant(id: string, ownerUserId: string, dto: UpdateRestaurantDTO) {
  const restaurant = await restaurantRepository.update(id, ownerUserId, dto);
  if (!restaurant) {
    throw new AppError(ErrorCode.NOT_FOUND, "Restaurant not found or not owned by you");
  }
  return restaurant;
}

export async function deleteRestaurant(id: string, ownerUserId: string) {
  const restaurant = await restaurantRepository.softDelete(id, ownerUserId);
  if (!restaurant) {
    throw new AppError(ErrorCode.NOT_FOUND, "Restaurant not found or not owned by you");
  }
  return restaurant;
}

export async function adminDeleteRestaurant(id: string) {
  const restaurant = await restaurantRepository.adminDelete(id);
  if (!restaurant) {
    throw new AppError(ErrorCode.NOT_FOUND, "Restaurant not found");
  }
  return restaurant;
}

export async function updateRestaurantStatus(id: string, status: string) {
  const restaurant = await restaurantRepository.updateStatus(id, status);
  if (!restaurant) {
    throw new AppError(ErrorCode.NOT_FOUND, "Restaurant not found");
  }
  return restaurant;
}

export async function listRestaurants(params: {
  page: number;
  pageSize: number;
  search?: string;
  ratingMin?: number;
  ratingMax?: number;
  priceMin?: number;
  priceMax?: number;
}) {
  return restaurantRepository.list(params);
}

export async function adminListRestaurants(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  return restaurantRepository.adminList(params);
}

export async function getDocuments(restaurantId: string) {
  const restaurant = await restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new AppError(ErrorCode.NOT_FOUND, "Restaurant not found");
  }
  return documentRepository.findByRestaurant(restaurantId);
}

export async function uploadDocument(
  restaurantId: string,
  ownerUserId: string,
  data: { documentType: string; documentUrl: string },
) {
  const restaurant = await restaurantRepository.findById(restaurantId);
  if (!restaurant) {
    throw new AppError(ErrorCode.NOT_FOUND, "Restaurant not found");
  }
  if (restaurant.ownerUserId !== ownerUserId) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not own this restaurant");
  }
  return documentRepository.create(restaurantId, data);
}

export async function verifyDocument(
  documentId: string,
  verifiedBy: string,
  data: { verificationStatus: string; remarks?: string },
) {
  const document = await documentRepository.findById(documentId);
  if (!document) {
    throw new AppError(ErrorCode.NOT_FOUND, "Document not found");
  }
  return documentRepository.updateVerificationStatus(
    documentId,
    data.verificationStatus,
    verifiedBy,
    data.remarks,
  );
}

export async function deleteDocument(documentId: string, ownerUserId: string) {
  const document = await documentRepository.findById(documentId);
  if (!document) {
    throw new AppError(ErrorCode.NOT_FOUND, "Document not found");
  }
  const restaurant = await restaurantRepository.findById(document.restaurantId);
  if (!restaurant || restaurant.ownerUserId !== ownerUserId) {
    throw new AppError(ErrorCode.FORBIDDEN, "You do not own this restaurant");
  }
  return documentRepository.remove(documentId);
}
