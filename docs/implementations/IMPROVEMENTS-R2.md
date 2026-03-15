# Secom — Improvement Schedule (Round 2)

## Phase 7: Security — Dashboard route auth guard

| # | Task | Files | Status |
|---|------|-------|--------|
| 7.1 | Add authenticate + requireTenant to dashboard route | `dashboard.routes.ts` | ✅ |

## Phase 8: Remaining inline styles → CSS classes

| # | Task | Files | Status |
|---|------|-------|--------|
| 8.1 | NotFoundPage + UnauthorizedPage | `NotFoundPage.tsx`, `UnauthorizedPage.tsx`, `global.css` | ✅ |
| 8.2 | ConnectionBanner | `ConnectionBanner.tsx`, `global.css` | ✅ |
| 8.3 | PasswordInput | `PasswordInput.tsx`, `global.css` | ✅ |
| 8.4 | ThemeToggle | `ThemeToggle.tsx`, `global.css` | ✅ |
| 8.5 | ProfilePage (+ role display, err: any fix) | `ProfilePage.tsx`, `global.css` | ✅ |

## Phase 9: Wire ConnectionBanner into App

| # | Task | Files | Status |
|---|------|-------|--------|
| 9.1 | Render ConnectionBanner in App.tsx | `App.tsx` | ✅ |

## Phase 10: Type safety — domain hooks `any` → proper types

| # | Task | Files | Status |
|---|------|-------|--------|
| 10.1 | Replace `<any>` with `@vsaas/types` entities in all 7 hooks | 7 hook files | ✅ |
| 10.2 | Fix shared types `string \| Date` → `string` (API returns ISO strings) | `packages/types/src/index.ts` | ✅ |

## Phase 11: Page titles

| # | Task | Files | Status |
|---|------|-------|--------|
| 11.1 | Create usePageTitle hook | `src/hooks/usePageTitle.ts` | ✅ |
| 11.2 | Wire into all pages (7 domain + dashboard + users + profile + 2 legal) | 12 page files | ✅ |

---

Items deferred:
- **Form validation feedback** — field-level error display from backend Joi errors
- **Delete loading state** — disable delete button while mutation pending
- **Sidebar icons** — requires icon set decision (emoji, SVG, or icon library)
- **Notifications system** — SSE/WebSocket backend + frontend consumer
- **CrudPage generic** — config-driven refactor of 7 domain pages
- **Dark mode logo variant** — needs white-text SVG

Note: PasswordInput strength bar retains 1 inline style for dynamic computed width/color — this is intentional.
