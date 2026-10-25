# Customizer

A white-label customizer for GoHighLevel (GHL) agencies. Agencies configure branding and UI changes
in an admin app; a small embed script applies them inside each agency's own GHL portal.

Features: themes (standard, seasonal, premium), logos, login-page builder, loader, menu editor,
button builder, floating buttons, launchpad tiles, banners and hero banners, support chat bubble
with inbox, guided tours, feedback, custom-field locks, and per-group overrides.

## How it works

```
Admin app (frontend, React)  --cookie auth-->  API (backend, Express + MongoDB)
                                                    |
                          public runtime API + /cdn embed script
                                                    |
                              GHL portal (script injected on agency's domain)
```

- **frontend/** - React 18, Vite, Ant Design, Tailwind. The admin editors, with live previews.
- **backend/** - Express, Mongoose, Zod.
  - `src/routes/<feature>/` - `routes.ts` (Zod-validated endpoints) and `services.ts` (DB logic).
  - `src/models/` - Mongoose models. Every document is scoped by `companyId` (and optional `groupId`).
  - `src/routes/runtime/` - public, cookie-less endpoints the embed script calls.
  - `runtime-scripts/` - plain-JS modules that run in the GHL portal (banners, tours, chat, ...).
- **scripts/** - repo checks, e.g. `check-icon-sync.mjs` keeps the admin and runtime icon libraries identical.

### Adding a feature

1. Model in `backend/src/models/`, router in `backend/src/routes/<feature>/`, mounted in `routes/index.ts`.
2. Always filter queries by `req.companyId` (see `utils/scope.ts`) - tenant isolation is tested.
3. If it shows in the portal: resolve it in `src/runtime/resolve.ts` and add a script in `runtime-scripts/`.
4. Admin page in `frontend/src/`.
5. Add API tests in `backend/tests/`.

## Getting started

Requires Node 20 (`.nvmrc`) and a MongoDB instance.

```bash
# backend
cd backend
cp .env.example .env     # then fill in values
npm ci
npm run dev              # http://localhost:8080

# frontend
cd frontend
npm ci
npm run dev              # http://localhost:5173
```

### Backend environment variables

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string |
| `JWT_SECRET` | yes | Signs session cookies (16+ chars) |
| `CORS_ORIGIN` | no | Comma-separated admin origins allowed to send the login cookie |
| `PUBLIC_BASE_URL` | no | Public origin baked into the embed script |
| `SECRETS_KEY` | no | Key for encrypting stored GHL tokens (falls back to `JWT_SECRET`) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | no | Seeds the first admin user |
| `PORT` | no | Defaults to 8080 |

## Quality checks

```bash
cd backend
npm run typecheck && npm run lint
npm test                 # Vitest + Supertest against an in-memory MongoDB
npm run test:coverage
```

The first test run downloads a MongoDB binary (cached afterwards). CI runs typecheck, lint, tests,
build and `npm audit` for both apps - see `.github/workflows/ci.yml`.

## Known follow-ups

- `zod` 3.x has an advisory fixed only in 4.x (breaking upgrade), so CI blocks on `critical` audit findings only for now.
- Test coverage is focused on auth, middleware and the banners API plus tenant isolation; extend the same
  pattern (`backend/tests/api.test.ts`) to the other routers, then add runtime-script and frontend tests.
