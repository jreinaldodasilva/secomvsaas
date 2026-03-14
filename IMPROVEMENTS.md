# Secom — Improvement Schedule

## Phase 1: Quick Fixes (inline styles, missing pages)

| # | Task | Files | Status |
|---|------|-------|--------|
| 1.1 | Fix ProtectedRoute inline styles → CSS classes | `ProtectedRoute.tsx`, `global.css` | ✅ |
| 1.2 | Create Privacy Policy page + route | `PrivacyPage.tsx`, `routes/index.tsx`, i18n | ✅ |
| 1.3 | Create Terms of Use page + route | `TermsPage.tsx`, `routes/index.tsx`, i18n | ✅ |

## Phase 2: Dashboard (summary cards with real data)

| # | Task | Files | Status |
|---|------|-------|--------|
| 2.1 | Create dashboard summary API endpoint | `dashboard.routes.ts`, `v1/index.ts` | ✅ |
| 2.2 | Create useDashboard hook | `src/hooks/useDashboard.ts` | ✅ |
| 2.3 | Build DashboardPage with stat cards + recent activity | `DashboardPage.tsx`, `global.css`, i18n | ✅ |

## Phase 3: Frontend Permission Guards

| # | Task | Files | Status |
|---|------|-------|--------|
| 3.1 | Add role→permissions map to frontend | `src/config/permissions.ts` | ✅ |
| 3.2 | Create PermissionGate component | `PermissionGate.tsx` | ✅ |
| 3.3 | Wire allowedRoles on protected routes | `routes/index.tsx` | ✅ |
| 3.4 | Hide sidebar nav links user can't access | `DashboardLayout.tsx` | ✅ |

## Phase 4: Lazy Loading Routes

| # | Task | Files | Status |
|---|------|-------|--------|
| 4.1 | Convert all page imports to React.lazy + Suspense | `routes/index.tsx` | ✅ |

## Phase 5: LGPD Compliance

| # | Task | Files | Status |
|---|------|-------|--------|
| 5.1 | Cookie consent banner component | `src/components/LGPD/CookieConsent.tsx`, `global.css` | ✅ |
| 5.2 | Wire banner into App.tsx | `App.tsx` | ✅ |

## Phase 6: Remove `as any` casts from domain pages

| # | Task | Files | Status |
|---|------|-------|--------|
| 6.1 | Expand interfaces, remove all `as any` | 7 domain page files | ✅ |

---

Items deferred (lower priority, higher effort):
- **Notifications system** — requires SSE/WebSocket backend + frontend consumer
- **CrudPage generic component** — refactor 7 pages into config-driven pattern
- **Dark mode logo variant** — needs a white-text SVG version of the logo
