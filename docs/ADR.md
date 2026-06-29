# FoodyGo — Architecture Decision Records
> Version: 0.1 — Last updated: 2026-06-26

---

### ADR-0001: PostgreSQL over MongoDB

**Status**: Accepted  
**Context**: The platform requires complex relational queries (orders with items, restaurants with menus, delivery assignments) and strict data consistency for payments and orders.  
**Decision**: Use PostgreSQL 16.  
**Rationale**: ACID transactions for order/payment flows, foreign key constraints for data integrity, JOINs for relational queries, and JSONB for flexible metadata when needed.  
**Consequences**: Requires schema migrations, more rigid schema design.

---

### ADR-0002: Modular Monolith over Microservices

**Status**: Accepted  
**Context**: Early-stage product with a small team. Need to ship features quickly while keeping options open for future scaling.  
**Decision**: Build as a modular monolith with clear module boundaries.  
**Rationale**: Simpler deployment (one process), lower operational complexity, shared code reuse, faster development. Each module is isolated and extractable to a microservice later.  
**Consequences**: Will need to enforce module isolation discipline; potential extraction cost later.

---

### ADR-0003: Drizzle ORM over Prisma

**Status**: Accepted  
**Context**: Need type-safe database access with full TypeScript integration.  
**Decision**: Use Drizzle ORM.  
**Rationale**: Full type safety, lighter bundle, closer to SQL (easier optimization), supports raw SQL when needed, better Postgres-specific features.  
**Consequences**: Less active community than Prisma; fewer built-in connection pool features.

---

### ADR-0004: pgEnum over varchar for Status Fields

**Status**: Accepted  
**Context**: Multiple tables have status fields (order_status, user_status, payment_status) that must have constrained values.  
**Decision**: Use Drizzle `pgEnum` instead of `varchar` for all status columns.  
**Rationale**: Database-level validation of allowed values, better type safety in TypeScript, self-documenting schema, prevents invalid data.  
**Consequences**: Adding new enum values requires a migration.

---

### ADR-0005: Dedicated refresh_tokens Table

**Status**: Accepted  
**Context**: The original design stored a single refresh token hash on the `users` table. This prevents multi-device support, device management, and per-device revocation.  
**Decision**: Create a dedicated `refresh_tokens` table with device tracking.  
**Rationale**: Multi-device login support, per-device logout, token rotation with history, security monitoring (IP, user agent, last used).  
**Consequences**: More storage, requires cleanup of expired tokens.

---

### ADR-0006: Just-in-Time Domain Layer

**Status**: Accepted  
**Context**: Domain services could be built upfront, but many depend on modules that don't exist yet (e.g., `OrderStateMachine` needs Orders, `PricingCalculator` needs Payments).  
**Decision**: Create domain services only when their dependent modules are implemented.  
**Rationale**: Avoids speculative code. Domain services emerge naturally from real business logic needs.  
**Consequences**: May need minor refactoring when extracting from services.

---

### ADR-0007: Selective Soft Deletes

**Status**: Accepted  
**Context**: Deleting business data can break historical records (orders, reviews, payments).  
**Decision**: Apply soft deletes (`deleted_at`) to users, restaurants, foods, and categories. Use `is_deleted` flag on addresses. Do NOT soft-delete orders, payments, reviews, notifications, audit_logs, or refresh_tokens.  
**Rationale**: Historical data must remain immutable. Soft-delete only entities where recovery or "undelete" makes business sense.  
**Consequences**: Querying needs `WHERE deleted_at IS NULL` on soft-deletable tables.

---

### ADR-0008: Expanded Order Pricing

**Status**: Accepted  
**Context**: The original schema stored only `total_amount`, `delivery_fee`, and `tax_amount` — insufficient for real-world financial reporting and analytics.  
**Decision**: Store granular pricing breakdown: `subtotal`, `discount`, `packing_fee`, `platform_fee`, `delivery_fee`, `tax`, `tip`, `grand_total`.  
**Rationale**: Transparent billing, financial reporting, promo validation, refund calculations, analytics.  
**Consequences**: More columns, but avoids complex price reconstruction logic.
