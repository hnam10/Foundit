# foundit-ui — Agent Instructions

Next.js (App Router) + TypeScript + Chakra UI **v3** frontend for the Foundit
lost-and-found app. Package manager is **pnpm**; run all commands from
`foundit-ui/`.

## Commands

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint .
pnpm test        # vitest run
pnpm build       # next build
```

CI runs all four — run them before pushing. lint-staged auto-formats
(prettier + eslint) on every commit, so don't hand-format.

## Design system — the rules that get broken most

- **Never hardcode hex colors.** Use the semantic tokens defined in
  `components/ui/provider.tsx`: `fg`, `fg.muted`, `fg.error`,
  `border.input`, `border.error`, `focusRing`. In style objects reference
  tokens as `{colors.focusRing}`.
- **Form fields must compose `components/ui/field-styles.ts`**
  (`fieldControlStyles`, `fieldLabelStyles`, `fieldHelperStyles`,
  `inlineFieldLabelStyles`). See `TextAreaInput.tsx` for the canonical
  pattern (element variables + `stacked` prop for label-above layout).
- This is **Chakra UI v3** — no v2 patterns (`extendTheme`,
  `ColorModeScript`, `colorScheme` prop, `@chakra-ui/icons`).
- Theme is light-only and forced light in the provider; don't add
  dark-mode styling yet.

## API and types

- All HTTP goes through `apiFetch` from `lib/api/client.ts` — never raw
  `fetch` to the backend. Pass `{ auth: false }` for public endpoints;
  authenticated requests and token refresh are handled inside the client.
- Endpoint wrappers live in `lib/api/*.ts`, grouped by resource.
- Shared response/entity types live in `types/*.ts`. Import them — never
  redeclare a type locally in an api or component file.

## Structure

- Routes are role-based: `app/student/*` and `app/security/*` (guarded by
  `middleware.ts` via the `foundit_role` cookie); public flows live at the
  top level (`app/login`, `app/report-found/[token]`, …). Build paths with
  the helpers in `utils/routes.ts`, not string literals.
- Shared UI in `components/` (PascalCase filenames, e.g.
  `ImageUploadGallery.tsx`); form state in `hooks/use*Form.ts`; option
  lists in `constants/` (`CATEGORIES`, campuses come from the API).
- Tests in `tests/`, mirroring the source tree
  (`tests/hooks/useLoginForm.test.ts` ↔ `hooks/useLoginForm.ts`), using
  vitest + @testing-library/react.

## Workflow

- Branches: `YourName/feature-name`. Commits: conventional style, e.g.
  `feat(ui): …`, `fix: …`, scoped to what changed.
- Keep PRs scoped to `foundit-ui/` unless the change genuinely needs
  backend edits.
