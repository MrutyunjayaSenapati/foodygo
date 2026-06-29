# FoodyGo — Complete Project Plan
> Version: 0.2 — Last updated: 2026-06-27

## Legend

- `[ ]` Not started
- `[x]` Completed
- `[~]` In progress
- `[!]` Blocked

---

## Definition of Done

A phase is complete only when:

- ✓ Feature implemented
- ✓ Lint passes
- ✓ Type check passes
- ✓ Build passes
- ✓ Manual validation completed
- ✓ Documentation updated
- ✓ Commit created

---

## API Versioning

- **Current**: `/api/v1` — All current endpoints
- **Future**: `/api/v2` — When breaking changes are required

**Rules**:
- Never introduce breaking changes inside v1.
- Deprecate v1 endpoints before removing them.
- Maintain backward compatibility within the same major version.

---

## Project Milestones

| Milestone | Phases | Description |
|-----------|--------|-------------|
| **M1 — Foundation** | Phase A, Phase 0A, Phase 0B, Phase 0C | Monorepo, database, infrastructure, auth |
| **M2 — Core Platform** | B4 (Users), B5 (Restaurants), B6 (Foods) | Core entity CRUD |
| **M3 — Ordering** | B7 (Cart), B8 (Orders), B9 (Payments), B10 (Delivery) | Transactional pipeline |
| **M4 — Customer Experience** | B11 (Reviews), B12 (Notifications), B13 (Recommendations), B14 (Analytics) | Engagement & insights |
| **M5 — Applications** | D (Customer), E (Delivery), F (Restaurant), G (Admin) | Client applications |
| **M6 — Production** | H (Docker, CI/CD, Polish) | Deployment readiness |

---

## Acceptance Criteria

All phases share this baseline criteria set. Phase-specific criteria are listed with the phase.

| Criterion | Description |
|-----------|-------------|
| Feature implemented | All planned routes and business logic are coded |
| Build passes | `pnpm build` succeeds with no errors |
| Type check passes | `pnpm check-types` succeeds with no errors |
| Lint passes | `pnpm lint` succeeds with no warnings |
| Documentation updated | Relevant docs (DATABASE.md, API.md, ARCHITECTURE.md) reflect changes |
| Commit created | Clean, conventional commit with descriptive message |

---

## Phase A — Monorepo Foundation

> **Status**: ✅ ALL DONE
> **Size**: Medium

### A1 — Cleanup
- `[x]` Remove boilerplate `apps/web`
- `[x]` Remove boilerplate `apps/docs`

### A2 — Rename packages to `@foodygo/*`
- `[x]` `@repo/eslint-config` → `@foodygo/eslint-config`
- `[x]` `@repo/typescript-config` → `@foodygo/typescript-config`
- `[x]` `@repo/ui` → `@foodygo/ui`
- `[x]` Update all cross-references across the monorepo

### A3 — TypeScript config presets
- `[x]` `packages/typescript-config/express.json` — Node/Express preset
- `[x]` `packages/typescript-config/expo.json` — Expo/React Native preset

### A4 — Shared packages (scaffolding)
- `[x]` `@foodygo/shared-types` — exports `./src/index.ts`
- `[x]` `@foodygo/shared-constants` — exports `./src/index.ts`
- `[x]` `@foodygo/shared-utils` — depends on types + constants

### A5 — Apps (scaffolding)
- `[x]` `@foodygo/api` — Express entry point + health check
- `[x]` `@foodygo/customer-app` — Expo SDK 53 + Router + Slot layout
- `[x]` `@foodygo/delivery-app` — Expo SDK 53 + Router + Slot layout
- `[x]` `@foodygo/restaurant-dashboard` — Next.js App Router
- `[x]` `@foodygo/admin-dashboard` — Next.js App Router

### A6 — Root config
- `[x]` `pnpm-workspace.yaml` — covers `apps/*` and `packages/*`
- `[x]` `turbo.json` — build, lint, check-types, dev tasks
- `[x]` `.npmrc` — `auto-install-peers=true`
- `[x]` Build verified — 8/8 tasks pass
- `[x]` Lint verified — 9/9 tasks pass

---

## Phase 0A — Database Foundation

> **Status**: ✅ ALL DONE
> **Size**: Large

### 0A1 — pgEnum definitions
- `[x]` 8 enums: user_status, restaurant_status, order_status, payment_status, discount_type, vehicle_type, delivery_assignment_status, verification_status

### 0A2 — New tables
- `[x]` `refresh_tokens` — device-aware token management with revocation
- `[x]` `audit_logs` — admin action logging

### 0A3 — Schema fixes (22 tables)
- `[x]` All varchar timestamps → `timestamp().defaultNow().notNull()`
- `[x]` All varchar status columns → pgEnum references
- `[x]` NOT NULL constraints on FK columns and required fields
- `[x]` Unique constraints on favorites(user_id, restaurant_id) + reviews(user_id, restaurant_id)
- `[x]` Removed refreshTokenHash from users table
- `[x]` Selective soft deletes (deleted_at / is_deleted)

### 0A4 — Expanded tables
- `[x]` `orders` — full pricing breakdown (subtotal, discount, packing_fee, etc.)
- `[x]` `restaurants` — is_active → restaurant_status enum
- `[x]` `restaurant_documents` — document verification workflow
- `[x]` `delivery_assignments` — status enum + timeline timestamps

### 0A5 — Indexes
- `[x]` 21 indexes across tables (inline in Drizzle schema)

### 0A6 — Relations
- `[x]` Updated `db/relations.ts` for refresh_tokens + audit_logs

### 0A7 — Migration
- `[x]` Generated `0000_talented_mephistopheles.sql` (263 lines)

### 0A8 — Seed script
- `[x]` `db/seed.ts` — inserts 4 roles (CUSTOMER, RESTAURANT_OWNER, DELIVERY_PARTNER, ADMIN)

