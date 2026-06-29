import * as addressRepository from "../repositories/addresses.repository";
import { AppError } from "../../../utils/errors";
import { ErrorCode } from "@foodygo/shared-constants";
import type { CreateAddressDTO } from "@foodygo/shared-types";

export async function create(userId: string, dto: CreateAddressDTO) {
  return addressRepository.create(userId, dto);
}

export async function update(id: string, userId: string, dto: Partial<CreateAddressDTO>) {
  const address = await addressRepository.update(id, userId, dto);
  if (!address) {
    throw new AppError(ErrorCode.NOT_FOUND, "Address not found");
  }
  return address;
}

export async function deleteAddress(id: string, userId: string) {
  const address = await addressRepository.softDelete(id, userId);
  if (!address) {
    throw new AppError(ErrorCode.NOT_FOUND, "Address not found");
  }
  return address;
}

export async function getById(id: string, userId: string) {
  const address = await addressRepository.findById(id, userId);
  if (!address) {
    throw new AppError(ErrorCode.NOT_FOUND, "Address not found");
  }
  return address;
}

export async function getByUser(userId: string) {
  return addressRepository.findByUserId(userId);
}
