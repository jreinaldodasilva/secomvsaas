# Secom Frontend — Architecture Overview
## Part 1: Executive Summary, Technology Stack & Project Structure

> **Document scope:** Static analysis of the frontend source tree at the time of writing.
> All findings are grounded in observable code and configuration.
> Speculative assumptions are explicitly marked.

---

## 1. Executive Summary

The Secom frontend is a **client-side rendered (CSR) single-page application** built on React 18 and Vite. It serves two distinct user populations through a single codebase:

- **Staff users** (super_admin, admin, assessor, social_media, atendente) — access a role-gated dashboard that exposes the seven Secom domain modules.
- **Citizens** — access a separate public-facing portal (`/portal/*`) with its own authentication context, layout, and route guards.

The application is architecturally layered: a custom HTTP client at the base, a thin service layer per domain, React Query hooks for server state, a single Zustand store for UI state, and React Context for auth and tenant identity. A generic `CrudPage` component abstracts the full list/create/edit/delete workflow, making all seven domain module pages structurally uniform.

The codebase is well-organized, TypeScript-strict, and ships with a meaningful test suite (unit + integration + E2E). The primary architectural risks are a custom i18n implementation with a non-reactive `t()` function, weak form validation (plain string comparisons, no schema library), and the absence of a dedicated error-reporting integration.

---

## 2. Technology Stack

### 2.1 Stack Inventory

| Technology | Category | Version | Purpose | Notes |
|---|---|---|---|---|
| React | UI Framework | 18.2.0 | Component rendering | CSR only; no SSR/RSC |
| TypeScript | Language | 5.7.3 | Type safety | `strict: true`, full coverage |
| Vite | Build tool | 5.4.11 | Dev server + production bundler | `@vitejs/plugin-react` (Babel transform) |
| React Router DOM | Routing | 6.30.1 | Client-side routing | `BrowserRouter`, flat + nested routes |
| TanStack Query (React Query) | Server state | 5.89.0 | Data fetching, caching, mutations | Global `QueryClient` with custom retry |
| Zustand | Client state | 4.5.7 | UI state (sidebar, toasts) | Two stores: `uiStore`, `toastStore` |
| framer-motion | Animation | 12.37.0 | `TopLoadingBar` transitions | Only used in one component |
| react-icons | Icon library | 5.6.0 | Icon rendering | Used in `Icon.tsx` wrapper |
| react-hot-toast | Notifications | 2.6.0 | — | **Installed but not used** — custom `toastStore` + `ToastContainer` is used instead |
| `@vsaas/types` | Shared types | file:packages/types | Domain types, RBAC constants | Local workspace package |
| Vitest | Unit testing | 2.0.0 | Frontend unit/component tests | jsdom environment |
| @testing-library/react | Test utilities | 16.3.0 | Component rendering in tests | |
| Cypress | E2E testing | 15.1.0 | Browser-level integration tests | 2 spec files present |
| ESLint | Linting | 9.39.4 | Code quality enforcement | Flat config (`eslint.config.js`) |
| Prettier | Formatting | 3.6.2 | Code style | `printWidth: 100`, single quotes |
| Husky | Git hooks | 9.1.7 | Pre-commit: type-check + lint | |
| lint-staged | Staged file runner | 16.2.3 | Runs prettier + eslint on staged files | |
| GitHub Actions | CI | — | Type-check, lint, test, build, E2E | Single `ci.yml` workflow |
| Docker Compose | Infrastructure | — | MongoDB, Redis, MailHog for local dev | |
| concurrently | Dev tooling | 9.2.0 | Runs frontend + backend + worker together | |

### 2.2 TypeScript Configuration

Key `tsconfig.json` settings:

