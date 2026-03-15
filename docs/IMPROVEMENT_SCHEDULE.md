# Secom — Improvement Schedule (Round 4)

## Overview

9 items across 3 tiers. Phases 1–3 (Tier 1) form one commit, Phases 4–6 (Tier 2) form a second commit, Phases 7–9 (Tier 3) form a third commit.

**Baseline**: 70 frontend + 77 backend = 147 tests passing.

---

## Tier 1 — High Impact, Low Effort

### Phase 1: Dead Code Removal (Stripe / Billing)

**Problem**: Stripe webhook route, BILLING_EVENTS, and Stripe env config are boilerplate leftovers irrelevant to a government communications office.

**Files Modified**:
- `backend/src/routes/v1/index.ts` — remove Stripe webhook route import/mount
- `backend/src/routes/webhooks/stripe.ts` — DELETE file
- `backend/src/platform/events/events.ts` — remove BILLING_EVENTS + BillingEventType
- `backend/src/config/env.ts` — remove `stripe` config block from interface + implementation
- `backend/src/app.ts` — remove Stripe raw body parser middleware

**Files NOT removed** (still useful):
- `backend/src/routes/webhooks/subscriptions.ts` — generic webhook subscriptions (not Stripe-specific)
- `backend/src/routes/uploads/upload.routes.ts` — file uploads are useful for press releases/social media
- `backend/src/services/storage/storageService.ts` — needed for uploads

### Phase 2: Fix `as any` on Domain Route Permissions

**Problem**: All 7 domain route files cast permission strings as `as any` (35 total). The `Permission` type already includes these exact string values.

**Fix**: Import `PERMISSIONS` constant and use typed references instead of string literals.

**Files Modified** (7):
- `backend/src/modules/domain/press-releases/routes/press-release.routes.ts`
- `backend/src/modules/domain/media-contacts/routes/media-contact.routes.ts`
- `backend/src/modules/domain/clippings/routes/clipping.routes.ts`
- `backend/src/modules/domain/events/routes/event.routes.ts`
- `backend/src/modules/domain/appointments/routes/appointment.routes.ts`
- `backend/src/modules/domain/citizen-portal/routes/citizen-portal.routes.ts`
- `backend/src/modules/domain/social-media/routes/social-media.routes.ts`

### Phase 3: Swagger Annotations for Domain Modules

**Problem**: Platform routes (auth, users, uploads, webhooks) have `@swagger` JSDoc but the 7 domain modules have zero annotations. `/api-docs` is incomplete.

**Fix**: Add `@swagger` JSDoc comments to all 5 CRUD endpoints in each of the 7 domain route files (35 endpoints total).

**Files Modified** (7): Same route files as Phase 2.

---

## Tier 2 — Medium Impact, Medium Effort

### Phase 4: Form Validation Feedback (Inline Errors)

**Problem**: Forms rely on native HTML5 validation only. No inline error messages in Portuguese.

**Fix**: Add `form-error` CSS class + show validation messages below fields on submit attempt.

**Files Modified**:
- `src/styles/global.css` — add `.form-error` style
- All 7 domain pages — add validation state + error display

### Phase 5: Delete Confirmation Modal + Loading State

**Problem**: Delete uses `window.confirm()` (English browser dialog) and has no loading indicator.

**Fix**: Create `ConfirmDialog` component using existing Modal. Add `isLoading` to delete buttons.

**Files Modified**:
- `src/components/UI/ConfirmDialog/ConfirmDialog.tsx` — NEW
- `src/components/UI/index.ts` — export ConfirmDialog
- `src/styles/global.css` — confirm dialog styles
- All 7 domain pages — replace `window.confirm` with ConfirmDialog
- `src/i18n/locales/pt-BR.json` — add confirm dialog strings
- `src/i18n/locales/en.json` — add confirm dialog strings

### Phase 6: Sidebar Icons

**Problem**: 7+ nav items are plain text links. Hard to scan visually.

**Fix**: Add react-icons (already installed) to sidebar nav links.

**Files Modified**:
- `src/layouts/DashboardLayout/DashboardLayout.tsx` — add icons to NavLinks

---

## Tier 3 — Nice to Have

### Phase 7: CrudPage Generic Component

**Problem**: 7 domain pages share ~60% structure (760 lines total, ~450 duplicated).

**Assessment**: After implementing Phases 4-5 (validation + ConfirmDialog), each page is 110-130 lines with significant variation in form layout (city/state row, checkboxes, tags parsing, date handling). A generic CrudPage would require a complex config schema harder to read than the current pages.

**Status**: SKIPPED — current pages are clean and self-contained. Revisit if more modules are added.

### Phase 8: Dark Mode Logo Variant

**Problem**: Logo may not be visible on dark backgrounds.

**Fix**: CSS `filter: brightness(0) invert(1)` on `.brand-logo` in `[data-theme="dark"]`. No separate image file needed.

**Files Modified**:
- `src/styles/global.css` — add dark mode brand-logo filter

### Phase 9: Notifications System

**Problem**: No in-app notification system. Users have no way to receive alerts about events, approvals, etc.

**Assessment**: This is real feature work requiring backend (notification model, service, routes) + frontend (notification bell, dropdown, mark-as-read). **Deferred** — requires dedicated planning session.

**Status**: DEFERRED — not implemented in this round.

---

## Commit Plan

| Commit | Phases | Description |
|--------|--------|-------------|
| 1 | 1–3 | Tier 1: dead code removal, type safety, Swagger |
| 2 | 4–6 | Tier 2: form validation, confirm dialog, sidebar icons |
| 3 | 8 | Tier 3: dark mode logo (CrudPage skipped, notifications deferred) |
