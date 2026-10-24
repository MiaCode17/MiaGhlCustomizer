# Customizer

White-label customizer for GoHighLevel (GHL) agencies. Admin app configures branding/UI; an embed script
applies it inside each agency's GHL portal. See README.md for the architecture diagram and env vars.

## Layout
- `frontend/` - React 18, Vite, Ant Design, Tailwind. Admin editors with live previews.
- `backend/src/routes/<feature>/` - `routes.ts` (Zod-validated) + `services.ts` (DB logic). Mounted in `routes/index.ts`.
- `backend/src/models/` - Mongoose models, every document scoped by `companyId` (and optional `groupId`).
- `backend/src/runtime/` - resolves config for the public runtime API (`resolve.ts`) and builds the embed script.
- `backend/runtime-scripts/` - plain browser JS that runs inside the GHL portal (banners, tours, chat, ...).
- `scripts/check-icon-sync.mjs` - admin and runtime icon libraries must stay identical.

## Commands
- Backend (`cd backend`): `npm run dev`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`
- Frontend (`cd frontend`): `npm run dev`, `npm run typecheck`, `npm run lint`, `npm run build`
- Repo root: `node scripts/check-icon-sync.mjs`
- CI (`.github/workflows/ci.yml`) runs all of the above plus `npm audit`.

## Rules
- Every DB query must filter by `req.companyId` (see `backend/src/utils/scope.ts`). Tenant isolation is tested.
- `backend/runtime-scripts/` stays plain JS: no TypeScript, imports or build step. It runs in a third-party page, so avoid globals leaking and CSS collisions.
- If you touch icons, run the icon sync check.
- Never edit or commit `.env` files or `backend/uploads/`.
- New API behaviour needs tests following the pattern in `backend/tests/api.test.ts`.

## Adding a feature
Use the `add-feature` skill. Short form: model -> router (+ mount) -> `runtime/resolve.ts` -> runtime script -> admin page -> tests.

## Done means
Typecheck, lint and tests pass in each app you changed. Say so explicitly, and say what you could not verify.
