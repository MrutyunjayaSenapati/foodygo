import { relations } from "drizzle-orm";
import { users } from "./schema/users";
import { roles } from "./schema/roles";
import { userRoles } from "./schema/user-roles";
import { addresses } from "./schema/addresses";
import { restaurants } from "./schema/restaurants";
import { restaurantDocuments } from "./schema/restaurant-documents";
import { foodCategories } from "./schema/food-categories";
import { foods } from "./schema/foods";
import { carts } from "./schema/carts";
import { cartItems } from "./schema/cart-items";
import { orders } from "./schema/orders";
import { orderItems } from "./schema/order-items";
import { orderStatusHistory } from "./schema/order-status-history";
import { payments } from "./schema/payments";
import { deliveryPartners } from "./schema/delivery-partners";
import { deliveryAssignments } from "./schema/delivery-assignments";
import { reviews } from "./schema/reviews";
import { favorites } from "./schema/favorites";
import { notifications } from "./schema/notifications";
import { refreshTokens } from "./schema/refresh-tokens";
import { auditLogs } from "./schema/audit-logs";

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
  addresses: many(addresses),
  restaurants: many(restaurants),
  orders: many(orders),
  carts: many(carts),
  reviews: many(reviews),
  favorites: many(favorites),
  notifications: many(notifications),
  deliveryPartners: many(deliveryPartners),
  refreshTokens: many(refreshTokens),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  owner: one(users, { fields: [restaurants.ownerUserId], references: [users.id] }),
  documents: many(restaurantDocuments),
  foodCategories: many(foodCategories),
  foods: many(foods),
  orders: many(orders),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const restaurantDocumentsRelations = relations(restaurantDocuments, ({ one }) => ({
  restaurant: one(restaurants, { fields: [restaurantDocuments.restaurantId], references: [restaurants.id] }),
}));

export const foodCategoriesRelations = relations(foodCategories, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [foodCategories.restaurantId], references: [restaurants.id] }),
  foods: many(foods),
}));

export const foodsRelations = relations(foods, ({ one, many }) => ({
  restaurant: one(restaurants, { fields: [foods.restaurantId], references: [restaurants.id] }),
  category: one(foodCategories, { fields: [foods.categoryId], references: [foodCategories.id] }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  food: one(foods, { fields: [cartItems.foodId], references: [foods.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [orders.restaurantId], references: [restaurants.id] }),
  address: one(addresses, { fields: [orders.addressId], references: [addresses.id] }),
  orderItems: many(orderItems),
  statusHistory: many(orderStatusHistory),
  payments: many(payments),
  deliveryAssignments: many(deliveryAssignments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  food: one(foods, { fields: [orderItems.foodId], references: [foods.id] }),
}));

export const orderStatusHistoryRelations = relations(orderStatusHistory, ({ one }) => ({
  order: one(orders, { fields: [orderStatusHistory.orderId], references: [orders.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

export const deliveryPartnersRelations = relations(deliveryPartners, ({ one, many }) => ({
  user: one(users, { fields: [deliveryPartners.userId], references: [users.id] }),
  assignments: many(deliveryAssignments),
}));

export const deliveryAssignmentsRelations = relations(deliveryAssignments, ({ one }) => ({
  order: one(orders, { fields: [deliveryAssignments.orderId], references: [orders.id] }),
  deliveryPartner: one(deliveryPartners, { fields: [deliveryAssignments.deliveryPartnerId], references: [deliveryPartners.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [reviews.restaurantId], references: [restaurants.id] }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  restaurant: one(restaurants, { fields: [favorites.restaurantId], references: [restaurants.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, { fields: [refreshTokens.userId], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
