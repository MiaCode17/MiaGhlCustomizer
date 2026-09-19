# Building a "GHL-Style App Customizer" — Full Project Blueprint

> **Purpose of this document**: This is a from-scratch build spec for a white-label "Customizer" platform, modeled on a working production app (an agency dashboard that lets a SaaS agency re-skin an embedded third-party app for its own customers). It is written to be dropped into an **empty project folder** and handed to Claude Code as the seed context for a build. It describes the product concept, the full feature surface, the recommended tech stack (cleaned up from the original — see "Deviations from the reference app" callouts), the project structure, and the core architectural patterns that make it work.
>
> This is not a copy of proprietary code — no code from the reference app is reproduced here. It is a description of the *shape* of the system: what the features are, what data they need, and how the pieces fit together, so an equivalent system can be built independently.

---

## 1. Product concept

The product is a **multi-tenant white-labeling / customization console**. An "Agency" (the paying customer of this platform) embeds a third-party web app inside their own product (via iframe or injected script) and needs to re-skin it for their own end customers ("Locations" / sub-accounts) without touching the third-party app's code. The Customizer is the admin UI where the Agency configures all of that branding and UI-injection, and a small runtime script applies the saved configuration live inside the embedded app.

Two actors:
- **Agency admin** — uses the Customizer UI (the app we're building) to configure branding/behavior.
- **End customer's embedded session** — the actual GHL-like third-party app, which loads a small injector script that reads the Agency's saved config and mutates the live DOM/styles.

Two scopes every setting can be saved at:
- **Global** (applies to every one of the Agency's locations/sub-accounts)
- **Group / specific location** (overrides global for one location or a named group of locations)

This scoping concept (`groupId` present-or-empty on every config document) is the single most important cross-cutting pattern in the whole system — build it first, in a shared schema field and a shared "which scope am I editing" UI selector, and every feature tab reuses it.

---

## 2. The Customizer feature surface (what to build)

This is the full tab list from the reference app. Build them as a horizontal tab bar (or sidebar) inside an "Customizer" section of the Agency dashboard. Each tab is its own page/route, its own Mongo collection (or logical partition), and its own small REST resource (`GET /`, `POST /`, `PUT /update`).

### 2.1 Theme Builder
Lets the agency pick or design a color/style theme for the embedded app's chrome.
- A gallery of **preset "classic" themes** (curated color palettes — primary/secondary/accent/background/text/border colors + optional gradient pairs), each taggable/searchable.
- A gallery of **preset "premium" design-movement themes** (e.g. glassmorphism, neumorphism, cyberpunk, dark mode, brutalism, claymorphism, maximalism, liquid glass, skeuomorphism, vaporwave, art-deco) — same color fields plus texture/shadow/border-radius/card-style metadata, optionally gated by subscription tier.
- A **custom theme editor** with sub-tabs covering: Brand Colors, Global/shared surfaces, Sidebar & Nav, Dashboard, primary feature areas of the embedded app (e.g. Conversations/Calendar/Contacts/Payments equivalents), and Typography (heading/body font pickers, border-radius, shadow intensity).
- A **per-element color-rule table**: `{ name, CSS selector, CSS property, default value, current value }` — this is how granular overrides are represented and later replayed by the runtime injector.
- A **gradient editor** for header/sidebar/button backgrounds.
- Save target: global or a specific group; a gallery of the agency's own saved custom themes.

### 2.2 Special/Seasonal Theme
A separate, simpler "festive theme" feature: pick a holiday/seasonal theme from a curated list (name, emoji, gradient, accent color, particle-effect emoji set), toggle a popup (title/message/CTA button+URL), and toggle a page effect (e.g. falling-snow particles) with a duration.

### 2.3 Logo Customization
CRUD list of named "logo campaigns": name, uploaded image, target group/location, plan-based limit on how many campaigns can exist.

### 2.4 Login Page Builder
Lets the agency restyle the embedded app's own login screen:
- A set of **layout presets** (e.g. split-screen with image left/right, centered card, full-bleed background) each with default gradient/clip-path/image-width/color values.
- Logo upload, background image upload, live editable CSS-variable table, and a raw custom-CSS textarea for power users.

### 2.5 Button Builder ("Top nav buttons" + friends)
The richest tab — lets the agency inject custom UI elements into specific surfaces of the embedded app:
- **Header/top-nav buttons**: text, tooltip, icon (from an icon set), icon position/size, style, size, plan-based count limit.
- **Record-detail-page buttons** (e.g. injected onto a "contact" or "deal" detail view): same shape, different injection target.
- **Dashboard buttons**: buttons/cards injected onto the embedded app's dashboard/home screen.
- **Custom tabs on a pipeline/record view**: adds a whole new tab (with its own iframe'd content) to an existing record page.

### 2.6 Side / Bottom floating buttons
Floating action buttons (right-edge or bottom-edge), each optionally expandable into a small quick-action menu (up to N sub-items: label, target URL or in-app destination). Position, open-percentage/size, background/text color are configurable. Plan-tier caps the number of buttons a given agency can create. (Consider unifying "right-side" and "bottom" into one combined button-manager screen rather than two near-duplicate ones — the reference app grew these separately and later had to merge them; build the unified version first.)

### 2.7 Dynamic links / custom menu items
CRUD of custom navigation links: title, URL, icon, open-mode (same tab/new tab/modal), role targeting, and scope (all locations / a specific group / a specific location) — with a reserved-name guard list so custom links can't collide with the embedded app's own built-in menu items.

### 2.8 Menu / navigation editing
- **Rename or hide native menu items** in the embedded app's own sidebar (simple `{ originalLabel, newLabel? , hidden? }` list, company-wide).
- **Custom page navigation tree**: a drag-and-drop editor for a location-level nav tree (parent/child items) shown inside a custom page area.
- **Extended nav tool categories**: named categories of "tools" (each an iframe'd URL) injected at specific menu anchor points, plan-limited.
- **Settings-menu additions**: append custom entries (name + link) into the embedded app's own Settings sub-menu.

### 2.9 Custom Field Manager
A campaign-based wizard: name a campaign → pick a target location/group → pick which of the embedded app's custom fields to expose → save. Useful when the embedded app has more fields than should be shown to a given customer segment.

### 2.10 Supporting/secondary customization tabs
- **Banners**: name, type, position, enabled, content — injected banner at top of a page.
- **Chat bubble widget**: fully brandable floating chat launcher (title, subtitle, gradient, welcome/success/error copy, quick-action nav tabs).
- **Custom loader/spinner**: pick or upload a custom page-load animation.
- **Add-on integration banner**: enable flag + placement + "also show on other pages" flag, used to cross-promote another feature.
- **Tooltip**: enable + button text + placement for a global help tooltip.
- **Membership/paywall customization**: enable flag + per-sub-account allow-list, controlling which locations see a "membership required" gate.
- **Unread-badge toggle**: simple on/off for a conversation-unread-count badge in nav.

Don't feel obligated to build all of §2.10 in v1 — they're small, independent, and can be added incrementally once the pattern from §2.1–2.9 is established.

---

## 3. Core architectural patterns to replicate

These are the patterns that make the reference app's Customizer tractable across ~20 largely-independent features. Copy the *pattern*, not the code.

### 3.1 Group/tenant scoping on every document
Every config document carries:
```
{ company_id: ObjectId, groupId: string | "", ... feature-specific fields }
```
`groupId: ""` (or absent) = the agency-wide default. A non-empty `groupId` = an override for one location or a named group of locations. Every GET should accept an optional `groupId` query param and fall back to the empty-groupId document if no group-specific one exists. Every save UI should show a "Saving for: Global ▾" selector driven by the same shared component.

### 3.2 One route module per feature, same shape
Each feature (theme, logo, login-page, buttons, etc.) gets its own backend route module with two files:
- `routes.js` — declares a small table of `{ method, url, middlewares, handler }` entries and wires them onto an `express.Router()`, wrapping every handler in a shared `asyncHandler`/error-wrapper so no route needs its own try/catch.
- `services.js` — the actual handler logic (DB reads/writes), kept separate from route wiring.

A single `routes/index.js` requires every feature's `routes.js` and mounts it under a common prefix (`/api/v1/<feature-name>`). This keeps 20+ independent features from turning into one giant router file, and makes it trivial to add a new tab: new folder, two files, one line in the index.

Standard REST shape per feature: `GET /` (fetch, scoped by groupId), `POST /` (create), `PUT /update` (update), `DELETE /delete` (remove). Keep it boring and consistent — every feature should feel the same to a new contributor.

### 3.3 Frontend: one central API-service layer, not scattered fetches
Build a single typed service object (e.g. `useAppServices()` returning an `APIs` tree: `APIs.theme.get`, `APIs.theme.save`, `APIs.buttonBuilder.header.list`, …) backed by one shared axios instance. Unlike the reference app (which built its axios calls ad hoc per-call and attached auth tokens inconsistently), **do this properly here**:
- One `axios.create({ baseURL })` instance.
- A **request interceptor** that attaches the auth token (Bearer header) automatically from wherever the session is stored.
- A **response interceptor** that normalizes `{ data, error }` shape and handles 401 → logout redirect centrally.
- Feature-specific calls are thin wrappers around this instance, grouped by feature in one `services/` folder (one file per feature, exporting typed functions) rather than one giant object literal.

### 3.4 Frontend: route table + layout switch + guards
- One `react-router-dom` v6 route array (or nested `<Routes>`), each entry lazy-loaded (`React.lazy`) and tagged with which layout wraps it (e.g. `"default"` with sidebar/nav vs `"blank"` for auth pages).
- A small `RouteGuard`-style wrapper component that checks auth/plan-tier and redirects, applied per protected route rather than duplicated inside every page component.

### 3.5 State management: keep it simple
- **Local component state** for page-local UI (forms, modals, tab selection).
- **React Context** for a small number of genuinely global concerns: current user/session, current agency, current subscription plan (for feature-gating), and any UI theming for the *builder app itself*.
- Reach for a global store (Redux Toolkit / Zustand) only if you have cross-page domain state that many unrelated components need to read — don't default to it for everything. The reference app mixed Redux + Context + local state without a clear line between them; draw that line up front: **Context = session/identity/plan, local state = everything else**, and only add a store when a concrete case demands it.

### 3.6 The runtime injector (how config becomes visible in the embedded app)
This is the part that makes it a "customizer" and not just a settings CRUD app: a small vanilla-JS script, served from your backend at something like `GET /customizer-script/:companyId`, which the embedded app loads via a single `<script>` tag. That script:
1. Fetches the agency's saved config for this `companyId` (theme colors, logo, buttons, menu edits, popups, etc.) once on load.
2. Injects a `<style>` block built from the color-rule table (selector → property → value) and any gradient/font settings.
3. Swaps in the custom logo, injects header/dashboard/record-page buttons and floating side/bottom buttons as real DOM nodes, renders the chat bubble and any popups, and rewrites/hides native menu labels per the menu-edit config.
4. Since the third-party app is not yours, this script generally has to poll/observe the DOM (a `MutationObserver` is cleaner than the polling the reference app used) to catch client-side navigation and re-apply injections as the SPA re-renders.

Build this as its own small bundle, separate from the admin dashboard's build — it ships into someone else's page, so keep it dependency-free and tiny.

---

## 4. Recommended tech stack

The reference app accumulated a lot of redundant dependencies over time (three date libraries, four UI kits, both Redux and Context with no clear boundary, hardcoded secrets instead of env vars). Below is a **cleaned-up equivalent stack** — same proven shape, without the accumulated cruft. Deviations are called out explicitly.

### Runtime
- **Node.js 20.x LTS** (the reference app pins nothing explicitly, but its npm lockfile version implies Node ≥18; standardize on 20 LTS for a new project and commit an `.nvmrc` — the reference app has none, which is worth fixing).
- **npm** as the package manager (what the reference app uses throughout; fine to keep, or switch to `pnpm` for faster installs/stricter dependency resolution if you prefer — either is a reasonable choice for a new project).

### Frontend
| Concern | Choice | Note |
|---|---|---|
| Build tool | **Vite 5.x** | matches reference app's Vite 4; upgrade to current major |
| Language | **TypeScript 5.x, `strict: true`** | reference app ran TS 4.8/4.9 inconsistently pinned; use one current version |
| UI framework | **React 18** | |
| UI component library | **Pick exactly one** — Ant Design *or* MUI, not both | Reference app ran Ant Design + MUI + Mantine + Radix simultaneously. Ant Design is a good fit here since it has strong out-of-the-box components for exactly this kind of dense admin/settings UI (tabs, forms, tables, color pickers, uploads) |
| Utility styling | **Tailwind CSS 3.x** | fine alongside a component library for layout/spacing |
| Routing | **react-router-dom v6** | matches reference app |
| HTTP | **axios**, with interceptors (see §3.3) | |
| Forms/validation | **react-hook-form + zod** (or Formik + Yup, either is fine — pick one and use it everywhere) | |
| Global state | **React Context** for session/plan; **Zustand** (lighter than Redux Toolkit) only if/when cross-cutting domain state emerges | |
| Dates | **date-fns** only | reference app carried date-fns + dayjs + moment simultaneously — pick one |
| Charts (if needed later) | **recharts** | lightest of the four the reference app carried |
| Icons | **lucide-react** or the icon set bundled with your chosen UI library | |
| Session storage | **localStorage/IndexedDB via a small wrapper** (e.g. `idb-keyval`) or simply an httpOnly cookie session if you control both frontend and backend origin — prefer a cookie session over client-readable token storage where possible | |

### Backend
| Concern | Choice | Note |
|---|---|---|
| Framework | **Express 4.x** | matches reference app; Fastify is a reasonable alternative if starting fresh |
| Language | **TypeScript** | reference app is plain JS/CommonJS; recommend TS for a new project for type-shared DTOs with the frontend |
| Database | **MongoDB + Mongoose 8.x** | matches reference app's document-per-feature model, which fits this domain well (loosely-structured, per-feature config blobs) |
| Auth | **JWT (jsonwebtoken) + bcrypt**, via `httpOnly` cookies rather than client-stored tokens | reference app hand-rolled crypto helpers against a hardcoded signing key — use env-var secrets and a maintained JWT library idiomatically instead |
| File uploads | **multer**, streaming to S3-compatible object storage (AWS S3 or DigitalOcean Spaces) | matches reference app's asset-storage approach |
| Validation | **zod** (shared schema definitions with the frontend if both are TS) or **Joi** | |
| Real-time (if needed) | **socket.io** | only add once you have a concrete live-update need (e.g. "config changes reflect instantly without refresh") |
| Background jobs (if needed) | **BullMQ + Redis** | only add once you have actual async work (e.g. bulk-applying a theme across thousands of locations) — don't add job infra speculatively |
| Config/secrets | **dotenv + a validated env schema (zod) read once at boot**, no hardcoded fallback literals | biggest deviation from the reference app, which hardcoded API keys/OAuth secrets directly in a config file — always load real secrets from environment variables, never commit them |
| Logging | **pino** or **morgan** for HTTP access logs | |

### Third-party integration SDKs
Only add these when the corresponding feature actually needs them — the reference app accumulated ~15 integration SDKs (Stripe, Twilio, OpenAI, Anthropic, Xero, Chargebee, Mailgun, Mailchimp, Google APIs, AWS, Playwright, etc.) over its lifetime. Don't pre-install anything not driven by a current feature; add SDKs feature-by-feature.

---

## 5. Recommended project structure

Single frontend + single backend (unlike the reference app's sprawl of 6 separate frontend apps sharing one backend — start with one app; split later only if you actually need a second independently-deployed surface).

```
project-root/
├── .nvmrc
├── docker-compose.yml          # local Mongo + Redis for dev
├── frontend/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── router/
│       │   ├── routes.tsx          # route table, lazy-loaded pages, layout tags
│       │   └── RouteGuard.tsx
│       ├── layouts/
│       │   ├── DefaultLayout.tsx   # sidebar + top nav shell
│       │   └── BlankLayout.tsx     # auth pages
│       ├── context/
│       │   ├── SessionContext.tsx
│       │   ├── AgencyContext.tsx
│       │   └── PlanContext.tsx
│       ├── services/                # one file per feature, thin axios wrappers
│       │   ├── apiClient.ts          # the single axios instance + interceptors
│       │   ├── themeService.ts
│       │   ├── loginPageService.ts
│       │   ├── buttonBuilderService.ts
│       │   └── ...
│       ├── pages/
│       │   └── customizer/
│       │       ├── CustomizerLayout.tsx   # the tab bar
│       │       ├── theme-builder/
│       │       ├── special-theme/
│       │       ├── logo/
│       │       ├── login-page-builder/
│       │       ├── button-builder/
│       │       ├── side-buttons/
│       │       ├── dynamic-links/
│       │       ├── menu-editor/
│       │       └── custom-fields/
│       ├── components/              # shared/reusable UI atoms
│       ├── hooks/
│       └── types/                   # shared TS types/interfaces (mirror backend DTOs)
├── backend/
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── server.ts                 # express app assembly, middleware order
│       ├── index.ts                  # entry, connects DB then starts server
│       ├── config/
│       │   └── env.ts                # zod-validated env loader
│       ├── db/
│       │   └── connect.ts
│       ├── middleware/
│       │   ├── auth.ts                # JWT verify, attaches req.user/req.company
│       │   ├── errorHandler.ts
│       │   └── asyncHandler.ts
│       ├── models/                    # one Mongoose model per collection
│       │   ├── Theme.ts
│       │   ├── SpecialTheme.ts
│       │   ├── LogoCampaign.ts
│       │   ├── LoginPageConfig.ts
│       │   ├── HeaderButton.ts
│       │   ├── SidebarButton.ts
│       │   ├── DynamicLink.ts
│       │   ├── MenuEdit.ts
│       │   └── ...
│       ├── routes/
│       │   ├── index.ts               # mounts every feature router
│       │   ├── theme/
│       │   │   ├── routes.ts
│       │   │   └── services.ts
│       │   ├── login-page/
│       │   ├── button-builder/
│       │   ├── side-buttons/
│       │   ├── dynamic-links/
│       │   ├── menu-editor/
│       │   └── ...
│       └── injector/                  # the separate runtime script (see §3.6)
│           └── build.ts               # bundles injector.js independently, small/no deps
└── docs/
    └── CUSTOMIZER_CLONE_BLUEPRINT.md  # this file
```

---

## 6. Suggested data model sketch

Rough shape per feature — refine per-tab as you build:

```ts
// shared scoping shape, embedded/spread into every feature model
interface Scoped {
  companyId: ObjectId;
  groupId?: string;      // "" or absent = global default
}

interface Theme extends Scoped {
  themeName: string;
  colorRules: { name: string; selector: string; property: string; value: string }[];
  gradients: { target: 'header' | 'sidebar' | 'button'; from: string; to: string; angle: number }[];
  fonts: { heading: string; body: string };
  borderRadius: string;
  shadowIntensity: 'none' | 'sm' | 'md' | 'lg';
  enabled: boolean;
}

interface SpecialTheme extends Scoped {
  enabled: boolean;
  themeKey: string;           // e.g. 'christmas', 'halloween'
  popup?: { visible: boolean; title: string; message: string; ctaText?: string; ctaUrl?: string };
  particleEffect?: { enabled: boolean; durationSeconds: number };
}

interface LogoCampaign extends Scoped {
  name: string;
  logoUrl: string;
}

interface LoginPageConfig extends Scoped {
  preset: string;
  logoUrl?: string;
  backgroundImageUrl?: string;
  cssVariables: { name: string; value: string }[];
  customCss?: string;
}

interface InjectedButton extends Scoped {
  surface: 'header' | 'dashboard' | 'record-detail' | 'record-tab';
  label: string;
  tooltip?: string;
  icon?: string;
  style?: string;
  targetUrl?: string;
  order: number;
}

interface FloatingButton extends Scoped {
  position: 'right' | 'bottom';
  label: string;
  backgroundColor: string;
  textColor: string;
  subItems: { label: string; url: string }[];
}

interface DynamicLink extends Scoped {
  title: string;
  url: string;
  icon?: string;
  openMode: 'same-tab' | 'new-tab' | 'modal';
}

interface MenuEdit extends Scoped {
  renamed: { originalLabel: string; newLabel: string }[];
  hidden: string[];   // original labels to hide
}
```

---

## 7. Environment variables (define these properly from day one)

```
# backend/.env.example
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/customizer
JWT_SECRET=
JWT_EXPIRES_IN=7d
COOKIE_DOMAIN=localhost
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
CORS_ORIGIN=http://localhost:5173
REDIS_URL=                # only once background jobs are actually needed

# frontend/.env.example
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

Validate these at backend boot with a zod schema and fail fast if anything required is missing — don't silently fall back to hardcoded literals (this was the single biggest structural weakness found in the reference app).

---

## 8. Suggested build order

1. **Scaffold**: Vite+React+TS frontend, Express+TS backend, Mongo connection, one health-check route, auth (signup/login/JWT cookie), base layout shell (sidebar + top nav + blank auth layout), route guard.
2. **Scoping primitive**: build the `Scoped` pattern once — a shared `GroupSelector` component on the frontend and a shared `scopeQuery(companyId, groupId)` helper on the backend — before building any feature tab, since every tab depends on it.
3. **First vertical slice — Theme Builder**: full model → routes → service → frontend page → save/load round trip. This is the most complex tab; getting it right early validates the whole pattern for the rest.
4. **Repeat the pattern** for Login Page Builder, Logo Customization, Dynamic Links, Menu Editor (these are all simpler CRUD shapes once the pattern is proven).
5. **Button Builder** (header/dashboard/record-detail/record-tab) and **Floating Buttons** — these introduce the "surface + placement" concept, build after the simpler CRUD tabs.
6. **The runtime injector**: a small standalone script + one public endpoint (`GET /injector/:companyId`) that fetches all of the above by companyId and applies it to a test HTML page standing in for the "embedded app." Prove this against a static test page before worrying about a real third-party target.
7. **Special/seasonal theme, custom fields, and the §2.10 secondary tabs** — add incrementally, same pattern each time.
8. **Plan-tier gating**: once 2-3 real feature limits exist (e.g. logo campaign count, button count), add the `PlanContext` gating layer rather than building it speculatively up front.

---

## 9. What to deliberately do differently from the reference app

- Pick **one** UI component library, not four.
- Pick **one** date library, not three.
- Draw a hard line between Context (session/plan/identity) and any global store (everything else) — don't let both grow ad hoc.
- **Never hardcode secrets** in a config file; validate env vars at boot.
- Add an **ESLint + Prettier** config from day one (the reference app has Prettier but no ESLint at all).
- Pin **Node version** via `.nvmrc` and `engines` in `package.json`.
- Keep the runtime injector script's dependency footprint at zero/minimal — it ships into someone else's page.
- Merge "right-side buttons" and "bottom buttons" into one combined floating-button manager from the start, instead of building near-duplicates and merging later.
