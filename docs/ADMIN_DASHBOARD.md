# FoodyGo — Admin Dashboard

> Plan for `apps/admin-dashboard` (Next.js 16 App Router)

## Tech Stack

- **Framework**: Next.js 16, React 19
- **Routing**: App Router (file-based)
- **State**: Zustand (auth) + TanStack React Query (server state)
- **Forms**: react-hook-form + Zod
- **HTTP**: Axios from `@foodygo/shared-utils`
- **Styling**: Tailwind CSS
- **Charts**: recharts
- **Icons**: lucide-react
- **Toasts**: sonner

## Design System

### Colors
```
primary:    #6366F1 (indigo — admin feel, distinct from brand orange)
primaryDark:#4F46E5
sidebar:    #0F172A (slate 900 — dark sidebar)
bg:         #F1F5F9 (slate 100)
surface:    #FFFFFF
text:       #0F172A (slate 900)
textMuted:  #64748B (slate 500)
success:    #10B981 (green)
warning:    #F59E0B (amber)
error:      #EF4444 (red)
border:     #E2E8F0 (slate 200)
```

### UX Principles
1. **Bulk actions** — select multiple rows → batch suspend/activate
2. **Advanced filtering** — multi-filters (status + role + date range) with URL query param sync
3. **Inline status changes** — dropdown or toggle to change user/restaurant status instantly
4. **Audit awareness** — show "Last updated by" on records where applicable
5. **Keyboard navigation** — tab through tables, Enter to open detail, Escape to close modals
6. **Document preview** — inline image/PDF preview for restaurant documents (no download required)

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
    query-provider.tsx
    auth-provider.tsx
    toast-provider.tsx
  hooks/
    use-url-filters.ts        — Sync filters with URL search params
  components/
    ui/
      button.tsx              — Variants: primary, outline, ghost, danger
      input.tsx               — Input with label + error + icon
      select.tsx              — Native select with styling
      table.tsx               — Sortable table with header, body, row, cell
      card.tsx                — Stat/value card
      modal.tsx               — Overlay dialog
      badge.tsx               — Status/role badge (color-coded)
      confirm-dialog.tsx      — Destructive action confirmation
      loading-spinner.tsx
      empty-state.tsx
      error-banner.tsx
      pagination.tsx
      toggle.tsx
      skeleton.tsx
      filter-bar.tsx          — Multi-filter row with search, dropdowns, date picker
      data-table.tsx          — Full-featured table: sort, filter, search, select, pagination
      status-badge.tsx        — Color-coded status with dot indicator
      metric-card.tsx         — Stat card with trend indicator (up/down arrow + percentage)
    layout/
      admin-layout.tsx        — Sidebar + header + content area
      sidebar.tsx             — Navigation sidebar with section headers + icons
      header.tsx              — Top bar: breadcrumbs, search, user menu
    users/
      user-table.tsx          — Users list with filters, search, bulk actions
      user-detail.tsx         — User info card + roles + status actions + order history
      user-form.tsx           — Create/edit user modal (admin)
    restaurants/
      restaurant-table.tsx    — Restaurants list with status filters + search
      restaurant-detail.tsx   — Restaurant info + owner info + documents + approval actions
      document-preview.tsx    — Inline image/pdf preview + approve/reject buttons
    delivery/
      partner-table.tsx       — Delivery partners list with vehicle + status info
      active-deliveries.tsx   — Currently active deliveries table
    charts/
      area-chart.tsx          — Revenue/Users over time (recharts AreaChart)
      bar-chart.tsx           — Orders per day/week (recharts BarChart)
      pie-chart.tsx           — Distribution charts (recharts PieChart)
      stat-card.tsx           — Metric card with sparkline chart
  app/
    layout.tsx                — Root: providers + metadata + font
    (dashboard)/
      layout.tsx              — AdminLayout wrapper
      page.tsx                — Platform overview with stat cards + mini charts
      users/
        page.tsx              — Users management table
        [id]/page.tsx         — User detail
      restaurants/
        page.tsx              — Restaurants management table
        [id]/page.tsx         — Restaurant detail + document review
      delivery/
        page.tsx              — Delivery partners + active deliveries
      analytics/
        page.tsx              — Full analytics with multiple chart types
