import * as couponRepository from "../repositories/coupons.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";

export async function list() {
  return couponRepository.findAll();
}

export async function create(dto: {
  code: string;
  discountType: string;
  discountValue: number;
  expiryDate: Date;
}) {
  const existing = await couponRepository.findByCode(dto.code);
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, "Coupon code already exists");
  }
  return couponRepository.create({
    code: dto.code,
    discountType: dto.discountType,
    discountValue: dto.discountValue.toString(),
    expiryDate: dto.expiryDate,
  });
}

export async function update(
  id: string,
  dto: {
    code?: string;
    discountType?: string;
    discountValue?: number;
    expiryDate?: Date;
  },
) {
  const coupon = await couponRepository.findById(id);
  if (!coupon) {
    throw new AppError(ErrorCode.NOT_FOUND, "Coupon not found");
  }
  const data: Record<string, unknown> = {};
  if (dto.code !== undefined) data.code = dto.code;
  if (dto.discountType !== undefined) data.discountType = dto.discountType;
  if (dto.discountValue !== undefined) data.discountValue = dto.discountValue.toString();
  if (dto.expiryDate !== undefined) data.expiryDate = dto.expiryDate;
  return couponRepository.update(id, data);
}

export async function deleteCoupon(id: string) {
  const coupon = await couponRepository.deleteCoupon(id);
  if (!coupon) {
    throw new AppError(ErrorCode.NOT_FOUND, "Coupon not found");
  }
  return coupon;
}

export async function validate(code: string) {
  const coupon = await couponRepository.validateCode(code);
  if (!coupon) {
    throw new AppError(ErrorCode.NOT_FOUND, "Invalid or expired coupon");
  }
  return coupon;
}
