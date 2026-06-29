# FoodyGo — AGENTS.md

## Project Overview
Food delivery platform. Monorepo with API backend + 4 client apps.

## Tech Stack
- **Backend**: Express, TypeScript, Drizzle ORM, PostgreSQL, Redis, Socket.IO
- **Mobile**: Expo SDK 53 (React Native)
- **Web Dashboards**: Next.js App Router
- **Package Manager**: pnpm (workspaces)
- **Build System**: Turborepo
- **Testing**: Vitest, Supertest

## Monorepo Structure
```
apps/
  api/           — Express REST API
  customer-app/  — Expo (customer)
  delivery-app/  — Expo (delivery partner)
  restaurant-dashboard/ — Next.js
  admin-dashboard/      — Next.js
packages/
  shared-types/     — DTOs, interfaces, enums
  shared-constants/ — Error codes, regex, pagination, role metadata
  shared-utils/     — API client, formatting, validation, storage
  eslint-config/
  typescript-config/
  ui/
```

## Package Naming
All workspace packages use `@foodygo/*` prefix.

## API Conventions
- **Port**: 4000 (dev), configurable via `PORT` env
- **Prefix**: `/api/v1/`
- **Auth**: JWT Bearer tokens (access + refresh)
- **Validation**: Zod 4.x schemas in each module's `validators.ts`
- **Response format**: `{ success: true, data: ... }` via `sendSuccess()`
- **Error format**: `{ success: false, error: { code, message } }`
- **Error handling**: `AppError` class, centralized `errorHandler` middleware
- **Async controllers**: Wrapped with `asyncHandler` — no try/catch in controllers

## Module Pattern
```
module/
  types.ts           — Module-specific types
  validators.ts      — Zod schemas
  repositories/      — Drizzle queries
  services/          — Business logic
  controllers/       — Express request handlers
  routes/            — Express Router
  domain/            — Pure domain classes (if needed)
```

## Testing
- **Framework**: Vitest 4.x
- **Unit tests**: Co-located in `__tests__/` within modules
- **Integration tests**: In `src/__tests__/`, use Supertest + module-level `vi.mock()`
- **Mock strategy**: Mock repositories, not DB layer (Drizzle query chains are complex)
- **Env vars**: Set via `test.env` in `vitest.config.ts`
- Run: `pnpm test`

## Key Dependencies
- `zod@4.4.3` — Schema validation
- `drizzle-orm@0.45.2` — ORM
- `express@4.22.2`
- `socket.io@4.8.3` — Realtime
- `firebase-admin@14.1.0` — FCM push
- `multer@2.2.0` — File uploads
- `compression`, `helmet`, `cors`, `express-rate-limit` — Security/infra
- `pino` — Logging
- `ioredis` — Redis client
- `jsonwebtoken` — JWT
- `argon2` — Password hashing
- `google-auth-library` — Google OAuth
- `swagger-ui-express` — API docs

## Coding Conventions
- **No comments** in code unless the logic is unavoidably complex
- **No emoji** in code, commit messages, or files
- **No try/catch** in controllers — use `asyncHandler`
- **No `console.log`** — use Pino logger
- **No direct DB access** in controllers — always go through services
- **No raw SQL** unless absolutely necessary — use Drizzle query builder
- **No barrel files** (no `index.ts` re-exports) — explicit imports only

## Git
- Do NOT commit unless explicitly asked by the user
- Conventional commits preferred when committing

## Decision Log
- **Socket.IO auth**: JWT verified in `io.use()` middleware; auto-join `user:{id}` room
- **Razorpay webhook**: Uses `RAZORPAY_WEBHOOK_SECRET`, HMAC-SHA256 over raw body
- **Recommendations**: Rule-based scoring (no ML)
- **Analytics**: Raw SQL aggregates via Drizzle `sql` template tag
- **OrderStateMachine**: Pure domain class, no DB/IO dependencies
- **ESLint**: `no-explicit-any` disabled for repository files (Drizzle enum typing)
- **FCM**: Gracefully disabled if `FCM_SERVICE_ACCOUNT_PATH` not configured
- **File uploads**: Local disk storage via multer, served via `express.static`
