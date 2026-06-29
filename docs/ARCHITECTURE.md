# FoodyGo — System Architecture
> Version: 0.1 — Last updated: 2026-06-26

---

## Architecture Overview

FoodyGo follows a **Modular Monolith** architecture. All backend functionality lives in a single Express application, organized into isolated feature modules. Each module can be extracted into a microservice in the future without rewriting business logic.

```
┌─────────────────────────────────────────────────────────┐
│                   Mobile Apps (Expo)                     │
│  Customer App  │  Delivery Partner App                   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP + WebSocket
┌───────────────────────▼─────────────────────────────────┐
│                   Dashboards (Next.js)                   │
│  Restaurant Dashboard  │  Admin Dashboard                │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────────────────┐
│                    API Gateway                            │
│  express-rate-limit  │  Helmet  │  CORS                   │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│               Express Application (apps/api)             │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Middleware   │  │  Auth       │  │  Users      │      │
│  │ - JWT Auth   │  │  Module     │  │  Module     │      │
│  │ - RBAC       │  │             │  │  (planned)  │      │
│  │ - Validation │  └─────────────┘  └─────────────┘      │
│  │ - Rate Limit │                                         │
│  │ - Error      │  ┌─────────────┐  ┌─────────────┐      │
│  │   Handler    │  │ Restaurants │  │  Foods      │      │
│  └─────────────┘  │  Module     │  │  Module     │      │
│                    │  (planned)  │  │  (planned)  │      │
│                    └─────────────┘  └─────────────┘      │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Orders      │  │  Payments   │  │  Delivery   │      │
│  │ Module      │  │  Module     │  │  Module     │      │
│  │ (planned)   │  │  (planned)  │  │  (planned)  │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Reviews     │  │ Notifications│ │ Recommends  │      │
│  │ Module      │  │ Module      │  │ Module      │      │
│  │ (planned)   │  │ (planned)   │  │ (planned)   │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   Domain Layer                            │
│  (created just-in-time per feature module)                │
│  OrderStateMachine  │  PricingCalculator                  │
│  CouponValidator    │  RecommendationEngine               │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   Infrastructure                          │
│  Redis (cache)  │  Socket.IO (realtime)  │  Pino (logs)  │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   Data Layer                              │
│  Drizzle ORM  │  PostgreSQL  │  Supabase Storage         │
└─────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

| Layer | Responsibility | Notes |
|-------|---------------|-------|
| **Middleware** | Auth, validation, rate limiting, error handling | Global + route-level |
| **Controllers** | Parse request, call service, return response | Thin — no business logic |
| **Services** | Orchestrate business workflow, call domain + repositories | Module-specific |
| **Domain** | Pure business rules, no I/O | Created when module complexity justifies it |
| **Repositories** | Data access via Drizzle ORM | One per entity |
| **Infrastructure** | Redis, Socket.IO, logging, caching | Shared across modules |

---

## Request Lifecycle

```
Request
  │
  ▼
Rate Limiter ────❌ (rate limited → 429)
  │
  ▼
Helmet (security headers)
  │
  ▼
CORS
  │
  ▼
JSON Parser
  │
  ▼
Router (API_PREFIX = /api/v1)
  │
  ├── Public routes (health, auth/register, auth/login)
  │     │
  │     ▼
  │   Validation (Zod) ────❌ (invalid → 400)
  │     │
  │     ▼
  │   Controller → Service → Repository → DB
  │     │
  │     ▼
  │   Response (standardized JSON)
  │
  └── Protected routes
        │
        ▼
      authenticate (JWT verify) ────❌ (invalid → 401)
        │
        ▼
      allowRoles (RBAC check) ────❌ (forbidden → 403)
        │
        ▼
      Validation (Zod) ────❌ (invalid → 400)
        │
        ▼
      Controller → Service → Repository → DB
        │
        ▼
      Response (standardized JSON)
```

---

## Standardized Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "email: Invalid email"
  }
}
```

---

## Module Structure

Every feature module follows this structure:

```
src/modules/{module}/
  types.ts              — DTOs and response types
  validators.ts         — Zod schemas
  repositories/         — Data access
  services/             — Business logic
  controllers/          — Request handlers
  routes/               — Express routes + middleware wiring
```

**Implemented modules**: auth  
**Planned modules**: users, restaurants, foods, cart, orders, payments, delivery, reviews, notifications, recommendations, analytics

---

## Authentication Flow

