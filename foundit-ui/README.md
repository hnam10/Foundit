# Foundit UI

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Development Workflow](#development-workflow)
- [Related Documentation](#related-documentation)

## Tech Stack

| Category    | Technologies                                                        |
| ----------- | ------------------------------------------------------------------- |
| Framework   | [Next.js 16](https://nextjs.org) — App Router, Turbopack dev server |
| UI          | [React 19](https://react.dev), [Chakra UI 3](https://chakra-ui.com) |
| Styling     | [Tailwind CSS 4](https://tailwindcss.com)                           |
| Language    | TypeScript (strict)                                                 |
| Package mgr | pnpm 11+                                                            |
| Tooling     | ESLint (`eslint-config-next`), Prettier, Husky, lint-staged         |

Path alias: `@/*` → project root (`tsconfig.json`).

## Prerequisites

- Node.js 22+
- pnpm 11+
- Backend API running — see [backend/README.md](../backend/README.md)
- PostgreSQL — see [database/README.md](../database/README.md)

## Getting Started

```bash
cd foundit-ui
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
pnpm run dev                   # http://localhost:3000
```

The backend must be reachable at the URL in `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`):

```bash
curl http://localhost:3001/api/health
```

## Environment Variables

| Variable              | Description                         | Example                 |
| --------------------- | ----------------------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend base URL, no trailing slash | `http://localhost:3001` |

Only `NEXT_PUBLIC_*` vars are inlined at build time and exposed to the browser. Do not store secrets here.

## Available Scripts

| Script                  | Description                  |
| ----------------------- | ---------------------------- |
| `pnpm run dev`          | Dev server on port 3000      |
| `pnpm run build`        | Production build             |
| `pnpm run start`        | Serve production build       |
| `pnpm run lint`         | ESLint on `app/`             |
| `pnpm run format`       | Prettier write               |
| `pnpm run format:check` | Prettier check (CI-friendly) |

## Project Structure

```
foundit-ui/
├── app/                    # App Router — pages, layouts, route segments
│   ├── login/
│   ├── signup/
│   ├── profile/
│   ├── student/
│   ├── security/           # items, claims, qr, dashboards
│   ├── report-found/       # public token-based form
│   └── email-verified/
├── components/             # Shared UI (forms, cards, Chakra wrappers)
├── hooks/                  # Feature hooks (forms, uploads, auth display)
├── lib/api/                # API client + endpoint modules
│   ├── client.ts           # authFetch, token refresh
│   ├── items.ts
│   └── reportLinks.ts
├── utils/                  # auth, validation, image upload/compression
├── constants/              # campuses, categories
├── types/
├── docs/                   # Feature-level UI notes
├── middleware.ts           # Edge route guards by role
└── public/
```

## Architecture

### Auth & session

Login stores credentials client-side in two places:

| Store          | Key(s)                                | Purpose                          |
| -------------- | ------------------------------------- | -------------------------------- |
| `localStorage` | `accessToken`, `refreshToken`, `user` | JWT pair + profile for API calls |
| Cookie         | `foundit_role`                        | Role hint for Next.js middleware |

- **Access token** — sent as `Authorization: Bearer` on protected API calls via `authFetch` in `lib/api/client.ts`.
- **Refresh token** — used to obtain a new access token on `401` with `code: TOKEN_EXPIRED`. Concurrent refresh requests are deduplicated.
- **Role cookie** — set by `setSessionRole()` in `utils/auth.ts`; read by `middleware.ts` for route protection. Not a security boundary on its own — the backend validates JWTs on every request.

`signOut()` clears localStorage and the role cookie, then hard-navigates to `/login`.

### Route protection (`middleware.ts`)

Middleware runs on edge for matched paths. It reads `foundit_role` and redirects unauthenticated users to `/login` or wrong-role users to their home.

| Role       | Home                  | Guarded prefixes        |
| ---------- | --------------------- | ----------------------- |
| `student`  | `/student/dashboard`  | `/student`, `/profile`  |
| `security` | `/security/dashboard` | `/security`, `/profile` |
| `admin`    | `/admin/dashboard`    | `/admin` + all above    |

Unmatched public routes (no middleware): `/`, `/login`, `/signup`, `/report-found/[token]`, `/email-verified`.

`/dashboard` redirects authenticated users to `ROLE_HOME[role]` (`utils/routes.ts`).

### API layer

All backend calls go through `lib/api/`:

```ts
import { authFetch, parseApiError } from '@/lib/api/client';

const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/items`);
if (!res.ok) throw new Error(await parseApiError(res));
```

Add new endpoint modules alongside `items.ts` and `reportLinks.ts`. Use plain `fetch` only for unauthenticated routes (e.g. login, token validation).

### UI & forms

- Chakra UI provider wraps the app in `components/ui/provider.tsx` with light/dark via `next-themes`.
- Form state lives in `hooks/` (e.g. `useLoginForm`, `useReportFoundItemForm`).
- Image uploads: client-side compression (`utils/imageCompression.ts`) then presigned upload flow via backend — see `utils/handleImageUpload.ts`.

## Development Workflow

### Git hooks

`pnpm install` runs `prepare`, which points the repo's Husky hooks at `foundit-ui/.husky`. Pre-commit runs lint-staged (ESLint + Prettier on staged files).

### Adding a feature

1. Define types in `types/` if needed.
2. Add API helpers in `lib/api/`.
3. Build UI in `components/` and wire with a hook.
4. Add the page under the appropriate `app/` segment.
5. If the route needs auth, extend `middleware.ts` `config.matcher` if not already covered.

## Related Documentation

- [Root README](../README.md)
- [Backend README](../backend/README.md) — API contracts
- [Database README](../database/README.md)
- [Report found form](./docs/report-found-form.md)
- [Security item detail](./docs/security-item-detail.md)
