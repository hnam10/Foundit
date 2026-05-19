# Foundit Backend

Express + TypeScript + PostgreSQL

## Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL running and seeded (see root `docker-compose.yml`)

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the values (see [Environment Variables](#environment-variables) below).

### 4. Start the dev server

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

| Variable                 | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `JWT_ACCESS_SECRET`      | Secret used to sign access tokens — **required**, server won't start without it  |
| `JWT_REFRESH_SECRET`     | Secret used to sign refresh tokens — **required**, server won't start without it |
| `JWT_ACCESS_EXPIRES_IN`  | Access token lifetime (default: `15m`)                                           |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (default: `7d`)                                           |

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
│   └── express.d.ts          # req.user type declaration
├── middleware/
│   ├── authenticate.ts        # TODO: JWT verification
│   └── requireRole.ts         # TODO: role-based access guard
├── validators/
│   ├── auth.ts                # TODO: zod schemas for auth routes
│   └── users.ts               # TODO: zod schemas for user/admin routes
├── routes/
│   ├── health.ts              # done
│   ├── auth.ts                # TODO: login / refresh / logout
│   ├── users.ts               # TODO: GET|PATCH /me, PATCH /me/notifications
│   └── admin/
│       └── users.ts           # TODO: list / create / deactivate / activate
├── db.ts                      # PostgreSQL connection pool
└── index.ts                   # entry point, router registration
```

> All routes are scaffolded and return `501 NOT_IMPLEMENTED`.
> Start with middleware → validators → routes (in that order).

---

## API Endpoints

### Auth

| Method | Path                | Description                                                 | Done |
| ------ | ------------------- | ----------------------------------------------------------- | ---- |
| POST   | `/api/auth/login`   | Verify email + password, return JWT access & refresh tokens |      |
| POST   | `/api/auth/refresh` | Exchange refresh token for a new access token               |      |
| POST   | `/api/auth/logout`  | Revoke refresh token (no access token needed)               |      |

### User Profile

| Method | Path                          | Description                                          | Done |
| ------ | ----------------------------- | ---------------------------------------------------- | ---- |
| GET    | `/api/users/me`               | Get current user's profile                           |      |
| PATCH  | `/api/users/me`               | Update first name, last name, or phone               |      |
| PATCH  | `/api/users/me/notifications` | Toggle email notification preference (students only) |      |

### Admin

| Method | Path                                  | Description                                                | Done |
| ------ | ------------------------------------- | ---------------------------------------------------------- | ---- |
| GET    | `/api/admin/users`                    | List users with optional filters (role, is_active, campus) |      |
| POST   | `/api/admin/users`                    | Create a new user account                                  |      |
| PATCH  | `/api/admin/users/:userId/deactivate` | Deactivate a user account                                  |      |
| PATCH  | `/api/admin/users/:userId/activate`   | Reactivate a user account                                  |      |

### System

| Method | Path          | Description           | Done |
| ------ | ------------- | --------------------- | ---- |
| GET    | `/api/health` | DB connectivity check | ✓    |