```
Register / Login
  │
  ▼
Validate credentials (Zod)
  │
  ▼
Argon2 hash / verify password
  │
  ▼
Generate JWT access token (15 min)
  │
  ▼
Generate refresh token (30 days)
  │
  ▼
Store SHA-256 hash of refresh token in refresh_tokens table
  │
  ▼
Return { user, accessToken, refreshToken }
```

**Token refresh**: Validate refresh token → verify hash against DB → rotate (invalidate old, issue new pair)  
**Logout**: Revoke refresh token in DB  
**Multi-device**: Each device gets its own refresh token row

---

## Cache Strategy (Redis)

| Data | Cache Key | TTL | Invalidation |
|------|-----------|-----|--------------|
| Restaurant list | `restaurants:list` | 5 min | On restaurant create/update |
| Restaurant detail | `restaurant:{id}` | 10 min | On restaurant update |
| Food menu | `menu:{restaurantId}` | 10 min | On food create/update |
| Recommendations | `recommendations:{userId}` | 5 min | On new order |
| Analytics (restaurant) | `analytics:restaurant:{id}` | 1 min | On order status change |
| Analytics (admin) | `analytics:admin` | 1 min | On any order event |
| Orders | — | No cache | Real-time data |

---

## Realtime Events (Socket.IO)

| Event | Direction | Trigger |
|-------|-----------|---------|
| `order_created` | Server → All | Order placed |
| `order_accepted` | Server → Customer | Restaurant accepts |
| `order_preparing` | Server → Customer | Preparation starts |
| `order_ready` | Server → Delivery | Ready for pickup |
| `order_picked_up` | Server → Customer | Driver picked up |
| `order_out_for_delivery` | Server → Customer | Out for delivery |
| `order_delivered` | Server → Customer | Delivered |

---

## External Services

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Supabase** | PostgreSQL database + file storage | Drizzle ORM + Supabase SDK |
| **Redis** | Caching, rate limiting | ioredis |
| **Razorpay** | Payment processing | Webhook + API SDK |
| **Firebase Cloud Messaging** | Push notifications | Firebase Admin SDK |
| **Google OAuth** | Social login | google-auth-library |
| **Cloudinary** | Image storage | Cloudinary SDK |

---

## Project Structure

```
apps/
  api/                          — Express backend (TypeScript)
  customer-app/                 — Expo mobile app (customer)
  delivery-app/                 — Expo mobile app (delivery)
  restaurant-dashboard/         — Next.js dashboard
  admin-dashboard/             — Next.js dashboard

packages/
  shared-types/                 — TypeScript interfaces + enums
  shared-constants/             — App-wide constants
  shared-utils/                 — API client, formatting, validation
  eslint-config/                — Shared ESLint config
  typescript-config/            — Shared TS config presets

docs/
  ARCHITECTURE.md               — This document
  DATABASE.md                   — Schema reference
  API.md                        — API endpoint reference
  ADR.md                        — Architecture Decision Records
  CONTRIBUTING.md               — Contribution guide
  CODE_STYLE.md                 — Coding standards
  PRD.md                        — Product requirements
  ORDER_FLOW.md                 — Order lifecycle
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| API Framework | Express |
| Language | TypeScript (strict) |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 (Supabase) |
| Cache | Redis (ioredis) |
| Realtime | Socket.IO |
| Auth | JWT + Argon2 + Google OAuth |
| Payments | Razorpay |
| Push Notifications | Firebase Cloud Messaging |
| Storage | Cloudinary |
| Mobile | Expo + React Native |
| Web Dashboards | Next.js App Router + Tailwind CSS |
| State (Mobile) | Zustand + TanStack Query |
| Package Manager | pnpm |
| Monorepo | Turborepo |

---

## CI/CD Pipeline (Planned)

```
Git Push
  │
  ▼
GitHub Actions
  │
  ├── pnpm install
  ├── pnpm lint
  ├── pnpm build
  ├── pnpm check-types
  │
  ├── (main branch) → Deploy API (Docker → VPS)
  ├── (main branch) → Deploy Mobile (EAS Build)
  └── (main branch) → Deploy Dashboards (Vercel)
```

---

## Deployment Strategy

| Component | Platform |
|-----------|----------|
| Backend API | Docker container on VPS |
| Mobile Apps | Expo EAS (app stores) |
| Web Dashboards | Vercel |
| Database | Supabase PostgreSQL (managed) |
| Storage | Cloudinary (managed) |
| Cache | Redis (managed or container) |
