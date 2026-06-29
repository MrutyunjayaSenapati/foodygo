import { Role } from "@foodygo/shared-types";

export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [Role.CUSTOMER]: "Customer",
  [Role.RESTAURANT_OWNER]: "Restaurant Owner",
  [Role.DELIVERY_PARTNER]: "Delivery Partner",
  [Role.ADMIN]: "Admin",
};

export const ALL_ROLES: Role[] = [
  Role.CUSTOMER,
  Role.RESTAURANT_OWNER,
  Role.DELIVERY_PARTNER,
  Role.ADMIN,
];
