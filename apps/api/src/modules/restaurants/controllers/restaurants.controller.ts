import type { Request, Response } from "express";
import crypto from "node:crypto";
import * as restaurantService from "../services/restaurants.service";
import { sendSuccess, sendPaginated } from "../../../utils/response";

export const getRestaurant = async (req: Request, res: Response) => {
  const result = await restaurantService.getRestaurant(String(req.params.id));
  sendSuccess(res, result);
};

export const createRestaurant = async (req: Request, res: Response) => {
  const result = await restaurantService.createRestaurant(req.user!.userId, req.body);
  sendSuccess(res, result, 201);
};

export const updateRestaurant = async (req: Request, res: Response) => {
  const result = await restaurantService.updateRestaurant(String(req.params.id), req.user!.userId, req.body);
  sendSuccess(res, result);
};

export const deleteRestaurant = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (req.user!.roles.includes("ADMIN")) {
    const result = await restaurantService.adminDeleteRestaurant(id);
    sendSuccess(res, result);
  } else {
    const result = await restaurantService.deleteRestaurant(id, req.user!.userId);
    sendSuccess(res, result);
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const result = await restaurantService.updateRestaurantStatus(String(req.params.id), req.body.status);
  sendSuccess(res, result);
};

export const listRestaurants = async (req: Request, res: Response) => {
  const result = await restaurantService.listRestaurants({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string,
    ratingMin: req.query.ratingMin ? Number(req.query.ratingMin) : undefined,
    ratingMax: req.query.ratingMax ? Number(req.query.ratingMax) : undefined,
    priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
    priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
  });
  sendPaginated(res, result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
};

export const adminListRestaurants = async (req: Request, res: Response) => {
  const result = await restaurantService.adminListRestaurants({
    page: Number(req.query.page) || 1,
    pageSize: Number(req.query.pageSize) || 10,
    search: req.query.search as string,
    status: req.query.status as string,
  });
  sendPaginated(res, result.data, {
    page: result.page,
    pageSize: result.pageSize,
    total: result.total,
  });
};

export const getMyRestaurants = async (req: Request, res: Response) => {
  const { findByOwnerId } = await import("../repositories/restaurants.repository");
  const result = await findByOwnerId(req.user!.userId);
  sendSuccess(res, result);
};

export const getDocuments = async (req: Request, res: Response) => {
  const result = await restaurantService.getDocuments(String(req.params.id));
  sendSuccess(res, result);
};

export const uploadDocument = async (req: Request, res: Response) => {
  let documentUrl = req.body.documentUrl;
  if (req.file) {
    if (process.env.VERCEL) {
      const { uploadToCloudinary } = await import("../../../lib/cloudinary");
      const ext = req.file.originalname.split(".").pop() ?? "jpg";
      const url = await uploadToCloudinary(
        req.file.buffer,
        `${crypto.randomUUID()}.${ext}`,
      );
      documentUrl = url;
    } else {
      documentUrl = `/uploads/restaurants/${req.file.filename}`;
    }
  }
  const result = await restaurantService.uploadDocument(
    String(req.params.id),
    req.user!.userId,
    { documentType: req.body.documentType, documentUrl },
  );
  sendSuccess(res, result, 201);
};

export const verifyDocument = async (req: Request, res: Response) => {
  const result = await restaurantService.verifyDocument(
    String(req.params.documentId),
    req.user!.userId,
    req.body,
  );
  sendSuccess(res, result);
};

export const deleteDocument = async (req: Request, res: Response) => {
  const result = await restaurantService.deleteDocument(String(req.params.documentId), req.user!.userId);
  sendSuccess(res, result);
};