### 0A9 — Shared packages
- `[x]` `shared-types`: new RestaurantStatus enum, RefreshToken + AuditLog types, updated Order/Restaurant/DeliveryAssignment types
- `[x]` `shared-constants`: granular cache TTL constants

**Acceptance Criteria**:
- ✓ All 22 tables defined as Drizzle schemas
- ✓ 8 pgEnum definitions (including verification_status)
- ✓ 21 indexes across tables
- ✓ Relations defined for all tables
- ✓ Migration generates without errors
- ✓ Seed script inserts 4 roles
- ✓ `pnpm check-types` passes
- ✓ `pnpm lint` passes
- ✓ `pnpm build` passes
- ✓ DATABASE.md, ARCHITECTURE.md, API.md, ADR.md updated

---

## Phase 0B — Infrastructure (`apps/api`)

> **Status**: ✅ ALL DONE
> **Size**: Medium

- `[x]` Redis error handling + reconnect strategy
- `[x]` Cache utilities (`lib/cache.ts`) with TTL constants
- `[x]` Replace console.log with Pino in socket.ts
- `[x]` Health check at `/api/v1/health` (keep `/health` for infra)
- `[x]` Rate limiter exclude health endpoint
- `[x]` Implement `@foodygo/shared-utils` (api-client, formatting, validation, storage)

**Acceptance Criteria**:
- ✓ Redis reconnects gracefully on connection loss
- ✓ Cache utilities use TTL constants from shared-constants
- ✓ Socket.IO uses Pino instead of console.log
- ✓ Health check responds at both `/health` and `/api/v1/health`
- ✓ Rate limiter excludes health endpoint
- ✓ `@foodygo/shared-utils` implemented with api-client, formatting, validation, storage utilities
- ✓ `pnpm check-types` passes
- ✓ `pnpm lint` passes
- ✓ `pnpm build` passes
- ✓ Documentation updated

---

## Phase 0C — Auth Refactor (`apps/api`)

> **Status**: ✅ ALL DONE
> **Size**: Small

- `[x]` Create `refresh-token.repository.ts` (multi-device refresh tokens)
- `[x]` Create `role.repository.ts` (role lookups)
- `[x]` Wire Google OAuth — types, validator, service, controller, route all done
- `[x]` Add asyncHandler wrapper to eliminate try/catch boilerplate
- `[x]` Use sendSuccess() consistently across all controllers

**Acceptance Criteria**:
- ✓ Refresh tokens stored and verified against `refresh_tokens` table
- ✓ Role lookups extracted to `role.repository.ts`
- ✓ Google OAuth login flow works end-to-end
- ✓ All controllers use `asyncHandler` wrapper
- ✓ All controllers use `sendSuccess()` helper
- ✓ `pnpm check-types` passes
- ✓ `pnpm lint` passes
- ✓ `pnpm build` passes
- ✓ Documentation updated

---

## Phase B — Backend API (`apps/api`)

### B1 — Express Application Foundation ✓

> **Size**: Medium

**Status**: ✅ DONE (with Phase 0A updates)

**Key files**:
| File | Status |
|------|--------|
| `src/lib/env.ts` | ✅ Zod-validated env vars |
| `src/lib/logger.ts` | ✅ Pino logger |
| `src/lib/db.ts` | ✅ Drizzle client |
| `src/lib/redis.ts` | ✅ Basic (needs error handling — Phase 0B) |
| `src/lib/socket.ts` | ✅ Basic (needs Pino — Phase 0B) |
| `src/middleware/auth.ts` | ✅ JWT authentication |
| `src/middleware/rbac.ts` | ✅ Role-based access |
| `src/middleware/validate.ts` | ✅ Zod validation |
| `src/middleware/error-handler.ts` | ✅ Centralized error handler |
| `src/middleware/rate-limiter.ts` | ✅ Rate limiting |
| `src/utils/response.ts` | ✅ Response helpers |
| `src/utils/errors.ts` | ✅ AppError class |
| `src/app.ts` | ✅ Express assembly |
| `src/index.ts` | ✅ Server entry |

---

### B2 — Database Schema ✓

> **Size**: Large

**Status**: ✅ DONE (expanded in Phase 0A)

**Goal**: Define all tables as Drizzle schema files, create relations, run migrations.

**Current state**:

- 22 tables defined (`apps/api/src/db/schema/*.ts`)
- 8 Drizzle pgEnum definitions (`apps/api/src/db/enums.ts`)
- Relations defined (`apps/api/src/db/relations.ts`)
- 21 indexes across tables
- Initial migration generated (`apps/api/src/db/migrations/0000_talented_mephistopheles.sql`)
- Seed script created (`apps/api/src/db/seed.ts`)

See `docs/DATABASE.md` for the complete schema reference.

---

### B3 — Auth Module ✓

> **Size**: Medium

**Status**: ✅ DONE (all auth features implemented end-to-end)

**Implemented**:
- Register (Argon2 hash, CUSTOMER role assignment, JWT generation)
- Login (credential verification, token generation)
- Google OAuth (ID token verification via google-auth-library, auto-create user)
- Refresh (token rotation with SHA-256 hashing, stored in refresh_tokens table)
- Logout (token revocation via refresh-token.repository.ts)
- GET /me (current user profile, uses AppError)
- asyncHandler wrapper applied to all controllers
- sendSuccess() helper used consistently

**Files**:
```
src/modules/auth/
  types.ts             — RegisterDTO, LoginDTO, GoogleLoginDTO, TokenPair, AuthResponse
  validators.ts         — Zod schemas for register, login, google login, refresh
  repositories/
    auth.repository.ts       — findByEmail, createUser, findById
    role.repository.ts       — getRoleNames, findRoleIdByName
    refresh-token.repository.ts — create, findByHash, revoke, cleanup
  services/
    auth.service.ts     — register, login, googleLogin, refresh, logout
  controllers/
    auth.controller.ts  — thin handlers (asyncHandler-wrapped)
  routes/
    auth.routes.ts      — POST /register, /login, /google, /refresh, /logout; GET /me
```

