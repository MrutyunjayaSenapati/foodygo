# FoodyGo — Customer Mobile App

> Plan for `apps/customer-app` (Expo SDK 56)

## Tech Stack

- **Framework**: Expo SDK 56, React 19.2, React Native 0.85
- **Routing**: expo-router ~56.2 (file-based, no React Navigation dependency)
- **State**: Zustand (auth, cart) + TanStack React Query (server state)
- **Forms**: react-hook-form + Zod (via @hookform/resolvers)
- **HTTP**: Axios from `@foodygo/shared-utils`
- **Images**: expo-image (cached, blur placeholders)
- **Animations**: react-native-reanimated (60fps gesture/animations)
- **Secure Storage**: expo-secure-store (tokens)
- **Maps/Location**: react-native-maps, expo-location
- **Notifications**: expo-notifications (push token registration)

## Design System

### Colors
```
primary:    #FF6B35 (warm orange — food industry standard)
primaryDark:#E55A2B
secondary:  #004E89 (trustworthy blue for CTAs)
background: #FAFAFA (off-white, easier on eyes than pure white)
surface:    #FFFFFF
text:       #1A1A1A
textMuted:  #8E8E93
success:    #34C759
warning:    #FF9F0A
error:      #FF3B30
border:     #E5E5EA
```

### Typography
- Headings: SF Pro / System, 700 weight, sizes 28/22/18
- Body: SF Pro / System, 400 weight, size 15
- Caption: SF Pro / System, 400 weight, size 12
- Price: SF Pro / System, 700 weight, size 16 (monospaced numbers)

### Spacing
- 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48
- Cards: 12px rounded corners, subtle shadow (elevation 3)
- Screen edges: 16px horizontal padding
- List item height: 72px (comfortable tap target)

### Motion
- Add to cart: spring scale animation (1→1.2→1) on the button
- Tab switch: fade transition (200ms)
- Order status: staggered slide-in for timeline items
- Pull-to-refresh: native refresh control
- Search bar: smooth expand on focus

## UI/UX Principles

1. **Skeleton everywhere** — never show blank space or spinners. Every card, text line, and image has a gray shimmer placeholder while loading.
2. **Persistent cart bar** — when items are in cart, a floating bottom bar shows on every screen with item count + total + "View Cart" button.
3. **One-tap add** — tapping "+" adds 1 item instantly with animation. Long-press opens a quantity picker. No modal for basic add.
4. **Sticky category headers** — on restaurant detail, category names stick to top while scrolling.
5. **Empty states** — every list has a friendly illustration + message + CTA button (e.g., "Your cart is empty — browse restaurants").
6. **Error recovery** — network errors show a banner with "Tap to Retry". TanStack Query auto-retry 3 times.
7. **Optimistic updates** — cart mutations update the UI instantly, roll back on failure.
8. **Safe areas** — handle notch, home indicator, keyboard avoidance on every screen.

## Dependencies to Install

```
npx expo install expo-secure-store react-native-maps expo-location expo-image expo-notifications react-native-maps
npm install zustand @tanstack/react-query axios react-hook-form @hookform/resolvers react-native-reanimated
```

## Architecture

