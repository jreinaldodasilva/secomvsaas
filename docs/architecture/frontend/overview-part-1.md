# Secom Frontend — Architecture Overview
## Part 1: Technology Stack, Project Structure & Dependency Analysis

**Document version:** 1.2  
**Codebase snapshot:** post-commit `7972600`  
**Scope:** `src/` (frontend), `packages/types/`, `vite.config.ts`, `tsconfig.json`, `package.json`, CI pipeline  

---

## 1. Executive Summary

The Secom frontend is a **client-side rendered (CSR) React 18 single-page application** built with Vite 5. It serves two distinct user populations through a single deployment: internal staff (assessors, admins, social media managers, attendants) via a protected dashboard, and citizens via a public-facing portal at `/portal/*`. Both surfaces share the same build artifact, routing tree, and component library.

The architecture is **layered and type-safe**: TypeScript strict mode is enabled, a shared `@vsaas/types` package enforces API contract alignment with the backend, and TanStack Query v5 manages all server state. Client-side state is minimal and handled by a single Zustand store. The UI is built entirely from a custom in-house component library (`src/components/UI/`) styled with CSS Modules and a CSS custom-property design token system.

**Strengths:** clean separation between server state (TanStack Query) and client state (Zustand), consistent domain hook pattern, strong TypeScript coverage, well-structured CI pipeline, and a coherent design token system.

**Current state:** all architecture improvement roadmap items resolved (21 of 22; FE-P3-01 skipped by decision). Architecture maturity score: 83/100 — "Advanced" tier. The sole remaining gap is the `framer-motion` bundle (~100KB gzipped), retained by explicit decision.

---

## 2. Technology Stack

### 2.1 Stack Table

| Technology | Category | Version | Purpose | Notes |
|---|---|---|---|---|
| React | Core framework | 18.2.0 | UI rendering | CSR only; no SSR/RSC |
| TypeScript | Language | 5.7.3 | Type safety | Strict mode enabled |
| Vite | Build tool | 5.4.11 | Dev server + production build | `@vitejs/plugin-react` (Babel transform) |
| React Router DOM | Routing | 6.30.1 | Client-side routing | Config-based, nested routes, lazy loading |
| TanStack Query | Server state | 5.89.0 | Data fetching, caching, mutations | Global `QueryClient` with custom retry logic |
| Zustand | Client state | 4.5.7 | UI state (sidebar, theme) | Single store; minimal usage |
| framer-motion | Animation | 12.37.0 | Landing page animations + top loading bar | Used in 5 files; ~100KB gzipped — retained by decision (FE-P3-01) |
| react-hot-toast | Notifications | 2.6.0 | Toast notifications | Thin `useToast` wrapper |
| react-icons | Icons | 5.6.0 | Icon set (Material Design subset) | Wrapped in custom `Icon` component; upgraded from v4 (FE-P3-02) |
| `@vsaas/types` | Shared types | local | API contract types shared with backend | File-system workspace package |
| CSS Modules | Styling | — | Component-scoped styles | All layout/component CSS |
| CSS Custom Properties | Design tokens | — | Theming and design system | `src/styles/tokens/index.css` |
| Vitest | Unit testing | 2.0.0 | Component and hook tests | jsdom environment |
| @testing-library/react | Testing utilities | 16.3.0 | Component rendering in tests | |
| Cypress | E2E testing | 15.1.0 | End-to-end browser tests | 2 spec files in CI |
| ESLint | Linting | 9.39.4 | Static analysis | v9 flat config (`eslint.config.js`) — 0 errors (FE-P1-06) |
| @typescript-eslint | TS linting | 8.57.0 | TypeScript-aware lint rules | |
| Prettier | Formatting | 3.6.2 | Code formatting | `printWidth: 100`, single quotes |
| Husky + lint-staged | Git hooks | 9.1.7 / 16.2.3 | Pre-commit lint + format | |
| GitHub Actions | CI | — | Type-check, lint, test, build, E2E | Single `ci.yml` job |
| Inter (Google Fonts) | Typography | — | Primary typeface | Non-blocking `<link>` tags in `index.html` (FE-P2-04) |