---

### B4 — Users Module (`src/modules/users/`)

> **Status**: ✅ DONE
> **Size**: Small

**Files**:
```
src/modules/users/
  types.ts
  validators.ts
  repositories/users.repository.ts
  services/users.service.ts
  controllers/users.controller.ts
  routes/users.routes.ts
```

**Routes**:
- `GET /users/:id` — Get user profile (own or admin)
- `PATCH /users/:id` — Update profile (own) or status (admin only)
- `GET /users` — Admin: list users with pagination & filters

**Acceptance Criteria**:
- ✓ Profile CRUD operations work with proper role gating
- ✓ User status updates via admin are audited
- ✓ Soft-deleted users are excluded from queries

---

### B5 — Restaurants Module (`src/modules/restaurants/`)

> **Status**: ✅ DONE (including document verification, price filters)
> **Size**: Large

**Files**:
```
src/modules/restaurants/
  types.ts
  validators.ts
  repositories/restaurants.repository.ts
  services/restaurants.service.ts
  controllers/restaurants.controller.ts
  routes/restaurants.routes.ts
```

**Routes**:
- `GET /restaurants` — Public: list with filters (rating, cuisine, price range, search)
- `GET /restaurants/:id` — Public: detail with categories & foods
- `POST /restaurants` — Restaurant owner: create
- `PATCH /restaurants/:id` — Owner: update; Admin: approve/suspend
- `DELETE /restaurants/:id` — Owner or admin

**Filters**: rating min/max, delivery time (distance-based), cuisine (category filter), price range, search by name, pagination

**Acceptance Criteria**:
- ✓ Public listing with all filters works
- ✓ Restaurant onboarding flow (PENDING → DOCUMENT_VERIFICATION → APPROVED) works
- ✓ Document upload and verification flow works
- ✓ Owner can manage their restaurants
- ✓ Admin can approve/suspend restaurants
- ✓ Soft-deleted restaurants do not appear in listings

---

### B6 — Foods Module (`src/modules/foods/`)

> **Status**: ✅ DONE
> **Size**: Medium

**Files**:
```
src/modules/foods/
  types.ts
  validators.ts
  repositories/foods.repository.ts
  services/foods.service.ts
  controllers/foods.controller.ts
  routes/foods.routes.ts
```

**Routes**:
- `GET /foods` — Public: search across all restaurants
- `GET /foods/:id` — Public: detail
- `POST /foods` — Restaurant owner: create
- `PATCH /foods/:id` — Owner: update, toggle availability
- `DELETE /foods/:id` — Owner

**Food categories** managed under restaurants: `POST /restaurants/:id/categories` etc.

**Acceptance Criteria**:
- ✓ Public food search and detail work
- ✓ Category CRUD works under restaurant scope
- ✓ Owner can manage their foods
- ✓ Unavailable foods are excluded from public queries
- ✓ Soft-deleted foods do not appear

---

### B7 — Cart Module (`src/modules/cart/`)

> **Status**: ✅ DONE
> **Size**: Medium

**Files**:
```
src/modules/cart/
  types.ts
  validators.ts
  repositories/cart.repository.ts
  services/cart.service.ts
  controllers/cart.controller.ts
  routes/cart.routes.ts
```

**Routes**:
- `GET /cart` — Get current user's cart with items + totals
- `POST /cart/items` — Add item (creates cart if needed)
- `PATCH /cart/items/:id` — Update quantity
- `DELETE /cart/items/:id` — Remove item

**Rules**:
- One cart per user
- Cart items from different restaurants: either block or clear previous
- Calculate subtotal, delivery fee, tax, total on every mutation

**Acceptance Criteria**:
- ✓ Cart CRUD operations work for authenticated customers
- ✓ Single-restaurant cart enforcement works
- ✓ Price calculations are accurate
- ✓ Cart auto-creates on first item add

---

### B8 — Orders Module (`src/modules/orders/`)

> **Status**: ✅ DONE (including OrderStateMachine, Socket.IO events, notifications)
> **Size**: Large

**Files**:
```
src/modules/orders/
  types.ts
  validators.ts
  repositories/orders.repository.ts
  services/orders.service.ts
  controllers/orders.controller.ts
  routes/orders.routes.ts
  domain/
    OrderStateMachine.ts    — Pure domain: transition validation
```

**Routes**:
- `POST /orders` — Create order from cart (must have address, payment)
- `GET /orders` — List user's orders (customer: own; restaurant: incoming; delivery: available)
- `GET /orders/:id` — Detail with items + status history
- `PATCH /orders/:id/status` — Update status (role-gated)

**Order lifecycle** (from ORDER_FLOW.md):
```
PENDING → RESTAURANT_ACCEPTED → PREPARING → READY_FOR_PICKUP → PICKED_UP → OUT_FOR_DELIVERY → DELIVERED
      ↘ CANCELLED (only from PENDING or RESTAURANT_ACCEPTED)
```

**Rules**:
- Every status transition appends to `order_status_history` (never overwrite)
- Validate transition is allowed from current status
- Cancellation only from PENDING or RESTAURANT_ACCEPTED
- Emit Socket.IO event on every transition
- Send push notification on key transitions (PENDING, RESTAURANT_ACCEPTED, PREPARING, OUT_FOR_DELIVERY, DELIVERED)

**Transaction Boundary — Create Order**:
```
  1. Create order record
  2. Create order_items from cart items (snapshot prices)
  3. Clear the cart
  4. Create initial order_status_history entry
  5. Create payment record (UNPAID)
  → COMMIT
  → On failure: ROLLBACK (no partial orders)
```

