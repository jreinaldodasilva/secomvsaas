# vSaaS Boilerplate — Improvement Schedule (Phase 5)

> Continuation after Phase 4 completion (13/13 items done).
> Focuses on internationalization, DX polish, frontend robustness, and boilerplate completeness.

## Status Legend

- ⬜ Not started
- 🔄 In progress
- ✅ Done

---

## Phase 18 — Quick Wins & DX

Small fixes that improve first-clone experience.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 18.1 | **Add `.gitkeep` to `backend/src/modules/domain/`** — Directory doesn't exist until CLI runs. Make it visible in the repo. | High | ✅ |
| 18.2 | **Typed frontend API errors** — Create `ApiError` class in `src/services/http.ts` with `status`, `code`, `details` matching backend `ApiResult` error shape. Replace generic `Error` throws. | High | ✅ |
| 18.3 | **Wire backend lint into CI** — `npm run lint` only runs frontend. Add `lint:backend` script and call it in GitHub Actions. | Medium | ✅ |

---

## Phase 19 — Internationalization

Replace hardcoded Portuguese strings with an i18n foundation.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 19.1 | **i18n core** — Add `src/i18n/` with `t()` helper, locale loader, and `pt-BR` + `en` JSON files covering all existing UI strings. | High | ✅ |
| 19.2 | **Wire i18n into pages** — Replace hardcoded strings in all pages and components with `t()` calls. | High | ✅ |
| 19.3 | **Language switcher** — Add locale toggle to `DashboardLayout` sidebar footer. Persist choice in `localStorage`. | Medium | ✅ |

---

## Phase 20 — Frontend Robustness

Improve error handling and theming.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 20.1 | **Dark mode** — Add `[data-theme="dark"]` CSS token overrides, theme toggle component, persist in `localStorage`. | Medium | ✅ |
| 20.2 | **Fix Cypress e2e tests** — Update selectors and assertions to match current page components (UnauthorizedPage, NotFoundPage, etc). | Medium | ✅ |
| 20.3 | **Remove unused `react-hook-form` chunk** — It's in Vite manual chunks but not used. Clean up `vite.config.ts`. | Low | ✅ |

---

## Phase 21 — Boilerplate Completeness

Fill gaps that adopters would hit immediately.

| # | Item | Priority | Status |
|---|------|----------|--------|
| 21.1 | **File upload service** — `StorageService` with local/S3 adapters, multer middleware, upload route. `.env.example` already has S3 config. | Medium | ✅ |
| 21.2 | **Outbound webhooks** — `WebhookSubscription` model, delivery queue via BullMQ, tenant-scoped CRUD routes. | Medium | ✅ |
| 21.3 | **API versioning docs** — Add section to README explaining the v1/v2 coexistence strategy and how to introduce a new version. | Low | ✅ |

---

## Implementation Order

```
Batch R (DX):           18.1 → 18.2 → 18.3
Batch S (i18n):         19.1 → 19.2 → 19.3
Batch T (frontend):     20.1 → 20.2 → 20.3
Batch U (completeness): 21.1 → 21.2 → 21.3
```

Batch R first — immediate DX wins, unblocks better error handling everywhere.
Batch S next — i18n is the biggest gap for a boilerplate targeting international adopters.
Batches T and U can be done in any order.

---

*Depends on: Phase 4 schedule (all 13 items complete)*
