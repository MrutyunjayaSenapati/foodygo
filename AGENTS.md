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

## Interaction Rules
- Always ask before running any install or execute command (pnpm install, npm, npx, builds, etc.)
- If a command fails, stop and inform the user before proceeding

## Git
- Do NOT commit unless explicitly asked by the user
- Conventional commits preferred when committing

## Admin Dashboard Remaining Backlog
- **P1-6** — User detail sheet (click row → profile, order history, address). Backend needs order history endpoint by user.
- **P1-8** — Inline form validation errors on coupon create/edit form (show field-level API error messages).

## Admin Dashboard Progress
- **G0** — Backend fixes: listUsers/listRestaurants pagination, delivery endpoints, analytics endpoints. API tests pass.
- **G1** — Foundation: deps, lib/utils, lib/api (Axios + token refresh), auth store, providers, Tailwind v3 + shadcn CSS variables.
- **G2** — Auth + Layout: login page, sidebar, header, admin layout, 6 placeholder pages. Build passes.
- **G3** — Platform Overview: live metric cards from GET /analytics/admin with skeleton loading.
- **G4** — Users + Coupons: DataTable component, user list table (paginated), coupon CRUD with create/edit dialog. All verified.
- **G5** — Restaurants: admin list with search, status badges, approve/reject buttons.
- **G6** — Delivery + Analytics: partners/assignments tabs via GET /delivery/*, revenue/order trend charts (recharts LineChart), top restaurants card.

### Key Notes
- **shadcn@latest (v4.12) targets Tailwind v4.** We use Tailwind v3 (3.4.19). The card.tsx component had v4 syntax (`gap-(--card-spacing)`). Replaced with v3-compatible version. Other components (button, input, select, table, dialog, etc.) work fine with v3.
- **pnpm 9.x hoisted linker bug on Windows** — `ERR_PNPM_ENOENT` during dedup. A clean `node_modules` delete + fresh `pnpm install` resolves it. Do NOT manually symlink. On this machine it works after a clean install.
- **Restaurant dashboard uses `@base-ui/react@1.6.0`** for DropdownMenu (same as admin dashboard). All other UI components are native HTML with CVA.
- **Restaurant dashboard theme**: Custom ThemeProvider with light/dark/system support, no next-themes dependency. Uses `bg-card`/`text-card-foreground` semantic classes for dark mode.

## Restaurant Dashboard Progress
- **G0** — Backend: `register-restaurant` creates user + restaurant in transaction; email field set on restaurant.
- **G1** — Foundation: deps, lib/utils, lib/api (Axios + token refresh), auth store (Zustand + persist), restaurant store, providers (Query, Auth, Theme, Toast), Tailwind v3 + CSS variables.
- **G2** — Auth + Layout: Login page (email/password + role check), Register page (2-step: owner info → restaurant + menu), Restaurant selection page (list owned + create modal), Sidebar (collapsible), Header, DashboardLayout.
- **G3** — Overview: analytics cards from GET /analytics/restaurant/:id with skeleton loading.
- **G4** — Orders: paginated table from GET /orders/restaurant/:restaurantId, status filter tabs (All/Pending/Accepted/Preparing/Ready/Completed/Cancelled), inline Accept/Start Preparing/Mark Ready actions via PATCH /orders/:id/status.
- **G5** — Menu: grouped categories + food items layout, full CRUD dialogs for categories and items, availability toggle, soft delete.
- **G6** — Reviews: paginated read-only list with star ratings, user names, dates. Settings: restaurant profile edit form (Basic Info + Branding + Appearance/Theme toggle).
- **Dark Mode**: All pages use semantic Tailwind classes (`bg-card`, `text-card-foreground`, `text-muted-foreground`, `border-input`) instead of hardcoded `bg-white`/`text-slate-*`.

## Decision Log
- **Socket.IO auth**: JWT verified in `io.use()` middleware; auto-join `user:{id}` room
- **Razorpay webhook**: Uses `RAZORPAY_WEBHOOK_SECRET`, HMAC-SHA256 over raw body
- **Recommendations**: Rule-based scoring (no ML)
- **Analytics**: Raw SQL aggregates via Drizzle `sql` template tag
- **OrderStateMachine**: Pure domain class, no DB/IO dependencies
- **ESLint**: `no-explicit-any` disabled for repository files (Drizzle enum typing)
- **FCM**: Gracefully disabled if `FCM_SERVICE_ACCOUNT_PATH` not configured
- **File uploads**: Local disk storage via multer, served via `express.static`
