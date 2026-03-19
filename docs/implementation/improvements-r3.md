# Secom — Improvement Schedule (Round 3)

## Phase 12: Auth pages consistency (Button, form-field, err: any, usePageTitle)

| # | Task | Files | Status |
|---|------|-------|--------|
| 12.1 | LoginForm — Button, err: any → ApiError | `LoginForm.tsx` | ✅ |
| 12.2 | RegisterPage — Button, form-field, err: any, usePageTitle | `RegisterPage.tsx` | ✅ |
| 12.3 | ForgotPasswordPage — Button, err: any, usePageTitle | `ForgotPasswordPage.tsx` | ✅ |
| 12.4 | ResetPasswordPage — Button, form-field, err: any, usePageTitle | `ResetPasswordPage.tsx` | ✅ |
| 12.5 | AcceptInvitePage — Button, form-field, err: any, usePageTitle | `AcceptInvitePage.tsx` | ✅ |
| 12.6 | LoginPage — usePageTitle | `LoginPage.tsx` | ✅ |
| 12.7 | LoginForm test — update for Button isLoading + ApiError | `LoginForm.test.tsx` | ✅ |
| 12.8 | Test setup — add matchMedia mock for ThemeToggle zustand | `setup.ts` | ✅ |

## Phase 13: Security — seed password from env

| # | Task | Files | Status |
|---|------|-------|--------|
| 13.1 | Read default admin password from env var with dev-only fallback | `defaultTenant.ts` | ✅ |

## Phase 14: Branding consistency (vsaas → secom)

| # | Task | Files | Status |
|---|------|-------|--------|
| 14.1 | Database name: vsaas → secom | `env.ts` | ✅ |
| 14.2 | Email defaults: vsaas.app → secom.gov.br | `env.ts` | ✅ |
| 14.3 | Cookie name: vsaas_access_token → secom_access_token | `auth.ts`, `auth routes`, `swagger` | ✅ |
| 14.4 | Theme storage key: vsaas_theme → secom_theme | `ThemeToggle.tsx` | ✅ |
| 14.5 | Locale storage key: vsaas_locale → secom_locale | `i18n/index.ts` | ✅ |

## Phase 15: SEO meta

| # | Task | Files | Status |
|---|------|-------|--------|
| 15.1 | Add meta description + theme-color to index.html | `index.html` | ✅ |

---

Items deferred:
- **Swagger annotations** — 7 domain modules + auth + dashboard + tenants need @swagger JSDoc
- **Form validation feedback** — field-level error display from backend Joi errors
- **Delete loading state** — disable delete button while mutation pending
- **Sidebar icons** — requires icon set decision
- **Notifications system** — SSE/WebSocket backend + frontend consumer
- **CrudPage generic** — config-driven refactor of 7 domain pages
- **Dark mode logo variant** — needs white-text SVG
