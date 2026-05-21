# Langdi CRM — Backend

Production-ready backend for a Real Estate CRM. Workflow-driven, role-based, stage-driven, analytics-enabled.

**Stack:** Node.js · Express · MongoDB · Mongoose · JWT · Joi · Winston · node-cron · helmet · CORS · rate-limit

---

## Quick start

```bash
# 1. clone / cd
cd Backend

# 2. install
npm install

# 3. configure
cp .env.example .env
# edit .env — at minimum: MONGODB_URI, JWT_*, COOKIE_SECRET

# 4. seed (idempotent — re-runnable)
npm run seed

# 5. run
npm run dev      # nodemon (auto-restart)
npm start        # plain node
```

Server: `http://localhost:5000`
API base: `http://localhost:5000/api/v1`
Health: `GET /api/v1/health`

### Default admin credentials (created by seed)

```
email:    admin@langdi.local
password: Admin@12345
```

Override via `.env`:
```
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourStrongPassword
```

**Change immediately in production.**

---

## Folder structure

```
Backend/
├── .env, .env.example, .gitignore, package.json
└── src/
    ├── server.js                       # HTTP entry + graceful shutdown
    ├── app.js                          # express app — middlewares, mount
    │
    ├── config/                         # env validator, jwt, cors, ratelimit
    ├── database/
    │   ├── connect.js                  # mongoose connect + reconnect listeners
    │   └── seed.js                     # permissions + roles + admin + stages
    │
    ├── constants/                      # roles, permissions, sources, statuses, …
    ├── middlewares/                    # auth, rbac, validate, errorHandler, requestLogger
    ├── utils/                          # ApiResponse, ApiError, asyncHandler, jwt, hash, logger, pagination
    ├── validators/                     # shared joi schemas (objectId, email, pagination)
    │
    ├── jobs/                           # autoAssignLead.job.js, overdueReminders.job.js
    ├── cron/                           # schedules.js, index.js (booted in server.js)
    │
    ├── routes/index.js                 # mounts /health + /crm
    │
    └── modules/crm/                    # all domain code lives here
        ├── index.js                    # mounts every sub-router
        ├── models/                     # mongoose schemas (16 collections)
        ├── repositories/               # DB layer — mongoose only, no business logic
        ├── services/                   # business logic — orchestrates repos + cross-module calls
        │   ├── workflow.engine.js      # stage-move + undo orchestrator
        │   └── ... (per-module .service.js)
        ├── controllers/                # HTTP layer — req parsing, calls service, sends ApiResponse
        ├── validators/                 # joi schemas per module
        └── routes/                     # express routers per module
```

---

## Architecture

```
HTTP REQ
  ↓
[route]  →  validate.middleware  →  auth.middleware  →  rbac.middleware
  ↓
[controller]  — parses req, calls service, wraps response in ApiResponse
  ↓
[service]  — business logic; may call OTHER services + repositories
  ↓
[repository]  — mongoose queries only
  ↓
[model]  — schema + indexes
  ↓
DB
```

**Cross-module side-effects** are explicit service-to-service calls (no event bus in v1):

- `qualification.qualify` → updates enquiry status + temperature
- `lead.createFromEnquiry` → flips enquiry to `converted`
- `leadAssignment.assign` → `notification.notify` + `auditLog.log`
- `workflow.engine.move` → `leadStageHistory.create` + `notification.notify` + `auditLog.log`
- `overdueReminders` cron → marks `missed` + `notification.notify`

---

## API conventions

### Auth

All `/api/v1/crm/*` endpoints require JWT — except `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`.

**Header:** `Authorization: Bearer <accessToken>`

**Tokens:**
- Access: 1 day (configurable via `JWT_ACCESS_EXPIRES_IN`)
- Refresh: 7 days, stored as `httpOnly signed cookie` (`refresh_token`) + returned in body for non-browser clients
- Refresh rotation: every refresh issues a new pair; old refresh is revoked immediately. Replay = 401.