| Setting | Value | Implication |
|---|---|---|
| `strict` | `true` | Full strict mode: `strictNullChecks`, `noImplicitAny`, etc. |
| `noUnusedLocals` | `true` | Dead code caught at compile time |
| `noUnusedParameters` | `true` | Unused function parameters are errors |
| `noFallthroughCasesInSwitch` | `true` | Switch safety |
| `moduleResolution` | `bundler` | Vite-native resolution; no `.js` extension required |
| `isolatedModules` | `true` | Each file transpilable independently (required for Vite) |
| `noEmit` | `true` | TypeScript is type-check only; Vite handles emit |
| `paths` | `@/*` → `./src/*`, `@vsaas/types` → `./packages/types/src` | Path aliases enforced in both TS and Vite |

Test files are excluded from the main `tsconfig.json` (`exclude` array), which means test code is not type-checked by the default `tsc --noEmit` invocation. This is a deliberate trade-off but means type errors in test files are only caught by Vitest's own runner.

### 2.3 React Features in Use

| Feature | Usage |
|---|---|
| Hooks | Extensively: `useState`, `useEffect`, `useCallback`, `useRef`, `useMemo`, `useContext` |
| Context API | `AuthContext`, `CitizenAuthContext`, `TenantContext` |
| Lazy loading | All page-level components via `React.lazy()` + `Suspense` |
| Error Boundaries | Class-based `ErrorBoundary`; placed at app root and inside each layout's `<main>` |
| `React.memo` | Applied to `FormField`, `Modal`, `Breadcrumbs` |
| `createPortal` | Used in `Modal` to render outside the DOM tree |
| `StrictMode` | Enabled in `index.tsx` |
| Suspense | Wraps every lazy route with `<LoadingScreen />` fallback |

### 2.4 Stack Maturity Assessment

The stack is modern and cohesive. All major dependencies are current (React 18, TanStack Query v5, Vite 5, TypeScript 5.7). The one notable anomaly is `react-hot-toast` being listed as a production dependency but never imported — it should be removed to avoid bundle bloat and dependency confusion.

---

## 3. Project Structure & Code Organization

### 3.1 Top-Level Source Tree

```
src/
├── App.tsx                  # Root component; wires providers, global UI, routes
├── index.tsx                # ReactDOM.createRoot entry point
├── components/              # Reusable UI and cross-cutting components
│   ├── Auth/                # Route guards, PermissionGate, LoginForm
│   ├── ContactForm/         # Landing page contact form
│   ├── DashboardMockup/     # Landing page visual mockup
│   ├── ErrorBoundary/       # Class-based error boundary
│   ├── Landing/             # Landing page section components
│   ├── Layout/              # Public site header and footer
│   ├── LGPD/                # Cookie consent banner
│   └── UI/                  # Design system primitives
├── config/                  # env.ts (validated ENV object), queryClient.ts
├── contexts/                # AuthContext, CitizenAuthContext, TenantContext
├── hooks/                   # Custom hooks (domain + utility)
├── i18n/                    # Custom i18n: Zustand store + locale JSON files
├── layouts/                 # Four layout shells (Auth, Public, Dashboard, CitizenPortal)
├── pages/                   # Page components organized by feature
├── providers/               # AppProviders composition, QueryProvider
├── routes/                  # Single routes/index.tsx with all route definitions
├── services/                # HTTP client, interceptors, per-domain API services
├── store/                   # Zustand stores (uiStore)
├── styles/                  # global.css + design tokens (CSS custom properties)
├── tests/                   # Vitest global setup
├── types/                   # (empty — types live in packages/types)
└── validation/              # Per-domain form validation functions
```

### 3.2 Directory-by-Directory Analysis

#### `src/components/UI/` — Design System Primitives

| Component | LOC | Responsibility |
|---|---|---|
| `CrudPage` | 206 | Generic list/create/edit/delete page shell |
| `DataTable` | 196 | Paginated, sortable, searchable table |
| `Modal` | 103 | Accessible modal with focus trap and portal |
| `Input` | 147 | Controlled input with password strength indicator |
| `FormField` | ~40 | Label + error + help text wrapper |
| `Button` | ~60 | Variant/size/loading-state button |
| `StatusBadge` | ~30 | Color-mapped status pill |
| `Skeleton` | ~40 | Shimmer loading placeholder |
| `Toast` / `ToastContainer` / `toastStore` | ~80 | Notification system (Zustand-backed) |
| `Breadcrumbs` | ~70 | Auto-generated from pathname + i18n keys |
| `TopLoadingBar` | ~50 | framer-motion bar tied to React Query `useIsFetching` |
| `ConnectionBanner` | ~20 | API health check banner |
| `SessionTimeoutModal` | ~30 | Inactivity warning dialog |
| `ConfirmDialog` | ~30 | Generic delete confirmation |
| `EmptyState` | ~30 | Empty list placeholder |
| `Icon` | ~30 | SVG icon wrapper (react-icons) |
| `Card` | ~20 | Surface container |