```

## Navigation Structure

```
/                          — Platform overview
/users                     — Users management
/users/[id]                — User detail
/restaurants               — Restaurants management
/restaurants/[id]          — Restaurant detail + document verification
/delivery                  — Delivery partners + active deliveries
/analytics                 — Full analytics dashboard
```

## Build Order

### G0 — Foundation

1. Install dependencies + init Tailwind
2. Create `src/lib/api.ts`, `src/lib/query-client.ts`
3. Create `src/store/auth-store.ts`
4. Create providers + update root layout
5. Create layout components: Sidebar, Header, AdminLayout
6. Create UI primitives + skeleton variants

### G1 — Auth + Layout

- Login page (centered card)
- Sidebar: 5 nav items with icons + active state (Overview, Users, Restaurants, Delivery, Analytics)
- Header: page breadcrumb, global search (future), admin avatar + dropdown
- Responsive: sidebar collapsible on mobile

### G2 — Platform Overview

File: `(dashboard)/page.tsx`

- 5 metric cards in grid: Total Users, Total Orders, Total Revenue, Active Restaurants, Active Drivers
- Each card: value, label, trend (up/down arrow), mini sparkline chart
- Mini area chart: Revenue (7 days)
- Mini bar chart: Orders (7 days)
- Loading: skeleton cards + skeleton charts
- Data from `GET /analytics/admin`

### G3 — Users Management

Files: `users/page.tsx`, `users/[id]/page.tsx`

- DataTable with columns: Avatar, Name, Email, Role (badge), Status (badge), Created, Actions
- Filter bar: search (name/email), role dropdown, status dropdown
- Sort by any column
- Row selection checkboxes for bulk actions
- Bulk action: Suspend Selected, Activate Selected
- Click row → navigate to user detail
- Detail: info card, role badges, order history summary, action buttons (Suspend/Activate/Ban)
- Suspend/Activate: confirmation dialog → PATCH /users/:id → toast

### G4 — Restaurants Management

Files: `restaurants/page.tsx`, `restaurants/[id]/page.tsx`

- DataTable: Name, Owner, Cuisine, Status (badge), Rating, Orders, Created
- Filter bar: search, status dropdown, cuisine dropdown
- Click row → navigate to restaurant detail
- Detail: restaurant info card, owner info, metrics (orders, revenue, rating)
- Documents section: list of uploaded documents with inline preview
- Document actions: Approve (green) / Reject (red) with optional reason
- Restaurant status actions: Approve → ACTIVE, Suspend → SUSPENDED
- Each action: confirmation → mutation → toast → table refresh

### G5 — Delivery Partners

File: `delivery/page.tsx`

- Two sections: Partners list + Active deliveries
- Partners DataTable: Name, Email, Vehicle, Status (Online/Offline), Total Deliveries, Rating
- Active deliveries DataTable: Partner name, Restaurant, Customer, Status, Duration
- No actions needed for MVP (read-only)

### G6 — Full Analytics

File: `analytics/page.tsx`

- Date range selector (last 7/30/90 days)
- Revenue area chart
- Orders bar chart
- Users area chart
- Cuisine distribution pie chart
- Order status distribution pie chart
- Top 10 restaurants by revenue table
- All data from `GET /analytics/admin`

## Relevant API Endpoints

| Endpoint | Usage |
|----------|-------|
| POST /auth/login | Login |
| POST /auth/refresh | Token refresh |
| GET /analytics/admin | Platform metrics |
| GET /users | List all users |
| GET /users/:id | User detail |
| PATCH /users/:id | Suspend/activate user |
| GET /restaurants | List all restaurants |
| GET /restaurants/:id | Restaurant detail |
| PATCH /restaurants/:id | Approve/suspend restaurant |
| GET /restaurants/:id/documents | List documents |
| PATCH /restaurants/documents/:id/verify | Approve/reject document |
| GET /delivery/orders | Active deliveries |
| GET /delivery/partners | Delivery partners list |

## Acceptance Criteria

- Login with admin credentials works, session persists
- Platform overview shows accurate aggregate metrics with skeleton loading + trend indicators
- Users DataTable with sort, search, multi-filter, bulk actions works
- User detail shows full info with suspend/activate, toast feedback
- Restaurants DataTable with filters works
- Restaurant detail shows info, owner, metrics, documents with inline preview
- Document approve/reject with reason works, toast feedback
- Restaurant approve/suspend works with confirmation
- Delivery section shows partners + active deliveries
- Analytics page renders all chart types with date range selector
- All actions show toast (success/error)
- Confirm dialog for all destructive actions
- All states handled: skeleton loading, empty state (illustration + message), error banner with retry
- Responsive layout: sidebar collapsible on mobile