```
src/
  lib/
    api.ts                    — Axios instance with auth interceptor + auto-refresh
    query-client.ts           — TanStack QueryClient (staleTime: 5min, retry: 3)
  store/
    auth-store.ts             — Zustand: tokens, user, login/logout/restoreSession
    cart-store.ts             — Zustand: items, restaurantId, add/remove/update/clear
  providers/
    query-provider.tsx        — QueryClientProvider
    auth-provider.tsx         — Session restore from expo-secure-store on launch
  hooks/
    use-auth.ts               — Convenience hook wrapping auth-store
    use-cart.ts               — Convenience hook wrapping cart-store actions + API sync
    use-debounce.ts           — Debounced value hook (search)
  components/
    ui/
      skeleton.tsx            — Shimmer placeholder (variants: card, text, image, circle)
      button.tsx              — Pressable with variants (primary, outline, ghost, danger)
      input.tsx               — TextInput with label + error + icon slot
      card.tsx                — Rounded shadow container
      badge.tsx               — Status badge (colored dot + text)
      loading-screen.tsx      — Full-screen skeleton layout
      empty-state.tsx         — Illustration + message + CTA
      error-banner.tsx        — Inline error with retry
      bottom-sheet.tsx        — Draggable bottom sheet (reanimated)
      quantity-stepper.tsx    — − / count / + with spring animations
    restaurant-card.tsx       — Horizontal card: Image, name, rating, eta, cuisine tags
    restaurant-card-skeleton.tsx — Shimmer version of restaurant-card
    food-item.tsx             — Row: Image, name, desc, price, add button with animation
    cart-item.tsx             — Row: Image, name, quantity-stepper, price, remove
    cart-bar.tsx              — Floating bottom bar: item count, total, "View Cart" button
    order-timeline.tsx        — Vertical timeline: status steps with icons + connector lines
    rating-stars.tsx          — Interactive/display-only 1-5 stars
    search-bar.tsx            — TextInput with search icon, clear button, debounced onChange
    carousel.tsx              — Horizontal FlatList section with title + "See All"
    section-header.tsx        — Sticky section title with optional action
    notification-item.tsx     — Row: icon, title, body, time, read/unread dot
  types/
    index.ts                  — Screen param types for expo-router
  constants/
    colors.ts                 — Color palette (from design system above)
    spacing.ts                — Spacing scale
    typography.ts             — Font sizes/weights
    layout.ts                 — Card dimensions, icon sizes, hit slop values
```

## Navigation Structure

```
RootLayout (_layout.tsx) — Stack navigator + providers
├── (auth)/                     — AuthStack (no bottom tabs)
│   ├── _layout.tsx             — Stack: login, register
│   ├── login.tsx
│   └── register.tsx
└── (tabs)/                     — Authenticated: bottom tab navigator
    ├── _layout.tsx             — 4 tabs: Home, Search, Cart, Profile
    ├── index.tsx               — Home screen
    ├── search.tsx              — Search + filters
    ├── cart.tsx                — Cart detail
    └── profile.tsx             — Profile menu
    │
    ├── restaurant/
    │   └── [id].tsx            — Restaurant detail
    ├── checkout/
    │   └── index.tsx           — Address → Summary → Pay → Place Order
    ├── order/
    │   ├── [id].tsx            — Live tracking with map
    │   └── history.tsx         — Past orders list
    ├── favorites/
    │   └── index.tsx           — Saved restaurants
    ├── addresses/
    │   └── index.tsx           — Saved addresses list + add/edit
    └── notifications/
        └── index.tsx           — Notification list
```

## Build Order

### D0 — Foundation

1. Install all dependencies
2. Create `src/lib/api.ts` — Axios with Bearer token interceptor + 401 auto-refresh
3. Create `src/lib/query-client.ts` — QueryClient (staleTime: 5min, gcTime: 30min, retry: 3)
4. Create `src/store/auth-store.ts` — Zustand persist to expo-secure-store
5. Create `src/store/cart-store.ts` — Zustand with computed totals (subtotal, deliveryFee, tax, total)
6. Create hooks: `use-auth.ts`, `use-cart.ts`, `use-debounce.ts`
7. Create providers: `query-provider.tsx`, `auth-provider.tsx`
8. Create `src/types/index.ts` — screen param types
9. Create `src/constants/` — colors, spacing, typography, layout
10. Create all UI primitives + skeleton variants
11. Configure splash screen:
    - Update `src/app/_layout.tsx`: `SplashScreen.preventAutoHideAsync()` before app mounts, `hideAsync()` after session restore completes
    - Update `app.json` with splash `backgroundColor`, `resizeMode`, and `image` path
    - Add `expo-splash-screen` plugin to app.json
    - Design deliverables: `assets/splash.png` (1242×2436 for iOS, 1080×1920 for Android), `assets/icon.png` (1024×1024)
12. Update `src/app/_layout.tsx` — wrap with QueryProvider + AuthProvider, Stack navigator, splash screen lifecycle

