import type { RestaurantStatus, VerificationStatus } from "../enums";

export interface Restaurant {
  id: string;
  ownerUserId: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  status: RestaurantStatus;
  deletedAt: Date | null;
}

export interface RestaurantDocument {
  id: string;
  restaurantId: string;
  documentType: string;
  documentUrl: string;
  verificationStatus: VerificationStatus;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  remarks: string | null;
}

export interface CreateRestaurantDTO {
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateRestaurantDTO {
  name?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}
