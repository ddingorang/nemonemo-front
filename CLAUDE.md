# Created: 2026-04-14 14:51:26
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build → /dist
npm run preview  # Preview production build locally
```

No test runner is configured.

## Architecture

**Stack**: React 18 + Vite, React Router v6, Axios, Tailwind CSS. No TypeScript, no state management library.

**Dev proxy**: Vite proxies `/api/*` to `http://localhost:8080` (backend must be running separately).

### Route Structure

```
/              → src/pages/customer/HomePage.jsx     (public: 10×5 unit grid)
/inquiry       → src/pages/customer/InquiryPage.jsx  (public: booking form)

/admin/login      → src/pages/admin/LoginPage.jsx
/admin/dashboard  → src/pages/admin/DashboardPage.jsx
/admin/units      → src/pages/admin/UnitsPage.jsx
/admin/inquiries  → src/pages/admin/InquiriesPage.jsx
/admin/contracts  → src/pages/admin/ContractsPage.jsx
```

Admin routes are wrapped in `<ProtectedRoute>` which checks `localStorage.getItem('token')`.

### API Client (`src/api/client.js`)

Single Axios instance with base URL `/api`:
- **Request interceptor**: Attaches `Authorization: Bearer <token>` from localStorage
- **Response interceptor**: Unwraps `.data`, on 401 clears token + redirects to login, on error dispatches `window.dispatchEvent(new CustomEvent('app:error', { detail: message }))` for `ErrorModal` to display

### Component Conventions

- **DataTable**: Reusable table with search, sortable columns, and pagination (20 rows/page). Props: `columns` (array of `{key, label, sortable, render}`), `rows`, `onEdit`, `onDelete`, `actions`.
- **Modals**: No library — `fixed inset-0` divs with state like `modal === 'create' | 'edit' | null`.
- **Forms**: Local `form` state updated via `setForm(p => ({...p, [key]: value}))`.
- **Status badges**: Uppercase string enums (e.g. `AVAILABLE`, `OCCUPIED`) mapped to Tailwind class strings in a `STATUS_CLASS` object per page.
- **Button classes**: Defined in `src/styles/index.css` as `@layer components` — use `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-sm`, `.btn-edit`, `.btn-delete` rather than inline Tailwind utilities.
- **Dates**: Handled as ISO strings; `.slice(0, 10)` for display. No date library used.
- **UI language**: Korean throughout.