### D1 — Auth Flow

Files: `(auth)/_layout.tsx`, `login.tsx`, `register.tsx`

- Login: email + password fields, "Sign in with Google" button
- Register: fullName + email + password + confirm password + validation via RHF+Zod
- Google sign-in: `expo-auth-session` to Google, send idToken to `POST /auth/google`
- On success: store tokens in auth-store, navigate to (tabs)
- Loading state: skeleton form fields while submitting
- Error state: inline error messages per field + general error banner for network/auth failures

### D2 — Home Screen

File: `(tabs)/index.tsx`

- **Search bar** at top — tapping navigates to search screen
- **Carousel: "Recommended for You"** — horizontal scroll, `GET /recommendations`
- **Carousel: "Top Rated"** — `GET /restaurants?ratingMin=4.5&limit=10`
- **Carousel: "Nearby"** — `GET /restaurants` with location from `expo-location`
- Each restaurant card: Image (expo-image with blurhash), name, rating stars, delivery time, cuisine tags
- Skeleton carousels while loading
- Pull-to-refresh

### D3 — Search Screen

File: `(tabs)/search.tsx`

- Debounced search input (300ms) with clear button
- Recent searches list (stored locally)
- Filter chips row: Cuisine, Rating, Price Range (scrollable horizontal)
- Results: FlatList with restaurant-card components
- Infinite scroll pagination (TanStack Query `getNextPageParam`)
- Empty state: "No restaurants found" with illustration
- Error state: inline retry banner

### D4 — Restaurant Detail

File: `restaurant/[id].tsx`

- Hero image (expo-image, large), restaurant info overlay
- Info section: name, rating, cuisine tags, delivery ETA, delivery fee, address
- SectionedList with category headers (sticky)
- Food items per category: food-item component (image, name, description, price, add button)
- Add button: spring scale animation, increment counter on the item
- Cart bar: floats at bottom when items in cart, shows count + total + "View Cart"
- Skeleton layout while loading
- Error state if restaurant not found (404)

### D5 — Cart Screen

File: `(tabs)/cart.tsx`

- List of cart items with quantity-stepper component
- Restaurant name header
- Price breakdown card: Subtotal, Delivery Fee, Tax, Total
- Coupon input (UI only, backend integration TBD)
- "Proceed to Checkout" primary button
- Empty state: illustration + "Browse Restaurants" CTA
- Swipe to delete item with red background

### D6 — Checkout

File: `checkout/index.tsx`

- Step 1: Address — list saved addresses, radio select, or "Add New Address" form
- Step 2: Order Summary — items list, pricing, delivery ETA
- Step 3: Payment — Razorpay integration via expo-web-browser or native SDK
- "Place Order" button → `POST /orders` → on success navigate to `order/[id]`
- Loading overlay during order creation
- Error handling: payment failure modal with retry

### D7 — Order Tracking

File: `order/[id].tsx`

- Status timeline: animated vertical steps with icons + connector lines
- Current status highlighted with primary color
- Delivery partner card (when assigned): name, photo, phone, vehicle, ETA
- Map integration: restaurant pin → delivery partner pin (animate movement)
- Cancel button (visible when status allows cancellation)
- Socket.IO connection for real-time status updates (fallback to polling)
- Confetti animation on DELIVERED status

### D8 — Order History

File: `order/history.tsx`

- Paginated FlatList of past orders
- Each item: restaurant image, name, date, total, status badge (color-coded)
- Tap → navigate to `order/[id]`
- Pull-to-refresh
- Empty state: "No orders yet" with "Browse Restaurants" CTA

### D9 — Profile

File: `(tabs)/profile.tsx`

- User avatar + name + email card
- Menu list with icons:
  - My Orders → `order/history`
  - Favorites → `favorites/index`
  - Addresses → `addresses/index`
  - Notifications → `notifications/index`
- Settings section (future: dark mode toggle, notification preferences)
- Logout button (red, with confirmation dialog)

### D10 — Address Management

Files: `addresses/index.tsx`

