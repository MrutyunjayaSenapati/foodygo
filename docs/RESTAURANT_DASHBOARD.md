# FoodyGo — Restaurant Dashboard

> Plan for `apps/restaurant-dashboard` (Next.js 16 App Router)

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Routing**: App Router (file-based)
- **State**: Zustand (auth) + TanStack React Query (server state)
- **Forms**: react-hook-form + Zod (@hookform/resolvers)
- **HTTP**: Axios from `@foodygo/shared-utils`
- **Styling**: Tailwind CSS
- **Charts**: recharts
- **Icons**: lucide-react
- **Toasts**: sonner (toast notifications for success/error)

## Design System

### Colors
```
primary:    #FF6B35 (orange — matches brand)
primaryDark:#E55A2B
sidebar:    #1A1A2E (dark navy sidebar)
bg:         #F8F9FA
surface:    #FFFFFF
text:       #1A1A1A
textMuted:  #6B7280
success:    #10B981 (green)
warning:    #F59E0B (amber)
error:      #EF4444 (red)
border:     #E5E7EB
```

### UX Principles
1. **Data density** — tables with sort, search, and pagination. No endless scrolling for business data.
2. **Inline editing** — toggle switches, inline status changes without page reload.
3. **Toast feedback** — every mutation shows a success/error toast (sonner). No alert().
4. **Responsive sidebar** — collapsible on mobile, persistent on desktop.
5. **Status badges** — color-coded for quick scanning (green=active/approved, amber=pending, red=suspended).
6. **Confirm before destructive actions** — delete/refund/suspend all show a confirmation modal.

## Dependencies to Install

```
npm install @tanstack/react-query axios zustand react-hook-form @hookform/resolvers
npm install tailwindcss postcss autoprefixer lucide-react recharts sonner
npx tailwindcss init -p
```

## Architecture

```
src/
  lib/
    api.ts                    — Axios with auth interceptor
    query-client.ts           — TanStack QueryClient
  store/
    auth-store.ts             — Zustand: tokens, user, login/logout/restore
  providers/
    query-provider.tsx        — QueryClientProvider
    auth-provider.tsx         — Session restore on mount
    toast-provider.tsx        — Toaster from sonner
  hooks/
    use-restaurant-id.ts      — Get current user's restaurant ID from auth
  components/
    ui/
      button.tsx              — Variants: primary, outline, ghost, danger, icon
      input.tsx               — Input with label + error + optional icon
      select.tsx              — Native select with styling
      table.tsx               — Sortable table with header, body, row, cell
      card.tsx                — Metric card with icon + value + label
      modal.tsx               — Overlay dialog with backdrop + close
      badge.tsx               — Status badge (color variants)
      confirm-dialog.tsx      — "Are you sure?" with cancel/confirm
      loading-spinner.tsx     — Centered spinner
      empty-state.tsx         — Icon + message
      error-banner.tsx        — Inline error with dismiss
      pagination.tsx          — Page numbers + prev/next
      toggle.tsx              — Switch toggle component
      skeleton.tsx            — Shimmer loading placeholder
    layout/
      sidebar.tsx             — Navigation sidebar with icons + active state
      header.tsx              — Top bar: restaurant name, notifications bell, user avatar dropdown
      dashboard-layout.tsx    — Sidebar + header + content area (responsive)
    menu/
      food-form.tsx           — Food create/edit form modal
      category-form.tsx       — Category create/edit form modal
      food-table.tsx          — Foods list with sort, search, availability toggle
    orders/
      order-card.tsx          — Incoming order card with accept/reject
      status-timeline.tsx     — Horizontal order status flow
    reviews/
      review-card.tsx         — Customer review with rating stars + date + comment
  app/
    layout.tsx                — Root: providers + metadata + font
    (dashboard)/
      layout.tsx              — DashboardLayout with sidebar + header
      page.tsx                — Overview metrics + popular foods
      menu/
        page.tsx              — Categories + Foods CRUD
      orders/
        page.tsx              — Incoming orders list with filters
        [id]/page.tsx         — Order detail + status management
      reviews/
        page.tsx              — Reviews list
      settings/
        page.tsx              — Restaurant profile settings
```

## Navigation Structure

