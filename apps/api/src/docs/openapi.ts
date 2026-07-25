const authResponseExample = {
  success: true,
  data: {
    user: { id: "089ecff0-b46f-4933-929d-64c96e20d16b", email: "user@example.com", fullName: "John Doe", avatarUrl: null, roles: ["CUSTOMER"] },
    tokens: { accessToken: "eyJhbGciOiJIUzI1NiIs...", refreshToken: "eyJhbGciOiJIUzI1NiIs...", expiresIn: 900 },
  },
};

const errorExample = { success: false, error: { code: "VALIDATION_ERROR", message: "email: Invalid email" } };

const paginationMeta = { page: 1, pageSize: 10, total: 1, totalPages: 1 };

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "FoodyGo API",
    version: "1.0.0",
    description:
      "Food delivery platform backend API. All authenticated endpoints require a Bearer JWT token obtained from `/api/v1/auth/login` or `/api/v1/auth/register`.",
  },
  servers: [{ url: "http://localhost:4000", description: "Local development" }],
  paths: {
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Creates a new user account with CUSTOMER role. Returns JWT tokens.",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterDTO" },
              example: { email: "user@example.com", password: "password123", fullName: "John Doe" },
            },
          },
          required: true,
        },
        responses: {
          "201": { description: "User registered successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" }, example: authResponseExample } } },
          "409": { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { ...errorExample, error: { code: "EMAIL_ALREADY_EXISTS", message: "An account with this email already exists" } } } } },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        description: "Authenticates a user and returns JWT tokens.",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginDTO" },
              example: { email: "user@example.com", password: "password123" },
            },
          },
          required: true,
        },
        responses: {
          "200": { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" }, example: authResponseExample } } },
          "401": { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" }, example: { ...errorExample, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } } } } },
        },
      },
    },
    "/api/v1/auth/google": {
      post: {
        tags: ["Auth"],
        summary: "Login/Register with Google",
        description: "Authenticates via Google ID token. Creates account if new.",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GoogleLoginDTO" },
              example: { idToken: "google-oauth-id-token-here" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Google login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" }, example: authResponseExample } } } },
      },
    },
    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        description: "Exchange a refresh token for a new access token pair.",
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshDTO" },
              example: { refreshToken: "eyJhbGciOiJIUzI1NiIs..." },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Token refreshed", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" }, example: authResponseExample } } } },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and revoke refresh tokens",
        description: "Revokes all refresh tokens for the authenticated user.",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Logged out", content: { "application/json": { example: { success: true, data: null } } } } },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current user profile",
        description: "Returns the authenticated user's profile with roles.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponseData" },
                example: { success: true, data: { id: "089ecff0-b46f-4933-929d-64c96e20d16b", email: "user@example.com", fullName: "John Doe", avatarUrl: null, roles: ["CUSTOMER"] } },
              },
            },
          },
        },
      },
    },

    "/api/v1/users": {
      get: {
        tags: ["Users"],
        summary: "List users (admin)",
        description: "Paginated list of all users. Admin only.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 }, description: "Page number" },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10, example: 10 }, description: "Items per page" },
          { in: "query", name: "search", schema: { type: "string", example: "john" }, description: "Search by name or email" },
          { in: "query", name: "status", schema: { type: "string", enum: ["ACTIVE", "SUSPENDED", "BANNED"], example: "ACTIVE" }, description: "Filter by status" },
        ],
        responses: {
          "200": {
            description: "Paginated users",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedUsers" },
                example: { success: true, data: [{ id: "089ecff0-b46f-4933-929d-64c96e20d16b", email: "user@example.com", fullName: "John Doe", avatarUrl: null, status: "ACTIVE", createdAt: "2025-01-01T00:00:00.000Z" }], meta: paginationMeta },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get user profile by ID",
        description: "Returns a user's public profile.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" }, description: "User UUID" }],
        responses: {
          "200": {
            description: "User profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponseData" },
                example: { success: true, data: { id: "089ecff0-b46f-4933-929d-64c96e20d16b", email: "user@example.com", fullName: "John Doe", avatarUrl: null, status: "ACTIVE", createdAt: "2025-01-01T00:00:00.000Z" } },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Users"],
        summary: "Update user profile",
        description: "Update your own profile details.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserDTO" },
              example: { fullName: "John Updated", avatarUrl: "https://example.com/avatar.jpg" },
            },
          },
        },
        responses: {
          "200": {
            description: "Profile updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponseData" },
                example: { success: true, data: { id: "089ecff0-b46f-4933-929d-64c96e20d16b", email: "user@example.com", fullName: "John Updated", avatarUrl: "https://example.com/avatar.jpg", status: "ACTIVE" } },
              },
            },
          },
        },
      },
    },
    "/api/v1/users/{id}/status": {
      patch: {
        tags: ["Users"],
        summary: "Update user status (admin)",
        description: "Suspend, ban, or activate a user account.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateUserStatusDTO" },
              example: { status: "SUSPENDED" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Status updated", content: { "application/json": { example: { success: true, data: { id: "089ecff0-b46f-4933-929d-64c96e20d16b", status: "SUSPENDED" } } } } } },
      },
    },

    "/api/v1/restaurants": {
      get: {
        tags: ["Restaurants"],
        summary: "List approved restaurants (public)",
        description: "Public endpoint to browse approved restaurants with optional filters.",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10, example: 10 } },
          { in: "query", name: "search", schema: { type: "string", example: "pizza" }, description: "Search by name" },
          { in: "query", name: "ratingMin", schema: { type: "number", example: 3.5 }, description: "Minimum rating filter" },
          { in: "query", name: "ratingMax", schema: { type: "number", example: 5 }, description: "Maximum rating filter" },
        ],
        responses: {
          "200": {
            description: "Paginated restaurants",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedRestaurants" },
                example: { success: true, data: [{ id: "uuid", ownerUserId: "uuid", name: "Pizza Paradise", description: "Best pizza in town", logoUrl: null, coverUrl: null, phone: "+1234567890", email: "contact@pizzaparadise.com", address: "123 Main St", latitude: 40.7128, longitude: -74.006, rating: 4.5, status: "APPROVED" }], meta: paginationMeta },
              },
            },
          },
        },
      },
      post: {
        tags: ["Restaurants"],
        summary: "Create a restaurant (owner)",
        description: "Register a new restaurant. Requires RESTAURANT_OWNER role.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateRestaurantDTO" },
              example: { name: "Pizza Paradise", description: "Best pizza in town", phone: "+1234567890", email: "contact@pizzaparadise.com", address: "123 Main St, New York, NY", latitude: 40.7128, longitude: -74.006 },
            },
          },
          required: true,
        },
        responses: {
          "201": {
            description: "Restaurant created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RestaurantData" },
                example: { success: true, data: { id: "uuid", ownerUserId: "uuid", name: "Pizza Paradise", description: "Best pizza in town", logoUrl: null, coverUrl: null, phone: "+1234567890", email: "contact@pizzaparadise.com", address: "123 Main St, New York, NY", latitude: 40.7128, longitude: -74.006, rating: 0, status: "PENDING" } },
              },
            },
          },
        },
      },
    },
    "/api/v1/restaurants/my": {
      get: {
        tags: ["Restaurants"],
        summary: "Get my restaurants (owner)",
        description: "Returns all restaurants owned by the authenticated user.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "My restaurants",
            content: {
              "application/json": {
                example: { success: true, data: [{ id: "uuid", ownerUserId: "uuid", name: "Pizza Paradise", description: "Best pizza in town", logoUrl: null, coverUrl: null, phone: "+1234567890", email: "contact@pizzaparadise.com", address: "123 Main St", latitude: 40.7128, longitude: -74.006, rating: 4.5, status: "APPROVED", deletedAt: null }] },
              },
            },
          },
        },
      },
    },
    "/api/v1/restaurants/{id}": {
      get: {
        tags: ["Restaurants"],
        summary: "Get restaurant by ID (public)",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }],
        responses: {
          "200": {
            description: "Restaurant details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RestaurantData" },
                example: { success: true, data: { id: "550e8400-e29b-41d4-a716-446655440000", ownerUserId: "uuid", name: "Pizza Paradise", description: "Best pizza in town", logoUrl: null, coverUrl: null, phone: "+1234567890", email: "contact@pizzaparadise.com", address: "123 Main St", latitude: 40.7128, longitude: -74.006, rating: 4.5, status: "APPROVED" } },
              },
            },
          },
          "404": { description: "Restaurant not found" },
        },
      },
      patch: {
        tags: ["Restaurants"],
        summary: "Update restaurant (owner/admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRestaurantDTO" },
              example: { name: "Pizza Paradise Updated", description: "Now with vegan options!", logoUrl: "https://example.com/logo.png" },
            },
          },
        },
        responses: { "200": { description: "Restaurant updated", content: { "application/json": { example: { success: true, data: { id: "uuid", name: "Pizza Paradise Updated" } } } } } },
      },
      delete: {
        tags: ["Restaurants"],
        summary: "Soft-delete restaurant (owner/admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }],
        responses: { "200": { description: "Restaurant deleted", content: { "application/json": { example: { success: true, data: { id: "uuid", deletedAt: "2025-01-01T00:00:00.000Z" } } } } } },
      },
    },
    "/api/v1/restaurants/{id}/status": {
      patch: {
        tags: ["Restaurants"],
        summary: "Update restaurant status (admin)",
        description: "Approve, reject, or suspend a restaurant.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateRestaurantStatusDTO" },
              example: { status: "APPROVED" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Status updated", content: { "application/json": { example: { success: true, data: { id: "uuid", status: "APPROVED" } } } } } },
      },
    },
    "/api/v1/restaurants/admin/all": {
      get: {
        tags: ["Restaurants"],
        summary: "List all restaurants (admin)",
        description: "Admin view of all restaurants with filtering by status.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10, example: 10 } },
          { in: "query", name: "search", schema: { type: "string", example: "pizza" } },
          { in: "query", name: "status", schema: { type: "string", example: "PENDING" }, description: "Filter by status: PENDING, APPROVED, REJECTED, SUSPENDED" },
        ],
        responses: { "200": { description: "Paginated restaurants", content: { "application/json": { schema: { $ref: "#/components/schemas/PaginatedRestaurants" }, example: { success: true, data: [], meta: paginationMeta } } } } },
      },
    },

    "/api/v1/foods": {
      get: {
        tags: ["Foods"],
        summary: "List foods (public)",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10, example: 10 } },
          { in: "query", name: "search", schema: { type: "string", example: "pepperoni" } },
          { in: "query", name: "restaurantId", schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } },
          { in: "query", name: "categoryId", schema: { type: "string", format: "uuid", example: "660e8400-e29b-41d4-a716-446655440001" } },
        ],
        responses: {
          "200": {
            description: "Paginated foods",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedFoods" },
                example: { success: true, data: [{ id: "uuid", restaurantId: "uuid", categoryId: "uuid", name: "Pepperoni Pizza", description: "Classic pepperoni", imageUrl: "https://example.com/pizza.jpg", price: 12.99, isAvailable: true }], meta: paginationMeta },
              },
            },
          },
        },
      },
    },
    "/api/v1/foods/{id}": {
      get: {
        tags: ["Foods"],
        summary: "Get food by ID (public)",
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "770e8400-e29b-41d4-a716-446655440002" } }],
        responses: {
          "200": {
            description: "Food details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/FoodData" },
                example: { success: true, data: { id: "770e8400-e29b-41d4-a716-446655440002", restaurantId: "uuid", categoryId: "uuid", name: "Pepperoni Pizza", description: "Classic pepperoni", imageUrl: "https://example.com/pizza.jpg", price: 12.99, isAvailable: true } },
              },
            },
          },
        },
      },
    },
    "/api/v1/foods/restaurant/{restaurantId}": {
      get: {
        tags: ["Foods"],
        summary: "Get all foods and categories for a restaurant",
        parameters: [{ in: "path", name: "restaurantId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }],
        responses: {
          "200": {
            description: "Foods with categories",
            content: {
              "application/json": {
                example: { success: true, data: { foods: [{ id: "uuid", restaurantId: "uuid", categoryId: "uuid", name: "Pepperoni Pizza", price: 12.99, isAvailable: true }], categories: [{ id: "uuid", restaurantId: "uuid", name: "Pizzas" }] } },
              },
            },
          },
        },
      },
    },
    "/api/v1/foods/{id}/restaurant/{restaurantId}": {
      patch: {
        tags: ["Foods"],
        summary: "Update a food item (owner)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "770e8400-e29b-41d4-a716-446655440002" } },
          { in: "path", name: "restaurantId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateFoodDTO" },
              example: { price: 14.99, isAvailable: false },
            },
          },
        },
        responses: { "200": { description: "Food updated", content: { "application/json": { example: { success: true, data: { id: "uuid", price: 14.99, isAvailable: false } } } } } },
      },
      delete: {
        tags: ["Foods"],
        summary: "Soft-delete a food item (owner)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "770e8400-e29b-41d4-a716-446655440002" } },
          { in: "path", name: "restaurantId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } },
        ],
        responses: { "200": { description: "Food deleted", content: { "application/json": { example: { success: true, data: { id: "uuid", deletedAt: "2025-01-01T00:00:00.000Z" } } } } } },
      },
    },
    "/api/v1/foods/restaurant/{restaurantId}/category": {
      post: {
        tags: ["Foods"],
        summary: "Create a food category (owner)",
        description: "Add a new category (e.g. Pizzas, Drinks) to your restaurant.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "restaurantId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateFoodCategoryDTO" },
              example: { name: "Pizzas" },
            },
          },
          required: true,
        },
        responses: { "201": { description: "Category created", content: { "application/json": { example: { success: true, data: { id: "uuid", restaurantId: "uuid", name: "Pizzas" } } } } } },
      },
    },
    "/api/v1/foods/category/{id}/restaurant/{restaurantId}": {
      patch: {
        tags: ["Foods"],
        summary: "Update a food category (owner)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "660e8400-e29b-41d4-a716-446655440001" } },
          { in: "path", name: "restaurantId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateFoodCategoryDTO" },
              example: { name: "Artisan Pizzas" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Category updated", content: { "application/json": { example: { success: true, data: { id: "uuid", name: "Artisan Pizzas" } } } } } },
      },
      delete: {
        tags: ["Foods"],
        summary: "Delete a food category (owner)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "660e8400-e29b-41d4-a716-446655440001" } },
          { in: "path", name: "restaurantId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } },
        ],
        responses: { "200": { description: "Category deleted", content: { "application/json": { example: { success: true, data: { id: "uuid" } } } } } },
      },
    },

    "/api/v1/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get or create cart",
        description: "Returns the current user's cart. Creates one if it doesn't exist.",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Cart with items",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CartData" },
                example: { success: true, data: { id: "uuid", userId: "uuid", items: [{ id: "uuid", cartId: "uuid", foodId: "uuid", quantity: 2, food: { id: "uuid", restaurantId: "uuid", name: "Pepperoni Pizza", price: 12.99, imageUrl: "https://example.com/pizza.jpg" } }] } },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear all items from cart",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Cart cleared", content: { "application/json": { example: { success: true, data: { id: "uuid", userId: "uuid", items: [] } } } } } },
      },
    },
    "/api/v1/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Add item to cart",
        description: "Add a food item. If it already exists, increments quantity.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddCartItemDTO" },
              example: { foodId: "770e8400-e29b-41d4-a716-446655440002", quantity: 2 },
            },
          },
          required: true,
        },
        responses: { "201": { description: "Item added", content: { "application/json": { schema: { $ref: "#/components/schemas/CartData" }, example: { success: true, data: { id: "uuid", userId: "uuid", items: [] } } } } } },
      },
    },
    "/api/v1/cart/items/{itemId}": {
      patch: {
        tags: ["Cart"],
        summary: "Update cart item quantity",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "itemId", required: true, schema: { type: "string", format: "uuid", example: "880e8400-e29b-41d4-a716-446655440003" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCartItemDTO" },
              example: { quantity: 3 },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Item updated", content: { "application/json": { schema: { $ref: "#/components/schemas/CartData" }, example: { success: true, data: { id: "uuid", userId: "uuid", items: [] } } } } } },
      },
      delete: {
        tags: ["Cart"],
        summary: "Remove item from cart",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "itemId", required: true, schema: { type: "string", format: "uuid", example: "880e8400-e29b-41d4-a716-446655440003" } }],
        responses: { "200": { description: "Item removed", content: { "application/json": { schema: { $ref: "#/components/schemas/CartData" }, example: { success: true, data: { id: "uuid", userId: "uuid", items: [] } } } } } },
      },
    },

    "/api/v1/addresses": {
      get: {
        tags: ["Addresses"],
        summary: "List my addresses",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Address list",
            content: {
              "application/json": {
                example: { success: true, data: [{ id: "uuid", userId: "uuid", label: "Home", addressLine1: "123 Main St", addressLine2: null, city: "New York", state: "NY", postalCode: "10001" }] },
              },
            },
          },
        },
      },
      post: {
        tags: ["Addresses"],
        summary: "Create a new address",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAddressDTO" },
              example: { label: "Home", addressLine1: "123 Main St", addressLine2: "Apt 4B", city: "New York", state: "NY", postalCode: "10001", latitude: 40.7128, longitude: -74.006 },
            },
          },
          required: true,
        },
        responses: { "201": { description: "Address created", content: { "application/json": { example: { success: true, data: { id: "uuid", userId: "uuid", label: "Home", addressLine1: "123 Main St", addressLine2: "Apt 4B", city: "New York", state: "NY", postalCode: "10001" } } } } } },
      },
    },
    "/api/v1/addresses/{id}": {
      get: {
        tags: ["Addresses"],
        summary: "Get address by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "990e8400-e29b-41d4-a716-446655440004" } }],
        responses: { "200": { description: "Address details", content: { "application/json": { example: { success: true, data: { id: "uuid", userId: "uuid", label: "Home", addressLine1: "123 Main St", city: "New York", state: "NY", postalCode: "10001" } } } } } },
      },
      patch: {
        tags: ["Addresses"],
        summary: "Update address",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "990e8400-e29b-41d4-a716-446655440004" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateAddressDTO" },
              example: { label: "Work", addressLine1: "456 Office Blvd", city: "New York", state: "NY", postalCode: "10002" },
            },
          },
        },
        responses: { "200": { description: "Address updated", content: { "application/json": { example: { success: true, data: { id: "uuid", label: "Work", addressLine1: "456 Office Blvd", city: "New York" } } } } } },
      },
      delete: {
        tags: ["Addresses"],
        summary: "Soft-delete address",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "990e8400-e29b-41d4-a716-446655440004" } }],
        responses: { "200": { description: "Address deleted", content: { "application/json": { example: { success: true, data: { id: "uuid" } } } } } },
      },
    },

    "/api/v1/orders": {
      get: {
        tags: ["Orders"],
        summary: "List my orders",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10, example: 10 } },
          { in: "query", name: "status", schema: { type: "string", example: "PENDING" }, description: "Filter by order status" },
        ],
        responses: { "200": { description: "Paginated orders", content: { "application/json": { example: { success: true, data: [], meta: paginationMeta } } } } },
      },
      post: {
        tags: ["Orders"],
        summary: "Create an order from cart",
        description: "Converts the current cart into an order. Calculates fees, clears cart.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderDTO" },
              example: { addressId: "990e8400-e29b-41d4-a716-446655440004", couponCode: "SAVE10" },
            },
          },
          required: true,
        },
        responses: {
          "201": {
            description: "Order created",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    id: "uuid", userId: "uuid", restaurantId: "uuid", addressId: "uuid",
                    subtotal: 25.98, discount: 0, packingFee: 0.52, platformFee: 0, deliveryFee: 0, tax: 2.08, tip: 0, grandTotal: 28.58,
                    status: "PENDING", paymentStatus: "UNPAID", createdAt: "2025-01-01T00:00:00.000Z",
                    items: [{ id: "uuid", orderId: "uuid", foodId: "uuid", quantity: 2, price: 12.99 }],
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/orders/restaurant/{restaurantId}": {
      get: {
        tags: ["Orders"],
        summary: "List orders for a restaurant (owner)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "restaurantId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } },
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10, example: 10 } },
          { in: "query", name: "status", schema: { type: "string", example: "PENDING" } },
        ],
        responses: { "200": { description: "Paginated orders", content: { "application/json": { example: { success: true, data: [], meta: paginationMeta } } } } },
      },
    },
    "/api/v1/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" } }],
        responses: {
          "200": {
            description: "Order details with items",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    id: "aa0e8400-e29b-41d4-a716-446655440005", userId: "uuid", restaurantId: "uuid", addressId: "uuid",
                    subtotal: 25.98, discount: 0, packingFee: 0.52, platformFee: 0, deliveryFee: 0, tax: 2.08, tip: 0, grandTotal: 28.58,
                    status: "PENDING", paymentStatus: "UNPAID", createdAt: "2025-01-01T00:00:00.000Z",
                    items: [{ id: "uuid", orderId: "uuid", foodId: "uuid", quantity: 2, price: 12.99 }],
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/orders/{id}/status": {
      patch: {
        tags: ["Orders"],
        summary: "Update order status (owner/admin)",
        description: "Valid status transitions: PENDING→RESTAURANT_ACCEPTED, RESTAURANT_ACCEPTED→PREPARING, PREPARING→READY_FOR_PICKUP, READY_FOR_PICKUP→PICKED_UP, PICKED_UP→OUT_FOR_DELIVERY, OUT_FOR_DELIVERY→DELIVERED. PENDING→CANCELLED, RESTAURANT_ACCEPTED→CANCELLED.",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateOrderStatusDTO" },
              example: { status: "RESTAURANT_ACCEPTED" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Status updated", content: { "application/json": { example: { success: true, data: { id: "uuid", status: "RESTAURANT_ACCEPTED" } } } } } },
      },
    },
    "/api/v1/orders/{id}/cancel": {
      post: {
        tags: ["Orders"],
        summary: "Cancel order (only if PENDING)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" } }],
        responses: { "200": { description: "Order cancelled", content: { "application/json": { example: { success: true, data: { id: "uuid", status: "CANCELLED" } } } } } },
      },
    },

    "/api/v1/payments/create-order": {
      post: {
        tags: ["Payments"],
        summary: "Create a payment order (Razorpay)",
        description: "Creates a Razorpay order. Returns the Razorpay order ID for client-side checkout.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePaymentOrderDTO" },
              example: { orderId: "aa0e8400-e29b-41d4-a716-446655440005" },
            },
          },
          required: true,
        },
        responses: {
          "200": {
            description: "Payment order created",
            content: {
              "application/json": {
                example: { success: true, data: { id: "uuid", orderId: "uuid", razorpayOrderId: "order_abc123", amount: 28.58, status: "UNPAID" } },
              },
            },
          },
        },
      },
    },
    "/api/v1/payments/verify": {
      post: {
        tags: ["Payments"],
        summary: "Verify Razorpay payment",
        description: "Verifies the Razorpay payment signature and updates order status to PAID.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyPaymentDTO" },
              example: { razorpayPaymentId: "pay_abc123", razorpayOrderId: "order_abc123", razorpaySignature: "signature_here" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Payment verified", content: { "application/json": { example: { success: true, data: { id: "uuid", orderId: "uuid", razorpayOrderId: "order_abc123", razorpayPaymentId: "pay_abc123", amount: 28.58, status: "PAID" } } } } } },
      },
    },
    "/api/v1/payments/order/{orderId}": {
      get: {
        tags: ["Payments"],
        summary: "Get payment by order ID",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "orderId", required: true, schema: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" } }],
        responses: { "200": { description: "Payment details", content: { "application/json": { example: { success: true, data: { id: "uuid", orderId: "uuid", razorpayOrderId: "order_abc123", razorpayPaymentId: null, amount: 28.58, status: "UNPAID" } } } } } },
      },
    },

    "/api/v1/delivery/partners/register": {
      post: {
        tags: ["Delivery"],
        summary: "Register as delivery partner",
        description: "Registers the authenticated user as a delivery partner.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterPartnerDTO" },
              example: { vehicleType: "BIKE", licenseNumber: "DL-1234-5678" },
            },
          },
          required: true,
        },
        responses: { "201": { description: "Partner registered", content: { "application/json": { example: { success: true, data: { id: "uuid", userId: "uuid", vehicleType: "BIKE", licenseNumber: "DL-1234-5678" } } } } } },
      },
    },
    "/api/v1/delivery/partners/{id}": {
      patch: {
        tags: ["Delivery"],
        summary: "Update delivery partner",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "bb0e8400-e29b-41d4-a716-446655440006" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePartnerDTO" },
              example: { vehicleType: "SCOOTER" },
            },
          },
        },
        responses: { "200": { description: "Partner updated", content: { "application/json": { example: { success: true, data: { id: "uuid", vehicleType: "SCOOTER" } } } } } },
      },
    },
    "/api/v1/delivery/assignments/available": {
      get: {
        tags: ["Delivery"],
        summary: "Get available deliveries",
        description: "Returns delivery assignments waiting for acceptance.",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Available assignments", content: { "application/json": { example: { success: true, data: [{ id: "uuid", orderId: "uuid", deliveryPartnerId: "uuid", status: "ASSIGNED", assignedAt: "2025-01-01T00:00:00.000Z", acceptedAt: null, pickedUpAt: null, completedAt: null }] } } } } },
      },
    },
    "/api/v1/delivery/assignments/{id}/accept": {
      post: {
        tags: ["Delivery"],
        summary: "Accept a delivery",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "cc0e8400-e29b-41d4-a716-446655440007" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AcceptDeliveryDTO" },
              example: { orderId: "aa0e8400-e29b-41d4-a716-446655440005" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Delivery accepted", content: { "application/json": { example: { success: true, data: { id: "uuid", status: "ACCEPTED", acceptedAt: "2025-01-01T00:00:00.000Z" } } } } } },
      },
    },
    "/api/v1/delivery/assignments/{id}/pickup": {
      post: {
        tags: ["Delivery"],
        summary: "Mark delivery as picked up",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "cc0e8400-e29b-41d4-a716-446655440007" } }],
        responses: { "200": { description: "Marked as picked up", content: { "application/json": { example: { success: true, data: { id: "uuid", status: "PICKED_UP", pickedUpAt: "2025-01-01T00:00:00.000Z" } } } } } },
      },
    },
    "/api/v1/delivery/assignments/{id}/complete": {
      post: {
        tags: ["Delivery"],
        summary: "Mark delivery as completed",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "cc0e8400-e29b-41d4-a716-446655440007" } }],
        responses: { "200": { description: "Delivery completed", content: { "application/json": { example: { success: true, data: { id: "uuid", status: "COMPLETED", completedAt: "2025-01-01T00:00:00.000Z" } } } } } },
      },
    },
    "/api/v1/delivery/assignments/my": {
      get: {
        tags: ["Delivery"],
        summary: "Get my delivery assignments",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "My assignments", content: { "application/json": { example: { success: true, data: [{ id: "uuid", orderId: "uuid", deliveryPartnerId: "uuid", status: "ACCEPTED", assignedAt: "2025-01-01T00:00:00.000Z" }] } } } } },
      },
    },

    "/api/v1/reviews/restaurant/{restaurantId}": {
      get: {
        tags: ["Reviews"],
        summary: "List reviews for a restaurant (public)",
        parameters: [
          { in: "path", name: "restaurantId", required: true, schema: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } },
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10, example: 10 } },
        ],
        responses: { "200": { description: "Paginated reviews", content: { "application/json": { example: { success: true, data: [{ id: "uuid", userId: "uuid", restaurantId: "uuid", rating: 5, comment: "Amazing pizza!", createdAt: "2025-01-01T00:00:00.000Z" }], meta: paginationMeta } } } } },
      },
    },
    "/api/v1/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Create a review",
        description: "Submit a rating and optional comment. One review per user per restaurant.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateReviewDTO" },
              example: { restaurantId: "550e8400-e29b-41d4-a716-446655440000", rating: 5, comment: "Amazing pizza! Highly recommend." },
            },
          },
          required: true,
        },
        responses: { "201": { description: "Review created", content: { "application/json": { example: { success: true, data: { id: "uuid", userId: "uuid", restaurantId: "uuid", rating: 5, comment: "Amazing pizza!", createdAt: "2025-01-01T00:00:00.000Z" } } } } } },
      },
    },
    "/api/v1/reviews/{id}": {
      delete: {
        tags: ["Reviews"],
        summary: "Delete a review",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "dd0e8400-e29b-41d4-a716-446655440008" } }],
        responses: { "200": { description: "Review deleted", content: { "application/json": { example: { success: true, data: { id: "uuid" } } } } } },
      },
    },

    "/api/v1/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "List my notifications",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", default: 1, example: 1 } },
          { in: "query", name: "pageSize", schema: { type: "integer", default: 10, example: 10 } },
        ],
        responses: { "200": { description: "Paginated notifications", content: { "application/json": { example: { success: true, data: [{ id: "uuid", userId: "uuid", title: "Order Confirmed", body: "Your order #123 has been confirmed.", isRead: false, createdAt: "2025-01-01T00:00:00.000Z" }], meta: paginationMeta } } } } },
      },
    },
    "/api/v1/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark notification as read",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "ee0e8400-e29b-41d4-a716-446655440009" } }],
        responses: { "200": { description: "Marked as read", content: { "application/json": { example: { success: true, data: { id: "uuid", isRead: true } } } } } },
      },
    },
    "/api/v1/notifications/read-all": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "All marked as read", content: { "application/json": { example: { success: true, data: { count: 5 } } } } } },
      },
    },
    "/api/v1/notifications/{id}": {
      delete: {
        tags: ["Notifications"],
        summary: "Delete a notification",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "ee0e8400-e29b-41d4-a716-446655440009" } }],
        responses: { "200": { description: "Notification deleted", content: { "application/json": { example: { success: true, data: { id: "uuid" } } } } } },
      },
    },

    "/api/v1/coupons": {
      get: {
        tags: ["Coupons"],
        summary: "List all coupons (admin)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Coupon list", content: { "application/json": { example: { success: true, data: [{ id: "uuid", code: "SAVE10", discountType: "PERCENTAGE", discountValue: 10, expiryDate: "2025-12-31T23:59:59.000Z" }] } } } } },
      },
      post: {
        tags: ["Coupons"],
        summary: "Create a coupon (admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCouponDTO" },
              example: { code: "SAVE10", discountType: "PERCENTAGE", discountValue: 10, expiryDate: "2025-12-31T23:59:59.000Z" },
            },
          },
          required: true,
        },
        responses: { "201": { description: "Coupon created", content: { "application/json": { example: { success: true, data: { id: "uuid", code: "SAVE10", discountType: "PERCENTAGE", discountValue: 10, expiryDate: "2025-12-31T23:59:59.000Z" } } } } } },
      },
    },
    "/api/v1/coupons/{id}": {
      patch: {
        tags: ["Coupons"],
        summary: "Update a coupon (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "ff0e8400-e29b-41d4-a716-446655440010" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCouponDTO" },
              example: { discountValue: 15 },
            },
          },
        },
        responses: { "200": { description: "Coupon updated", content: { "application/json": { example: { success: true, data: { id: "uuid", discountValue: 15 } } } } } },
      },
      delete: {
        tags: ["Coupons"],
        summary: "Delete a coupon (admin)",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string", format: "uuid", example: "ff0e8400-e29b-41d4-a716-446655440010" } }],
        responses: { "200": { description: "Coupon deleted", content: { "application/json": { example: { success: true, data: { id: "uuid" } } } } } },
      },
    },
    "/api/v1/coupons/validate": {
      post: {
        tags: ["Coupons"],
        summary: "Validate a coupon code",
        description: "Check if a coupon code is valid and not expired.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ValidateCouponDTO" },
              example: { code: "SAVE10" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Coupon is valid", content: { "application/json": { example: { success: true, data: { id: "uuid", code: "SAVE10", discountType: "PERCENTAGE", discountValue: 10, expiryDate: "2025-12-31T23:59:59.000Z" } } } } } },
      },
    },

    "/api/v1/favorites": {
      get: {
        tags: ["Favorites"],
        summary: "List my favorite restaurants",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Favorites list", content: { "application/json": { example: { success: true, data: [{ id: "uuid", userId: "uuid", restaurantId: "uuid", restaurant: { id: "uuid", name: "Pizza Paradise", rating: 4.5 } }] } } } } },
      },
      post: {
        tags: ["Favorites"],
        summary: "Toggle restaurant favorite",
        description: "Adds if not favorited, removes if already favorited.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ToggleFavoriteDTO" },
              example: { restaurantId: "550e8400-e29b-41d4-a716-446655440000" },
            },
          },
          required: true,
        },
        responses: { "200": { description: "Toggled", content: { "application/json": { example: { success: true, data: { favorited: true } } } } } },
      },
    },

    "/health": { get: { tags: ["Health"], summary: "Simple health check", responses: { "200": { description: "OK", content: { "application/json": { example: { status: "ok" } } } } } } },
    "/api/v1/health": {
      get: {
        tags: ["Health"],
        summary: "Detailed health check",
        responses: { "200": { description: "OK", content: { "application/json": { example: { status: "ok", timestamp: "2025-01-01T00:00:00.000Z", uptime: 3600 } } } } },
      },
    },

    "/api/v1/recommendations": {
      get: {
        tags: ["Recommendations"],
        summary: "Get personalized restaurant recommendations",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Scored restaurant list", content: { "application/json": { example: { success: true, data: [{ id: "uuid", name: "Pizza Paradise", score: 7, rating: 4.5 }] } } } },
        },
      },
    },

    "/api/v1/analytics/restaurant/{id}": {
      get: {
        tags: ["Analytics"],
        summary: "Get restaurant analytics",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: {
          "200": { description: "Restaurant metrics", content: { "application/json": { example: { success: true, data: { ordersToday: 12, revenueToday: 45.5, revenueThisMonth: 1200.0, popularFoods: [{ name: "Margherita", totalOrdered: 34 }] } } } } },
        },
      },
    },

    "/api/v1/analytics/admin": {
      get: {
        tags: ["Analytics"],
        summary: "Get platform-wide analytics",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Admin metrics", content: { "application/json": { example: { success: true, data: { totalUsers: 1200, totalOrders: 3400, totalRevenue: 45000, activeRestaurants: 45, activeDeliveryPartners: 30 } } } } },
        },
      },
    },

    "/api/v1/payments/webhook": {
      post: {
        tags: ["Payments"],
        summary: "Razorpay payment webhook",
        description: "No auth — verified by HMAC-SHA256 signature",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" }, example: { event: "payment.captured", payload: { payment: { entity: { id: "pay_xxxxxxxx", order_id: "order_xxxxxxxx", status: "captured" } } } } } } },
        responses: {
          "200": { description: "Webhook processed" },
          "400": { description: "Invalid signature" },
        },
      },
    },

    "/api/v1/restaurants/{id}/documents": {
      get: {
        tags: ["Restaurants"],
        summary: "List restaurant documents",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Document list", content: { "application/json": { example: { success: true, data: [{ id: "uuid", documentType: "license", documentUrl: "/uploads/restaurants/file.pdf", verificationStatus: "PENDING" }] } } } } },
      },
      post: {
        tags: ["Restaurants"],
        summary: "Upload a restaurant document (multipart)",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "multipart/form-data": { schema: { type: "object", properties: { document: { type: "string", format: "binary" }, documentType: { type: "string", example: "license" } }, required: ["document", "documentType"] } } } },
        responses: { "201": { description: "Document uploaded" } },
      },
    },

    "/api/v1/restaurants/documents/{documentId}/verify": {
      patch: {
        tags: ["Restaurants"],
        summary: "Verify or reject a document",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "documentId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/VerifyDocumentDTO" } } } },
        responses: { "200": { description: "Document verification status updated" } },
      },
    },

    "/api/v1/notifications/unread-count": {
      get: {
        tags: ["Notifications"],
        summary: "Get unread notification count",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Unread count", content: { "application/json": { example: { success: true, data: { count: 3 } } } } } },
      },
    },
  },

  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      RegisterDTO: {
        type: "object",
        required: ["email", "password", "fullName"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
          fullName: { type: "string", example: "John Doe" },
        },
      },
      LoginDTO: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      GoogleLoginDTO: { type: "object", required: ["idToken"], properties: { idToken: { type: "string", example: "google-oauth-id-token-here" } } },
      RefreshDTO: { type: "object", required: ["refreshToken"], properties: { refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." } } },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" },
                  email: { type: "string", example: "user@example.com" },
                  fullName: { type: "string", example: "John Doe" },
                  avatarUrl: { type: "string", nullable: true, example: null },
                  roles: { type: "array", items: { type: "string" }, example: ["CUSTOMER"] },
                },
              },
              tokens: {
                type: "object",
                properties: {
                  accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                  refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
                  expiresIn: { type: "integer", example: 900 },
                },
              },
            },
          },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" },
          email: { type: "string", example: "user@example.com" },
          fullName: { type: "string", example: "John Doe" },
          avatarUrl: { type: "string", nullable: true, example: null },
          status: { type: "string", example: "ACTIVE" },
          createdAt: { type: "string", format: "date-time", example: "2025-01-01T00:00:00.000Z" },
        },
      },
      UserResponseData: {
        type: "object",
        properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/UserProfile" } },
      },
      UpdateUserDTO: {
        type: "object",
        properties: {
          fullName: { type: "string", example: "John Updated" },
          avatarUrl: { type: "string", nullable: true, example: "https://example.com/avatar.jpg" },
        },
      },
      UpdateUserStatusDTO: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: ["ACTIVE", "SUSPENDED", "BANNED"], example: "SUSPENDED" } },
      },
      PaginatedUsers: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "array", items: { $ref: "#/components/schemas/UserProfile" } },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },

      CreateRestaurantDTO: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Pizza Paradise" },
          description: { type: "string", example: "Best pizza in town" },
          phone: { type: "string", example: "+1234567890" },
          email: { type: "string", format: "email", example: "contact@pizzaparadise.com" },
          address: { type: "string", example: "123 Main St, New York, NY" },
          latitude: { type: "number", example: 40.7128 },
          longitude: { type: "number", example: -74.006 },
        },
      },
      UpdateRestaurantDTO: {
        type: "object",
        properties: {
          name: { type: "string", example: "Pizza Paradise Updated" },
          description: { type: "string", example: "Now with vegan options!" },
          logoUrl: { type: "string", example: "https://example.com/logo.png" },
          coverUrl: { type: "string", example: "https://example.com/cover.jpg" },
          phone: { type: "string", example: "+1234567890" },
          email: { type: "string", format: "email", example: "contact@pizzaparadise.com" },
          address: { type: "string", example: "456 Oak Ave, New York, NY" },
          latitude: { type: "number", example: 40.758 },
          longitude: { type: "number", example: -73.9855 },
        },
      },
      UpdateRestaurantStatusDTO: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"], example: "APPROVED" } },
      },
      Restaurant: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
          ownerUserId: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" },
          name: { type: "string", example: "Pizza Paradise" },
          description: { type: "string", nullable: true, example: "Best pizza in town" },
          logoUrl: { type: "string", nullable: true, example: null },
          coverUrl: { type: "string", nullable: true, example: null },
          phone: { type: "string", nullable: true, example: "+1234567890" },
          email: { type: "string", nullable: true, example: "contact@pizzaparadise.com" },
          address: { type: "string", example: "123 Main St, New York, NY" },
          latitude: { type: "number", example: 40.7128 },
          longitude: { type: "number", example: -74.006 },
          rating: { type: "number", example: 4.5 },
          status: { type: "string", example: "APPROVED" },
        },
      },
      RestaurantData: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Restaurant" } } },
      PaginatedRestaurants: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "array", items: { $ref: "#/components/schemas/Restaurant" } },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },

      UpdateFoodDTO: {
        type: "object",
        properties: {
          name: { type: "string", example: "Pepperoni Supreme" },
          description: { type: "string", example: "Pepperoni with extra cheese" },
          imageUrl: { type: "string", example: "https://example.com/new-pizza.jpg" },
          price: { type: "number", example: 14.99 },
          isAvailable: { type: "boolean", example: false },
          categoryId: { type: "string", format: "uuid", example: "660e8400-e29b-41d4-a716-446655440001" },
        },
      },
      CreateFoodCategoryDTO: { type: "object", required: ["name"], properties: { name: { type: "string", example: "Pizzas" } } },
      Food: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "770e8400-e29b-41d4-a716-446655440002" },
          restaurantId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
          categoryId: { type: "string", format: "uuid", nullable: true, example: "660e8400-e29b-41d4-a716-446655440001" },
          name: { type: "string", example: "Pepperoni Pizza" },
          description: { type: "string", nullable: true, example: "Classic pepperoni with mozzarella" },
          imageUrl: { type: "string", nullable: true, example: "https://example.com/pizza.jpg" },
          price: { type: "number", example: 12.99 },
          isAvailable: { type: "boolean", example: true },
        },
      },
      FoodData: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Food" } } },
      PaginatedFoods: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          data: { type: "array", items: { $ref: "#/components/schemas/Food" } },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },

      AddCartItemDTO: {
        type: "object",
        required: ["foodId", "quantity"],
        properties: {
          foodId: { type: "string", format: "uuid", example: "770e8400-e29b-41d4-a716-446655440002" },
          quantity: { type: "integer", minimum: 1, example: 2 },
        },
      },
      UpdateCartItemDTO: { type: "object", required: ["quantity"], properties: { quantity: { type: "integer", minimum: 1, example: 3 } } },
      Cart: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" },
          userId: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" },
          items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "bb0e8400-e29b-41d4-a716-446655440006" },
          cartId: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" },
          foodId: { type: "string", format: "uuid", example: "770e8400-e29b-41d4-a716-446655440002" },
          quantity: { type: "integer", example: 2 },
          food: { $ref: "#/components/schemas/Food" },
        },
      },
      CartData: { type: "object", properties: { success: { type: "boolean" }, data: { $ref: "#/components/schemas/Cart" } } },

      CreateAddressDTO: {
        type: "object",
        required: ["addressLine1", "city", "state", "postalCode"],
        properties: {
          label: { type: "string", example: "Home" },
          addressLine1: { type: "string", example: "123 Main St" },
          addressLine2: { type: "string", example: "Apt 4B" },
          city: { type: "string", example: "New York" },
          state: { type: "string", example: "NY" },
          postalCode: { type: "string", example: "10001" },
          latitude: { type: "number", example: 40.7128 },
          longitude: { type: "number", example: -74.006 },
        },
      },
      UpdateAddressDTO: {
        type: "object",
        properties: {
          label: { type: "string", example: "Work" },
          addressLine1: { type: "string", example: "456 Office Blvd" },
          addressLine2: { type: "string", example: "Suite 200" },
          city: { type: "string", example: "New York" },
          state: { type: "string", example: "NY" },
          postalCode: { type: "string", example: "10002" },
          latitude: { type: "number", example: 40.758 },
          longitude: { type: "number", example: -73.9855 },
        },
      },
      Address: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "990e8400-e29b-41d4-a716-446655440004" },
          userId: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" },
          label: { type: "string", nullable: true, example: "Home" },
          addressLine1: { type: "string", example: "123 Main St" },
          addressLine2: { type: "string", nullable: true, example: "Apt 4B" },
          city: { type: "string", example: "New York" },
          state: { type: "string", example: "NY" },
          postalCode: { type: "string", example: "10001" },
        },
      },

      CreateOrderDTO: {
        type: "object",
        required: ["addressId"],
        properties: {
          addressId: { type: "string", format: "uuid", example: "990e8400-e29b-41d4-a716-446655440004" },
          couponCode: { type: "string", example: "SAVE10" },
        },
      },
      UpdateOrderStatusDTO: { type: "object", required: ["status"], properties: { status: { type: "string", example: "PREPARING" } } },
      Order: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" },
          userId: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" },
          restaurantId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
          addressId: { type: "string", format: "uuid", example: "990e8400-e29b-41d4-a716-446655440004" },
          subtotal: { type: "number", example: 25.98 },
          discount: { type: "number", example: 0 },
          packingFee: { type: "number", example: 0.52 },
          platformFee: { type: "number", example: 0 },
          deliveryFee: { type: "number", example: 0 },
          tax: { type: "number", example: 2.08 },
          tip: { type: "number", example: 0 },
          grandTotal: { type: "number", example: 28.58 },
          status: { type: "string", example: "PENDING" },
          paymentStatus: { type: "string", example: "UNPAID" },
          createdAt: { type: "string", format: "date-time", example: "2025-01-01T00:00:00.000Z" },
          items: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
        },
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "cc0e8400-e29b-41d4-a716-446655440007" },
          orderId: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" },
          foodId: { type: "string", format: "uuid", example: "770e8400-e29b-41d4-a716-446655440002" },
          quantity: { type: "integer", example: 2 },
          price: { type: "number", example: 12.99 },
        },
      },

      CreatePaymentOrderDTO: {
        type: "object",
        required: ["orderId"],
        properties: { orderId: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" } },
      },
      VerifyPaymentDTO: {
        type: "object",
        required: ["razorpayPaymentId", "razorpayOrderId", "razorpaySignature"],
        properties: {
          razorpayPaymentId: { type: "string", example: "pay_abc123" },
          razorpayOrderId: { type: "string", example: "order_abc123" },
          razorpaySignature: { type: "string", example: "signature_here" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "dd0e8400-e29b-41d4-a716-446655440008" },
          orderId: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" },
          razorpayOrderId: { type: "string", example: "order_abc123" },
          razorpayPaymentId: { type: "string", nullable: true, example: null },
          amount: { type: "number", example: 28.58 },
          status: { type: "string", example: "UNPAID" },
        },
      },

      RegisterPartnerDTO: {
        type: "object",
        required: ["vehicleType", "licenseNumber"],
        properties: {
          vehicleType: { type: "string", enum: ["BIKE", "SCOOTER", "CAR"], example: "BIKE" },
          licenseNumber: { type: "string", example: "DL-1234-5678" },
        },
      },
      UpdatePartnerDTO: {
        type: "object",
        properties: {
          vehicleType: { type: "string", enum: ["BIKE", "SCOOTER", "CAR"], example: "SCOOTER" },
          licenseNumber: { type: "string", example: "DL-9876-5432" },
        },
      },
      AcceptDeliveryDTO: {
        type: "object",
        required: ["orderId"],
        properties: { orderId: { type: "string", format: "uuid", example: "aa0e8400-e29b-41d4-a716-446655440005" } },
      },
      DeliveryPartner: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid", example: "ee0e8400-e29b-41d4-a716-446655440009" },
          userId: { type: "string", format: "uuid", example: "089ecff0-b46f-4933-929d-64c96e20d16b" },
          vehicleType: { type: "string", example: "BIKE" },
          licenseNumber: { type: "string", example: "DL-1234-5678" },
        },
      },

      CreateReviewDTO: {
        type: "object",
        required: ["restaurantId", "rating"],
        properties: {
          restaurantId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" },
          rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
          comment: { type: "string", example: "Amazing pizza! Highly recommend." },
        },
      },

      CreateCouponDTO: {
        type: "object",
        required: ["code", "discountType", "discountValue", "expiryDate"],
        properties: {
          code: { type: "string", example: "SAVE10" },
          discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "PERCENTAGE" },
          discountValue: { type: "number", example: 10 },
          expiryDate: { type: "string", format: "date-time", example: "2025-12-31T23:59:59.000Z" },
        },
      },
      UpdateCouponDTO: {
        type: "object",
        properties: {
          code: { type: "string", example: "SAVE20" },
          discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"], example: "FIXED" },
          discountValue: { type: "number", example: 5 },
          expiryDate: { type: "string", format: "date-time", example: "2026-01-01T00:00:00.000Z" },
        },
      },
      ValidateCouponDTO: { type: "object", required: ["code"], properties: { code: { type: "string", example: "SAVE10" } } },

      ToggleFavoriteDTO: {
        type: "object",
        required: ["restaurantId"],
        properties: { restaurantId: { type: "string", format: "uuid", example: "550e8400-e29b-41d4-a716-446655440000" } },
      },

      VerifyDocumentDTO: {
        type: "object",
        required: ["verificationStatus"],
        properties: {
          verificationStatus: { type: "string", enum: ["VERIFIED", "REJECTED"], example: "VERIFIED" },
          remarks: { type: "string", example: "All documents look good" },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", enum: [false] },
          error: {
            type: "object",
            properties: { code: { type: "string", example: "VALIDATION_ERROR" }, message: { type: "string", example: "email: Invalid email" } },
          },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          pageSize: { type: "integer", example: 10 },
          total: { type: "integer", example: 1 },
          totalPages: { type: "integer", example: 1 },
        },
      },
    },
  },
};