### 2.2 Key React Features in Use

| Feature | Used | Location |
|---|---|---|
| Hooks (useState, useEffect, useCallback, useMemo) | ✅ | Throughout |
| Context API | ✅ | `AuthContext`, `CitizenAuthContext`, `TenantContext` |
| Suspense + lazy() | ✅ | All routes in `routes/index.tsx` |
| React.StrictMode | ✅ | `index.tsx` |
| Error Boundaries | ✅ | Class component in `ErrorBoundary/` |
| Concurrent features (useTransition, useDeferredValue) | ❌ | Not used |
| React.memo | ❌ | Not used |
| useReducer | ❌ | Not used |
| Portals | ✅ | `Modal` uses `createPortal` targeting `document.body` (FE-P2-07) |
| Ref forwarding | ❌ | Not used |

### 2.3 TypeScript Configuration

Key `tsconfig.json` settings:

| Setting | Value | Implication |
|---|---|---|
| `strict` | `true` | Full strict mode: `strictNullChecks`, `noImplicitAny`, etc. |
| `noUnusedLocals` | `true` | Unused variables are compile errors |
| `noUnusedParameters` | `true` | Unused function parameters are compile errors |
| `noFallthroughCasesInSwitch` | `true` | Switch exhaustiveness enforced |
| `moduleResolution` | `bundler` | Vite-native resolution; no `node_modules` traversal |
| `isolatedModules` | `true` | Each file transpilable independently (required for Vite) |
| `noEmit` | `true` | `tsc` used only for type-checking, not compilation |
| `paths` | `@/*`, `@vsaas/types` | Path aliases; mirrored in `vite.config.ts` |
| `jsx` | `react-jsx` | New JSX transform; no `import React` required |
| Test files | excluded | `*.test.ts(x)` excluded from main `tsconfig.json` |

**Note:** `@/*` path alias is fully adopted — 244 relative parent imports rewritten across 84 files (FE-P2-02). ESLint `no-restricted-imports` rule blocks relative parent imports going forward.

