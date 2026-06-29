# FoodyGo — API Specification
> Version: 0.1 — Last updated: 2026-06-26

**Base URL**: `/api/v1`  
**Health Check**: `GET /health` (infrastructure) and `GET /api/v1/health` (API consumers)

---

## Authentication

All protected routes require:

```
Authorization: Bearer <access_token>
```

Access tokens expire after 15 minutes. Use the refresh endpoint to obtain new tokens.

---

## Standard Response Format

```json
{
  "success": true,
  "data": { }
}
```

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

---

## ✅ Implemented Endpoints

### Health

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/health` | Infrastructure health check | No |
| GET | `/api/v1/health` | API health check | No |

**Response:**
```json
{ "status": "ok" }
```

---

### Auth

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/v1/auth/register` | Register new customer | No |
| POST | `/api/v1/auth/login` | Login with email + password | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout (revoke refresh token) | Yes |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |

#### POST `/api/v1/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": null,
      "roles": ["CUSTOMER"]
    },
    "tokens": {
      "accessToken": "jwt...",
      "refreshToken": "jwt..."
    }
  }
}
```

#### POST `/api/v1/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

#### POST `/api/v1/auth/refresh`

**Request:**
```json
{
  "refreshToken": "jwt..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "jwt...",
      "refreshToken": "jwt..."
    }
  }
}
```

#### POST `/api/v1/auth/logout`

Requires: `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": null
}
```

#### GET `/api/v1/auth/me`

Requires: `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "avatarUrl": null,
    "roles": ["CUSTOMER"]
  }
}
```

---

## 📋 Planned Endpoints

### Users — Phase B4

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/users` | List users (paginated) | ADMIN |
| GET | `/api/v1/users/:id` | Get user profile | Self, ADMIN |
| PATCH | `/api/v1/users/:id` | Update profile / status | Self, ADMIN |

---

### Restaurants — Phase B5

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/restaurants` | List restaurants (filtered, paginated) | Public |
| GET | `/api/v1/restaurants/:id` | Restaurant detail + menu | Public |
| POST | `/api/v1/restaurants` | Create restaurant | OWNER |
| PATCH | `/api/v1/restaurants/:id` | Update restaurant | OWNER, ADMIN |
| DELETE | `/api/v1/restaurants/:id` | Delete restaurant | OWNER, ADMIN |

**Filters**: rating, cuisine, price range, search, pagination

---

### Foods — Phase B6

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/foods` | Search foods across restaurants | Public |
| GET | `/api/v1/foods/:id` | Food detail | Public |
| POST | `/api/v1/foods` | Create food item | OWNER |
| PATCH | `/api/v1/foods/:id` | Update food item | OWNER |
| DELETE | `/api/v1/foods/:id` | Delete food item | OWNER |

---

### Cart — Phase B7

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/cart` | Get current cart + totals | CUSTOMER |
| POST | `/api/v1/cart/items` | Add item to cart | CUSTOMER |
| PATCH | `/api/v1/cart/items/:id` | Update item quantity | CUSTOMER |
| DELETE | `/api/v1/cart/items/:id` | Remove item from cart | CUSTOMER |

---

### Orders — Phase B8

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/orders` | Create order from cart | CUSTOMER |
| GET | `/api/v1/orders` | List user's orders | CUSTOMER, OWNER, DELIVERY |
| GET | `/api/v1/orders/:id` | Order detail + status history | Stakeholders |
| PATCH | `/api/v1/orders/:id/status` | Update order status | Role-gated |

---

### Payments — Phase B9

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/payments/create-order` | Create Razorpay order | CUSTOMER |
| POST | `/api/v1/payments/webhook` | Razorpay webhook | No auth (signature) |

---

### Delivery — Phase B10

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/delivery/orders` | Available deliveries | DELIVERY |
| POST | `/api/v1/delivery/orders/:id/accept` | Accept delivery | DELIVERY |
| PATCH | `/api/v1/delivery/orders/:id/status` | Update delivery status | DELIVERY |

---

### Reviews — Phase B11

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/reviews` | Create review | CUSTOMER |
| GET | `/api/v1/reviews/:restaurantId` | List restaurant reviews | Public |

---

### Notifications — Phase B12

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/notifications` | List user notifications | All |
| PATCH | `/api/v1/notifications/:id/read` | Mark as read | All |

---

### Recommendations — Phase B13

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/recommendations` | Get personalized restaurant list | CUSTOMER |

---

### Analytics — Phase B14

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/v1/analytics/restaurant/:id` | Restaurant dashboard metrics | OWNER |
| GET | `/api/v1/analytics/admin` | Platform-wide metrics | ADMIN |

---

## Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid auth header |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body/query |
| `CONFLICT` | 409 | Resource already exists |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `RATE_LIMITED` | 429 | Too many requests |
| `ORDER_NOT_CANCELLABLE` | 400 | Order cannot be cancelled |
| `INVALID_STATUS_TRANSITION` | 400 | Disallowed status change |
| `PAYMENT_FAILED` | 402 | Payment processing error |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
