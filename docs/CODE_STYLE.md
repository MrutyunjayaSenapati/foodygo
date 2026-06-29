# FoodyGo — Code Style Guide
> Version: 0.1 — Last updated: 2026-06-26

---

## Language

- TypeScript only. Strict mode.
- No `any`. Prefer `unknown` when type is uncertain.
- Use `strictNullChecks` enabled.

---

## Naming

| Category | Convention | Example |
|----------|-----------|---------|
| Variables | camelCase | `userName`, `accessToken` |
| Functions | camelCase, verb | `getUser()`, `validateOrder()` |
| Classes | PascalCase | `AppError`, `PricingCalculator` |
| Interfaces | PascalCase | `AuthResponse`, `LoginDTO` |
| Types | PascalCase | `RegisterDTO`, `TokenPair` |
| Enums | PascalCase, singular | `OrderStatus`, `UserRole` |
| Enum values | UPPER_SNAKE_CASE | `OrderStatus.PENDING` |
| Files | kebab-case | `auth.service.ts` |
| Folders | kebab-case | `auth/`, `user-roles/` |
| Database tables | snake_case, plural | `users`, `refresh_tokens` |
| Database columns | snake_case | `owner_user_id`, `is_active` |

---

## Declarations

```typescript
// const over let
const name = "FoodyGo";

// let only when reassigning
let counter = 0;
counter += 1;

// No var
```

---

## Import Style

```typescript
// External
import jwt from "jsonwebtoken";
import { z } from "zod";

// Internal packages
import { ErrorCode } from "@foodygo/shared-constants";

// Relative
import { AppError } from "../../utils/errors";
import { authRepository } from "../repositories/auth.repository";
```

- Named exports preferred over default exports.
- One import group per source type (external / internal / relative).
- Groups separated by blank line.

---

## Functions

```typescript
// Max 30 lines
// Max 3 parameters (use object for more)
// Name should hint at return type

// Good
async function findByEmail(email: string): Promise<User | null> { }

// Good (too many params → object)
async function createOrder(dto: CreateOrderDTO, userId: string): Promise<Order> { }

// Avoid
async function doStuff(a: string, b: number, c: boolean, d: Date) { }
```

---

## Async / Await

```typescript
// Always use async/await. No raw promises.
async function getUser(id: string): Promise<User> {
  const user = await userRepository.findById(id);
  return user;
}

// Avoid
function getUser(id: string): Promise<User> {
  return userRepository.findById(id).then(user => user);
}
```

---

## Error Handling

```typescript
// Use AppError for all business errors
throw new AppError(ErrorCode.NOT_FOUND, "User not found");

// Never throw raw Error
throw new Error("User not found");  // ❌
```

**Error Codes** are defined in `@foodygo/shared-constants` (errors.ts).

---

## Controllers

```typescript
// Controllers must be thin
// Use asyncHandler to eliminate try/catch

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.id);
  sendSuccess(res, user);
});

// Never put business logic in controllers
export const getUser = async (req: Request, res: Response) => {    // ❌
  const db = getDb();                                               // ❌
  const user = await db.query(...);                                 // ❌
  if (user.status !== "ACTIVE") { ... }                             // ❌
  res.json(user);                                                   // ❌
};
```

---

## Services

```typescript
// Services orchestrate business logic
// They call repositories and domain services

async function register(dto: RegisterDTO): Promise<AuthResponse> {
  const existing = await authRepository.findByEmail(dto.email);
  if (existing) throw new AppError(ErrorCode.EMAIL_ALREADY_EXISTS);

  const passwordHash = await argon2.hash(dto.password);
  const user = await authRepository.createUser({ ...dto, passwordHash });
  const tokens = generateTokens(user.id, roleNames);

  return { user, tokens };
}
```

---

## Repositories

```typescript
// Only data access. No business logic.
// Return Drizzle types or null.

async function findByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}
```

---

## Validation (Zod)

```typescript
// All schemas in validators.ts
// Schema names match route names

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1).max(255),
});

// Apply via middleware
router.post("/register", validate({ body: registerSchema }), controller.register);
```

---

## Response Format

```typescript
// Use response helpers from utils/response.ts

sendSuccess(res, data);                    // { success: true, data }
sendSuccess(res, data, 201);               // With custom status
sendPaginated(res, data, { page, pageSize, total });  // Paginated response
```

---

## Logging (Pino)

```typescript
// Use injected Pino logger
import { logger } from "../lib/logger";

logger.info("Order created", { orderId, userId });
logger.error(err, "Payment failed");

// Never console.log
console.log("Order created");  // ❌

// Never log secrets
logger.info({ password: "abc" });  // ❌
logger.info({ token: req.headers.authorization });  // ❌
```

---

## Comments

```typescript
// No comments for obvious code
// Add comments only when explaining WHY, not WHAT

// Good: explains non-obvious business rule
// Cancellation allowed only from PENDING or RESTAURANT_ACCEPTED
const cancellableStatuses = [OrderStatus.PENDING, OrderStatus.RESTAURANT_ACCEPTED];

// Bad: states the obvious
// Find user by email  // ❌
const user = await authRepository.findByEmail(email);
```

---

## Folder Conventions

```
src/
  modules/        — Feature modules (auth, users, orders, ...)
  domain/         — Domain services (created per module when needed)
  middleware/     — Express middleware (auth, rbac, validate, ...)
  lib/            — Infrastructure (db, redis, logger, env, ...)
  utils/          — Shared utilities (errors, response, ...)
  db/             — Database (schema, relations, enums, migrations, seed)
```

---

## TypeScript Config

- Target: ES2022
- Module: NodeNext
- Strict: true
- No unchecked indexed access

See `packages/typescript-config/express.json` for the API preset.