### 2.4 State Management Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    State Sources                         │
│                                                         │
│  Server State (TanStack Query)                          │
│  ├── queryClient: staleTime=5min, gcTime=10min          │
│  ├── retry: skip on 401/403, max 2 retries              │
│  ├── networkMode: offlineFirst                          │
│  └── Domain hooks: usePressRelease, useEvent, etc.      │
│                                                         │
│  Auth State (React Context)                             │
│  ├── AuthContext: staff user session                    │
│  ├── CitizenAuthContext: citizen portal session         │
│  └── TenantContext: current tenant + feature flags      │
│                                                         │
│  Client State (Zustand)                                 │
│  └── uiStore: sidebarOpen (theme/toggleTheme removed)   │
│                                                         │
│  i18n State (Zustand)                                   │
│  └── useI18nStore: locale (pt-BR); useTranslation       │
│      returns locale-bound t/tArray via useCallback      │
└─────────────────────────────────────────────────────────┘
```

**Note:** `TenantContext` migrated to TanStack Query `useQuery` (FE-P1-02). All data fetching runs through a single server-state layer. No parallel fetching paths remain.

---

## 3. Project Structure & Code Organization

### 3.1 Directory Map

```
src/
├── components/          # Reusable UI components
│   ├── Auth/            # Auth-specific components (ProtectedRoute, PermissionGate, LoginForm)
│   ├── ContactForm/     # Landing page contact form
│   ├── DashboardMockup/ # Landing page dashboard preview
│   ├── ErrorBoundary/   # Global error boundary (class component)
│   ├── Landing/         # Landing page section components
│   ├── Layout/          # Public layout header/footer
│   ├── LGPD/            # Cookie consent banner
│   └── UI/              # Design system component library (20 components)
│
├── config/              # App-level configuration
│   ├── env.ts           # VITE_API_URL + VITE_APP_ENV validation + ENV object
│   └── queryClient.ts   # TanStack Query global config
│   # permissions.ts deleted — PERMISSIONS/ROLE_PERMISSIONS moved to @vsaas/types (FE-P0-03)
│
├── contexts/            # React Context providers
│   ├── AuthContext.tsx       # Staff auth session
│   ├── CitizenAuthContext.tsx # Citizen portal session
│   ├── TenantContext.tsx     # Tenant data + feature flags (TanStack Query)
│   └── index.ts             # Barrel export (FE-P3-06)
│
├── hooks/               # Custom React hooks
│   ├── useApi.ts        # TanStack Query wrappers (useApiQuery, useApiMutation)
│   ├── useDashboard.ts  # Dashboard data hook
│   ├── useDebounce.ts   # Debounce utility hook
│   ├── useHealthCheck.ts # API reachability polling
│   ├── usePageTitle.ts  # document.title management
│   ├── useSessionTimeout.ts # Inactivity logout
│   ├── useToast.ts      # react-hot-toast wrapper
│   ├── use{Domain}.ts   # 7 domain-specific hooks (one per module)
│   └── index.ts         # Barrel export — all 14 hooks (FE-P3-06)
│
├── i18n/                # Internationalisation
│   ├── index.ts         # Zustand store; useTranslation returns locale-bound callbacks (FE-P3-03)
│   └── locales/pt-BR.json # Single locale; includes breadcrumbs.* section (FE-P2-05)
│
├── layouts/             # Page layout shells
│   ├── AuthLayout/      # Minimal layout (ErrorBoundary + Outlet)
│   ├── CitizenPortalLayout/ # Citizen portal header/footer
│   ├── DashboardLayout/ # Staff sidebar + main content
│   ├── PublicLayout/    # Public site header/footer
│   └── index.ts         # Barrel export (FE-P3-06)
│
├── pages/               # Route-level page components
│   ├── AcceptInvite/
│   ├── Admin/           # Dashboard, Users
│   ├── CitizenPortal/   # Citizen-facing portal pages (new)
│   ├── Domain/          # 7 domain modules — all use CrudPage abstraction (FE-P1-01)
│   ├── Error/           # 404, 403
│   ├── ForgotPassword/
│   ├── Landing/
│   ├── Legal/           # Privacy, Terms
│   ├── Login/
│   ├── Register/
│   ├── ResetPassword/
│   └── Settings/        # Profile page
│
├── providers/           # Provider wrappers
│   └── QueryProvider.tsx # QueryClientProvider wrapper
│
├── routes/              # Routing configuration
│   └── index.tsx        # All routes, lazy imports, layout nesting
│
├── services/            # API communication layer
│   ├── api/             # 10 domain service modules + barrel index.ts (FE-P3-06)
│   ├── base/            # ApiError, buildUrl, baseRequest (FE-P1-03)
│   ├── interceptors/    # withRefreshInterceptor (FE-P1-03)
│   └── http.ts          # Thin composition layer (fetch + interceptors)
│
├── store/               # Zustand stores
│   ├── index.ts         # Barrel export
│   └── uiStore.ts       # Sidebar + theme state
│
├── styles/              # Global styles
│   ├── global.css       # Reset, typography, utility classes
│   └── tokens/index.css # CSS custom property design tokens
│
├── validation/          # Form validation layer (FE-P1-07)
│   └── domain/          # 7 files (one per domain) + barrel index.ts
│                        # each exports FormState type, emptyForm, validate*, domain constants
│
└── tests/
    └── setup.ts         # Vitest global setup (jest-dom, locale, matchMedia mock)
