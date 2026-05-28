# Langdi CRM — Frontend

React + Vite SPA for the Langdi Real-Estate CRM. Connects to the Node/Express + MongoDB backend over REST.

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Build tool | Vite 8 |
| Routing | React Router 7 |
| State | Redux Toolkit + React Redux |
| Forms | React Hook Form |
| HTTP | Axios |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Linter | ESLint 10 |

---

## Project structure

```
src/
├── app/                          # App shell
│   ├── router.jsx                # Route definitions
│   └── store.js                  # Redux store (combines all slice reducers)
│
├── layouts/                      # Shared layout shells
│   ├── AppLayout.jsx             # Authenticated layout (sidebar + topbar + main)
│   ├── AuthLayout.jsx            # Login/forgot-password layout
│   └── menuConfig.js             # Permission-gated sidebar menu config
│
├── shared/                       # Reusable, app-wide
│   ├── api/axiosClient.js        # Axios instance with auth interceptor
│   ├── components/               # Generic UI (Button, Input, Modal, Drawer, Toast, …)
│   ├── constants/apiRoutes.js
│   ├── guards/                   # ProtectedRoute / PublicRoute
│   └── utils/                    # permissions.js, tokenStorage.js
│
└── modules/crm/                  # Feature modules (one folder per feature)
    ├── auth/
    ├── configuration/
    ├── dashboard/
    ├── enquiries/
    ├── lead-assignments/
    ├── leads/
    ├── qualifications/
    ├── reports/
    ├── roles/                    # Roles & Permissions manager
    └── users/
```

Each feature module follows the same internal shape:

```
modules/crm/<feature>/
├── components/        # UI pieces specific to this feature
├── pages/             # Top-level routed pages
├── hooks/             # Custom hooks (e.g. useLeads, useEnquiryList)
├── redux/             # Async thunks + slice
├── services/          # axiosClient wrappers + response unwrappers
├── constants/         # Status enums, columns, etc.
├── utils/             # Formatters, helpers
└── validations/       # Form schemas
```

---

## Quick start

```bash
# install
npm install

# dev server (default http://localhost:5173)
npm run dev

# production build
npm run build

# preview production build locally
npm run preview

# lint
npm run lint
```

The dev server expects the backend running at the URL configured in `src/shared/api/axiosClient.js` (default `http://localhost:5000/api/v1/crm` — adjust as needed).

---

## Environment

Vite reads env from `.env` / `.env.local`. Variables must be prefixed with `VITE_` to be exposed to the client.

| Var | Purpose |
|-----|---------|
| `VITE_API_BASE_URL` | Backend API base (e.g. `http://localhost:5000/api/v1/crm`) |

---

## Authentication & RBAC

- **JWT access token** stored in `localStorage` via `shared/utils/tokenStorage.js`
- `axiosClient` attaches it to every request as `Authorization: Bearer <token>`
- On login, `/auth/login` returns `{ accessToken, user }` — both go into the `auth` slice
- The `user` object includes the merged `permissions` array (role permissions + additional)
- Components gate UI via `useAuth().can(key)` (e.g. `can(PERMISSIONS.lead.assign)`)
- Sidebar items hide automatically via `requires:` in `menuConfig.js`
- Routes are wrapped in `ProtectedRoute` (auth required) or `PublicRoute` (must not be authed)

**Source of truth is always the backend** — frontend gating is purely UX. Every API call is re-checked by `auth` + `rbac` middleware on the server.

---

## Feature modules

| Module | Route(s) | Notes |
|--------|----------|-------|
| `auth` | `/login`, `/forgot-password` | Login + session bootstrapping |
| `dashboard` | `/app/dashboard` | KPIs + Recharts funnels |
| `enquiries` | `/app/enquiries` | List + create modal + qualify flow |
| `qualifications` | (modal flow) | Opened from enquiry list, dynamic Q&A |
| `leads` | `/app/leads` | Stage-driven pipeline + detail modal + timeline |
| `lead-assignments` | `/app/lead-assignments` | Assign leads, salesperson workload |
| `users` | `/app/users` | User CRUD, role assignment, temp password generation |
| `roles` | `/app/roles` | Role & permission manager (matrix UI) |
| `configuration` | `/app/configurations` | Stage configuration |
| `reports` | `/app/reports` | Reports + export |

Some routes (qualifications detail, followups, roles edit modals, audit logs) are still placeholder pages.

---

## Conventions

- **Services layer** wraps `axiosClient` and unwraps `res.data.data` / `res.data` shapes consistently
- **Redux thunks** in `<module>/redux/<feature>Slice.js` — `extractApiError` from `axiosClient.js` normalises errors
- **Components are file-per-component** under `<module>/components/`
- **Tailwind utility classes only** — no CSS-in-JS, no separate CSS files (except `index.css` for base + custom utilities like `.no-scrollbar`, `.field-input`)
- **Brand colours** (`brand-50` to `brand-700`) configured in `tailwind.config.js` (palette: `#F2F9FF` → `#0A5BB0`)
- **Permission constants** centralised in `modules/crm/auth/constants/permissions.js`

---

## Deployment

Built and deployed via **Vercel** (frontend only; backend lives on **Render**).

- `vercel.json` rewrites all paths to `/` for SPA routing
- Build: `vite build` → `dist/`
- Production env vars must be set in Vercel project settings
- Backend URL in production should point to the Render backend (e.g. `https://langdi-backend.onrender.com/api/v1/crm`)

---

## Common tasks

**Add a new feature module**
1. Create `modules/crm/<feature>/` with the standard sub-folders
2. Add a slice reducer in `modules/crm/<feature>/redux/<feature>Slice.js`
3. Register it in `app/store.js`
4. Add the page in `app/router.jsx` (wrap with `ProtectedRoute`)
5. Add a sidebar entry in `layouts/menuConfig.js` with the right `requires:` permission

**Add a new permission to the catalog**
1. Backend: add entry to `Backend/src/constants/permissions.js` `PERMISSION_CATALOG`
2. Backend: re-run `npm run seed` (or grant via Roles UI)
3. Frontend: add key to `modules/crm/auth/constants/permissions.js` `PERMISSIONS` object
4. Use as `PERMISSIONS.<module>.<action>` in `can()` / `requires`

**Test as a different role**
- Sample users created via `Backend/npm run seed:sample`
- Sales Person: `amit.sharma@langdi.local` / `Sales@1234`
- Tele Sales: `pooja.tele@langdi.local` / `Sales@1234`
- Visit Team: `karan.visit@langdi.local` / `Sales@1234`
- Admin: `admin@langdi.local` / `Admin@12345`

---

## Known gaps / TODO

- **Roles page** — Add Role and Delete Role buttons missing (backend ready)
- **Stage-aware permission matrix** in UI — currently hard-coded in `Backend/.../stageAccessGuard.js`
- **Frontend UX gating** — disabled state for buttons when action will 403 (e.g. Tele Sales comment on post-visit lead)
- **Lead detail modal** — `plannedStageAt` and `requirement` silently stripped on Save Progress (validator drops unknown fields)
- **Undo Stage button** — shows even on never-moved leads; clicking errors with "Cannot undo the initial stage"
- **Lead KPIs** — computed from current page only (`useLeads.totals` iterates `state.items`, not full dataset)
- Roles UI: Total Users column, Status badge, Edit Role modal — all from spec, all pending