**Transaction Boundary — Status Change**:
```
  1. Validate transition via OrderStateMachine
  2. Update order.status
  3. Append to order_status_history
  4. Emit Socket.IO event
  5. Create notification record
  → COMMIT
```

**Acceptance Criteria**:
- ✓ Order creation within transaction (cart cleared only on success)
- ✓ Status transitions validated by OrderStateMachine
- ✓ Cancellation rules enforced
- ✓ Socket.IO events emitted on transitions
- ✓ Order history is append-only
- ✓ Price snapshots are immutable after creation

---

### B9 — Payments Module (`src/modules/payments/`)

> **Status**: ✅ DONE (including HMAC webhook verification, transactional updates)
> **Size**: Medium

**Files**:
```
src/modules/payments/
  types.ts
  validators.ts
  repositories/payments.repository.ts
  services/payments.service.ts
  controllers/payments.controller.ts
  routes/payments.routes.ts
```

**Routes**:
- `POST /payments/create-order` — Create Razorpay order
- `POST /payments/webhook` — Razorpay webhook (no auth, verify signature)

**Rules**:
- Never trust frontend payment success
- Verify Razorpay webhook signature using webhook secret
- Store every payment event in `payments` table
- On successful payment webhook: update order `payment_status` to PAID

**Transaction Boundary — Payment Webhook**:
```
  1. Verify Razorpay webhook signature
  2. Update payment record (status → PAID, razorpay_payment_id)
  3. Update order.payment_status → PAID
  4. Append to order_status_history
  → COMMIT
  → On failure: ROLLBACK (payment remains UNPAID)
```

**Acceptance Criteria**:
- ✓ Razorpay order creation works
- ✓ Webhook signature verification is secure
- ✓ Payment status updates are transactional
- ✓ Duplicate webhook events are idempotent

---

### B10 — Delivery Module (`src/modules/delivery/`)

> **Status**: ✅ DONE
> **Size**: Medium

**Files**:
```
src/modules/delivery/
  types.ts
  validators.ts
  repositories/delivery.repository.ts
  services/delivery.service.ts
  controllers/delivery.controller.ts
  routes/delivery.routes.ts
```

**Routes**:
- `GET /delivery/orders` — Available deliveries (READY_FOR_PICKUP orders)
- `POST /delivery/orders/:id/accept` — Partner accepts assignment
- `PATCH /delivery/orders/:id/status` — PICKED_UP, OUT_FOR_DELIVERY, DELIVERED

**Acceptance Criteria**:
- ✓ Available deliveries listing works for delivery partners
- ✓ Assignment acceptance creates delivery_assignment record
- ✓ Status updates update both delivery_assignment and order
- ✓ Timeline timestamps are recorded correctly

---

### B11 — Reviews Module (`src/modules/reviews/`)

> **Status**: ✅ DONE (delivered-order check, auto rating recalculation)
> **Size**: Small

**Files**:
```
src/modules/reviews/
  types.ts
  validators.ts          — rating 1-5 integer
  repositories/reviews.repository.ts
  services/reviews.service.ts
  controllers/reviews.controller.ts
  routes/reviews.routes.ts
```

**Routes**:
- `POST /reviews` — Customer creates review
- `GET /reviews/:restaurantId` — Public: get reviews for restaurant

**Rules**:
- One review per user per restaurant
- Can only review after order is DELIVERED

**Acceptance Criteria**:
- ✓ Customers can review only DELIVERED orders
- ✓ Unique constraint (one review per user per restaurant) works
- ✓ Restaurant rating recalculates on new review
- ✓ Public listing returns paginated reviews

---

### B12 — Notifications Module (`src/modules/notifications/`)

> **Status**: ✅ DONE (including unread count endpoint, auto-creation on status changes)
> **Size**: Medium

**Files**:
```
src/modules/notifications/
  types.ts
  repositories/notifications.repository.ts
  services/notifications.service.ts    — FCM push + in-app store
  controllers/notifications.controller.ts
  routes/notifications.routes.ts
```

**Routes**:
- `GET /notifications` — List user's notifications
- `PATCH /notifications/:id/read` — Mark as read

**Notification triggers** (from ORDER_FLOW.md):
- PENDING → "Order placed"
- RESTAURANT_ACCEPTED → "Restaurant accepted order"
- PREPARING → "Food is being prepared"
- OUT_FOR_DELIVERY → "Driver is on the way"
- DELIVERED → "Order delivered"

**Acceptance Criteria**:
- ✓ Notifications are created on order status changes
- ✓ FCM push notifications are sent for key events
- ✓ Users can list and mark notifications as read
- ✓ Unread notification count is available

---

### B13 — Recommendations Module (`src/modules/recommendations/`)

> **Status**: ✅ DONE (rule-based scoring engine)
> **Size**: Medium

**Files**:
```
src/modules/recommendations/
  services/recommendations.service.ts
  controllers/recommendations.controller.ts
  routes/recommendations.routes.ts
```

**V1 — Rule-based scoring**:
| Factor | Score |
|--------|-------|
| Cuisine Match (from past orders) | +5 |
| Previously ordered from | +4 |
| Top Rated (rating ≥ 4.5) | +3 |
| Nearby (within 3km) | +2 |
| Trending (high order volume) | +1 |

**Route**: `GET /recommendations` — Returns scored restaurant list for customer

**Acceptance Criteria**:
- ✓ Recommendations return scored, sorted restaurant list
- ✓ Results exclude soft-deleted restaurants
- ✓ Results respect user's past orders for scoring

---

### B14 — Analytics Module (`src/modules/analytics/`)

> **Status**: ✅ DONE (restaurant + admin metrics)
> **Size**: Medium

**Files**:
```
src/modules/analytics/
  services/analytics.service.ts
  controllers/analytics.controller.ts
  routes/analytics.routes.ts
```

**Routes**:
- `GET /analytics/restaurant/:id` — Restaurant dashboard metrics
- `GET /analytics/admin` — Platform-wide metrics