```
/                          — Dashboard home (metrics)
/menu                      — Categories + foods management
/orders                    — Incoming orders list
/orders/[id]               — Order detail
/reviews                   — Customer reviews
/settings                  — Restaurant profile edit
```

## Build Order

### F0 — Foundation

1. Install dependencies + init Tailwind
2. Create `src/lib/api.ts`, `src/lib/query-client.ts`
3. Create `src/store/auth-store.ts`
4. Create providers + update root layout
5. Create layout components: Sidebar, Header, DashboardLayout
6. Create all UI primitives + skeleton variants

### F1 — Auth + Layout Shell

- Login page (centered card layout, POST /auth/login)
- Sidebar: nav items with lucide icons + active highlight
- Header: restaurant name, notification bell, user avatar + dropdown (profile, logout)
- DashboardLayout wraps all (dashboard)/ routes
- Responsive: sidebar collapses to hamburger on < 768px

### F2 — Dashboard Overview

File: `(dashboard)/page.tsx`

- 4 metric cards in a grid: Orders Today, Revenue Today, Revenue This Month, Avg Rating
- Popular Foods table (top 5 by order count)
- Loading: skeleton cards + skeleton table rows
- Error: inline banner with retry
- Data from `GET /analytics/restaurant/:id`

### F3 — Menu Management

File: `menu/page.tsx`

- Two-panel: Categories (left sidebar) + Foods (main area)
- Categories: list with edit/delete icons. "Add Category" button opens modal form.
- Foods: searchable, sortable table (name, category, price, availability, actions)
- Availability toggle switch — instant mutation with toast feedback
- Edit: opens modal pre-filled with food data
- Delete: confirmation dialog → DELETE /foods/:id → toast + table refresh

### F4 — Orders

Files: `orders/page.tsx`, `orders/[id]/page.tsx`

- List: cards with status filter tabs (All, Pending, Accepted, Preparing, Ready)
- Each card: order id, customer name, item count, total, time elapsed (live), status badge
- Accept/Reject buttons on PENDING orders
- Detail page: customer info, items table with prices, pricing breakdown, status timeline
- Status action buttons: Accept → Preparing → Ready for Pickup
- Each action: immediate mutation + toast feedback

### F5 — Reviews

File: `reviews/page.tsx`

- Paginated list of reviews for this restaurant
- Each review: customer name (or "Anonymous"), rating stars, date, comment text
- Sort by: newest, highest rated, lowest rated
- Empty state: "No reviews yet"

### F6 — Settings

File: `settings/page.tsx`

- Form sections: Basic Info (name, description, cuisine), Contact (phone, email), Address
- Image upload for logo and banner
- Delivery settings: ETA range, delivery fee
- Save button: PATCH /restaurants/:id with loading state + success toast
- Form validation via RHF + Zod

## Relevant API Endpoints

| Endpoint | Usage |
|----------|-------|
| POST /auth/login | Login |
| POST /auth/refresh | Token refresh |
| GET /analytics/restaurant/:id | Dashboard metrics |
| GET /restaurants/:id | Get restaurant profile |
| PATCH /restaurants/:id | Update restaurant |
| GET /foods | List foods |
| POST /foods | Create food |
| PATCH /foods/:id | Update food, toggle availability |
| DELETE /foods/:id | Delete food |
| POST /restaurants/:id/categories | Create category |
| PATCH /food-categories/:id | Update category |
| DELETE /food-categories/:id | Delete category |
| GET /orders | List orders (filtered by restaurant) |
| GET /orders/:id | Order detail |
| PATCH /orders/:id/status | Update order status |
| GET /reviews/:restaurantId | List reviews |

## Acceptance Criteria

- Login works, session persists, logout works
- Dashboard shows accurate metrics with skeleton loading
- Menu CRUD (categories + foods) works with validation + toast feedback
- Orders list loads with status filter tabs, accept/reject flow works
- Order detail shows customer info, items, pricing, status timeline
- Reviews list loads with sorting
- Settings form saves with validation + success toast
- All destructive actions show confirmation dialog
- Responsive layout: sidebar collapses on mobile
- All states handled: skeleton loading, empty state (icon + message), error banner with retry, toast for mutations
