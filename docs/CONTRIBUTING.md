# FoodyGo — Contributing Guide
> Version: 0.1 — Last updated: 2026-06-26

---

## Module Structure

Every feature module follows this exact structure:

```
src/modules/{module}/
  types.ts              — DTOs, request/response interfaces
  validators.ts         — Zod schemas for request validation
  repositories/         — Data access layer (Drizzle queries)
  services/             — Business logic orchestration
  controllers/          — Thin request handlers
  routes/               — Express router with middleware wiring
```

When a module's service grows beyond ~200 lines, extract domain logic into `src/domain/{module}/`.

---

## Coding Conventions

### General

- TypeScript only. Strict mode enabled.
- Use `async/await`. Avoid raw promises.
- No `any`. Use `unknown` if type is uncertain.
- Prefer `const` over `let`. Avoid `var`.

### Naming

| Scope | Convention | Example |
|-------|-----------|---------|
| Variables | camelCase | `userName` |
| Functions | camelCase | `getUserById()` |
| Classes | PascalCase | `AppError` |
| Interfaces | PascalCase | `AuthResponse` |
| Types | PascalCase | `LoginDTO` |
| Enums | PascalCase | `OrderStatus` |
| Files | kebab-case | `auth.repository.ts` |
| Folders | kebab-case | `auth/`, `restaurant-documents/` |
| DB tables | snake_case | `refresh_tokens` |
| DB columns | snake_case | `owner_user_id` |

### Import Order

1. External packages (e.g., `express`, `zod`, `jwt`)
2. Internal packages (e.g., `@foodygo/shared-types`)
3. Relative imports (e.g., `../services/auth.service`)

Separate groups with a blank line.

```typescript
import jwt from "jsonwebtoken";
import { z } from "zod";

import { ErrorCode } from "@foodygo/shared-constants";

import { AppError } from "../../utils/errors";
```

### Maximum Line Length

80 characters for code. 72 for comments.

### Functions

- Maximum 30 lines per function.
- Maximum 3 parameters. Use an object for more.
- Name implies return type: `findByEmail()` returns one, `findAllByRole()` returns many.

### Error Handling

- Use `AppError` class for all business errors.
- Use centralized error handler middleware.
- Never `throw new Error()` directly — always use `AppError` with a valid `ErrorCode`.

```typescript
throw new AppError(ErrorCode.NOT_FOUND, "User not found");
```

### Controllers

- Must be thin. No business logic.
- Wrap in `asyncHandler` to avoid try/catch boilerplate.

```typescript
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.id);
  sendSuccess(res, user);
});
```

### Services

- Orchestrate business logic.
- Call repositories and domain services.
- Throw `AppError` for business rule violations.

### Repositories

- Only data access. No business logic.
- Return Drizzle entity types.
- One repository per database table.

### Validation

- All request body/query/params must be validated with Zod.
- Validation schemas go in `validators.ts`.
- Use the `validate()` middleware to apply schemas to routes.

---

## Commit Conventions

Use conventional commits:

```
feat: new feature
fix: bug fix
docs: documentation
refactor: code change (no feature/fix)
chore: build, deps, tooling
db: migrations or schema changes
```

Format:

```
<type>(<scope>): <description>

<body>
```

Examples:

```
feat(auth): implement Google OAuth login

docs: synchronize documentation after Phase 0A

db: add refresh_tokens table and indexes

fix(cart): prevent adding items from different restaurants
```

---

## PR Workflow

1. Create a feature branch from `main`
2. Make changes following conventions
3. Run `pnpm check-types` and `pnpm lint`
4. Push and open a PR
5. Ensure CI passes before merge

---

## Development Workflow

```bash
# Install dependencies
pnpm install

# Start API in dev mode
pnpm --filter @foodygo/api dev

# Generate migration after schema changes
pnpm --filter @foodygo/api db:generate

# Apply migration
pnpm --filter @foodygo/api db:migrate

# Seed database
pnpm --filter @foodygo/api db:seed

# Type check all packages
pnpm check-types

# Lint all packages
pnpm lint
```

---

## Testing (Planned)

- Unit tests for services and domain classes
- Integration tests for repositories
- E2E tests for critical flows (auth, order lifecycle)
- Jest + Supertest as test framework