### Response shape

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "meta": { "pagination": { "page": 1, "limit": 20, "total": 42, "totalPages": 3, "hasNext": true, "hasPrev": false } }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable message",
  "code": "BAD_REQUEST | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | UNPROCESSABLE | TOO_MANY_REQUESTS | INTERNAL",
  "details": [ { "source": "body", "field": "email", "message": "..." } ]
}
```

### Common query params (pagination + filters)

- `page` (default 1), `limit` (default 20, max 100)
- `sortBy` (e.g. `createdAt`), `sortOrder` (`asc` | `desc`)
- `search` — substring match (regex i) on text fields
- `from`, `to` — ISO 8601 date range
- Module-specific: `status`, `source`, `temperature`, `assignedTo`, `currentStageId`, etc.

---

## Modules

### 1. Auth — `/api/v1/crm/auth`

| Method | Path | RBAC | Purpose |
|---|---|---|---|
| POST | `/login` | — | email + password → tokens |
| POST | `/refresh` | — | rotate refresh + issue new access |
| POST | `/logout` | — | revoke current refresh |
| POST | `/logout-all` | auth | revoke all refresh for user |
| GET | `/me` | auth | current user + permissions |
| POST | `/forgot-password` | — | email reset token (returned in dev) |
| POST | `/reset-password` | — | redeem token + set new password |
| POST | `/change-password` | auth | current → new |

### 2. Users & RBAC — `/users`, `/roles`, `/permissions`

User schema: `name, email (unique), phone, passwordHash, roleId, additionalPermissions[], managerId, status, lastLoginAt, loginHistory[]`

Role schema: `name (unique), description, permissions[] (string keys), isSystem`

Permission schema: `key (unique), module, action, description`

**Permissions are string keys** (e.g. `lead:create`). Roles store an array of these. Effective perms = `role.permissions ∪ user.additionalPermissions`. Stored as strings (no populate) for fast RBAC checks on every request.

Routes:
- `/users` — CRUD + `/:id/activate`, `/:id/deactivate`, `/:id/assign-role`
- `/roles` — CRUD (system roles can't be renamed/deleted)
- `/permissions` — read-only catalog

### 3. Enquiries — `/enquiries`

Top of funnel. Lead generators capture client interest.

Fields: `clientName, clientEmail, clientPhone, source, propertyType, project, budgetMin/Max, timeline, temperature, status, remarks, nextFollowupAt, qualificationAnswers (Mixed)`

Lifecycle: `new → contacted → qualified → converted` (or `rejected` / `hold`).

CRUD + `/:id/followup` to set nextFollowupAt.

### 4. Qualifications — `/qualifications`

One per enquiry (unique). Converts enquiry into qualified lead.

Fields: `enquiryId (unique), answers[], score, leadTemperature, remarks, nextFollowupAt, qualificationStatus, qualifiedBy, rejectionReason, holdUntil`

Actions: `/:id/qualify`, `/:id/reject` (reason required), `/:id/hold`

**Auto-classify temperature by score:** ≥70 → hot, ≥40 → warm, else cold.

Qualifying flips enquiry to `qualified` and copies leadTemperature to enquiry.

### 5. Lead Stages — `/lead-stages`

Fully configurable pipeline. Admin can add/edit/reorder/activate/deactivate.

Fields: `name, order, color, assignedRoles[], requiredFields[], allowedNextStages[], slaHours, isActive, isInitial, isFinal, isSystem`

Default 7-stage pipeline (seeded as system):

| # | Name | Roles | Required | SLA |
|---|---|---|---|---|
| 1 | Visit Confirmation | Admin, Sales Coord | — | 24h |
| 2 | Reminder Call | Admin, Sales Coord, Sales Person | — | 24h |
| 3 | Visit Confirmed | Admin, Sales Coord, Sales Person | — | 48h |
| 4 | Feedback Call | Admin, Sales Person | budget | 24h |
| 5 | Follow-Up | Admin, Sales Person | — | 48h |
| 6 | Negotiation | Admin, Sales Coord, Sales Person | budget, expectedRevenue | 72h |
| 7 | Final Deal | Admin, Sales Coord | expectedRevenue | 168h |

### 6. Leads — `/leads`

Created from qualified enquiries only. **One lead per enquiry** (unique index).

Fields: `enquiryId (unique), qualificationId, currentStageId, assignedTo, temperature, source, project, budget, expectedRevenue, status (active/won/lost/dropped), lostReason, closedAt, plannedStageAt, actualStageAt, lastActivityAt`

| Method | Path | Purpose |
|---|---|---|
| POST | `/from-enquiry/:enquiryId` | create from qualified enquiry |
| GET | `/` | list with rich filters |
| GET | `/:id` | detail |
| GET | `/:id/history` | full stage history |
| GET | `/:id/assignments` | assignment history |
| PATCH | `/:id` | update (cannot edit assignedTo/stage/status here) |
| POST | `/:id/move-stage` | workflow-validated transition |
| POST | `/:id/undo-stage` | revert to previous stage |
| POST | `/:id/assign` / `/unassign` | manual (re)assignment |
| POST | `/:id/mark-won` / `/mark-lost` / `/mark-dropped` | terminal status |
| DELETE | `/:id` | admin only |

### Workflow engine (`workflow.engine.js`)

`canMove(lead, toStageId, user)` returns `{ allowed, reason }`. Checks **in order**:

1. Lead status ∉ {won, lost, dropped}
2. Target stage exists + isActive
3. Lead not already at target stage
4. User's role ∈ `toStage.assignedRoles` (Administrator bypasses)
5. `toStageId` ∈ `currentStage.allowedNextStages` (or empty = any)
6. Lead has all `toStage.requiredFields` (non-empty)

If all 5 pass: insert `LeadStageHistory` + update lead + emit notification + emit audit log.

`undoLast(leadId)` reverts to previous fromStage — does **not** delete history, creates a new `isUndo:true` entry for full audit trail.

### 7. Lead Assignment — `/lead-assignments`

History is a separate collection. Auto-assignment uses **least-active workload strategy**.

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | list all assignments across leads |
| POST | `/auto-run` | trigger cron logic on demand (admin) |

Plus on leads: `/leads/:id/assign`, `/unassign`, `/assignments`.

**Auto-assign algorithm:**
```
1. find leads where: assignedTo=null AND status=active AND createdAt < now - delayMinutes
2. for each:
   a. find users in target role (default 'Sales Person')
   b. aggregate active lead count per candidate
   c. pick least loaded (tiebreak by id)
   d. atomic claim: findOneAndUpdate({_id, assignedTo:null}, {$set:{assignedTo:pick}})
   e. record LeadAssignment{ autoAssigned:true, triggerType:'auto' }
   f. notify assignee