**Organization:** One directory per component, each containing the `.tsx` file, a `.module.css` file, and a `.test.tsx` file. This is consistent and well-maintained.

**Observation:** `CrudPage` (206 LOC) is the largest component and carries significant responsibility: modal state, form state, validation dispatch, mutation callbacks, and delete confirmation. It is a deliberate abstraction, not an accidental god file — its complexity is bounded by its generic type parameters.

#### `src/pages/` — Page Components

| Directory | Files | Pattern |
|---|---|---|
| `Domain/PressReleases/` | `PressReleasesPage.tsx`, `PressReleaseForm.tsx`, `PressReleasesPage.test.tsx` | CrudPage + Form + Test |
| `Domain/MediaContacts/` | Same pattern | CrudPage + Form + Test |
| `Domain/Clippings/` | Same pattern | CrudPage + Form + Test |
| `Domain/Events/` | Same pattern | CrudPage + Form + Test |
| `Domain/Appointments/` | Same pattern | CrudPage + Form + Test |
| `Domain/CitizenPortal/` | Same pattern | CrudPage + Form + Test |
| `Domain/SocialMedia/` | Same pattern | CrudPage + Form + Test |
| `Admin/Dashboard/` | `DashboardPage.tsx` (176 LOC) | Custom page, no CrudPage |
| `Admin/Users/` | `UsersPage.tsx` (175 LOC) | Custom page, no CrudPage |
| `CitizenPortal/` | 5 files | Citizen-facing pages (separate from Domain/CitizenPortal) |
| `Auth/` (Login, Register, etc.) | ~6 directories | Auth flow pages |
| `Error/` | `NotFoundPage`, `UnauthorizedPage` | Error pages |
| `Landing/`, `Legal/`, `Settings/` | 1–2 files each | Misc pages |

**Naming convention:** PascalCase for files and directories. Page components are named `<Feature>Page`. Form components are named `<Feature>Form`. Tests co-located with the component they test.

**Secom module organization:** All seven domain modules live under `src/pages/Domain/`, each in its own subdirectory. This is a clean feature-based organization. There is no cross-module coupling at the page level.

**Citizen portal duality:** There are two citizen portal directories:
- `src/pages/Domain/CitizenPortal/` — the **staff-facing** admin view of citizen records (accessed by `atendente` role via the dashboard).
- `src/pages/CitizenPortal/` — the **citizen-facing** public portal pages (login, register, dashboard, profile).

This naming is a potential source of confusion for new developers. The distinction is enforced by routing (different layout shells and route guards) but is not obvious from directory names alone.

#### `src/hooks/` — Custom Hooks

| Hook | Responsibility |
|---|---|
| `useApi.ts` | `useApiQuery` and `useApiMutation` — thin wrappers over TanStack Query |
| `usePressRelease.ts` | CRUD hooks for press releases |
| `useMediaContact.ts` | CRUD hooks for media contacts |
| `useClipping.ts` | CRUD hooks for clippings |
| `useEvent.ts` | CRUD hooks for events |
| `useAppointment.ts` | CRUD hooks for appointments |
| `useCitizenPortal.ts` | CRUD hooks for citizen portal records |
| `useSocialMedia.ts` | CRUD hooks for social media posts |
| `useDashboard.ts` | Dashboard summary query |
| `useAuth.ts` | Re-exported from `AuthContext` |
| `useSessionTimeout.ts` | Inactivity timer with warning callback |
| `useHealthCheck.ts` | Polling API health endpoint every 30s |
| `useDebounce.ts` | Generic debounce hook |
| `usePageTitle.ts` | Sets `document.title` |
| `useToast.ts` | Thin wrapper over `useToastStore` |

