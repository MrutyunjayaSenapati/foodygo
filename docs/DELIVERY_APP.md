# FoodyGo — Delivery Partner Mobile App

> Plan for `apps/delivery-app` (Expo SDK 56)

## Tech Stack

- **Framework**: Expo SDK 56, React 19.2, React Native 0.85
- **Routing**: expo-router ~56.2 (file-based)
- **State**: Zustand (auth) + TanStack React Query (server state)
- **HTTP**: Axios from `@foodygo/shared-utils`
- **Maps**: react-native-maps, expo-location
- **Animations**: react-native-reanimated
- **Secure Storage**: expo-secure-store (tokens)
- **Push**: expo-notifications + `PATCH /users/fcm-token`

## Design System

### Colors
```
primary:    #007AFF (blue — professional, trustworthy)
success:    #34C759 (green for available/delivered)
warning:    #FF9F0A (orange for preparing/picked-up)
error:      #FF3B30 (red for issues)
background: #F2F2F7 (light gray — iOS standard grouped bg)
surface:    #FFFFFF
text:       #1A1A1A
textMuted:  #8E8E93
border:     #E5E5EA
```

### Typography & Spacing
- Same scale as customer app (consistent brand)
- Large tap targets for status buttons (minimum 56px height)
- Bold numbers for earnings (monospaced)

## Dependencies to Install

```
npx expo install expo-secure-store react-native-maps expo-location expo-notifications
npm install zustand @tanstack/react-query axios react-native-reanimated
```

## Architecture

```
src/
  lib/
    api.ts                    — Axios with auth interceptor + auto-refresh
    query-client.ts           — TanStack QueryClient
  store/
    auth-store.ts             — Zustand: tokens, user, login/logout/restore
  providers/
    query-provider.tsx
    auth-provider.tsx
  hooks/
    use-location.ts           — Continuous location tracking for map
    use-socket.ts             — Socket.IO connection for real-time delivery updates
  components/
    ui/
      skeleton.tsx            — Shimmer placeholders
      button.tsx
      badge.tsx               — Status badge (color-coded for delivery statuses)
      card.tsx
      loading-screen.tsx
      empty-state.tsx
      error-banner.tsx
      confirm-dialog.tsx      — "Accept delivery?" confirmation
    delivery-card.tsx         — Available delivery: restaurant, address, items, amount, distance
    active-card.tsx           — Active delivery header with status + progress
    status-button.tsx         — Large CTA for status transition (PICKED_UP, OUT_FOR_DELIVERY, DELIVERED)
    order-timeline.tsx        — Vertical status flow with icons
    earnings-summary.tsx      — Today/Week/Month earnings card
    partner-info-card.tsx     — Profile info display
  constants/
    colors.ts                 — Color palette
    spacing.ts                — Spacing scale
    delivery-status.ts        — Status flow order + display labels
```

## Navigation Structure

```
RootLayout (_layout.tsx)
├── (auth)/
│   ├── _layout.tsx          — Auth stack
│   └── login.tsx
└── (tabs)/
    ├── _layout.tsx          — BottomTabs: Deliveries, Earnings, Profile
    ├── index.tsx            — Available deliveries
    ├── earnings.tsx         — Earnings summary
    └── profile.tsx          — Partner profile
    │
    ├── delivery/
    │   ├── [id].tsx         — Active delivery (map + status actions)
    │   └── history.tsx      — Past deliveries list
```

## Build Order

### E0 — Foundation

1. Install dependencies
2. Create `src/lib/api.ts` — Axios with auth interceptor
3. Create `src/lib/query-client.ts`
4. Create `src/store/auth-store.ts`
5. Configure splash screen:
   - `SplashScreen.preventAutoHideAsync()` at app start, `hideAsync()` after auth restore
   - Update `app.json` with splash config
6. Create providers + update root layout
7. Create UI primitives + skeleton variants
8. Create `src/constants/`

### E1 — Auth

File: `(auth)/login.tsx`

- Email + password form with validation
- Loading skeleton on submit
- Error banner for invalid credentials
- No registration (partners created by admin)

### E2 — Available Deliveries (Home)

File: `(tabs)/index.tsx`

- Header: "Available Deliveries" with count badge
- List of READY_FOR_PICKUP orders from `GET /delivery/assignments/available`
- Each card: restaurant name, customer address, item count, total amount, estimated distance
- Pull-to-refresh with haptic feedback
- "Accept" button on each card → confirmation dialog → `POST /delivery/assignments/:id/accept` → navigate to active delivery
- Empty state: "No deliveries available — check back soon"
- Skeleton cards while loading

### E3 — Active Delivery

File: `delivery/[id].tsx`

- **Header**: Restaurant name → Customer address with distance
- **Map view**: Restaurant pin → animated route line → Customer pin (current location marker)
- **Order summary**: Items list, total amount
- **Customer info**: Name, phone (tappable → dialer)
- **Status timeline**: Animated vertical progress
- **Action buttons** (one visible at a time based on current status):
  - "Mark Picked Up" → `POST /delivery/assignments/:id/pickup`
  - "Out for Delivery" → (status updated via order status endpoint)
  - "Mark as Delivered" → `POST /delivery/assignments/:id/complete` → navigate back to available
- Each button is large (56px+ height), full width, with loading state during API call
- Success feedback: brief checkmark animation, then navigate
- Error: inline banner with retry

### E4 — Earnings

File: `earnings.tsx`

- Three summary cards: Today, This Week, This Month
- Each card: total deliveries count, total earnings amount
- Data from `GET /delivery/assignments/my` (aggregate locally)
- Skeleton cards while loading
- Pull-to-refresh

### E5 — Profile

File: `profile.tsx`

- Partner info: avatar, name, email, phone
- Vehicle info: type (bike/scooter/car), vehicle number
- Status toggle: Online/Offline (future)
- Total deliveries to date
- Logout button with confirmation dialog

### E6 — Delivery History

File: `delivery/history.tsx`

- Paginated list of completed deliveries
- Each item: date, restaurant name, customer address, total amount, completion time
- Tap for detail (navigate to delivery/[id] in read-only mode)
- Pull-to-refresh
- Empty state: "No deliveries yet"

## Relevant API Endpoints

| Endpoint | Usage |
|----------|-------|
| POST /auth/login | Login |
| POST /auth/refresh | Token refresh |
| POST /delivery/partners/register | Register as delivery partner |
| PATCH /delivery/partners/:id | Update partner profile |
| GET /delivery/assignments/available | Available deliveries (READY_FOR_PICKUP) |
| POST /delivery/assignments/:id/accept | Accept delivery |
| POST /delivery/assignments/:id/pickup | Mark as picked up |
| POST /delivery/assignments/:id/complete | Mark as delivered |
| GET /delivery/assignments/my | My active assignments |
| GET /orders/:id | Order detail |
| PATCH /users/:id | Update profile |
| PATCH /users/fcm-token | Register push token |

## Acceptance Criteria

- Login works, session persists on app restart
- Available deliveries list loads with pull-to-refresh + skeleton
- Accept flow shows confirmation dialog, creates assignment, navigates to active delivery
- Status buttons appear in correct order, large tap targets, loading states work
- Map shows restaurant → customer with current location
- Earnings screen aggregates from delivery assignments
- Profile shows partner info, logout works with confirmation
- Past deliveries list is paginated with pull-to-refresh
- All states handled: skeleton loading, empty state with message, error with retry banner
- Safe area insets respected on all screens
- Keyboard avoidance on login form