```

### 8. Comments — `/comments`

Polymorphic timeline. Attach to any enquiry / lead / qualification.

Fields: `referenceType (enquiry|lead|qualification), referenceId, comment, nextFollowupDate, nextFollowupTime, createdBy`

`GET /comments/by-ref/:referenceType/:referenceId` → full timeline.

### 9. Reminders — `/reminders`

Polymorphic. Cron sweeps overdue every 15 min.

Fields: `referenceType, referenceId, assignedTo, title, description, reminderDate, reminderTime, reminderAt (computed), status (pending|done|missed|cancelled), completedAt, completedBy, createdBy`

Per-user views:
- `GET /reminders/today` — pending due today
- `GET /reminders/overdue` — pending past-due
- `GET /reminders/missed` — already marked missed by cron

Actions: `/:id/complete`, `/:id/cancel`, PATCH (only when pending).

### 10. Notifications — `/notifications`

In-app, per-user. Auto-fired on:

| Event | Type |
|---|---|
| Manual assign | `lead_assigned` / `lead_reassigned` |
| Auto-assign (cron) | `lead_auto_assigned` |
| Stage move (when mover ≠ assignee) | `lead_stage_moved` |
| Reminder overdue (cron) | `reminder_overdue` |

| Method | Path |
|---|---|
| GET | `/notifications` — current user's, `meta.unread` count |
| GET | `/notifications/unread-count` |
| POST | `/notifications/:id/mark-read` |
| POST | `/notifications/mark-all-read` |
| DELETE | `/notifications/:id` |

**Fail-safe:** `notify()` catches errors → logs warning → never throws. A notification failure never breaks the parent operation.

### 11. Dashboard — `/dashboard`

7 aggregation endpoints. Filters: `from`, `to`, `salespersonId`, `source`, `project`.

| Path | Returns |
|---|---|
| `/overview` | totals (enquiries, leads, by status, by temperature, assigned/unassigned, today/overdue followups, conversion %) |
| `/stage-funnel` | lead count per stage (sorted by order) |
| `/salesperson-performance` | per-assignee: total, active, won, lost, revenue, conversion % |
| `/source-breakdown` | per source: enquiries, leads, won, conversion |
| `/temperature-breakdown` | hot/warm/cold counts with status split |
| `/negotiation-pipeline` | leads in Negotiation stage + expected revenue sum |
| `/final-deals` | won leads count + total revenue |

### 12. Reports — `/reports`

7 deeper analytics endpoints (rbac: `report:view`).

| Path | Returns |
|---|---|
| `/conversion-funnel` | 4-stage funnel: Enquiries → Qualified → Leads → Won with % drop |
| `/source-analytics` | qualification + win rate per source |
| `/lost-reasons` | grouped lost leads with revenue lost |
| `/avg-completion-time` | won leads: avg/min/max days from create to close |
| `/stage-delay` | avg time spent in each stage (from history transitions) |
| `/salesperson-scorecard` | detailed scorecard with revenue + win rate + avg close time |
| `/overdue-followups` | total + breakdown by assignee |

**Anti-duplicate counting:** all "qualified leads" counts pulled from `leads` collection (never sum of enquiries + leads). `enquiryId` unique index on Lead enforces this physically.

### 13. Configurations — `/configurations`

Admin key-value store. Useful for: qualification questions, custom lead sources, reminder rules, role-stage overrides, UI settings, feature flags.

| Method | Path |
|---|---|
| GET | `/configurations?category=ui` |
| GET | `/configurations/:key` |
| PUT | `/configurations/:key` (upsert) |
| POST | `/configurations/bulk` (up to 50 keys) |
| DELETE | `/configurations/:key` |

Key format: `^[a-z0-9._-]{2,80}$` (e.g. `site.theme`, `lead.auto-assign.delay-minutes`).

### 14. Audit Logs — `/audit-logs`

Append-only. Auto-captured for:

| Module | Actions |
|---|---|
| auth | login (success + failure), logout, logoutAll |
| user | create, update, setStatus, assignRole, delete |
| leadAssignment | manual, reassign, unassign |
| lead | stageMove, stageUndo |

Each entry: `{ module, action, performedBy, performedByEmail, refType, refId, oldData, newData, meta, ipAddress, userAgent, success, errorMessage, createdAt }`

| Method | Path |
|---|---|
| GET | `/audit-logs?module=user&action=update&performedBy=...&refId=...&from=...&to=...` |
| GET | `/audit-logs/:id` |

RBAC: `auditLog:read`.

---

## Seeded data

### Roles + Permissions

42 permissions across 15 modules (`{module}:{action}` format — `lead:create`, `user:assignRole`, etc.)

| Role | Permissions |
|---|---|
| Administrator | All 42 |
| Sales Coordinator | 24 (read users, manage enquiries/qualifications/leads, lead assign + move stage, reports) |
| Sales Person | 15 (read leads, update own, move stage, comments, reminders) |
| Lead Generator | 14 (create enquiries + qualifications, read leads) |

System roles cannot be renamed or deleted.

### Default pipeline

7 stages seeded as `isSystem: true` with `allowedNextStages` wired bidirectionally. See "Lead Stages" section above.

---

## Cron jobs

Booted in `server.js` on startup, stopped on SIGTERM/SIGINT.

| Job | Schedule | What |
|---|---|---|
| `autoAssignLead` | `0 * * * *` (hourly) | Find unassigned leads > `AUTO_ASSIGN_DELAY_MINUTES` old → assign least-loaded user in `AUTO_ASSIGN_TARGET_ROLE` |
| `overdueReminders` | `*/15 * * * *` (every 15 min) | Find pending reminders past `reminderAt` → mark `missed` + fire `reminder_overdue` notification |

Disable all cron: `CRON_ENABLED=false` in `.env`.

Both jobs are also exposed as manual triggers:
- Auto-assign: `POST /lead-assignments/auto-run` (admin)

---

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | env mode |
| `PORT` | `5000` | HTTP listen port |
| `API_PREFIX` | `/api/v1` | path prefix |
| `MONGODB_URI` | — | **required** — `mongodb://localhost:27017/langdi_crm` |
| `JWT_ACCESS_SECRET` | — | **required**, min 16 chars |
| `JWT_REFRESH_SECRET` | — | **required**, min 16 chars |
| `JWT_ACCESS_EXPIRES_IN` | `1d` | e.g. `15m`, `1d`, `7d` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | |
| `CORS_ORIGIN` | `*` | comma-separated; `http://localhost:3000,http://localhost:5173` |
| `COOKIE_SECRET` | — | **required**, min 16 chars |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15 min |
| `RATE_LIMIT_MAX` | `300` | requests per window |
| `LOG_LEVEL` | `info` | `error` / `warn` / `info` / `debug` |
| `CRON_ENABLED` | `true` | master switch |
| `AUTO_ASSIGN_CRON` | `0 * * * *` | cron expression |
| `AUTO_ASSIGN_DELAY_MINUTES` | `1440` | 24h |
| `AUTO_ASSIGN_TARGET_ROLE` | `Sales Person` | role name |
| `AUTO_ASSIGN_BATCH_SIZE` | `50` | leads per sweep |
| `OVERDUE_REMINDER_CRON` | `*/15 * * * *` | cron expression |
| `ADMIN_EMAIL` | `admin@langdi.local` | seeded admin |
| `ADMIN_PASSWORD` | `Admin@12345` | seeded admin |