**Metrics**:
- Restaurant: Orders Today, Revenue Today, Revenue This Month, Popular Foods
- Admin: Total Users, Total Orders, Total Revenue, Active Restaurants, Active Delivery Partners

**Acceptance Criteria**:
- ✓ Restaurant metrics return correct aggregated data
- ✓ Admin metrics return correct platform-wide data
- ✓ Metrics are cached with short TTL
- ✓ Data is filtered by authorization scope

---

### B15 — Route Registration

> **Status**: ✅ DONE
> **Size**: Small

**Files**:
```
src/routes/index.ts    — Mount all module routes under /api/v1
```

**Pattern**:
```typescript
router.use("/api/v1/auth", authRoutes);
router.use("/api/v1/users", authMiddleware, userRoutes);
// ... etc
```

**Acceptance Criteria**:
- ✓ All module routes mounted under `/api/v1`
- ✓ Middleware applied consistently (auth, RBAC, validation)
- ✓ No route conflicts

---

---

## Phase 1 — Critical Security Fixes

> **Status**: ✅ ALL DONE
> **Size**: Medium

### 1.1 — Payment webhook verification
- `[x]` HMAC-SHA256 signature verification against `RAZORPAY_WEBHOOK_SECRET`
- `[x]` Ownership check on payment records before updating
- `[x]` Validators with correct types

### 1.2 — Restaurant ownership check on foods
- `[x]` `verifyRestaurantOwnership` guard on food create/update/delete

### 1.3 — DB transaction for order creation
- `[x]` Order creation wrapped in Drizzle transaction (rollback on failure)

### 1.4 — DB transaction for registration + auth fixes
- `[x]` User registration wrapped in transaction
- `[x]` `/me` uses `AppError` (consistent error handling)
- `[x]` `googleLogin` fix with Google auth library integration

---

## Phase 2 — Infrastructure Hardening

> **Status**: ✅ ALL DONE
> **Size**: Medium

### 2.1 — Graceful shutdown
- `[x]` SIGTERM/SIGINT handler: close HTTP server, DB pool, Redis

### 2.2 — Request ID middleware
- `[x]` UUID per request from `x-request-id` header or `crypto.randomUUID()`
- `[x]` Express type augmentation for `req.id`

### 2.3 — HTTP logging with pino-http
- `[x]` `pinoHttp({ logger })` in app.ts

### 2.4 — Gzip compression
- `[x]` `compression()` middleware in app.ts

### 2.5 — .gitignore
- `[x]` `.expo/` added to `apps/api/.gitignore`

### 2.6 — Missing DB indexes
- `[x]` 13 additional indexes across 9 tables (users, restaurants, foods, cart_items, orders, order_items, reviews, notifications, payments)

### 2.7 — Test setup
- `[x]` Vitest v4 installed and configured
- `[x]` First test suite: payment HMAC signature verification (3/3 tests passing)

---

## Phase 3 — Missing Features & Business Logic

> **Status**: ✅ ALL DONE
> **Size**: Large

### 3.1 — Recommendations module (B13)
- `[x]` `GET /api/v1/recommendations` — rule-based scoring engine

### 3.2 — Analytics module (B14)
- `[x]` `GET /api/v1/analytics/restaurant/:id` — restaurant metrics
- `[x]` `GET /api/v1/analytics/admin` — platform metrics

### 3.3 — Socket.IO events wiring
- `[x]` JWT auth middleware (`io.use()`)
- `[x]` Room management (`user:`, `restaurant:`, `delivery:`)
- `[x]` 7 domain events: order created/status/cancelled, delivery accepted/picked-up/completed
- `[x]` Helper functions: `emitToUser`, `emitToRestaurant`, `emitToDeliveryPartner`

### 3.4 — Auto-create notifications on status changes
- `[x]` Notification created in orders service on every status transition
- `[x]` Notification created in delivery service on accept/pickup/complete

### 3.5 — Payment webhook route
- `[x]` `POST /api/v1/payments/webhook` — HMAC verification + transactional update

### 3.6 — Review business logic fixes
- `[x]` Delivered-order check before allowing review
- `[x]` Auto rating recalculation on review create/delete

---

## Phase 4 — Domain + Restaurant Features

> **Status**: ✅ ALL DONE
> **Size**: Medium

### 4.1 — OrderStateMachine domain class
- `[x]` Pure domain class: `canTransitionTo()`, `transitionTo()`, `isCancellable()`
- `[x]` `InvalidTransitionError` with `toErrorCode()` mapping
- `[x]` 13 unit tests covering all transition paths

### 4.2 — Restaurant document verification flow
- `[x]` Document repository (findByRestaurant, create, updateVerificationStatus, findById, remove)
- `[x]` Zod validators (`uploadDocumentSchema`, `verifyDocumentSchema`)
- `[x]` Service methods with ownership checks
- `[x]` Controller handlers and 4 routes (GET/POST docs, PATCH verify, DELETE)

### 4.3 — Cuisine/price range filters
- `[x]` `priceMin`/`priceMax` query params on `GET /api/v1/restaurants`
- `[x]` Filters by cheapest food price per restaurant

### 4.4 — Unread notification count
- `[x]` `GET /api/v1/notifications/unread-count` endpoint

---

## Phase 4.5 — TypeScript Type Fixes

> **Status**: ✅ ALL DONE
> **Size**: Small

- `[x]` Fixed `express.d.ts` module augmentation (script→module to avoid shadowing socket.io types)
- `[x]` Added `rawBody` on `http.IncomingMessage` for `express.json()` verify callback
- `[x]` All checks pass: `pnpm check-types`, `pnpm build`, `pnpm lint`, `pnpm test`

---

## Phase 5 — Cleanup & Polish

> **Status**: ✅ ALL DONE
> **Size**: Medium

