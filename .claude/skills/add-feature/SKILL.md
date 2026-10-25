---
name: add-feature
description: Add a new customizer feature end to end (model, API, runtime script, admin page, tests). Use when the user asks for a new feature or a new type of customization.
---

Follow the existing feature closest to the request (e.g. `routes/banners` or `routes/hero-banners`) as the template. Read it first.

1. **Model**: `backend/src/models/<feature>.ts`, with `companyId` and optional `groupId`.
2. **Router**: `backend/src/routes/<feature>/routes.ts` (Zod validation) and `services.ts` (DB logic). Mount in `routes/index.ts` (check `routeTable.ts` too). Every query filters by `req.companyId` via `utils/scope.ts`.
3. **Portal output** (only if it shows in the GHL portal): resolve it in `backend/src/runtime/resolve.ts`, register it in `runtime/scripts.ts`, and add a plain-JS module in `backend/runtime-scripts/`.
4. **Admin page**: `frontend/src/`, Ant Design, with a live preview like the other editors.
5. **Tests**: extend the pattern in `backend/tests/api.test.ts`, including a tenant-isolation case.
6. **Verify**: `npm run typecheck && npm run lint && npm test` in backend; `npm run typecheck && npm run lint` in frontend; `node scripts/check-icon-sync.mjs` if icons changed.

Propose the plan before writing code if the feature touches more than one layer. Report what passed and what you could not verify.