---

## Database

**Collections (16):**

users · roles · permissions · refreshtokens · enquiries · qualifications · leads · leadstages · leadstagehistories · leadassignments · comments · reminders · notifications · configurations · auditlogs

**Critical indexes:**

- `users.email` unique
- `enquiries.clientPhone`, `enquiries.{status,createdAt}`, text on `clientName + remarks`
- `leads.enquiryId` unique (**enforces 1 lead per enquiry — prevents duplicate counting**)
- `leads.{assignedTo,status}`, `leads.{currentStageId,status}` (dashboard speed)
- `leadstagehistories.{leadId,movedAt}` (timeline)
- `reminders.{assignedTo,status,reminderAt}`, `reminders.reminderAt` (cron sweep)
- `refreshtokens.expiresAt` TTL (auto-cleanup)
- `auditlogs.{performedBy,createdAt}`, `.{module,createdAt}`, `.{refType,refId,createdAt}`

`autoIndex` is enabled in dev. In production, run `db.collection.createIndexes()` explicitly or pre-build.

---

## Security

- **Passwords:** bcrypt (10 rounds), `passwordHash` `select: false`, stripped in `toJSON`
- **JWT:** `iss`/`aud` claims, separate secrets for access and refresh
- **Refresh rotation:** stored `jti` revoked on every refresh — replay returns 401
- **httpOnly signed cookie** for refresh token (XSS-safe)
- **Helmet** default security headers
- **CORS** allowlist via env
- **Rate limit:** 300 req per 15 min per IP (configurable)
- **Joi validation** strips unknown fields, type-coerces, abortEarly: false (full error report)
- **Mongoose duplicate-key** auto-normalized to 409 conflict
- **RBAC** enforced at route level (`rbac('user:create')`)
- **Audit log** for all auth + privileged mutations (immutable record)
- **Request size:** 1mb cap on JSON + urlencoded