All domain hooks follow an identical pattern: `useXxxList`, `useXxxDetail`, `useCreateXxx`, `useUpdateXxx`, `useDeleteXxx`. This uniformity is a significant maintainability strength.

#### `src/services/` — HTTP and API Layer

```
services/
├── http.ts              # Public facade: http.get/post/put/patch/delete
├── base/index.ts        # baseRequest (fetch wrapper), ApiError class, buildUrl
├── interceptors/index.ts # withRefreshInterceptor: CSRF token + 401 refresh logic
└── api/
    ├── authService.ts
    ├── citizenAuthService.ts
    ├── tenantService.ts
    ├── pressReleaseService.ts
    ├── mediaContactService.ts
    ├── clippingService.ts
    ├── eventService.ts
    ├── appointmentService.ts
    ├── citizenPortalService.ts
    └── socialMediaService.ts
```

The HTTP stack is custom-built on the native `fetch` API. There is no Axios dependency. The layering is clean: `baseRequest` handles URL construction and error normalization; `withRefreshInterceptor` handles CSRF token management and JWT refresh; `http` is the public API consumed by service files.

#### `src/validation/domain/` — Form Validation

One file per domain module, each exporting:
- A `FormState` interface
- An `emptyForm` constant
- A `validate(form, t)` function returning `Record<string, string>` errors
- Domain-specific constants (statuses, categories, platforms)

Validation logic is plain imperative code (string length checks, presence checks). There is no schema validation library (e.g., Zod, Yup).

#### `src/styles/` — Styling Strategy

The application uses a **hybrid CSS approach**:
- `src/styles/tokens/index.css` — a comprehensive set of CSS custom properties (design tokens) covering color, spacing, typography, shadows, z-index, transitions, and component dimensions.
- `src/styles/global.css` — global resets, utility classes (`.btn`, `.form-stack`, `.form-grid`, `.page-header`, `.spinner`, `.skeleton`), and responsive/accessibility rules.
- `*.module.css` — CSS Modules for component-scoped styles (33 module files).

There is no Tailwind CSS or CSS-in-JS library. The design token system is well-structured and aligned with the "eSecom" brand palette (Azul Petróleo primary, Verde Institucional secondary, Dourado accent).

### 3.3 Summary Statistics

| Metric | Value |
|---|---|
| Total `.ts`/`.tsx` source files | 173 |
| Test files (`.test.ts`/`.test.tsx`) | 41 |
| CSS Module files | 33 |
| Largest file (LOC) | `CrudPage.tsx` — 206 |
| Files > 150 LOC | 3 (`CrudPage`, `DataTable`, `Input`) |
| Files > 100 LOC | 12 |
| Domain module pages | 7 (all under `src/pages/Domain/`) |
| Layouts | 4 (`Auth`, `Public`, `Dashboard`, `CitizenPortal`) |
| Zustand stores | 2 (`uiStore`, `toastStore`) |
| React Contexts | 3 (`Auth`, `CitizenAuth`, `Tenant`) |

### 3.4 Architectural Observations

**Strengths:**
- Consistent file naming and co-location of tests with components.
- Clear separation between public site, staff dashboard, and citizen portal via layout shells.
- Domain modules are structurally uniform — onboarding a new module requires following an established pattern.
- No circular dependencies observed between layers.
- ESLint rule `no-restricted-imports` enforces `@/` path aliases over relative parent imports.

**Concerns:**
- 🟨 The naming collision between `src/pages/Domain/CitizenPortal/` (staff view) and `src/pages/CitizenPortal/` (citizen view) is a readability risk.
- 🟨 `src/types/` directory exists but is empty — all types live in `packages/types`. The empty directory is misleading.
- 🟩 `DashboardPage.tsx` (176 LOC) defines seven inline SVG icon components at the top of the file. These could be extracted to `src/components/UI/Icon/` to reduce file size and enable reuse.
