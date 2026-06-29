import { Router } from "express";
import { API_PREFIX } from "@foodygo/shared-constants";
import authRoutes from "../modules/auth/routes/auth.routes";
import usersRoutes from "../modules/users/routes/users.routes";
import restaurantsRoutes from "../modules/restaurants/routes/restaurants.routes";
import foodsRoutes from "../modules/foods/routes/foods.routes";
import cartRoutes from "../modules/cart/routes/cart.routes";
import ordersRoutes from "../modules/orders/routes/orders.routes";
import paymentsRoutes from "../modules/payments/routes/payments.routes";
import deliveryRoutes from "../modules/delivery/routes/delivery.routes";
import reviewsRoutes from "../modules/reviews/routes/reviews.routes";
import addressesRoutes from "../modules/addresses/routes/addresses.routes";
import notificationsRoutes from "../modules/notifications/routes/notifications.routes";
import couponsRoutes from "../modules/coupons/routes/coupons.routes";
import favoritesRoutes from "../modules/favorites/routes/favorites.routes";
import recommendationsRoutes from "../modules/recommendations/routes/recommendations.routes";
import analyticsRoutes from "../modules/analytics/routes/analytics.routes";

const router: Router = Router();

router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, usersRoutes);
router.use(`${API_PREFIX}/restaurants`, restaurantsRoutes);
router.use(`${API_PREFIX}/foods`, foodsRoutes);
router.use(`${API_PREFIX}/cart`, cartRoutes);
router.use(`${API_PREFIX}/orders`, ordersRoutes);
router.use(`${API_PREFIX}/payments`, paymentsRoutes);
router.use(`${API_PREFIX}/delivery`, deliveryRoutes);
router.use(`${API_PREFIX}/reviews`, reviewsRoutes);
router.use(`${API_PREFIX}/addresses`, addressesRoutes);
router.use(`${API_PREFIX}/notifications`, notificationsRoutes);
router.use(`${API_PREFIX}/coupons`, couponsRoutes);
router.use(`${API_PREFIX}/favorites`, favoritesRoutes);
router.use(`${API_PREFIX}/recommendations`, recommendationsRoutes);
router.use(`${API_PREFIX}/analytics`, analyticsRoutes);

export default router;
