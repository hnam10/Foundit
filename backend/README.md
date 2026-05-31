# Foundit Backend

Express + TypeScript + PostgreSQL

## Getting Started

### 1. Prerequisites

- Node.js 22+
- PostgreSQL running (start via `cd database && docker compose up -d` from project root)

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values (see [Environment Variables](#environment-variables) below).

### 4. Apply database migrations and seed

```bash
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

This creates all tables and inserts a default admin account (`admin@myseneca.ca` / `Admin@1234`).

### 5. Start the dev server

```bash
# Make sure you are inside the backend/ folder
pnpm run dev
```

Server runs at `http://localhost:3001`. Confirm it's up:

```bash
curl http://localhost:3001/api/health
# → { "status": "ok", "db": true }
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in each value.

### Server

| Variable      | Description                                                |
| ------------- | ---------------------------------------------------------- |
| `PORT`        | Port the server listens on (default: `3001`)               |
| `CORS_ORIGIN` | Allowed frontend origin (default: `http://localhost:3000`) |

### JWT

| Variable                   | Description                                                                      |
| -------------------------- | -------------------------------------------------------------------------------- |
| `JWT_ACCESS_SECRET`        | Secret used to sign access tokens — **required**, server won't start without it  |
| `JWT_REFRESH_SECRET`       | Secret used to sign refresh tokens — **required**, server won't start without it |
| `JWT_ACCESS_EXPIRES_IN`    | Access token lifetime (default: `15m`)                                           |
| `JWT_REFRESH_EXPIRES_IN`   | Refresh token lifetime (default: `7d`)                                           |
| `JWT_REFRESH_EXPIRES_DAYS` | Refresh token lifetime in days for DB expiry calculation (default: `7`)          |

**Why two JWT secrets?**
Access tokens and refresh tokens are signed with separate secrets so that if one is compromised, the other is unaffected. If they shared the same secret, a leaked refresh secret would let an attacker forge access tokens and bypass authentication entirely.

Set them to any long random string in local dev, e.g.:

```
JWT_ACCESS_SECRET=some-long-random-string-here
JWT_REFRESH_SECRET=another-different-random-string
```

---

## Project Structure

```
src/
├── types/
│   └── express.d.ts           # req.user type declaration (campus_id is nullable)
├── middleware/
│   ├── authenticate.ts         # JWT verification — attaches req.user on success
│   ├── requireRole.ts          # Role-based access guard
│   └── errorHandler.ts         # Global Express error handler (Zod, JWT, generic)
├── validators/
│   ├── shared.ts               # validate() and validateQuery() middleware helpers
│   ├── auth.ts                 # Zod schemas: loginSchema, registerSchema, refreshSchema, logoutSchema
│   └── users.ts                # Zod schemas: updateProfileSchema, createUserSchema, listUsersQuerySchema
├── utils/
│   ├── token.ts                # JWT signing, refresh token verification, SHA-256 hash helper
│   ├── password.ts             # bcrypt hash and compare helpers
│   ├── auditLog.ts             # Audit log writer
│   └── username.ts             # Unique username generator
├── routes/
│   ├── health.ts               # GET /api/health
│   ├── auth.ts                 # POST /api/auth/login|register (done) · refresh|logout (stub)
│   ├── users.ts                # GET|PATCH /api/users/me (stub)
│   └── admin/
│       └── users.ts            # Admin user management stubs
├── db.ts                       # Prisma client singleton
└── index.ts                    # Entry point, router registration, error handler
```

---

## API Endpoints

This section lists both implemented routes and planned backend API contracts. Current implementation status:

- **Done**: implemented route behavior.
- **Stub**: route exists and returns `501 NOT_IMPLEMENTED`.
- **Planned**: route is part of the backend API plan but has not been added to Express yet.

Global API rules:

- Responses use **camelCase** field names.
- Protected routes require `Authorization: Bearer <accessToken>`.
- Endpoints must return explicit DTOs/projections and must not return raw Prisma models directly.
- List endpoints should use cursor pagination: `{ data: [...], nextCursor: string | null }`, with max `limit = 50`.
- Errors should use `{ code: "ERROR_CODE", message: "Human-readable description." }`.

### Auth

| Method | Path                 | Auth | Status | Description                                                 |
| ------ | -------------------- | ---- | ------ | ----------------------------------------------------------- |
| POST   | `/api/auth/register` | —    | Done   | Self-register a student or security account                 |
| POST   | `/api/auth/login`    | —    | Done   | Verify email + password, return JWT access & refresh tokens |
| POST   | `/api/auth/refresh`  | —    | Stub   | Exchange refresh token for a new access token               |
| POST   | `/api/auth/logout`   | —    | Stub   | Revoke refresh token                                        |

### Campus

| Method | Path            | Auth | Status  | Description                                              |
| ------ | --------------- | ---- | ------- | -------------------------------------------------------- |
| GET    | `/api/campuses` | —    | Planned | List campuses for registration dropdowns and admin forms |

### User Profile

| Method | Path                          | Auth    | Status  | Description                                     |
| ------ | ----------------------------- | ------- | ------- | ----------------------------------------------- |
| GET    | `/api/users/me`               | any     | Stub    | Get current user's profile                      |
| PATCH  | `/api/users/me`               | any     | Stub    | Update `firstName`, `lastName`, or `phone` only |
| PATCH  | `/api/users/me/password`      | any     | Planned | Change password; requires `currentPassword`     |
| PATCH  | `/api/users/me/notifications` | student | Stub    | Toggle email notification preference            |

### Admin

| Method | Path                       | Auth  | Status  | Description                                                                                                                                         |
| ------ | -------------------------- | ----- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/admin/users`         | admin | Stub    | List users with optional filters (role, isActive, campus)                                                                                           |
| POST   | `/api/admin/users`         | admin | Stub    | Create a new user account                                                                                                                           |
| PATCH  | `/api/admin/users/:userId` | admin | Planned | Update user fields — `body` accepts `isActive`, `campusId`, `role`; to activate send `{ isActive: true }`, to deactivate send `{ isActive: false }` |

### Claims

| Method | Path                                              | Auth                   | Status  | Description                                              |
| ------ | ------------------------------------------------- | ---------------------- | ------- | -------------------------------------------------------- |
| POST   | `/api/claims`                                     | student                | Planned | Submit a lost item claim                                 |
| GET    | `/api/claims`                                     | student/security/admin | Planned | List claims; student sees own, security/admin can filter |
| GET    | `/api/claims/:claimId`                            | student/security/admin | Planned | Get claim detail with ownership/authorization checks     |
| PATCH  | `/api/claims/:claimId/status`                     | security/admin         | Planned | Transition claim status using existing DB enum           |
| DELETE | `/api/claims/:claimId`                            | student                | Planned | Cancel/delete own cancellable claim with audit logging   |
| PATCH  | `/api/claims/:claimId`                            | security/admin         | Planned | Link a stored item to the claim (`itemId` only)          |
| GET    | `/api/claims/:claimId/match-suggestions`          | security/admin         | Planned | Retrieve match suggestions for a claim                   |
| POST   | `/api/claims/:claimId/match-suggestions`          | security/admin         | Planned | Trigger match scoring and create suggestions             |
| PATCH  | `/api/claims/:claimId/match-suggestions/:matchId` | security/admin         | Planned | Confirm or dismiss a match suggestion                    |

Claim cancellation uses `DELETE /api/claims/:claimId` because the original database `claim_status` enum does not include `withdrawn`.

### Report Links & Found Item Reports

| Method | Path                                       | Auth           | Status  | Description                                                         |
| ------ | ------------------------------------------ | -------------- | ------- | ------------------------------------------------------------------- |
| POST   | `/api/report-links`                        | security/admin | Planned | Generate a one-time QR report link token                            |
| GET    | `/api/report-links`                        | security/admin | Planned | List report links generated for relevant campus scope               |
| GET    | `/api/report-links/:token/validate`        | —              | Planned | Validate a token; returns only `{ valid: true/false }`              |
| POST   | `/api/report-links/:token/submit`          | student        | Planned | Submit a found item report and atomically consume token             |
| GET    | `/api/found-item-reports`                  | security/admin | Planned | List found item reports                                             |
| GET    | `/api/found-item-reports/:reportId`        | security/admin | Planned | Get found item report detail                                        |
| PATCH  | `/api/found-item-reports/:reportId/status` | security/admin | Planned | Transition report status (`submitted → processed → linked_to_item`) |

Report link tokens stay in the URL to match the current database model, but must be treated as one-time secrets: high entropy, rate-limited validation/submission, `Cache-Control: no-store`, redacted logs, and atomic consume on submit.

### Items

| Method | Path                        | Auth           | Status  | Description                                              |
| ------ | --------------------------- | -------------- | ------- | -------------------------------------------------------- |
| GET    | `/api/items/category-stats` | —              | Planned | Public item counts per category                          |
| POST   | `/api/items/batch`          | security/admin | Planned | Batch status update for items                            |
| POST   | `/api/items`                | security/admin | Planned | Register a found item into inventory                     |
| GET    | `/api/items`                | security/admin | Planned | List items with filters                                  |
| GET    | `/api/items/:itemId`        | security/admin | Planned | Get item detail                                          |
| PATCH  | `/api/items/:itemId`        | security/admin | Planned | Update item fields; does not modify status               |
| DELETE | `/api/items/:itemId`        | admin          | Planned | Permanently delete only erroneous records with audit log |
| PATCH  | `/api/items/:itemId/status` | security/admin | Planned | Transition item lifecycle status                         |

Normal item disposal should use `PATCH /api/items/:itemId/status` with `disposed`; `DELETE /api/items/:itemId` is reserved for admin correction of erroneous records.

### Notifications

| Method | Path                                 | Auth    | Status  | Description                                 |
| ------ | ------------------------------------ | ------- | ------- | ------------------------------------------- |
| GET    | `/api/notifications`                 | student | Planned | List notifications for current user         |
| GET    | `/api/notifications/stats`           | student | Planned | Get notification stats such as unread count |
| PATCH  | `/api/notifications`                 | student | Planned | Mark all notifications as read              |
| PATCH  | `/api/notifications/:notificationId` | student | Planned | Mark a single notification as read          |

### Audit Logs

| Method | Path                     | Auth           | Status  | Description                   |
| ------ | ------------------------ | -------------- | ------- | ----------------------------- |
| GET    | `/api/audit-logs`        | security/admin | Planned | Query audit logs with filters |
| GET    | `/api/audit-logs/export` | admin          | Planned | Export audit logs as CSV      |

Audit log campus scoping must either use a denormalized `campusId` in a future schema change or define per-entity scope-resolution rules without changing the existing database.

### System

| Method | Path          | Auth | Status | Description           |
| ------ | ------------- | ---- | ------ | --------------------- |
| GET    | `/api/health` | —    | Done   | DB connectivity check |

---

## Notes

- All responses use **camelCase** field names (e.g. `userId`, `firstName`, `campusId`)
- `campus_id` in JWT payload is `string | null` — users who self-register without selecting a campus will have `null` until assigned by an admin
- Stub routes return `501 NOT_IMPLEMENTED` until implemented
- Login is rate-limited to 10 attempts per IP per 15 minutes
- Registration is planned to be rate-limited to 10 requests per IP per 15 minutes
- Security users are allowed by project design to self-register and view cross-campus operational records where the endpoint documents that behavior