- List of saved addresses with radio selection for default
- Each address: type badge (Home/Work/Other), full address, phone
- Add address form: label, full address, city, pincode, lat/lng from map picker
- Edit/delete with confirmation dialog
- Uses `GET /addresses`, `POST /addresses`, `PATCH /addresses/:id`, `DELETE /addresses/:id`

### D11 — Favorites

File: `favorites/index.tsx`

- Grid of favorited restaurants (restaurant-card component)
- Heart icon toggle on each card
- Empty state: "No favorites yet" with "Discover Restaurants" CTA
- Pull-to-refresh
- Uses `GET /favorites`, `POST /favorites` (with restaurantId in body)

### D12 — Submit Review

Triggered from order detail after DELIVERED status

- Rating stars (interactive, 1-5)
- Comment text input (optional)
- Submit button → `POST /reviews`
- Once submitted, show "Review submitted" state, disable further edits

### D13 — Notifications

File: `notifications/index.tsx`

- List of notifications with read/unread indicator (blue dot)
- Tap: mark as read (`PATCH /notifications/:id/read`), navigate to related order
- Swipe to delete (future)
- Empty state: "No notifications yet"
- Pull-to-refresh

## Relevant API Endpoints

| Endpoint | Usage |
|----------|-------|
| POST /auth/register | Registration |
| POST /auth/login | Login |
| POST /auth/google | Google OAuth |
| POST /auth/refresh | Token refresh |
| POST /auth/logout | Logout |
| GET /auth/me | Current user |
| GET /restaurants | List/search/filter restaurants |
| GET /restaurants/:id | Restaurant detail |
| GET /foods | Search foods across all restaurants |
| GET /foods/restaurant/:restaurantId | Foods for a specific restaurant |
| GET /recommendations | Personalized recommendations |
| GET /favorites | List favorite restaurants |
| POST /favorites | Add favorite (body: { restaurantId }) |
| DELETE /favorites/:restaurantId | Remove favorite (check exact path) |
| GET /cart | Get user's cart with items + totals |
| POST /cart/items | Add item to cart |
| PATCH /cart/items/:itemId | Update item quantity |
| DELETE /cart/items/:itemId | Remove item from cart |
| DELETE /cart | Clear entire cart |
| POST /orders | Create order from cart |
| GET /orders | List user's orders |
| GET /orders/:id | Order detail |
| PATCH /orders/:id/status | Update order status (cancel) |
| POST /orders/:id/cancel | Cancel order |
| POST /payments/create-order | Create payment order |
| POST /payments/verify | Verify payment |
| GET /addresses | List saved addresses |
| POST /addresses | Add address |
| PATCH /addresses/:id | Update address |
| DELETE /addresses/:id | Delete address |
| POST /coupons/validate | Validate coupon code |
| GET /reviews/restaurant/:restaurantId | Restaurant reviews |
| POST /reviews | Submit review (body: { restaurantId, rating, comment }) |
| GET /notifications | List notifications |
| PATCH /notifications/:id/read | Mark notification read |
| PATCH /notifications/read-all | Mark all read |
| GET /notifications/unread-count | Unread count |
| PATCH /users/:id | Update profile |
| PATCH /users/fcm-token | Register push token |

## Acceptance Criteria

- Auth (register, login, Google, logout, session restore) works
- Home shows recommendations + restaurants with skeleton loaders
- Search with debounce and filters works, infinite scroll pagination
- Restaurant detail shows foods, one-tap add-to-cart with animation
- Cart shows items with quantity stepper, accurate total calculations
- Coupon code can be validated and applied in cart
- Address management: add, edit, delete, set default
- Checkout flow (address → payment → place order) completes an order
- Order tracking shows live status with partner info and map
- Review submission works after DELIVERED order
- Order history paginated with pull-to-refresh, tap to reorder
- Favorites toggle works, dedicated favorites screen
- Profile shows user info, logout works with confirmation
- Notifications list + mark-as-read works, unread badge count
- All states handled: skeleton loading, empty state (illustration + CTA), error (retry banner)
- Keyboard avoidance on all form screens
- Safe area insets respected on all screens