### Production checklist

- [ ] Rotate `JWT_*` and `COOKIE_SECRET` to long random strings
- [ ] Change admin password (`POST /auth/change-password`)
- [ ] Set `NODE_ENV=production` (enables JSON logs, secure cookies, hides stack traces in errors)
- [ ] Set `CORS_ORIGIN` to your frontend URL(s) — no `*`
- [ ] Tighten `JWT_ACCESS_EXPIRES_IN` (recommend `15m`)
- [ ] Use MongoDB **replica set** if you need transactions (currently sequential writes)
- [ ] Add HTTPS reverse proxy (nginx/cloudflare); express has `trust proxy 1`
- [ ] Set up log aggregation (winston outputs JSON in prod)
- [ ] Set up health check probe → `GET /api/v1/health` returns 200 (or 503 if DB down)
- [ ] Increase `RATE_LIMIT_MAX` per actual traffic OR add per-route limits
- [ ] Set up MongoDB backups
- [ ] Consider Redis for refresh token store at scale

---

## Common tasks

### Add a new role

```bash
POST /api/v1/crm/roles
Authorization: Bearer <admin-token>
{
  "name": "Branch Manager",
  "description": "Manages a branch office",
  "permissions": ["dashboard:view", "lead:read", "lead:assign", "report:view", ...]
}
```

