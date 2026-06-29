# FoodyGo — Database Schema
> Version: 0.1 — Last updated: 2026-06-26

**Dialect**: PostgreSQL 16  
**ORM**: Drizzle ORM  
**Provider**: Supabase PostgreSQL

---

## Table of Contents

- [Implemented Tables](#implemented-tables)
  - [users](#users)
  - [roles](#roles)
  - [user\_roles](#user_roles)
  - [addresses](#addresses)
  - [restaurants](#restaurants)
  - [restaurant\_documents](#restaurant_documents)
  - [food\_categories](#food_categories)
  - [foods](#foods)
  - [carts](#carts)
  - [cart\_items](#cart_items)
  - [orders](#orders)
  - [order\_items](#order_items)
  - [order\_status\_history](#order_status_history)
  - [payments](#payments)
  - [delivery\_partners](#delivery_partners)
  - [delivery\_assignments](#delivery_assignments)
  - [reviews](#reviews)
  - [favorites](#favorites)
  - [notifications](#notifications)
  - [coupons](#coupons)
  - [refresh\_tokens](#refresh_tokens)
  - [audit\_logs](#audit_logs)
- [Enums](#enums)
- [Indexes](#indexes)
- [Relations](#relations)
- [Naming Conventions](#naming-conventions)
- [Soft Delete Strategy](#soft-delete-strategy)
- [Transaction Boundaries](#transaction-boundaries)
- [Planned Tables](#planned-tables)

---

## Implemented Tables

---

### users

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| email | `varchar(255)` | UNIQUE, NOT NULL |
| password\_hash | `varchar(255)` | NOT NULL |
| full\_name | `varchar(255)` | NOT NULL |
| avatar\_url | `varchar(500)` | nullable |
| status | `user_status` | DEFAULT `'ACTIVE'`, NOT NULL |
| deleted\_at | `timestamp` | nullable (soft delete) |
| created\_at | `timestamp` | DEFAULT `now()`, NOT NULL |
| updated\_at | `timestamp` | DEFAULT `now()`, NOT NULL |

---

### roles

| Column | Type | Constraints |
|--------|------|-------------|
| id | `serial` | PK |
| name | `varchar(50)` | UNIQUE, NOT NULL |

**Seed values**: `CUSTOMER`, `RESTAURANT_OWNER`, `DELIVERY_PARTNER`, `ADMIN`

---

### user\_roles

| Column | Type | Constraints |
|--------|------|-------------|
| user\_id | `uuid` | FK → users.id, NOT NULL |
| role\_id | `integer` | FK → roles.id, NOT NULL |

**PK**: composite `(user_id, role_id)`  
**Relations**: many-to-many between users and roles

---

### addresses

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | FK → users.id, NOT NULL |
| label | `varchar(100)` | nullable (e.g. "Home", "Office") |
| address\_line\_1 | `varchar(255)` | NOT NULL |
| address\_line\_2 | `varchar(255)` | nullable |
| city | `varchar(100)` | NOT NULL |
| state | `varchar(100)` | NOT NULL |
| postal\_code | `varchar(20)` | NOT NULL |
| latitude | `numeric(10,7)` | nullable |
| longitude | `numeric(10,7)` | nullable |
| is\_deleted | `boolean` | DEFAULT `false`, NOT NULL |

**Soft delete**: Uses `is_deleted` flag. Hard deletion is prevented if address is referenced by an order.

---

### restaurants

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| owner\_user\_id | `uuid` | FK → users.id, NOT NULL |
| name | `varchar(255)` | NOT NULL |
| description | `text` | nullable |
| logo\_url | `varchar(500)` | nullable |
| cover\_url | `varchar(500)` | nullable |
| phone | `varchar(20)` | nullable |
| email | `varchar(255)` | nullable |
| address | `text` | NOT NULL |
| latitude | `numeric(10,7)` | NOT NULL |
| longitude | `numeric(10,7)` | NOT NULL |
| rating | `numeric(3,2)` | DEFAULT `'0'`, NOT NULL |
| status | `restaurant_status` | DEFAULT `'PENDING'`, NOT NULL |
| deleted\_at | `timestamp` | nullable (soft delete) |

**Indexes**: `idx_restaurants_owner`, `idx_restaurants_coords`

---

### restaurant\_documents

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| restaurant\_id | `uuid` | FK → restaurants.id, NOT NULL |
| document\_type | `varchar(50)` | NOT NULL |
| document\_url | `varchar(500)` | NOT NULL |
| verification\_status | `varchar(30)` | DEFAULT `'PENDING'`, NOT NULL |
| verified\_by | `uuid` | FK → users.id, nullable |
| verified\_at | `timestamp` | nullable |
| remarks | `text` | nullable |

---

### food\_categories

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| restaurant\_id | `uuid` | FK → restaurants.id, NOT NULL |
| name | `varchar(255)` | NOT NULL |
| deleted\_at | `timestamp` | nullable (soft delete) |

---

### foods

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| restaurant\_id | `uuid` | FK → restaurants.id, NOT NULL |
| category\_id | `uuid` | FK → food\_categories.id, nullable |
| name | `varchar(255)` | NOT NULL |
| description | `text` | nullable |
| image\_url | `varchar(500)` | nullable |
| price | `numeric(10,2)` | NOT NULL |
| is\_available | `boolean` | DEFAULT `true`, NOT NULL |
| deleted\_at | `timestamp` | nullable (soft delete) |

**Indexes**: `idx_foods_restaurant`

---

### carts

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | UNIQUE, FK → users.id, NOT NULL |

One cart per user enforced via UNIQUE constraint.

---

### cart\_items

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| cart\_id | `uuid` | FK → carts.id, NOT NULL |
| food\_id | `uuid` | FK → foods.id, NOT NULL |
| quantity | `integer` | DEFAULT `1`, NOT NULL |

---

### orders

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | FK → users.id, NOT NULL |
| restaurant\_id | `uuid` | FK → restaurants.id, NOT NULL |
| address\_id | `uuid` | FK → addresses.id, NOT NULL |
| subtotal | `numeric(10,2)` | NOT NULL |
| discount | `numeric(10,2)` | DEFAULT `'0'`, NOT NULL |
| packing\_fee | `numeric(10,2)` | DEFAULT `'0'`, NOT NULL |
| platform\_fee | `numeric(10,2)` | DEFAULT `'0'`, NOT NULL |
| delivery\_fee | `numeric(10,2)` | NOT NULL |
| tax | `numeric(10,2)` | NOT NULL |
| tip | `numeric(10,2)` | DEFAULT `'0'`, NOT NULL |
| grand\_total | `numeric(10,2)` | NOT NULL |
| status | `order_status` | DEFAULT `'PENDING'`, NOT NULL |
| payment\_status | `payment_status` | DEFAULT `'UNPAID'`, NOT NULL |
| estimated\_delivery\_time | `timestamp` | nullable |
| actual\_delivery\_time | `timestamp` | nullable |
| created\_at | `timestamp` | DEFAULT `now()`, NOT NULL |

**Indexes**: `idx_orders_user`, `idx_orders_restaurant`, `idx_orders_status`

---

### order\_items

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| order\_id | `uuid` | FK → orders.id, NOT NULL |
| food\_id | `uuid` | FK → foods.id, NOT NULL |
| quantity | `integer` | NOT NULL |
| price | `numeric(10,2)` | NOT NULL (snapshot at time of order) |

---

### order\_status\_history

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| order\_id | `uuid` | FK → orders.id, NOT NULL |
| status | `order_status` | NOT NULL |
| created\_at | `timestamp` | DEFAULT `now()`, NOT NULL |

Never overwrite status history — every transition appends a row.

---

### payments

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| order\_id | `uuid` | FK → orders.id, NOT NULL |
| razorpay\_order\_id | `varchar(100)` | NOT NULL |
| razorpay\_payment\_id | `varchar(100)` | nullable |
| amount | `numeric(10,2)` | NOT NULL |
| status | `payment_status` | NOT NULL |
| created\_at | `timestamp` | DEFAULT `now()`, NOT NULL |

**Indexes**: `idx_payments_order`

---

### delivery\_partners

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | UNIQUE, FK → users.id, NOT NULL |
| vehicle\_type | `vehicle_type` | NOT NULL |
| license\_number | `varchar(100)` | NOT NULL |

---

### delivery\_assignments

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| order\_id | `uuid` | FK → orders.id, NOT NULL |
| delivery\_partner\_id | `uuid` | FK → delivery\_partners.id, NOT NULL |
| status | `delivery_assignment_status` | DEFAULT `'ASSIGNED'`, NOT NULL |
| assigned\_at | `timestamp` | DEFAULT `now()`, NOT NULL |
| accepted\_at | `timestamp` | nullable |
| picked\_up\_at | `timestamp` | nullable |
| completed\_at | `timestamp` | nullable |

---

### reviews

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | FK → users.id, NOT NULL |
| restaurant\_id | `uuid` | FK → restaurants.id, NOT NULL |
| rating | `integer` | NOT NULL (1-5) |
| comment | `text` | nullable |
| created\_at | `timestamp` | DEFAULT `now()`, NOT NULL |

**Unique constraint**: one review per user per restaurant `(user_id, restaurant_id)`

---

### favorites

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | FK → users.id, NOT NULL |
| restaurant\_id | `uuid` | FK → restaurants.id, NOT NULL |

**Unique constraint**: one favorite per user per restaurant `(user_id, restaurant_id)`  
**Indexes**: `idx_favorites_user`

---

### notifications

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | FK → users.id, NOT NULL |
| title | `varchar(255)` | NOT NULL |
| body | `text` | nullable |
| is\_read | `boolean` | DEFAULT `false`, NOT NULL |
| created\_at | `timestamp` | DEFAULT `now()`, NOT NULL |

**Indexes**: `idx_notifications_user`

---

### coupons

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| code | `varchar(50)` | UNIQUE, NOT NULL |
| discount\_type | `discount_type` | NOT NULL |
| discount\_value | `numeric(10,2)` | NOT NULL |
| expiry\_date | `timestamp` | NOT NULL |

---

### refresh\_tokens

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | FK → users.id, NOT NULL |
| token\_hash | `varchar(255)` | NOT NULL |
| device\_name | `varchar(255)` | nullable |
| ip\_address | `varchar(45)` | nullable |
| user\_agent | `text` | nullable |
| last\_used\_at | `timestamp` | nullable |
| expires\_at | `timestamp` | NOT NULL |
| revoked\_at | `timestamp` | nullable |
| created\_at | `timestamp` | DEFAULT `now()`, NOT NULL |

**Indexes**: `idx_refresh_tokens_user`, `idx_refresh_tokens_hash`

---

### audit\_logs

| Column | Type | Constraints |
|--------|------|-------------|
| id | `uuid` | PK, default `gen_random_uuid()` |
| user\_id | `uuid` | FK → users.id, nullable (anonymous actions) |
| action | `varchar(100)` | NOT NULL |
| resource | `varchar(100)` | NOT NULL |
| resource\_id | `varchar(100)` | nullable |
| ip\_address | `varchar(45)` | nullable |
| created\_at | `timestamp` | DEFAULT `now()`, NOT NULL |

**Indexes**: `idx_audit_logs_user`, `idx_audit_logs_resource`

---

## Enums

Defined in `apps/api/src/db/enums.ts` using Drizzle `pgEnum`.

| Enum Name | Values | Used By |
|-----------|--------|---------|
| `user_status` | ACTIVE, SUSPENDED, BANNED | users |
| `restaurant_status` | PENDING, DOCUMENT_VERIFICATION, APPROVED, REJECTED, SUSPENDED | restaurants |
| `order_status` | PENDING, RESTAURANT_ACCEPTED, PREPARING, READY_FOR_PICKUP, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, CANCELLED | orders, order\_status\_history |
| `payment_status` | UNPAID, PAID, FAILED, REFUNDED | orders, payments |
| `discount_type` | PERCENTAGE, FIXED | coupons |
| `vehicle_type` | BIKE, SCOOTER, CAR | delivery\_partners |
| `delivery_assignment_status` | ASSIGNED, ACCEPTED, PICKED_UP, COMPLETED, CANCELLED | delivery\_assignments |
| `verification_status` | PENDING, VERIFIED, REJECTED | restaurant\_documents |

---

## Indexes

| Name | Table | Columns |
|------|-------|---------|
| `idx_restaurants_owner` | restaurants | owner\_user\_id |
| `idx_restaurants_coords` | restaurants | latitude, longitude |
| `idx_foods_restaurant` | foods | restaurant\_id |
| `idx_orders_user` | orders | user\_id |
| `idx_orders_restaurant` | orders | restaurant\_id |
| `idx_orders_status` | orders | status |
| `idx_payments_order` | payments | order\_id |
| `idx_notifications_user` | notifications | user\_id |
| `idx_favorites_user` | favorites | user\_id |
| `idx_refresh_tokens_user` | refresh\_tokens | user\_id |
| `idx_refresh_tokens_hash` | refresh\_tokens | token\_hash |
| `idx_audit_logs_user` | audit\_logs | user\_id |
| `idx_audit_logs_resource` | audit\_logs | resource, resource\_id |
| `idx_addresses_user` | addresses | user\_id |
| `idx_food_categories_restaurant` | food\_categories | restaurant\_id |
| `idx_order_items_order` | order\_items | order\_id |
| `idx_order_status_history_order` | order\_status\_history | order\_id |
| `idx_delivery_assignments_order` | delivery\_assignments | order\_id |
| `idx_delivery_assignments_partner` | delivery\_assignments | delivery\_partner\_id |
| `idx_restaurant_documents_restaurant` | restaurant\_documents | restaurant\_id |
| `idx_reviews_restaurant` | reviews | restaurant\_id |

---

## Naming Conventions

| Convention | Rule |
|------------|------|
| Table names | `snake_case`, plural |
| Column names | `snake_case` |
| Primary keys | `id` (uuid) |
| Foreign keys | `{referenced_table}_id` |
| Timestamps | `created_at`, `updated_at`, `deleted_at` |
| Boolean flags | `is_{adjective}` (e.g. `is_active`, `is_read`, `is_deleted`) |
| Status enums | `status` |
| Drizzle column names | camelCase in TypeScript → snake\_case in PostgreSQL |
| Enum names | `{table}_{property}` pattern (e.g. `user_status`, `order_status`) |

---

## Soft Delete Strategy

| Table | Strategy | Reason |
|-------|----------|--------|
| users | `deleted_at` timestamp | Account recovery, order history integrity |
| restaurants | `deleted_at` timestamp | Menu history, order references |
| foods | `deleted_at` timestamp | Order item references |
| food\_categories | `deleted_at` timestamp | Food references |
| addresses | `is_deleted` boolean | Simpler querying, order address references |

**Not soft-deleted**: orders, order\_items, payments, reviews, notifications, audit\_logs, refresh\_tokens. These are immutable or append-only.

---

## Transaction Boundaries

The following operations must execute within a database transaction:

| Operation | Steps |
|-----------|-------|
| User Registration | Create user → Assign CUSTOMER role → Create refresh token |
| Create Order | Create order → Create order items → Clear cart → Create status history → Create payment record |
| Order Status Change | Validate transition → Update order status → Create status history → Emit Socket.IO event → Send notification |
| Payment Webhook | Verify signature → Update payment → Update order payment\_status → Create status history |
| Order Cancellation | Validate cancellable → Update status → Create history → Revoke delivery assignments |
| Restaurant Approval | Verify documents → Update restaurant status → Create audit log |
| Delivery Assignment | Assign partner → Update order → Emit event |

---

## Planned Tables

| Table | Purpose |
|-------|---------|
| loyalty\_points | Customer rewards program |
| user\_devices | FCM device tokens for push notifications |
| referral\_codes | User referral tracking |
| subscription\_plans | Premium subscription features |

