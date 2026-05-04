# Agent Instructions — Pengelolaan Perusahaan (Housing Finance System)

## Project Overview

This is a **Next.js 16** frontend application for a Housing Company Financial Management System ("Sistem Pengelolaan Keuangan Perusahaan Perumahan"). It is a dashboard-style web app that connects to a separate **Express.js backend** running on `http://localhost:5000`.

The application handles:
- **Financial Transactions** — Create, view, edit, approve/reject transactions (double-entry accounting with debit/credit accounts)
- **Chart of Accounts** — Hierarchical account structure (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
- **Financial Reports** — Balance sheet, income statement, cash flow, and report archiving
- **User Management** — CRUD operations for system users
- **Approval Workflows** — Manager/Owner approval for pending transactions
- **Activity Logs** — System-wide audit trail
- **Role-Based Access** — Admin, Marketing, Manager, Owner roles with different menu visibility

## Tech Stack

| Layer         | Technology                        |
|---------------|-----------------------------------|
| Framework     | Next.js 16 (App Router)           |
| Language      | TypeScript 5                      |
| React         | React 19                          |
| Styling       | Tailwind CSS v4 (via PostCSS)     |
| Icons         | Lucide React                      |
| State         | React Context API                 |
| Backend       | Express.js (separate repo)        |
| API Protocol  | REST (JSON) with Bearer token auth|

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                   # Root layout — wraps all providers
│   ├── globals.css                  # Global Tailwind imports
│   ├── (auth)/
│   │   └── login/page.tsx           # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx               # Dashboard layout (sidebar + header + main)
│   │   ├── page.tsx                 # Dashboard home (stats + charts)
│   │   ├── transactions/page.tsx    # Transaction management
│   │   ├── reports/
│   │   │   ├── page.tsx             # Reports overview
│   │   │   ├── balance-sheet/       # Balance sheet reports (list + detail [id])
│   │   │   ├── income-statement/    # Income statement reports
│   │   │   └── archive/            # Archived reports
│   │   ├── approval/page.tsx        # Transaction approval (Manager/Owner)
│   │   ├── users/
│   │   │   ├── page.tsx             # User list
│   │   │   ├── add/page.tsx         # Add user
│   │   │   └── [id]/               # Edit user
│   │   └── activity-log/page.tsx    # Activity logs
│   └── api/
│       ├── auth/                    # Auth proxy endpoints
│       └── users/                   # Users proxy endpoints
├── components/
│   ├── Sidebar.tsx                  # Main navigation sidebar
│   ├── Pagination.tsx               # Reusable pagination component
│   ├── PageTransition.tsx           # Page transition animations
│   ├── SessionWarningModal.tsx      # Idle timeout warning modal
│   ├── SessionWarningToast.tsx      # Idle timeout warning toast
│   └── ToastContainer.tsx           # Toast notification container
├── contexts/
│   ├── AuthContext.tsx              # Authentication state + session management
│   ├── ToastContext.tsx             # Toast notifications
│   ├── ConfirmDialogContext.tsx     # Confirmation dialogs
│   ├── ActivityLogContext.tsx       # Activity logging
│   └── MobileMenuContext.tsx        # Mobile sidebar toggle
├── hooks/
│   ├── index.ts                     # Re-exports
│   ├── useApi.ts                    # Base API hook (token + companyId injection)
│   ├── useApiEndpoints.ts           # Domain-specific API hooks
│   └── useFetch.ts                  # Generic data fetching hook
├── services/
│   └── api-client.ts                # Class-based API client (alternative)
├── types/
│   └── financial-system.ts          # All TypeScript interfaces & types
└── utils/
    └── financial-constants.ts       # API config, formatting, token helpers
```

## Architecture & Patterns

### Authentication
- JWT-based auth with Bearer tokens stored in `localStorage`
- Session management with **15-minute idle timeout** and **8-hour absolute timeout**
- Idle warning displayed 1 minute before auto-logout
- Token verification on mount via `/api/auth/verify`
- Login via `POST /api/auth/login` to the Express backend

### API Communication
There are **two API patterns** in use (prefer the hooks-based approach for new code):

1. **Hooks-based (preferred):** `useApi()` → `useApiEndpoints.ts` hooks
   - `useApi()` handles token injection, companyId, and 401 auto-logout
   - Domain hooks: `useDashboard()`, `useChartOfAccounts()`, `useTransactions()`, `useUsers()`, `useActivityLogs()`, `useFinancialReports()`
   - Each hook manages its own `loading` and `error` states

2. **Class-based (legacy):** `ApiClient` in `services/api-client.ts`
   - Singleton instance `apiClient` exported
   - Methods organized as `apiClient.auth.*`, `apiClient.transactions.*`, etc.

### API Base URL
- Configured via `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:5000`)
- All API endpoints are prefixed with `/api/` (e.g., `/api/transactions`, `/api/dashboard/stats`)
- `companyId` is automatically injected into requests by the `useApi` hook

### Role-Based Access Control
Roles and their permissions:
| Role      | Dashboard | Transactions | Reports | Approval | Users | Activity Log |
|-----------|-----------|-------------|---------|----------|-------|--------------|
| Admin     | ✅        | ✅          | ✅      | ❌       | ✅    | ✅           |
| Marketing | ✅        | ❌          | ❌      | ❌       | ❌    | ❌           |
| Manager   | ✅        | ✅          | ✅      | ✅       | ❌    | ✅           |
| Owner     | ✅        | ✅          | ✅      | ✅       | ❌    | ✅           |

### Context Providers (wrapping order in root layout)
```
AuthProvider → MobileMenuProvider → ActivityLogProvider → ConfirmDialogProvider → ToastProvider
```

## Key Types

```typescript
// Account types for Chart of Accounts
type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
type AccountLevel = 1 | 2 | 3 | 4;

// Transaction types & statuses
type TransactionType = 'PENDAPATAN' | 'PENGELUARAN' | 'TRANSFER' | 'PENYESUAIAN';
type TransactionStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'POSTED';

// User roles
type Role = 'Admin' | 'Marketing' | 'Manager' | 'Owner';
```

## Backend API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET  /api/auth/me` — Current user

### Chart of Accounts
- `GET    /api/chart-of-accounts` — List all
- `GET    /api/chart-of-accounts/:id` — Get by ID
- `POST   /api/chart-of-accounts` — Create
- `PUT    /api/chart-of-accounts/:id` — Update
- `DELETE /api/chart-of-accounts/:id` — Delete
- `GET    /api/chart-of-accounts/hierarchy/tree` — Hierarchy view
- `GET    /api/chart-of-accounts/type/:type` — Filter by type

### Transactions
- `GET    /api/transactions` — List all (with filters)
- `GET    /api/transactions/:id` — Get by ID
- `POST   /api/transactions` — Create
- `PUT    /api/transactions/:id` — Update
- `DELETE /api/transactions/:id` — Delete
- `POST   /api/transactions/:id/approve` — Approve
- `POST   /api/transactions/:id/reject` — Reject (with `rejectionReason`)

### Dashboard
- `GET /api/dashboard/stats` — Financial statistics
- `GET /api/dashboard/recent-transactions` — Recent transactions
- `GET /api/dashboard/summary` — Summary overview

### Reports
- `GET  /api/dashboard/balance-sheet` — Balance sheet
- `POST /api/dashboard/balance-sheet` — Generate balance sheet
- `GET  /api/dashboard/income-statement` — Income statement
- `POST /api/dashboard/income-statement` — Generate income statement
- `GET  /api/dashboard/cash-flow` — Cash flow report
- `GET  /api/dashboard/reports` — List all reports
- `GET  /api/dashboard/reports/:id` — Get report by ID
- `PUT  /api/dashboard/reports/:id` — Update report
- `POST /api/dashboard/reports/:id/finalize` — Finalize report

### Users
- `GET    /api/users` — List all
- `GET    /api/users/:id` — Get by ID
- `POST   /api/users` — Create
- `PUT    /api/users/:id` — Update
- `DELETE /api/users/:id` — Delete

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000       # Backend API base URL
NEXT_PUBLIC_APP_NAME=Sistem Pengelolaan Keuangan
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_BATCH_PROCESSING=false       # Feature flag
NEXT_PUBLIC_ENABLE_ADVANCED_REPORTS=false        # Feature flag
NEXT_PUBLIC_ENABLE_RBAC=false                    # Feature flag
```

## Development

### Running the App
```bash
npm run dev        # Start Next.js dev server (http://localhost:3000)
npm run build      # Production build
npm run lint       # ESLint
```

> **Note:** The backend must be running separately on port 5000 for API calls to work.

### Path Aliases
- `@/*` maps to `./src/*` (configured in `tsconfig.json`)

## Conventions & Guidelines

### Code Style
- Use `"use client"` directive for all components that use React hooks or browser APIs
- Use Tailwind CSS v4 for styling — no separate CSS modules
- Indonesian language used in UI labels (e.g., "Manajemen Transaksi", "Laporan Neraca")
- Currency formatted as IDR using `Intl.NumberFormat('id-ID')`
- Dates formatted using Indonesian locale (`id-ID`)

### Adding New Pages
1. Create a new directory under `src/app/(dashboard)/`
2. Add `page.tsx` with `"use client"` directive
3. Add the route to `Sidebar.tsx` menu items with appropriate role restrictions
4. Use hooks from `useApiEndpoints.ts` for data fetching

### Adding New API Endpoints
1. Add the endpoint path to `API_ENDPOINTS` in `src/utils/financial-constants.ts`
2. Add a corresponding method in the relevant hook in `src/hooks/useApiEndpoints.ts`
3. Add TypeScript types in `src/types/financial-system.ts`

### Component Patterns
- Use Context API for global state (not Redux/Zustand)
- Toast notifications via `useToast()` context hook
- Confirmation dialogs via `useConfirmDialog()` context hook
- All data tables should use the `Pagination` component
- Page transitions wrapped in `PageTransition` component

### Error Handling
- API errors return `{ success: false, message: string, error?: string }`
- 401 responses trigger automatic logout and redirect to login
- Network errors are caught and displayed as toast notifications
