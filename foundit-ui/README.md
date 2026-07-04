# Foundit UI

Frontend for **Foundit**, a lost-and-found platform for Seneca Polytechnic. Students report lost items and submit claims; campus security staff log found items, manage inventory, and match claims. Built with [Next.js](https://nextjs.org) (App Router) and [Chakra UI v3](https://chakra-ui.com).

The REST API this app talks to lives in [`../backend`](../backend).

## Prerequisites

- Node.js 22+
- pnpm 11+ (`corepack enable`)
- The backend running locally (defaults to port 3001) — see [`../backend/README.md`](../backend)

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then adjust if your backend runs elsewhere
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable              | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (no trailing `/`). |

## Scripts

| Script              | What it does                         |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start the dev server                 |
| `pnpm build`        | Production build                     |
| `pnpm start`        | Serve the production build           |
| `pnpm lint`         | ESLint over the whole package        |
| `pnpm typecheck`    | TypeScript check (no emit)           |
| `pnpm test`         | Run the unit test suite (Vitest)     |
| `pnpm format`       | Prettier write                       |
| `pnpm format:check` | Prettier check (same as the CI gate) |

Husky + lint-staged run ESLint/Prettier on staged files at commit time. CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, and build on every PR.

## Project structure

```text
app/            Routes (App Router). Role areas: /student, /security, /admin
components/     Shared React components
components/ui/  Design-system primitives (provider, theme tokens, Button, …)
constants/      Static option lists (campuses, categories)
docs/           Feature and architecture notes
hooks/          Form and data hooks (one per page-level form)
lib/api/        API client: fetch wrapper, auth/refresh, typed endpoints
middleware.ts   Role-based route gating (reads the role cookie)
tests/          Unit tests (Vitest + jsdom), mirroring the source tree
types/          Shared TypeScript types for API payloads
utils/          Auth/session helpers, validation, debug logging
```

## How auth and roles work

See [docs/architecture.md](docs/architecture.md) for the full picture (login flow, token refresh, role cookie vs. backend authorization, API error conventions).