```

### 3.2 Directory Statistics

| Directory | Source Files | Test Files | Avg LOC | Largest File |
|---|---|---|---|---|
| `components/UI/` | 20 | 9 | ~35 | `DataTable.tsx` (123) |
| `components/Landing/` | 8 | 0 | ~45 | `landing.data.ts` (135) |
| `components/Auth/` | 4 | 1 | ~20 | `PermissionGate.tsx` (15) |
| `pages/Domain/` | 14 | 7 | ~85 | `CitizenPortalPage.tsx` (102) |
| `pages/Admin/` | 2 | 0 | ~135 | `UsersPage.tsx` (166) |
| `pages/CitizenPortal/` | 5 | 0 | ~65 | `CitizenRegisterPage.tsx` (96) |
| `pages/` (auth) | 8 | 5 | ~80 | `RegisterPage.tsx` (118) |
| `hooks/` | 15 | 3 | ~30 | `domain-hooks.test.ts` (328) |
| `contexts/` | 3 | 2 | ~55 | `TenantContext.tsx` (60) |
| `services/` | 13 | 1 | ~30 | `http.ts` (thin composition) |
| `validation/domain/` | 8 | 1 | ~40 | `pressRelease.ts` |
| `layouts/` | 5 | 1 | ~60 | `DashboardLayout.tsx` (96) |
| `store/` | 2 | 1 | ~20 | `uiStore.ts` (20) |
| `i18n/` | 2 | 0 | ~35 | `index.ts` (50) |
| `config/` | 3 | 0 | ~35 | `permissions.ts` (55) |
| **Total** | **125** | **35** | **~49** | `UsersPage.tsx` (166) |

**No file exceeds 200 LOC.** The codebase is well-decomposed.

### 3.3 Naming Conventions

| Convention | Applied | Example |
|---|---|---|
| PascalCase for components | ✅ Consistent | `DashboardLayout.tsx`, `PasswordInput.tsx` |
| camelCase for hooks | ✅ Consistent | `useApiQuery`, `useSessionTimeout` |
| `use` prefix for hooks | ✅ Consistent | All hooks follow the convention |
| `Page` suffix for route components | ✅ Consistent | `LoginPage`, `PressReleasesPage` |
| `Form` suffix for form components | ✅ Consistent | `PressReleaseForm`, `EventForm` |
| `Layout` suffix for layouts | ✅ Consistent | `DashboardLayout`, `PublicLayout` |
| `Context` suffix for contexts | ✅ Consistent | `AuthContext`, `TenantContext` |
| CSS Module files co-located | ✅ Consistent | `Component.tsx` + `Component.module.css` |
| Barrel `index.ts` exports | ✅ Complete | `components/UI/`, `store/`, `contexts/`, `hooks/`, `services/api/`, `layouts/` |

### 3.4 Architectural Observations

**🟩 Strength — Consistent domain hook pattern.** Every domain module follows the same structure: `use{Domain}List`, `use{Domain}Detail`, `useCreate{Domain}`, `useUpdate{Domain}`, `useDelete{Domain}`. This makes the data layer predictable and easy to extend.

**🟩 Strength — `CrudPage` abstraction implemented.** `src/components/UI/CrudPage/CrudPage.tsx` provides the shared DataTable + Modal + ConfirmDialog + state pattern. All 7 domain pages use it — ~400 LOC of duplication eliminated (FE-P1-01).

**🟩 Strength — Dedicated validation layer.** `src/validation/domain/` owns all form state types, empty-state factories, and validation functions for all 7 domain modules. Domain `*Form.tsx` files re-export from this layer. Form logic is fully decoupled from the page layer (FE-P1-07).

**🟩 Strength — `services/base/` and `services/interceptors/` fully populated.** `ApiError`, `buildUrl`, and `baseRequest` live in `services/base/`; `withRefreshInterceptor` lives in `services/interceptors/`. `http.ts` is a thin composition layer (FE-P1-03).

**🟩 Strength — No "god files".** The largest source file is `UsersPage.tsx` at 166 LOC. The codebase has no files approaching 300 LOC.

---

## 4. Dependency Analysis

### 4.1 Production Dependencies

| Package | Version | Purpose | Risk | Status |
|---|---|---|---|---|
| `react` | 18.2.0 | Core framework | None | ✅ Current |
| `react-dom` | 18.2.0 | DOM renderer | None | ✅ Current |
| `react-router-dom` | 6.30.1 | Routing | None | ✅ Current |
| `@tanstack/react-query` | 5.89.0 | Server state | None | ✅ Current |
| `zustand` | 4.5.7 | Client state | None | ✅ Current |
| `framer-motion` | 12.37.0 | Animations | 🟨 Bundle weight | ✅ Current — see note |
| `react-hot-toast` | 2.6.0 | Notifications | None | ✅ Current |
| `react-icons` | 5.6.0 | Icon set | None | ✅ v5 — upgraded (FE-P3-02) |
| `@vsaas/types` | local | Shared types | None | ✅ Workspace package |

### 4.2 Development Dependencies

| Package | Version | Purpose | Risk | Status |
|---|---|---|---|---|
| `vite` | 5.4.11 | Build tool | None | ✅ Current |
| `@vitejs/plugin-react` | 4.3.4 | React Babel transform | None | ✅ Current |
| `typescript` | 5.7.3 | Type system | None | ✅ Current |
| `vitest` | 2.0.0 | Unit test runner | None | ✅ Current |
| `@testing-library/react` | 16.3.0 | Component testing | None | ✅ Current |
| `@testing-library/jest-dom` | 6.8.0 | DOM matchers | None | ✅ Current |
| `@testing-library/user-event` | 14.6.1 | User interaction simulation | None | ✅ Current |
| `cypress` | 15.1.0 | E2E testing | None | ✅ Current |
| `eslint` | 9.39.4 | Linting | None | ✅ v9 flat config — 0 errors (FE-P1-06) |
| `@typescript-eslint/parser` | 8.57.0 | TS ESLint parser | None | ✅ Current |
| `@typescript-eslint/eslint-plugin` | 8.57.0 | TS lint rules | None | ✅ Current |
| `eslint-plugin-react` | 7.37.5 | React lint rules | None | ✅ Current |
| `eslint-plugin-react-hooks` | 7.0.1 | Hooks lint rules | None | ✅ Current |
| `prettier` | 3.6.2 | Code formatting | None | ✅ Current |
| `husky` | 9.1.7 | Git hooks | None | ✅ Current |
| `lint-staged` | 16.2.3 | Staged file linting | None | ✅ Current |
| `@tanstack/react-query-devtools` | 5.89.0 | Query debugging | None | ✅ Dev only |
| `@faker-js/faker` | 8.4.1 | Test data generation | None | ✅ Current |
| `concurrently` | 9.2.0 | Parallel dev scripts | None | ✅ Current |
| `jsdom` | 25.0.0 | DOM simulation for Vitest | None | ✅ Current |
| `wait-on` | 8.0.0 | CI server readiness check | None | ✅ Current |

### 4.3 Risk Classification

**✅ Resolved — ESLint v9**  
ESLint upgraded to v9.39.4. `.eslintrc.json` replaced with `eslint.config.js` flat config. `globals` package added. `react/prop-types` disabled for TypeScript. Vitest globals scoped to test files. 0 errors, 65 warnings (all pre-existing) (FE-P1-06).

**🔴 Retained by decision — `framer-motion` bundle weight**  
`framer-motion` v12 (~100KB gzipped) is used in 5 files: 4 landing page section components and `TopLoadingBar`. The `motion` chunk is isolated via `manualChunks` in `vite.config.ts`. Removal was evaluated and skipped by explicit decision (FE-P3-01).

**✅ Resolved — Google Fonts loading**  
Render-blocking `@import` removed from `global.css`. Non-blocking `<link rel="preconnect">` + `<link rel="stylesheet">` added to `index.html` (FE-P2-04).

**✅ Resolved — `react-icons` v5**  
Upgraded from v4.12.0 to v5.6.0. `Icon.tsx` wrapper required no changes. Improved tree-shaking active (FE-P3-02).

**🟩 Low — No unused production dependencies detected**  
All 8 production dependencies have observable usage in source files.

**🟩 Low — `@faker-js/faker` is dev-only**  
Correctly placed in `devDependencies`. Used in test data generation scripts.

### 4.4 Bundle Chunking Strategy

`vite.config.ts` defines four manual chunks:

| Chunk | Contents | Rationale |
|---|---|---|
| `vendor` | react, react-dom, react-router-dom | Core framework — changes rarely |
| `query` | @tanstack/react-query | Large, stable dependency |
| `motion` | framer-motion | Isolates animation library |
| `icons` | react-icons | Isolates icon library |

Route-level code splitting is achieved via `React.lazy()` on all 20+ page components in `routes/index.tsx`. This means each page is a separate async chunk loaded on demand.

**Observation:** The `@vsaas/types` package is a local workspace dependency resolved at build time — it adds no runtime chunk.
