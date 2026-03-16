# Secom Frontend Architecture Overview — Part 1

**Scope:** Technology Stack · Project Structure · Dependency Analysis  
**Codebase:** `secomvsaas/` (frontend root)  
**Analysis date:** July 2025  
**Part:** 1 of 2 — see [Part 2](./01-Secom-Frontend-Architecture-Overview-Part2.md) for Bootstrap, Build, Architecture & Recommendations

---

## 1. Executive Summary

The Secom frontend is a **client-side React 18 single-page application** built on the vSaaS boilerplate. It serves a multi-tenant government communications platform with seven domain modules (press releases, media contacts, clippings, events, appointments, citizen portal, social media) and a role-based access control system with six roles.

The stack is modern and cohesive: Vite 5 + TypeScript 5.7 + React 18 + TanStack Query v5 + Zustand v4 + React Router v6. The codebase is small (~4,000 LOC across 87 source files), well-organized, and shows consistent patterns throughout. A custom i18n system supports pt-BR and English. Styling is done entirely with plain CSS custom properties — no CSS framework is used.

**Key strengths:**
- Consistent layered architecture (services → hooks → pages)
- All routes are lazy-loaded with Suspense
- Solid unit test coverage for core infrastructure (auth, http, UI primitives)
- Shared type package (`@vsaas/types`) eliminates frontend/backend type drift
- RBAC enforced at both route and UI levels
- Token refresh with deduplication built into the HTTP layer

**Key risks and concerns:**
- 🟧 Domain page components mix UI, form state, validation, and data-fetching in a single file — no separation of concerns within pages
- 🟧 `ThemeToggle` creates a second, independent Zustand store for theme, duplicating state already in `uiStore`
- 🟧 The i18n `t()` function is not a React hook — it reads Zustand state imperatively, which can cause stale renders in some call sites
- 🟨 `@stripe/react-stripe-js` and `@stripe/stripe-js` are declared as production dependencies but no Stripe integration is observable in the source code
- 🟨 `framer-motion` is declared as a production dependency but is not used anywhere in the source
- 🟨 `react-hook-form` is declared as a production dependency but all forms use plain controlled `useState` — the library is unused
- 🟨 Empty placeholder directories (`common/`, `Navigation/`, `Notifications/`, `Form/`, `Toast/`, `base/`, `interceptors/`, `types/`, `utils/`) indicate planned but unimplemented structure
- 🟩 No environment variable validation at startup — missing values fail silently at runtime

---

## 2. Technology Stack

### 2.1 Stack Table

| Technology | Category | Version | Purpose | Notes |
|---|---|---|---|---|
| React | Core framework | 18.2.0 | UI rendering | CSR only; no SSR/SSG |
| TypeScript | Language | 5.7.3 | Static typing | `strict: true`, full coverage |
| Vite | Build tool | 5.4.11 | Dev server + bundler | `@vitejs/plugin-react` (Babel) |
| React Router DOM | Routing | 6.30.1 | Client-side routing | Config-based, nested layouts |
| TanStack Query | Server state | 5.89.0 | Data fetching + caching | Global `QueryClient` singleton |
| Zustand | Client state | 4.5.7 | UI state + i18n store | Two separate stores |
| react-hook-form | Forms | 7.65.0 | Form management | **Declared but unused** |
| zod | Validation | 3.22.4 | Schema validation | Used only in manual chunks config; no observable usage in source |
| react-hot-toast | Notifications | 2.6.0 | Toast notifications | Wrapped in `useToast` hook |
| react-icons | Icons | 4.12.0 | Icon set | Material Design icons (MD prefix) |
| framer-motion | Animation | 10.18.0 | Animations | **Declared but unused** |
| dompurify | Security | 3.2.2 | HTML sanitization | Declared; no observable usage in source |
| @stripe/react-stripe-js | Payments | 5.3.0 | Stripe UI components | **Declared but unused** |
| @stripe/stripe-js | Payments | 8.2.0 | Stripe SDK | **Declared but unused** |
| web-vitals | Observability | 3.5.0 | Core Web Vitals | Declared; no observable usage in source |
| @vsaas/types | Shared types | 1.0.0 (local) | Frontend/backend type contract | Local workspace package |
| Vitest | Testing | 2.0.0 | Unit/integration tests | jsdom environment |
| @testing-library/react | Testing | 16.3.0 | Component testing | With user-event v14 |
| Cypress | E2E testing | 15.1.0 | End-to-end tests | Auth flow only |
| ESLint | Linting | 8.57.1 | Code quality | `eslint-config-react-app` base |
| Prettier | Formatting | 3.6.2 | Code formatting | 100-char print width, single quotes |
| Husky | Git hooks | 9.1.7 | Pre-commit enforcement | Runs `type-check` + `lint` |
| lint-staged | Git hooks | 16.2.3 | Staged file processing | Format + lint on commit |
| concurrently | Dev tooling | 9.2.0 | Parallel process runner | `dev:all` script |
| @faker-js/faker | Testing | 8.4.1 | Test data generation | devDependency |