### 5.1 — File upload with multer
- `[x]` Installed `multer` + `@types/multer`
- `[x]` Created `src/middleware/upload.ts` — disk storage, file filter (jpg/jpeg/png/pdf), 5MB limit
- `[x]` Updated restaurant document route to accept multipart upload
- `[x]` Added `express.static("/uploads")` for serving uploaded files
- `[x]` Uploads directory auto-created on first use

### 5.2 — FCM push notifications
- `[x]` Installed `firebase-admin` 14.1.0
- `[x]` Created `src/lib/fcm.ts` — `sendPushNotification`, `sendPushNotificationToUser`
- `[x]` Added `FCM_SERVICE_ACCOUNT_PATH` to env config (optional)
- `[x]` Added `fcmToken` column to users schema
- `[x]` Created `PATCH /users/fcm-token` endpoint for clients to register their device token
- `[x]` Integrated FCM push into notification creation (fire-and-forget, gracefully skips if unconfigured)

### 5.3 — OpenAPI docs coverage
- `[x]` Added docs for: `/api/v1/recommendations`, `/api/v1/analytics/*`, `/api/v1/payments/webhook`, `/api/v1/restaurants/:id/documents`, `/api/v1/restaurants/documents/:documentId/verify`, `/api/v1/notifications/unread-count`
- `[x]` Added `VerifyDocumentDTO` schema

### 5.4 — Integration/E2E tests
- `[x]` Installed `supertest` + `@types/supertest`
- `[x]` Auth integration: register validation, login, refresh, me (5 tests)
- `[x]` Orders integration: auth guards, listing, detail, status update (5 tests)
- `[x]` Payments integration: auth guard, HMAC verification, tamper detection (3 tests)
- `[x]` Recommendations integration: auth guard, scoring response, role handling (3 tests)
- `[x]` Total: 32 tests across 6 files (16 unit + 16 integration)

---

## Phase 5.5 — Health endpoint verification

> **Status**: ✅ Already existed
> **Size**: Trivial

- `[x]` `/api/v1/health` already registered in `app.ts`
- `[x]` Rate limiter already exempts both `/health` and `/api/v1/health`

---

## Phase C — Shared Packages (Business Logic)

### C1 — `@foodygo/shared-types` ✓

> **Size**: Medium

**Goal**: Define all TypeScript types, interfaces, and enums used across apps.

**Files**:
```
packages/shared-types/src/
  index.ts                  — Re-export all
  types/
    user.ts                 — User, CreateUserDTO, UpdateUserDTO
    auth.ts                 — RegisterDTO, LoginDTO, GoogleLoginDTO, TokenPair, AuthResponse
    restaurant.ts           — Restaurant, CreateRestaurantDTO, UpdateRestaurantDTO
    food.ts                 — Food, FoodCategory, CreateFoodDTO
    cart.ts                 — Cart, CartItem, AddCartItemDTO, UpdateCartItemDTO
    order.ts                — Order, OrderItem, CreateOrderDTO, OrderStatusHistory
    payment.ts              — Payment, CreatePaymentOrderDTO
    delivery.ts             — DeliveryPartner, DeliveryAssignment
    review.ts               — Review, CreateReviewDTO
    notification.ts         — Notification
    coupon.ts               — Coupon
    address.ts              — Address, CreateAddressDTO
    api.ts                  — ApiResponse<T>, PaginatedResponse<T>, PaginationParams, ErrorResponse
  enums/
    index.ts                — Re-export all
    user-status.ts          — UserStatus (ACTIVE, SUSPENDED, BANNED)
    order-status.ts         — OrderStatus (PENDING, RESTAURANT_ACCEPTED, ..., CANCELLED)
    payment-status.ts       — PaymentStatus (UNPAID, PAID, FAILED, REFUNDED)
    role.ts                 — Role (CUSTOMER, RESTAURANT_OWNER, DELIVERY_PARTNER, ADMIN)
    discount-type.ts        — DiscountType (PERCENTAGE, FIXED)
    vehicle-type.ts         — VehicleType (BIKE, SCOOTER, CAR)
    restaurant-status.ts      — RestaurantStatus (PENDING, DOCUMENT_VERIFICATION, ..., SUSPENDED)
    verification-status.ts    — VerificationStatus (PENDING, VERIFIED, REJECTED)
```

**Acceptance Criteria**:
- ✓ All types match DB schema
- ✓ All DTOs defined for CRUD
- ✓ Enums match pgEnum values
- ✓ Exports are complete

### C2 — `@foodygo/shared-constants` ✓

> **Size**: Small

**Files**:
```
packages/shared-constants/src/
  index.ts
  order-status.ts           — ORDER_STATUS_FLOW (ordered array), ALLOWED_TRANSITIONS (Map), CANCELLABLE_STATUSES
  roles.ts                  — Role metadata (display names, descriptions)
  pagination.ts             — DEFAULT_PAGE_SIZE = 10, MAX_PAGE_SIZE = 100
  errors.ts                 — ErrorCode enum, error messages map
  time.ts                   — ACCESS_TOKEN_EXPIRY = "15m", REFRESH_TOKEN_EXPIRY = "30d", CACHE_TTL = 300
  regex.ts                  — EMAIL_REGEX, PHONE_REGEX, PINCODE_REGEX, PASSWORD_REGEX
  api.ts                    — API_PREFIX = "/api/v1"
```

### C3 — `@foodygo/shared-utils`

> **Size**: Medium
> **Implemented during**: Phase 0B

**Files**:
```
packages/shared-utils/src/
  index.ts
  api-client.ts             — Axios instance with:
                              - base URL from env
                              - request interceptor: attach JWT
                              - response interceptor: auto-refresh on 401
  formatting.ts             — formatPrice(cents: number): string (₹), formatDate(), formatDistance()
  validation.ts             — Shared Zod schemas: emailSchema, passwordSchema, phoneSchema, paginationSchema
  storage.ts                — TokenStorage interface:
                              - Mobile: ExpoSecureTokenStorage (expo-secure-store)
                              - Web: LocalTokenStorage (localStorage)
```