### Add a new lead stage

```bash
POST /api/v1/crm/lead-stages
{
  "name": "Site Inspection",
  "order": 4,
  "color": "#06B6D4",
  "assignedRoles": ["Administrator", "Sales Person"],
  "requiredFields": ["project"],
  "allowedNextStages": ["<next-stage-id>"],
  "slaHours": 48
}
```

Then `PATCH /lead-stages/reorder` to slot it in.

### Add a custom permission

Edit [src/constants/permissions.js](src/constants/permissions.js) → add to `PERMISSION_CATALOG` → run `npm run seed` (idempotent upsert).

### Trigger auto-assignment immediately for testing

```bash
POST /api/v1/crm/lead-assignments/auto-run
{ "delayMinutes": 0, "batchSize": 10 }
```

### View audit history for a specific user

```bash
GET /api/v1/crm/audit-logs?refType=user&refId=<userId>&limit=50
```

---

## Troubleshooting

**`Env validation failed`** — missing required env var. Check `.env` against `.env.example`.

**`MongoDB connection failed`** — mongod not running, or wrong URI. Verify with `mongosh "$MONGODB_URI"`.

**`Token expired` on every request** — `JWT_ACCESS_EXPIRES_IN` is too short OR your client clock is skewed. Bump to `1d` for dev.

**`Refresh token revoked or unknown`** — refresh rotation revoked your old token. Client must use the new refresh from the previous response, not the original.

**`Cannot transition from X to Y`** — current stage's `allowedNextStages` doesn't include target. Update the stage via `PATCH /lead-stages/:id` to add the target.

**`Required fields missing: budget`** — lead is missing fields the target stage requires. PATCH the lead to fill them before moving.

**`Lead is won — cannot move stage`** — terminal lead. Use `mark-won` was already done; no further stage changes allowed.

**Validation 422 on every request** — check Joi `details[]` in the response body — field names + exact reasons.

**Cron not firing** — `CRON_ENABLED=false` in `.env`, OR invalid cron expression (server logs `Invalid cron expression for ...` on boot).

---

## Scripts

```bash
npm run dev      # nodemon — auto-restart on file change
npm start        # plain node
npm run seed     # idempotent — re-runnable any time
npm test         # placeholder
```

---

## Tech notes

- **CommonJS** (`type: commonjs` in package.json) — `require/module.exports` everywhere
- **Mongoose 8** — strictQuery enabled
- **Express 4** — `trust proxy` set to 1 for accurate `req.ip` behind reverse proxy
- **Async error handling** — every controller wrapped in `asyncHandler`, normalized in `errorHandler.js`
- **No transactions in v1** — local MongoDB standalone doesn't support them. Cross-collection writes use sequential operations. To enable transactions: deploy as replica set + wrap `lead.service.createFromEnquiry`, `qualification.qualify`, `workflow.engine.move` in `mongoose.startSession()`.
- **No event bus** — cross-module side-effects are direct service-to-service calls. Easy to read, harder to scale to multiple services. If splitting into microservices later, introduce a queue (RabbitMQ/Kafka/Redis Streams) and emit events instead.