### 2.2 TypeScript Configuration

Key `tsconfig.json` settings:

| Setting | Value | Implication |
|---|---|---|
| `strict` | `true` | Full strict mode enabled |
| `noUnusedLocals` | `true` | Unused variables are errors |
| `noUnusedParameters` | `true` | Unused parameters are errors |
| `noFallthroughCasesInSwitch` | `true` | Switch safety enforced |
| `moduleResolution` | `bundler` | Vite-native resolution |
| `isolatedModules` | `true` | Compatible with Vite's transpile-only mode |
| `noEmit` | `true` | TypeScript is type-check only; Vite handles emit |
| `target` | `ES2020` | Modern JS output |
| `jsx` | `react-jsx` | No explicit React import needed |
| Path aliases | `@/*` → `src/*`, `@vsaas/types` → `packages/types/src` | Consistent across TS and Vite |
| Test files | Excluded from main `tsconfig.json` | Tests use Vitest's own type resolution |

### 2.3 Stack Maturity Assessment

The stack is current and well-chosen for a government SaaS application. All major dependencies are at recent stable versions. The combination of Vite 5 + React 18 + TanStack Query v5 + Zustand v4 represents a mature, production-proven frontend stack as of 2025.

The main cohesion concern is the presence of **four unused production dependencies** (framer-motion, react-hook-form, @stripe/*, dompurify, web-vitals) that inflate the declared dependency surface without contributing to the application. These should be audited and removed or activated.

---

## 3. Project Structure & Organization

### 3.1 Directory Tree (src/)

```
src/
├── index.tsx              # Entry point — ReactDOM.createRoot
├── App.tsx                # Root component — provider composition
├── routes/
│   └── index.tsx          # Centralized route config (all lazy)
├── components/
│   ├── Auth/              # Auth-specific components (LoginForm, ProtectedRoute, PermissionGate)
│   ├── common/            # [empty — placeholder]
│   ├── ErrorBoundary/     # Class-based error boundary
│   ├── Layout/            # Public layout primitives (MainHeader, Footer)
│   ├── LGPD/              # Cookie consent banner
│   ├── Navigation/        # [empty — placeholder]
│   ├── Notifications/     # [empty — placeholder]
│   └── UI/                # Reusable UI primitives (Button, Modal, DataTable, etc.)
├── config/
│   ├── permissions.ts     # RBAC role/permission matrix
│   └── queryClient.ts     # TanStack Query global config
├── contexts/
│   ├── AuthContext.tsx    # Auth state (user, login, logout, refresh)
│   └── TenantContext.tsx  # Tenant state (tenant data, hasFeature)
├── hooks/
│   ├── useApi.ts          # Generic useApiQuery / useApiMutation wrappers
│   ├── usePressRelease.ts # Domain hooks (one file per module)
│   ├── useAppointment.ts
│   ├── useClipping.ts
│   ├── useEvent.ts
│   ├── useMediaContact.ts
│   ├── useSocialMedia.ts
│   ├── useCitizenPortal.ts
│   ├── useDashboard.ts
│   ├── useHealthCheck.ts
│   ├── usePageTitle.ts
│   └── useToast.ts
├── i18n/
│   ├── index.ts           # Zustand-based i18n store + t() function
│   └── locales/
│       ├── pt-BR.json     # Primary locale (complete)
│       └── en.json        # Secondary locale (complete)
├── layouts/
│   ├── AuthLayout/        # Centered card layout for auth pages
│   ├── DashboardLayout/   # Sidebar + main content layout
│   └── PublicLayout/      # Header + footer layout for public pages
├── pages/
│   ├── Admin/             # Dashboard, Users
│   ├── Domain/            # 7 domain CRUD pages
│   ├── Error/             # 404, 403
│   ├── Landing/           # Public landing page
│   ├── Legal/             # Privacy, Terms
│   ├── Login/             # Login page
│   ├── Register/          # Registration page
│   ├── AcceptInvite/      # Invite acceptance
│   ├── ForgotPassword/    # Password recovery
│   ├── ResetPassword/     # Password reset
│   └── Settings/          # User profile
├── providers/
│   └── QueryProvider.tsx  # Thin wrapper around QueryClientProvider
├── services/
│   ├── http.ts            # Fetch-based HTTP client with token refresh
│   ├── api/               # Per-domain service objects (authService, pressReleaseService, etc.)
│   ├── base/              # [empty — placeholder]
│   └── interceptors/      # [empty — placeholder]
├── store/
│   ├── uiStore.ts         # Zustand store: sidebar state + theme
│   └── index.ts           # Re-export
├── styles/
│   ├── global.css         # All component styles (610 LOC)
│   └── tokens/index.css   # CSS custom properties (design tokens, 81 LOC)
├── tests/
│   └── setup.ts           # Vitest global setup
├── types/                 # [empty — placeholder]
└── utils/                 # [empty — placeholder]
```

### 3.2 Directory-by-Directory Analysis

**`src/components/`**

The component tree is split into four meaningful sub-groups:
- `Auth/` — authentication-specific components with direct `useAuth` coupling
- `ErrorBoundary/` — single class component, correctly isolated
- `Layout/` — public layout primitives (header, footer) with no business logic
- `LGPD/` — LGPD/cookie consent, self-contained
- `UI/` — reusable primitives (Button, Modal, DataTable, StatusBadge, etc.) exported via a barrel `index.ts`

The `common/`, `Navigation/`, and `Notifications/` directories are empty placeholders. `UI/CrudPage/`, `UI/Form/`, and `UI/Toast/` are also empty. These represent planned but unimplemented abstractions.

**`src/hooks/`**

All domain data-fetching hooks follow an identical pattern: they wrap `useApiQuery` / `useApiMutation` from `useApi.ts` with domain-specific query keys and endpoint paths. This is consistent and predictable. The hooks are thin — they contain no business logic, only query/mutation wiring.

**`src/services/`**

Two layers:
1. `http.ts` — a custom `fetch` wrapper with automatic token refresh, error normalization, and query string serialization
2. `api/*.ts` — per-domain service objects that call `http.*` methods with typed responses

The `base/` and `interceptors/` directories are empty placeholders, suggesting a planned but not yet implemented interceptor pattern.

**`src/pages/`**

Pages are organized by concern: `Admin/`, `Domain/`, `Error/`, auth pages at root level. All domain pages follow the same structure: list view with `DataTable`, create/edit `Modal`, `ConfirmDialog` for deletion. This is consistent but results in significant code duplication across the seven domain pages (each is ~115–165 LOC with near-identical structure).

**`src/store/`**

Only one active Zustand store (`uiStore`) managing sidebar open/close and theme. The i18n store lives in `src/i18n/index.ts` rather than `src/store/`, which is a minor organizational inconsistency. Additionally, `ThemeToggle.tsx` creates its own independent Zustand store (`useThemeStore`) with a different localStorage key (`secom_theme`) than `uiStore` (`theme`), creating a **duplicate theme state** problem.

**`src/styles/`**

All styles are in two files: `global.css` (610 LOC) and `tokens/index.css` (81 LOC). The design token system uses CSS custom properties with a `[data-theme="dark"]` selector for dark mode. There are no CSS Modules, no Tailwind, and no styled-components — all styling is global class-based CSS. This is simple but will not scale well as the application grows.

### 3.3 Summary Statistics

| Metric | Value |
|---|---|
| Total source files (`.ts`/`.tsx`) | 87 |
| Production source files (excl. tests) | 76 |
| Test files | 11 |
| Total lines of code (all TS/TSX) | ~4,024 |
| Average file size (production files) | ~87 LOC |
| Largest production file | `UsersPage.tsx` — 165 LOC |
| CSS total | 691 LOC (2 files) |
| Empty placeholder directories | 8 |
| i18n locales | 2 (pt-BR, en) |

No file exceeds 300 LOC. The largest files are domain page components (115–165 LOC), which are large relative to their peers but not pathological.

### 3.4 Architectural Observations

**Organization strategy:** The project uses a hybrid approach — **layer-based at the top level** (`hooks/`, `services/`, `store/`, `contexts/`) and **feature-based within pages** (`pages/Domain/PressReleases/`). This is a pragmatic choice for a codebase of this size.

**Cross-feature coupling:** Low. Domain modules are independent — each has its own hook file, service file, and page. The only shared dependencies are `useApi.ts`, `http.ts`, and the UI component library.

**Scalability concern:** The current structure works well at this scale. As the number of domain modules grows, the flat `hooks/` directory (one file per domain) and the `services/api/` directory will remain manageable. The main scalability risk is the monolithic `global.css` — adding more modules will continue to grow this file without a natural organizational boundary.

---

## 4. Dependency Analysis

### 4.1 Production Dependencies Audit

| Package | Version | Purpose | Status | Risk |
|---|---|---|---|---|
| react | 18.2.0 | Core framework | Current | None |
| react-dom | 18.2.0 | DOM renderer | Current | None |
| react-router-dom | 6.30.1 | Routing | Current | None |
| @tanstack/react-query | 5.89.0 | Server state | Current | None |
| @tanstack/react-query-devtools | 5.89.0 | Dev tools | Current | Should be devDependency |
| zustand | 4.5.7 | Client state | Current | None |
| react-hot-toast | 2.6.0 | Notifications | Current | None |
| react-icons | 4.12.0 | Icons | Current (v4; v5 exists) | Low — v5 has tree-shaking improvements |
| @hookform/resolvers | 5.2.2 | Form validation resolvers | Unused | 🟨 react-hook-form not used |
| react-hook-form | 7.65.0 | Form management | **Unused** | 🟨 Dead dependency |
| framer-motion | 10.18.0 | Animations | **Unused** | 🟨 Dead dependency (~140KB gzipped) |
| @stripe/react-stripe-js | 5.3.0 | Stripe UI | **Unused** | 🟨 Dead dependency |
| @stripe/stripe-js | 8.2.0 | Stripe SDK | **Unused** | 🟨 Dead dependency |
| dompurify | 3.2.2 | HTML sanitization | Declared; not used in source | 🟨 Verify usage or remove |
| web-vitals | 3.5.0 | Performance metrics | Declared; not used in source | 🟨 Verify usage or remove |
| zod | 3.22.4 | Schema validation | Referenced in Vite chunk config; no usage in source | 🟨 Verify usage or remove |
| @vsaas/types | 1.0.0 (local) | Shared types | Active | None |

### 4.2 DevDependency Audit

| Package | Version | Purpose | Status |
|---|---|---|---|
| vite | 5.4.11 | Build tool | Current |
| @vitejs/plugin-react | 4.3.4 | React plugin | Current |
| typescript | 5.7.3 | Type checker | Current |
| vitest | 2.0.0 | Test runner | Current |
| @vitest/coverage-v8 | 2.0.0 | Coverage | Current |
| @testing-library/react | 16.3.0 | Component testing | Current |
| @testing-library/user-event | 14.6.1 | User interaction simulation | Current |
| @testing-library/jest-dom | 6.8.0 | DOM matchers | Current |
| cypress | 15.1.0 | E2E testing | Current |
| jsdom | 25.0.0 | DOM environment for Vitest | Current |
| eslint | 8.57.1 | Linting | ESLint v8 (v9 is current) | Low risk |
| eslint-config-react-app | 7.0.1 | ESLint config | Tied to CRA; outdated | 🟨 CRA-derived config in a Vite project |
| husky | 9.1.7 | Git hooks | Current | None |
| lint-staged | 16.2.3 | Staged linting | Current | None |
| prettier | 3.6.2 | Formatting | Current | None |
| concurrently | 9.2.0 | Process runner | Current | None |
| @faker-js/faker | 8.4.1 | Test data | Current | None |
| @types/node | 24.6.0 | Node types | Current | None |
| @types/react | 18.2.39 | React types | Current | None |
| @types/react-dom | 18.2.17 | React DOM types | Current | None |
| @types/dompurify | 3.2.0 | DOMPurify types | Current | Paired with unused dompurify |

### 4.3 Identified Issues

**🟧 High — Unused production dependencies with bundle impact**

`framer-motion` (~140KB gzipped), `@stripe/react-stripe-js`, and `@stripe/stripe-js` are declared as production dependencies but have no observable usage in the source code. They will be included in the bundle if imported transitively or if tree-shaking fails. Even if tree-shaken, they inflate `package.json` and create a misleading dependency surface.

**🟨 Medium — `@tanstack/react-query-devtools` in production dependencies**

The devtools package is listed under `dependencies` rather than `devDependencies`. While TanStack Query devtools are typically only rendered in development mode, the package should be in `devDependencies` to signal intent and avoid accidental production inclusion.

**🟨 Medium — `eslint-config-react-app` in a Vite project**

`eslint-config-react-app` is a Create React App artifact. It pulls in CRA-specific rules and peer dependencies that are not aligned with a Vite project. The ESLint configuration should be migrated to a Vite/React-appropriate config (e.g., `eslint-plugin-react`, `eslint-plugin-react-hooks`, `@typescript-eslint/eslint-plugin`).

**🟨 Medium — `react-hook-form` and `@hookform/resolvers` declared but unused**

All forms in the codebase use plain controlled `useState`. The `react-hook-form` library and its resolver companion are dead weight. If forms are intended to be migrated to `react-hook-form` + `zod`, that migration has not started.

**🟨 Medium — `zod` referenced in Vite chunk config but not used in source**

`zod` appears in `vite.config.ts` as a manual chunk entry (`forms: ['zod']`), but no `zod` schema is observable in the source code. This creates a chunk that may be empty or near-empty.

**🟩 Low — `react-icons` at v4 (v5 available)**

React Icons v5 introduced improved tree-shaking. The upgrade is non-breaking for most usage patterns.

### 4.4 Bundle Impact Assessment

Based on declared dependencies, the estimated significant bundle contributors are:

| Package | Approx. gzipped size | Status |
|---|---|---|
| react + react-dom | ~45KB | Active |
| react-router-dom | ~25KB | Active |
| @tanstack/react-query | ~35KB | Active |
| zustand | ~3KB | Active |
| framer-motion | ~140KB | **Unused — should be removed** |
| @stripe/stripe-js | ~50KB | **Unused — should be removed** |
| react-hook-form | ~25KB | **Unused — should be removed** |
| react-icons (used icons only) | ~5KB (tree-shaken) | Active |

The three unused heavy dependencies (framer-motion, Stripe, react-hook-form) represent a potential ~215KB of unnecessary bundle weight if not properly tree-shaken.