---

## Phase D — Customer Mobile App (`apps/customer-app`)

> **Size**: Very Large
> 📄 [Detailed plan → docs/CUSTOMER_APP.md](./CUSTOMER_APP.md)

**Build order**: Foundation → Auth → Home → Search → Restaurant Detail → Cart → Checkout → Order Tracking → Order History → Profile → Addresses → Favorites → Submit Review → Notifications

**Acceptance Criteria**:
- ✓ Auth (register, login, Google, logout, session restore) works
- ✓ Home shows recommendations + restaurants with skeleton loaders
- ✓ Search with debounce and filters works, infinite scroll
- ✓ Restaurant detail with one-tap add-to-cart animation
- ✓ Cart with quantity stepper, coupon validation, accurate totals
- ✓ Address management (add/edit/delete/set default)
- ✓ Checkout flow (address → payment → place order) completes an order
- ✓ Order tracking with live status, partner info, map
- ✓ Review submission after DELIVERED order
- ✓ Favorites toggle + dedicated favorites screen
- ✓ Notifications list with read/unread + badge count
- ✓ All states: skeleton loading, empty state with CTA, error with retry

---

## Phase E — Delivery Partner Mobile App (`apps/delivery-app`)

> **Size**: Large
> 📄 [Detailed plan → docs/DELIVERY_APP.md](./DELIVERY_APP.md)

**Build order**: Foundation → Auth → Available Deliveries → Active Delivery → Earnings → Profile → Delivery History

**Acceptance Criteria**:
- ✓ Delivery partner auth works
- ✓ Available deliveries listing with accept flow works
- ✓ Active delivery status updates (pickup, complete) work
- ✓ Earnings aggregated from completed assignments
- ✓ History shows past deliveries

---

## Phase F — Restaurant Dashboard (`apps/restaurant-dashboard`)

> **Size**: Very Large
> 📄 [Detailed plan → docs/RESTAURANT_DASHBOARD.md](./RESTAURANT_DASHBOARD.md)

**Pages**: Overview → Menu → Orders → Order Detail → Reviews → Settings

**Acceptance Criteria**:
- ✓ Restaurant owner auth works
- ✓ Dashboard displays correct metrics
- ✓ Menu CRUD (categories + foods) works
- ✓ Order management with status transitions works
- ✓ Reviews displayed correctly

---

## Phase G — Admin Dashboard (`apps/admin-dashboard`)

> **Size**: Very Large
> 📄 [Detailed plan → docs/ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md)

**Pages**: Overview → Users → User Detail → Restaurants → Restaurant Detail → Delivery → Analytics

**Acceptance Criteria**:
- ✓ Admin auth works
- ✓ Platform analytics display correct aggregated data
- ✓ User management (list, search, suspend) works
- ✓ Restaurant management (list, approve, reject, suspend) works

---

## Phase H — Deployment & CI/CD

> **Size**: Medium

### H1 — Docker

**`apps/api/Dockerfile`** (multi-stage):
```
Stage 1: pnpm install + tsc build
Stage 2: node:20-alpine, copy dist/, pnpm install --prod
CMD: node dist/index.js
```

**`docker-compose.yml`** (dev):
```
services:
  api: build: ./apps/api, ports 4000:4000, depends on db + redis
  db: postgres:16, volume for data
  redis: redis:7-alpine
```

### H2 — GitHub Actions

**`.github/workflows/ci.yml`**:
```yaml
on: pull_request
jobs:
  quality:
    steps:
      - pnpm install
      - pnpm lint
      - pnpm build
      - pnpm check-types
```

**`.github/workflows/deploy-api.yml`**:
- Trigger: push to main
- Build Docker image
- Push to container registry
- SSH into VPS → pull & restart

**`.github/workflows/deploy-web.yml`**:
- Trigger: push to main
- Deploy customer-app + delivery-app to Expo (EAS)
- Deploy dashboards to Vercel

### H3 — Env Documentation

Document all required env vars per app in `.env.example` (already scaffolded):
- API: PORT, DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET, RAZORPAY_*, SUPABASE_*
- Mobile apps: EXPO_PUBLIC_API_URL
- Dashboards: NEXT_PUBLIC_API_URL

### H4 — Repository Polish
- `[ ]` Update `.gitignore` — add `dist/`, `.next/`, `.expo/`, `*.tsbuildinfo`
- `[ ]` Add `README.md` with setup instructions
- `[ ]` Add `CONTRIBUTING.md` (optional)

**Acceptance Criteria**:
- ✓ Docker image builds and runs
- ✓ CI pipeline runs lint, build, type-check
- ✓ All env vars documented in .env.example
- ✓ Repository polish complete

---

## Recommended Build Sequence

```
Phase A (DONE)
Phase 0A (DONE)

              ┌─────────────────────────────────────────────┐
              │  Phase 0B — ALL DONE                       │
              │  Redis, cache, Pino, health,               │
              │  rate limiter, shared-utils                │
              └─────────────────────┬───────────────────────┘
                                    │
              ┌─────────────────────▼───────────────────────┐
              │  Phase 0C — ALL DONE                       │
              │  asyncHandler, sendSuccess,                │
              │  refresh_tokens repo, role repo,           │
              │  Google OAuth full wiring                  │
              └─────────────────────┬───────────────────────┘
                                    │
              ┌─────────────────────▼───────────────────────┐
              │  Phases 1-4 — ALL DONE                     │
              │  Security → Infrastructure → Features →    │
              │  Domain + Restaurant                       │
              └─────────────────────┬───────────────────────┘
                                    │
              ┌─────────────────────▼───────────────────────┐
              │  B4-B15 — ALL DONE (all API modules)       │
              │  Users, Restaurants, Foods, Cart, Orders,  │
              │  Payments, Delivery, Reviews,              │
              │  Notifications, Recommendations, Analytics │
              └─────────────────────┬───────────────────────┘
                                    │
              ┌─────────────────────▼───────────────────────┐
              │  D — Customer Mobile App (NEXT)            │
              │  E — Delivery Mobile App                   │
              └─────────────────────┬───────────────────────┘
                                    │
              ┌─────────────────────▼───────────────────────┐
              │  F — Restaurant Dashboard                  │
              │  G — Admin Dashboard                       │
              └─────────────────────┬───────────────────────┘
                                    │
              ┌─────────────────────▼───────────────────────┐
              │  H — Docker + CI/CD + Polish               │
              └─────────────────────────────────────────────┘
```

