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
│       └── users.ts            # GET|POST /api/admin/users (stub)
├── db.ts                       # Prisma client singleton
└── index.ts                    # Entry point, router registration, error handler
```

---

## API Endpoints

### Auth

| Method | Path                 | Auth | Description                                                 | Done |
| ------ | -------------------- | ---- | ----------------------------------------------------------- | ---- |
| POST   | `/api/auth/register` | —    | Self-register a student or security account                 | ✓    |
| POST   | `/api/auth/login`    | —    | Verify email + password, return JWT access & refresh tokens | ✓    |
| POST   | `/api/auth/refresh`  | —    | Exchange refresh token for a new access token               |      |
| POST   | `/api/auth/logout`   | —    | Revoke refresh token (no access token needed)               |      |

### User Profile

| Method | Path                          | Auth    | Description                            | Done |
| ------ | ----------------------------- | ------- | -------------------------------------- | ---- |
| GET    | `/api/users/me`               | any     | Get current user's profile             |      |
| PATCH  | `/api/users/me`               | any     | Update first name, last name, or phone |      |
| PATCH  | `/api/users/me/notifications` | student | Toggle email notification preference   |      |

### Admin

| Method | Path                                  | Auth  | Description                                               | Done |
| ------ | ------------------------------------- | ----- | --------------------------------------------------------- | ---- |
| GET    | `/api/admin/users`                    | admin | List users with optional filters (role, isActive, campus) |      |
| POST   | `/api/admin/users`                    | admin | Create a new user account                                 |      |
| PATCH  | `/api/admin/users/:userId/deactivate` | admin | Deactivate a user account                                 |      |
| PATCH  | `/api/admin/users/:userId/activate`   | admin | Reactivate a user account                                 |      |

### System

| Method | Path          | Auth | Description           | Done |
| ------ | ------------- | ---- | --------------------- | ---- |
| GET    | `/api/health` | —    | DB connectivity check | ✓    |

---

## Notes

- All responses use **camelCase** field names (e.g. `userId`, `firstName`, `campusId`)
- `campus_id` in JWT payload is `string | null` — users who self-register without selecting a campus will have `null` until assigned by an admin
- Stub routes return `501 NOT_IMPLEMENTED` until implemented
- Login is rate-limited to 10 attempts per IP per 15 minutes
