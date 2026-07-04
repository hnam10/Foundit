# Architecture notes

How the frontend handles auth, roles, API access and theming. For feature-specific notes see the other files in this folder.

## Auth flow

1. **Login** (`hooks/useLoginForm.ts`) POSTs to `/api/auth/login`. On success it stores `accessToken`, `refreshToken` and the `user` object in `localStorage` (via `utils/auth.ts`), sets a `foundit_role` cookie, then does a **full** navigation (`window.location.href`) so the middleware sees the cookie on the very next request.
2. **Authenticated requests** go through `apiFetch`/`authFetch` in `lib/api/client.ts`. `authFetch` attaches the bearer token; when the backend answers `401` with code `TOKEN_EXPIRED` it calls `/api/auth/refresh` (deduplicated — concurrent 401s share one refresh) and retries the original request once. If the refresh fails it clears the session and redirects to `/login`.
3. **Sign-out** (`utils/auth.ts#signOut`) clears tokens, the stored user and the role cookie, then hard-navigates to `/login`.

### Security trade-offs (known, accepted for now)

- **Tokens live in `localStorage`**, which any XSS can read. The robust alternative is httpOnly cookies set by the backend; that's a backend change tracked for later. Until then: never render unsanitized user input, and keep dependencies patched.
- **The `foundit_role` cookie is client-set and unsigned.** It exists only so `middleware.ts` can route users to the right area without a backend round-trip. It is _UX gating, not authorization_ — every API endpoint enforces the real role server-side from the JWT. Editing the cookie gets you an empty shell of the wrong dashboard, not data.

## Roles and routing

- `utils/routes.ts` is the single source of truth: `ROLES`, `UserRole`, `parseRole()` (narrows untrusted strings) and `ROLE_HOME` (role → dashboard path).
- `middleware.ts` gates `/student`, `/security`, `/admin` and `/profile` by the role cookie and redirects `/dashboard` to the role-specific home. `admin` may enter the student and security areas.
- `app/dashboard/page.tsx` repeats that redirect client-side purely as a fallback if the middleware matcher misses.

## API layer conventions

- `lib/api/client.ts` exports:
  - `API_BASE` — always import this; never read `process.env.NEXT_PUBLIC_API_URL` directly.
  - `apiFetch<T>(path, init)` — JSON request that resolves with the typed body or throws `ApiError`. Pass `auth: false` for public endpoints. Sets `Content-Type: application/json` for you.
  - `ApiError { status, code?, message }` — `status === 0` means the request never reached the server (missing `NEXT_PUBLIC_API_URL` or network failure) and `message` says which.
- Endpoint wrappers live in `lib/api/*.ts` (see `items.ts`) and stay one line thick: build the path/body, delegate to `apiFetch`.
- Hooks translate `ApiError.status` into user-facing copy (see `useClaimItemForm.ts#messageForStatus`); they never parse `Response` objects themselves.

## Design system

- **All color values are defined in one place: `components/ui/provider.tsx`**, as Chakra semantic tokens passed to `createSystem`. Components reference tokens (`color="fg"`, `borderColor="border.input"`), never raw hex — changing the palette is a one-file edit.

  <!-- Swatches are committed SVGs (assets/colors/<hex>.svg) because plain
       markdown/GitHub can't render a color from a hex code in .md files. -->

  | Token          | Preview                                       | Value     | Used for                                   |
  | -------------- | --------------------------------------------- | --------- | ------------------------------------------ |
  | `fg`           | ![#1a1a1a swatch](./assets/colors/1a1a1a.svg) | `#1a1a1a` | Default body/label text                    |
  | `fg.muted`     | ![#666666 swatch](./assets/colors/666666.svg) | `#666666` | Secondary text, hints, helper copy         |
  | `fg.error`     | ![#cd0000 swatch](./assets/colors/cd0000.svg) | `#cd0000` | Validation error text                      |
  | `border.input` | ![#D9D9D9 swatch](./assets/colors/D9D9D9.svg) | `#D9D9D9` | Resting border on inputs/selects/textareas |
  | `border.error` | ![#cd0000 swatch](./assets/colors/cd0000.svg) | `#cd0000` | Border on invalid fields                   |
  | `focusRing`    | ![#009adb swatch](./assets/colors/009adb.svg) | `#009adb` | Focus outline on all form controls         |

  Everything else (e.g. `blue.500`, `gray.900`, `blackAlpha.700`) comes from Chakra's built-in palette via `defaultConfig`. In style objects, tokens are referenced with the `{colors.…}` syntax, e.g. `boxShadow: '0 0 0 2px {colors.focusRing}'` in `field-styles.ts`.

- Shared field styling (label / helper / control) lives in `components/ui/field-styles.ts` and is spread by `TextInput`, `FormTextInput`, `SelectInput` and `TextAreaInput`.
- The palette is light-only, so the provider forces light mode; remove `forcedTheme` once tokens carry dark values.

## Testing

- Unit tests live in `tests/`, mirroring the source tree (`tests/utils/auth.test.ts` covers `utils/auth.ts`), and run with Vitest + jsdom: `pnpm test` (CI runs it on every PR).
- Highest-value suites: `tests/utils/auth.test.ts` (redirect sanitizing, session parsing), `tests/lib/api/client.test.ts` (refresh-and-retry flow, `ApiError` mapping) and the form-hook tests (validation + status→copy mapping with `apiFetch` mocked).
- Debug logging (`utils/debug.ts`) is dev-only; log value shapes/lengths, never tokens or raw user input.