**Key dependency rules**:
- Phase 0A needs Phase A (monorepo) + B1 (Express) + B2 (schema)
- Phase 0B needs Phase 0A (fixed schema)
- Phase 0C needs Phase 0A + B3 (auth scaffold)
- Phases 1-4 are standalone security/infra/feature/domain work (all done)
- B4-B15 need Phase 0C (refactored auth) + B2 (their tables) + C1/C2 — all completed alongside Phases 1-4
- D+E need B3/0C (auth) + B4-B15 (all API modules) + C1-C3 (types, constants, utils)
- F+G need the same as D+E
- H needs everything else

---

## Project Size Estimates

| Phase | Size | Description |
|-------|------|-------------|
| Phase A — Foundation | **Medium** | 14 files, config, monorepo setup |
| Phase 0A — Database | **Large** | 22 tables, 8 enums, 21 indexes, seed, migration |
| Phase 0B — Infrastructure | **Medium** | Cache, logger, health, shared-utils |
| Phase 0C — Auth Refactor | **Small** | Refresh token repo, Google OAuth, asyncHandler |
| **Phase 1 — Security** | **Medium** | HMAC, ownership, transactions, auth fixes |
| **Phase 2 — Hardening** | **Medium** | Graceful shutdown, request ID, logging, compression, indexes, vitest |
| **Phase 3 — Features** | **Large** | Recommendations, analytics, Socket.IO, notifications, webhook, reviews |
| **Phase 4 — Domain** | **Medium** | OrderStateMachine, document verification, price filters, unread count |
| **Phase 4.5 — TS Fixes** | **Small** | Module augmentation fix, type fixes |
| **Phase 5 — Polish** | **Medium** | Multer upload, FCM push, OpenAPI coverage, 16 integration tests |
| B4 — Users | **Small** | 6 files, 3 routes |
| B5 — Restaurants | **Large** | CRUD, filters, documents, verification workflow |
| B6 — Foods | **Medium** | 6 files, categories + foods CRUD |
| B7 — Cart | **Medium** | Multi-restaurant validation, price calcs |
| B8 — Orders | **Large** | State machine, transactions, notifications, Socket.IO |
| B9 — Payments | **Medium** | Razorpay integration, webhooks |
| B10 — Delivery | **Medium** | Assignment flow, timeline tracking |
| B11 — Reviews | **Small** | Rating CRUD, restaurant aggregation |
| B12 — Notifications | **Medium** | FCM push, in-app storage |
| B13 — Recommendations | **Medium** | Rule-based scoring engine |
| B14 — Analytics | **Medium** | Aggregation queries, caching |
| B15 — Route Registration | **Small** | Single file, route mounting |
| C1-C3 — Shared Packages | **Medium** | Types, constants, utils |
| D — Customer App | **Very Large** | 25+ screens, auth, cart, orders, tracking |
| E — Delivery App | **Large** | 10 screens, delivery flow, earnings |
| F — Restaurant Dashboard | **Very Large** | 15 screens, menu, orders, analytics |
| G — Admin Dashboard | **Very Large** | 10 screens, platform management |
| H — Deployment | **Medium** | Docker, CI/CD, polish |

---

## Status

✅ **Phase A** (Monorepo Setup) — Done  
✅ **Phase B1** (Express Foundation) — Done  
✅ **Phase B2** (Database Schema) — Done  
✅ **Phase B3** (Auth Module) — Done (asyncHandler + sendSuccess done; Google OAuth types done)  
✅ **Phase 0A** (Database Foundation) — Done  
✅ **Phase 0B** (Infrastructure) — Done  
✅ **Phase 0C** (Auth Refactor) — Done  
✅ **Phase 1** (Security Fixes) — Done  
✅ **Phase 2** (Infrastructure Hardening) — Done  
✅ **Phase 3** (Missing Features & Business Logic) — Done  
✅ **Phase 4** (Domain + Restaurant Features) — Done  
✅ **Phase 4.5** (TypeScript Type Fixes) — Done  
✅ **Phase 5** (Cleanup & Polish) — Done (multer, FCM, OpenAPI, integration tests)  
✅ **Phase 5.5** (Health endpoint) — Already existed  
✅ **B4** (Users) — Done  
✅ **B5** (Restaurants) — Done  
✅ **B6** (Foods) — Done  
✅ **B7** (Cart) — Done  
✅ **B8** (Orders) — Done  
✅ **B9** (Payments) — Done  
✅ **B10** (Delivery) — Done  
✅ **B11** (Reviews) — Done  
✅ **B12** (Notifications) — Done  
✅ **B13** (Recommendations) — Done  
✅ **B14** (Analytics) — Done  
✅ **B15** (Route Registration) — Done  
✅ **C1** (`@foodygo/shared-types`) — Done  
✅ **C2** (`@foodygo/shared-constants`) — Done  
✅ **C3** (`@foodygo/shared-utils`) — Done  
📋 **Phase D** (Customer Mobile App) — Next major milestone  
📋 **Phase E** (Delivery Mobile App) — After D  
📋 **Phase F** (Restaurant Dashboard) — After D  
📋 **Phase G** (Admin Dashboard) — After D  
📋 **Phase H** (Deployment) — Last
