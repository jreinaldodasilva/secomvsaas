# Forms & Validation Improvement Roadmap
## Secom — Secretaria de Comunicação

> **Source documents:** `forms-validation-part-1.md`, `forms-validation-part-2.md`, `forms-validation-part-3.md`
> **Scope:** All 17 forms across 7 domain modules, 7 auth/account forms, 1 admin utility form, 1 public landing form.
> **Methodology:** Findings are grounded exclusively in the source documents. No speculative debt is introduced.

---

## Table of Contents

1. [Prioritized Issue Inventory](#1-prioritized-issue-inventory)
2. [Technical Debt Assessment](#2-technical-debt-assessment)
3. [Phased Roadmap](#3-phased-roadmap)
4. [KPIs & Success Metrics](#4-kpis--success-metrics)
5. [Forms Maturity Score](#5-forms-maturity-score)
6. [Executive Summary](#6-executive-summary)

---

## 1. Prioritized Issue Inventory

### Secom-Specific Distribution Analysis

Before the issue tables, three structural observations from the source documents:

- **Systemic vs. module-specific:** Validation inconsistencies are systemic across all 7 modules. The hybrid English/Portuguese error message defect, submit-only trigger timing, and absence of navigation guards affect every form without exception.
- **Citizen-facing risk concentration:** `AppointmentForm` and `CitizenRecordsForm` are the primary sources of data integrity risk — they handle PII (CPF, phone, email, address) with the weakest schema depth (63% of fields use bare `z.string()`). `CitizenRegisterPage` adds a secondary risk layer as the public self-service entry point.
- **Approval workflow gap:** Press release status transitions are unconstrained at the form level. An `assessor` can set status directly to `published`, bypassing the `draft → review → approved` chain. This is documented as a business logic risk, not merely a UX issue.

---

### 1.1 🟥 P0 — Data Integrity / Submission Risk

| # | Issue | Form Area | System Impact | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P0-01 | Validation messages are hybrid: Zod's built-in English messages appended to i18n field name keys, producing strings like `"Título — String must contain at least 5 character(s)"` | All 7 domain forms | Users of a Portuguese government application receive technical English error messages; non-technical staff and citizens cannot act on them | Medium | Zod custom message API; `pt-BR.json` i18n file | Part1, Part3 |
| P0-02 | No navigation guard on any form — unsaved data is silently lost on modal close or route change | All 17 forms | Silent data loss; press release body and event descriptions are the highest-risk content given their length | Medium | `CrudPage` modal close handler; dirty-state tracking | Part1, Part3 |
| P0-03 | No autosave or draft state on any form — all form state held in `CrudPage` `useState` and discarded on modal close | All forms, highest risk on PressRelease and Event | Long-form content (press release body, event description) permanently lost on any interruption | High | Server draft API or `localStorage` strategy | Part1, Part3 |
| P0-04 | CPF fields accept any string — no format validation (11 digits, check digit) | AppointmentForm, CitizenRecordsForm | Invalid CPF data stored in the database; downstream processing failures for government identity workflows | Low | Zod schema update; CPF validation utility | Part1, Part2, Part3 |
| P0-05 | Email fields in domain forms have no format validation in the Zod schema (`z.string()` without `.email()`) — `CitizenRecordsForm` uses `type="email"` for browser-level validation only, creating inconsistent enforcement layers | CitizenRecordsForm, MediaContactForm | Invalid emails stored; communication failures; browser validation bypassed by programmatic submission | Low | Zod schema update | Part1, Part2, Part3 |
| P0-06 | Press release `status` field allows any transition between any value — `assessor` can set status directly to `published`, bypassing `draft → review → approved` workflow | PressReleaseForm | Approval workflow bypass at the frontend level; unreviewed press releases can be published | Medium | Role-based status filtering logic; `useAuth` hook | Part1, Part2, Part3 |
| P0-07 | `scheduledAt` in AppointmentForm accepts any non-empty string — past dates pass validation | AppointmentForm | Appointments can be created in the past; scheduling integrity failures | Low | Zod refinement for future-date check | Part1, Part2, Part3 |
| P0-08 | No end-before-start cross-field validation on EventForm — `endsAt` before `startsAt` passes validation | EventForm | Events with logically invalid date ranges stored; calendar display errors | Low | Zod `.refine()` cross-field rule | Part1, Part2, Part3 |

---

### 1.2 🟧 P1 — Reliability / Maintainability Risks

| # | Issue | Form Area | System Impact | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P1-01 | Phone fields accept any string — no format or length validation | AppointmentForm, CitizenRecordsForm, MediaContactForm | Invalid phone data stored; contact failures for media relations and citizen services | Low | Zod schema update; phone format utility | Part1, Part2, Part3 |
| P1-02 | URL fields (`sourceUrl`, `mediaUrl`) have no format validation in Zod schemas | ClippingForm, SocialMediaForm | Invalid URLs stored; broken links in clipping records and social media posts | Low | Zod `.url()` refinement | Part1, Part2, Part3 |
| P1-03 | All forms validate exclusively on submit — no `onBlur` or `onChange` feedback | All 7 domain forms | High error-correction cost on longer forms (CitizenRecordsForm 9 fields, PressReleaseForm 7 fields); users receive no feedback until submission attempt | Medium | Validation trigger refactor in `CrudPage` or form hooks | Part1, Part3 |
| P1-04 | No server field-level error mapping — server validation errors surface only as generic toasts or banners, never inline next to the relevant field | All domain forms, all auth forms | Users cannot identify which field caused a server-side rejection; critical for forms with many fields | Medium | `ApiError` response parsing; field error mapping layer | Part2, Part3 |
| P1-05 | `PasswordInput` has no `error` prop — cannot display field-level validation errors; password errors shown only as banners | All auth forms using `PasswordInput` (Login, Register, CitizenRegister, AcceptInvite, ResetPassword, ChangePassword) | Inline error display impossible for password fields; degrades error UX for all auth flows | Low | `PasswordInput` component API extension | Part2, Part3 |
| P1-06 | Password validation logic duplicated between `CitizenRegisterPage` and `RegisterPage` — same rules, different implementations | CitizenRegister, Register | Divergence risk; a rule change must be applied in two places; already partially diverged (special character rule shown in UI but not enforced in `RegisterPage`) | Low | Shared password validation utility | Part2, Part3 |
| P1-07 | `PasswordInput` strength indicator colors are hardcoded hex values in JS (`#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60`) — do not match semantic token values (`--color-error: #D32F2F`) | PasswordInput (used in 6 auth forms) | Design token system bypassed; visual inconsistency between strength indicator and other error states across all auth forms | Low | Replace hardcoded values with CSS custom properties | Part2 |
| P1-08 | `Auth.module.css` contains 7 hardcoded hex values for error/info/success banners — bypasses the token system | All auth pages | Token system inconsistency; theme changes require manual updates in two places | Low | Replace with `var(--color-error)`, `var(--color-success)`, `var(--color-info)` | Part2 |
| P1-09 | 63% of Zod schema fields (29 of 46) use bare `z.string()` with no validation rules — schemas define shape but do not enforce domain constraints | All 7 domain forms | Zod layer provides false confidence; domain-specific constraints (format, range, enum) are absent for the majority of fields | Medium | Schema depth review across all 7 files | Part3 |
| P1-10 | `CitizenPortalForm.tsx` is a deprecated re-export shim with a file comment indicating it should be deleted | CitizenPortal module | Dead code; maintenance confusion; risk of accidental use in future development | Low | None | Part1, Part3 |
| P1-11 | `LoginPage.tsx` and `LoginForm.tsx` are parallel implementations — `LoginPage` uses raw `<input>` elements; `LoginForm` uses the `Input` component; `LoginForm` is only used in tests | Staff login | Structural inconsistency; `LoginPage` bypasses the shared component system; divergence risk on future changes | Low | Consolidate to single implementation | Part2 |

---

### 1.3 🟨 P2 — Structural Standardization Improvements

| # | Issue | Form Area | System Impact | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P2-01 | Status option labels in `<select>` elements use raw enum values (`draft`, `no_show`, `social_media`) — not translated into Portuguese | PressReleaseForm, AppointmentForm, SocialMediaForm, UsersPage | Non-technical staff cannot reliably interpret status options; `no_show` is particularly opaque; incorrect status selection risk | Low | `pt-BR.json` additions; select option rendering update | Part1, Part3 |
| P2-02 | Auth pages use a parallel `.field` class in `Auth.module.css` instead of the global `.form-field` utility — two parallel field-wrapper implementations | All auth pages | Structural duplication; changes to field layout must be applied in two places | Medium | Auth page refactor to use global utilities or explicit divergence documentation | Part2 |
| P2-03 | `ContactForm` (landing page) is entirely isolated from the shared component system — uses inline imperative validation, no Zod, no shared components | ContactForm | Inconsistent validation pattern; not covered by any shared improvement; isolated maintenance burden | Medium | Refactor to use shared `Input`, `FormField`, Zod schema | Part1, Part3 |
| P2-04 | No password confirmation field in Register, CitizenRegister, AcceptInvite, or ResetPassword forms | Register, CitizenRegister, AcceptInvite, ResetPassword | Password typos are undetectable; users may be locked out of newly created accounts | Low | Add confirm field + cross-field Zod refinement | Part1, Part2 |
| P2-05 | `EventForm` checkbox is not wrapped in a `FormField` component — inconsistent with all other fields in the domain form set | EventForm | Structural inconsistency; checkbox cannot receive `error` or `helpText` props via the standard pattern | Low | Wrap checkbox in `FormField` | Part1, Part2 |
| P2-06 | `FormField` label association relies on a naming convention (`name` prop must match child `id`) that is not enforced by TypeScript — a mismatch silently breaks label association | All domain forms using `FormField` | Accessibility regression risk on future form additions; no compile-time safety | Medium | TypeScript enforcement or `useId`-based auto-association | Part2 |
| P2-07 | `state` (UF) field in CitizenRecordsForm is a free-text input with only `maxLength={2}` — no validation against valid Brazilian state codes | CitizenRecordsForm | Invalid state codes stored; address data quality degradation | Low | Replace with `<select>` of 27 Brazilian UF codes | Part2, Part3 |
| P2-08 | `service` field in AppointmentForm is free text — no dropdown or autocomplete of available services | AppointmentForm | Inconsistent service names across records; reporting and filtering difficulties | Medium | Service options list or autocomplete component | Part2, Part3 |
| P2-09 | `userId` in CitizenRecordsForm is a free-text field with no lookup or autocomplete — validated only via an imperative check outside the Zod schema, inconsistent with the Zod-first pattern | CitizenRecordsForm | Invalid user references possible; `userId` validation is the only field in the codebase validated outside Zod | Part2, Part3 | Medium | Integrate `userId` into Zod schema; add lookup UI | Part2, Part3 |
| P2-10 | No `autoComplete` attributes on any domain form field — missed autofill opportunity for `atendente` role entering repeated citizen data | AppointmentForm, CitizenRecordsForm, MediaContactForm | Slower data entry for staff; no browser autofill for name, email, phone, address fields | Low | Add `autoComplete` attributes per field type | Part2, Part3 |
| P2-11 | `CitizenRegisterPage` password strength rules shown in `PasswordInput` include "special character" but submit validation does not enforce it — visual feedback and actual requirement are inconsistent | CitizenRegisterPage | Users believe they must include a special character but the form accepts passwords without one; trust erosion | Low | Align strength rules with enforced validation rules | Part2 |
| P2-12 | No LGPD consent checkbox in `CitizenRegisterPage` — cookie consent banner present but no explicit data processing consent at registration | CitizenRegisterPage | Regulatory compliance gap for citizen data collection under Brazilian LGPD | Low | Add consent checkbox with required validation | Part3 |

---

### 1.4 🟩 P3 — Optimization & Refinements

| # | Issue | Form Area | System Impact | Effort | Dependencies | Source |
|---|---|---|---|---|---|---|
| P3-01 | No autosave or draft state for long-form content — press release body and event description are at risk of loss on any interruption | PressReleaseForm, EventForm | Content loss risk for the most text-heavy forms; lower severity than P0-03 for shorter forms | High | `localStorage` draft or server-side draft API | Part1, Part3 |
| P3-02 | Auth error messages are vague generic strings (`"Erro ao fazer login"`) — do not distinguish between wrong password, account not found, or account locked | All auth forms | Users cannot self-diagnose auth failures; increased support burden | Medium | Backend error code mapping; i18n key expansion | Part3 |
| P3-03 | `CitizenProfilePage` is read-only — citizens cannot update their own data; instruction to contact the Secretaria is the only recourse | Citizen portal | No self-service capability; increases administrative burden on `atendente` staff | High | New citizen profile edit form + API endpoint | Part3 |
| P3-04 | `EventForm` checkbox touch target is 16px — below WCAG 2.5.5 minimum of 44px | EventForm | Accessibility failure on mobile for the `isPublic` checkbox | Low | CSS touch target expansion | Part2, Part3 |
| P3-05 | No character count on `content` fields with minimum length requirements — users cannot see the 10-character minimum until submit | PressReleaseForm, SocialMediaForm | Unnecessary submit-fail cycle; poor feedback for content-heavy fields | Low | Character count display in `FormField` or `helpText` | Part2, Part3 |
| P3-06 | CPF field displays placeholder `00000000000` (11 unformatted digits) — Brazilian users expect `000.000.000-00` format | AppointmentForm, CitizenRecordsForm | UX friction; format expectation mismatch for government-context users | Low | Input mask or formatted placeholder | Part2 |
| P3-07 | `helpText` in `FormField` renders above the input due to CSS `order: 3` — visually appears below the label, not below the input as users expect | All forms using `helpText` | Unusual but not blocking; help text position is counterintuitive | Low | CSS `order` correction in `FormField.module.css` | Part1, Part2 |
| P3-08 | `ConfirmDialog` confirm button label defaults to `t('common.delete')` — always "Excluir" regardless of the action being confirmed | All uses of `ConfirmDialog` | Misleading confirmation label for non-delete destructive actions (e.g., deactivating a user) | Low | Accept a `confirmLabel` prop | Part2 |
| P3-09 | No time-slot availability check in AppointmentForm — double-booking is possible at the frontend level | AppointmentForm | Scheduling conflicts not surfaced until server rejection; no async availability validation | High | Async availability API call; debounced validation | Part2, Part3 |
| P3-10 | No link between `citizenCpf` in AppointmentForm and an existing CitizenRecord — appointment and citizen record are not cross-referenced | AppointmentForm | Data fragmentation; same citizen may have multiple inconsistent records | High | CPF lookup against CitizenRecords API | Part3 |


---

## 2. Technical Debt Assessment

### 2.1 Debt Table by Category

| Category | Description | Risk if Ignored | Effort Estimate | Priority | Source |
|---|---|---|---|---|---|
| Validation message localization debt | All 7 domain `validate()` functions produce hybrid English/Portuguese messages by concatenating translated field labels with Zod's built-in English issue messages | Users of a government application permanently receive technical English error strings; trust and usability degradation compounds with each new form | 3 dev-days | P0 | Part1, Part3 |
| Schema depth debt | 29 of 46 schema fields (63%) use bare `z.string()` — CPF, phone, email, URL, date fields have no domain-specific rules | Invalid PII (CPF, phone, email) and invalid URLs accumulate in the database; data quality degrades silently over time | 4 dev-days | P0/P1 | Part3 |
| Navigation guard / data loss debt | No form in the codebase implements a dirty-state check before modal close or route change | Silent data loss on every form; highest impact on press release and event content which can be hundreds of characters | 3 dev-days | P0 | Part1, Part3 |
| Cross-field validation debt | Zero cross-field validation rules across all 17 forms — event date range, appointment future-date, password confirmation, press release status transitions all absent | Logically invalid data (past appointments, inverted event dates, unconfirmed passwords) stored without rejection | 4 dev-days | P0/P1 | Part1, Part3 |
| Approval workflow enforcement debt | Press release status transitions are unconstrained at the form level — any user with write access can publish directly from draft | Approval workflow exists only as a convention; bypassed at will from the frontend | 2 dev-days | P0 | Part1, Part2, Part3 |
| Auth form validation debt | 7 of 17 forms have no client-side validation — Login, ForgotPassword, ResetPassword, AcceptInvite, ChangePassword, InviteUser, CitizenLogin rely entirely on server responses | Every empty or malformed submission makes a network request; server load and latency increase; UX degrades on slow connections | 3 dev-days | P1 | Part1, Part3 |
| Token system bypass debt | `PasswordInput` strength colors (4 hardcoded hex values) and `Auth.module.css` (7 hardcoded hex values) bypass the design token system | Visual inconsistency between validation states across auth and domain forms; theme changes require manual updates in multiple files | 1 dev-day | P1 | Part2 |
| Component API gap debt | `PasswordInput` has no `error` prop — field-level error display is architecturally impossible for password fields | All password-related validation errors are permanently banner-level; inline error pattern cannot be applied to auth forms | 1 dev-day | P1 | Part2 |
| Parallel implementation debt | `LoginPage` uses raw `<input>` elements; `LoginForm` uses the `Input` component; `Auth.module.css` `.field` class parallels global `.form-field`; `ContactForm` is entirely isolated | Three separate form implementation patterns increase maintenance surface; improvements to the shared system do not propagate to isolated implementations | 3 dev-days | P1/P2 | Part1, Part2 |
| Status label localization debt | Status and enum `<select>` options display raw TypeScript constant values (`draft`, `no_show`, `social_media`) — no i18n entries exist for these values | Non-technical staff misread or misselect status values; `StatusBadge` also displays raw keys when no `labelMap` is provided | 1 dev-day | P2 | Part1, Part3 |
| Duplicate field logic debt | CPF field attributes duplicated in AppointmentForm and CitizenRecordsForm; phone field duplicated in three forms; password validation logic duplicated in two page components | Changes to CPF/phone/password handling must be applied in multiple places; divergence already observed (special character rule) | 2 dev-days | P2 | Part2, Part3 |
| Validation trigger timing debt | All domain forms validate on submit only — no `onBlur` feedback | Error correction cost is highest on the longest forms (CitizenRecordsForm 9 fields, PressReleaseForm 7 fields); users must submit to discover errors | 2 dev-days | P1 | Part1, Part3 |
| Server error mapping debt | No field-level server error mapping — all server validation errors surface as generic toasts or banners | Server-side rejections (duplicate CPF, invalid email) cannot be surfaced inline; users cannot identify the failing field on multi-field forms | 3 dev-days | P1 | Part2, Part3 |
| Accessibility / compliance debt | `EventForm` checkbox touch target is 16px (WCAG 2.5.5 minimum: 44px); `CitizenRegisterPage` has no LGPD consent checkbox; `FormField` label association not TypeScript-enforced | WCAG failure on mobile; potential LGPD compliance gap for citizen data collection | 2 dev-days | P2/P3 | Part2, Part3 |
| Autosave / draft debt | No autosave or draft state on any form | Press release and event content permanently lost on interruption; no recovery path | 5 dev-days | P3 | Part1, Part3 |

---

### 2.2 Debt Summary

| Metric | Value |
|---|---|
| Total estimated developer-days | **43 dev-days** |
| Confidence level | **Medium** |
| P0 debt (data integrity / submission risk) | ~16 dev-days |
| P1 debt (reliability / maintainability) | ~14 dev-days |
| P2 debt (structural standardization) | ~8 dev-days |
| P3 debt (optimization / refinements) | ~5 dev-days |

**Assumptions:**
- Estimates assume 3–5 frontend engineers with familiarity with the existing `CrudPage` pattern and Zod API.
- Autosave/draft (P3-01) estimate assumes a `localStorage`-based approach; a server-side draft API would add backend effort not counted here.
- Cross-field validation estimates assume Zod `.refine()` / `.superRefine()` — no new library dependencies.
- Server error mapping estimate assumes the backend already returns structured field-level errors; if not, backend work is additional.
- Token replacement estimates assume CSS custom properties are already defined in `src/styles/tokens/index.css` (confirmed by source documents).


---

## 3. Phased Roadmap

> **Team assumption:** 3–5 frontend engineers, 2-week sprints, parallel refactoring allowed for independent forms.
> **Sequencing rationale:** P0 data integrity issues are resolved before standardization work begins. Standardization is completed before performance and resilience work, which depends on a stable validation foundation. Governance work is last, as it requires the preceding phases to be stable.

---

### Phase 1 — Stabilization (Weeks 1–2)

**Goal:** Eliminate data integrity risks, silent data loss, and the most critical validation gaps. Establish a baseline where no form can submit logically invalid PII or bypass the approval workflow.

#### Included Issues

| Issue ID | Title |
|---|---|
| P0-01 | Hybrid English/Portuguese validation messages |
| P0-02 | No navigation guard — silent data loss on modal close |
| P0-04 | CPF fields accept any string |
| P0-05 | Email fields lack Zod format validation |
| P0-06 | Press release status transitions unconstrained |
| P0-07 | `scheduledAt` accepts past dates |
| P0-08 | No end-before-start validation on EventForm |
| P1-07 | `PasswordInput` strength colors hardcoded |
| P1-08 | `Auth.module.css` hardcoded hex values |
| P1-10 | `CitizenPortalForm.tsx` deprecated shim |

#### Effort Estimate

| Work Item | Estimate |
|---|---|
| Zod custom Portuguese messages (all 7 schemas) | 3 dev-days |
| Navigation guard in `CrudPage` | 1 dev-day |
| CPF + email + date Zod refinements | 2 dev-days |
| Press release role-based status filtering | 2 dev-days |
| Token replacement (`PasswordInput` + `Auth.module.css`) | 1 dev-day |
| Remove `CitizenPortalForm.tsx` shim | 0.5 dev-days |
| **Phase 1 Total** | **~9.5 dev-days** |

#### Dependencies

- `pt-BR.json` i18n file must be writable and structured to accept new validation message keys.
- `useAuth` hook must expose the current user's role for press release status filtering.
- CSS custom properties `--color-error`, `--color-success`, `--color-warning` must be confirmed in `src/styles/tokens/index.css` (confirmed by Part 2).

#### Risk Mitigation Impact

- Eliminates the most visible user-facing defect (English error messages in a Portuguese government application).
- Closes the silent data loss vector on all forms.
- Prevents CPF and email garbage data from entering the database.
- Closes the approval workflow bypass for press releases.

#### Business Impact

- Citizen-facing and staff-facing forms become trustworthy for PII collection.
- Press release publication integrity is enforced at the frontend layer.
- Compliance posture improves for government data handling.

---

### Phase 2 — Standardization (Weeks 3–6)

**Goal:** Consolidate validation patterns, normalize error messages and status labels across all modules, enforce cross-field rules, align token usage, and close structural gaps in the component API.

#### Included Issues

| Issue ID | Title |
|---|---|
| P0-03 | No autosave/draft (scoped to navigation guard enhancement — full autosave deferred to Phase 3) |
| P1-01 | Phone fields accept any string |
| P1-02 | URL fields lack format validation |
| P1-03 | Submit-only validation trigger — add `onBlur` |
| P1-04 | No server field-level error mapping |
| P1-05 | `PasswordInput` missing `error` prop |
| P1-06 | Password validation logic duplicated |
| P1-09 | 63% of schema fields use bare `z.string()` |
| P1-11 | `LoginPage` / `LoginForm` parallel implementations |
| P2-01 | Status option labels are raw enum values |
| P2-04 | No password confirmation field |
| P2-05 | `EventForm` checkbox not in `FormField` |
| P2-07 | `state` (UF) free-text input |
| P2-10 | No `autoComplete` on domain form fields |
| P2-11 | Password strength rules inconsistent with enforced validation |
| P2-12 | No LGPD consent checkbox in `CitizenRegisterPage` |

#### Effort Estimate

| Work Item | Estimate |
|---|---|
| Phone + URL Zod refinements (3 schemas) | 1 dev-day |
| `onBlur` validation trigger in `CrudPage` | 1 dev-day |
| Server field-level error mapping layer | 3 dev-days |
| `PasswordInput` `error` prop + inline error display | 1 dev-day |
| Shared password validation utility | 1 dev-day |
| Schema depth pass — remaining bare `z.string()` fields | 3 dev-days |
| `LoginPage` consolidation to `Input` component | 1 dev-day |
| Status label i18n entries + select rendering update | 1 dev-day |
| Password confirmation fields (4 auth forms) | 1.5 dev-days |
| `EventForm` checkbox → `FormField` wrapper | 0.5 dev-days |
| `state` field → UF `<select>` | 0.5 dev-days |
| `autoComplete` attributes on domain forms | 0.5 dev-days |
| Password strength rule alignment | 0.5 dev-days |
| LGPD consent checkbox | 0.5 dev-days |
| **Phase 2 Total** | **~16 dev-days** |

#### Dependencies

- Phase 1 must be complete (Zod custom messages, token alignment, navigation guard).
- Backend must return structured field-level errors for server error mapping to be implementable; if not, this item is blocked on backend work.
- `pt-BR.json` must be extended with status label translations.

#### Risk Mitigation Impact

- Closes the remaining schema depth gaps — all PII fields gain format enforcement.
- Eliminates the parallel implementation maintenance burden.
- Standardizes validation trigger timing across all domain forms.
- Closes the password confirmation gap across all auth flows.
- Addresses LGPD compliance for citizen registration.

#### Business Impact

- Staff data entry quality improves across all 7 modules.
- Auth flows become structurally consistent and maintainable.
- Status labels become readable for non-technical `atendente` and `assessor` staff.

---

### Phase 3 — Performance & Resilience (Weeks 7–10)

**Goal:** Improve form resilience for long-form content, add async validation where domain logic requires it, simplify conditional rendering, and address mobile experience gaps.

#### Included Issues

| Issue ID | Title |
|---|---|
| P0-03 | Autosave / draft state for PressReleaseForm and EventForm |
| P2-02 | Auth pages parallel `.field` class vs. global `.form-field` |
| P2-03 | `ContactForm` isolated from shared component system |
| P2-06 | `FormField` label association not TypeScript-enforced |
| P2-08 | `service` field free text in AppointmentForm |
| P2-09 | `userId` validated outside Zod schema |
| P3-04 | `EventForm` checkbox touch target below WCAG minimum |
| P3-05 | No character count on `content` fields |
| P3-06 | CPF placeholder unformatted |
| P3-07 | `helpText` renders above input |
| P3-08 | `ConfirmDialog` confirm label always "Excluir" |
| P3-09 | No time-slot availability check (async validation) |

#### Effort Estimate

| Work Item | Estimate |
|---|---|
| `localStorage` draft for PressRelease + Event | 3 dev-days |
| Auth page `.field` → global `.form-field` alignment | 1 dev-day |
| `ContactForm` refactor to shared components + Zod | 2 dev-days |
| `FormField` TypeScript label association enforcement | 1 dev-day |
| `service` dropdown / autocomplete in AppointmentForm | 2 dev-days |
| `userId` Zod integration + lookup UI | 2 dev-days |
| Checkbox touch target fix | 0.5 dev-days |
| Character count display | 0.5 dev-days |
| CPF formatted placeholder / mask | 0.5 dev-days |
| `helpText` CSS `order` fix | 0.5 dev-days |
| `ConfirmDialog` `confirmLabel` prop | 0.5 dev-days |
| Async time-slot availability check (debounced) | 3 dev-days |
| **Phase 3 Total** | **~16.5 dev-days** |

#### Dependencies

- Phase 2 must be complete (schema depth, `onBlur` triggers, server error mapping).
- Async availability check requires a backend endpoint for time-slot conflict detection.
- `service` dropdown requires a defined list of available services (product/domain decision).

#### Risk Mitigation Impact

- Eliminates content loss risk for the two most text-heavy forms.
- Closes the double-booking risk at the frontend level.
- Resolves the remaining structural inconsistencies in the component system.
- Addresses the WCAG touch target failure on mobile.

#### Business Impact

- Press release and event workflows become resilient to interruptions.
- Appointment scheduling integrity improves.
- `ContactForm` becomes maintainable within the shared system.

---

### Phase 4 — Forms Governance & Maturity (Weeks 11–14)

**Goal:** Establish governance patterns that prevent regression, expand validation coverage for remaining gaps, and align documentation with the implemented system.

#### Included Issues

| Issue ID | Title |
|---|---|
| P1-04 | Server error mapping — validation and documentation of the pattern |
| P3-01 | Autosave/draft — extend to remaining long-form candidates |
| P3-02 | Auth error message specificity improvement |
| P3-03 | Citizen self-service profile edit form |
| P3-10 | CPF cross-reference between AppointmentForm and CitizenRecords |

#### Effort Estimate

| Work Item | Estimate |
|---|---|
| Server error mapping pattern documentation + enforcement | 1 dev-day |
| Auth error message specificity (i18n + backend alignment) | 2 dev-days |
| Citizen self-service profile edit form | 3 dev-days |
| CPF cross-reference lookup in AppointmentForm | 3 dev-days |
| Validation governance guide (schema conventions, message format, trigger timing) | 1 dev-day |
| **Phase 4 Total** | **~10 dev-days** |

#### Dependencies

- Phase 3 must be complete.
- Citizen profile edit requires a backend PATCH endpoint for citizen self-service.
- CPF cross-reference requires the CitizenRecords API to support CPF lookup.
- Auth error specificity requires backend to return distinguishable error codes.

#### Risk Mitigation Impact

- Prevents regression on validation patterns established in Phases 1–3.
- Closes the citizen self-service gap, reducing `atendente` administrative burden.
- Establishes a governance baseline for future module additions.

#### Business Impact

- Citizens gain self-service capability, reducing Secretaria workload.
- Appointment data integrity improves through CPF cross-referencing.
- New developers have a clear validation contract to follow.


---

## 4. KPIs & Success Metrics

> Metrics are scoped strictly to form reliability and validation consistency as documented in the source documents. Baseline values marked `?` are not quantified in the source documents and require a code audit or monitoring baseline to establish.

| Metric | Current State | Target | Measurement Method | Phase |
|---|---|---|---|---|
| Validation messages in Portuguese | 0% of domain form messages fully in Portuguese (field label translated; Zod message in English) | 100% of all validation messages in Portuguese | i18n audit of all `validate()` function outputs | Phase 1 |
| Schema fields with domain-specific rules | 37% (17 of 46 fields have rules beyond `z.string()`) | ≥ 80% | Zod schema code audit | Phase 2 |
| Forms with navigation guard | 0 of 17 forms | 17 of 17 forms | Code review | Phase 1 |
| Cross-field validation rules implemented | 0 of 5 documented required rules | 5 of 5 | QA tracking against Part 1 §2.3 | Phase 1–2 |
| Status labels translated in `<select>` elements | 0% (all 4 affected forms use raw enum values) | 100% | UI audit across PressRelease, Appointment, SocialMedia, UsersPage | Phase 2 |
| Semantic token usage for validation states (`--color-error`, `--color-success`, `--color-warning`) | Partial — `FormField` and `Input` use tokens; `PasswordInput` (4 hardcoded) and `Auth.module.css` (7 hardcoded) do not | 100% — zero hardcoded color values in form-related CSS/JS | Style audit of all form component files | Phase 1 |
| Forms with `onBlur` validation trigger | 0 of 7 domain forms | 7 of 7 domain forms | Code review | Phase 2 |
| Server field-level error mapping | Not implemented — all server errors surface as generic toasts or banners | Implemented for all domain form mutations | Code review + QA | Phase 2 |
| Password confirmation field coverage | 0 of 4 required forms (Register, CitizenRegister, AcceptInvite, ResetPassword) | 4 of 4 | Code review | Phase 2 |
| `autoComplete` attribute coverage on domain forms | 0% of domain form fields | 100% of applicable fields (name, email, tel, address) | Code audit | Phase 2 |
| Parallel form implementation count | 3 (LoginPage raw inputs, Auth `.field` class, ContactForm isolation) | 0 — all forms use shared component system | Code review | Phase 2–3 |
| Autosave / draft coverage for long-form content | 0 forms | PressReleaseForm + EventForm | Code review + manual test | Phase 3 |
| `FormField` label association TypeScript enforcement | Not enforced — convention only | Compile-time enforcement | TypeScript strict check | Phase 3 |
| LGPD consent checkbox in `CitizenRegisterPage` | Absent | Present and required | Code review + QA | Phase 2 |
| Deprecated dead code (`CitizenPortalForm.tsx`) | Present | Removed | Code review | Phase 1 |

---

## 5. Forms Maturity Score

### 5.1 Dimension Scores

| Dimension | Score | Rationale |
|---|---|---|
| Validation consistency | 28 / 100 | Zod used in 7 of 17 forms; 63% of schema fields have no rules; submit-only triggers; zero cross-field rules; hybrid English messages |
| Schema governance | 45 / 100 | Clean co-located architecture in `src/validation/domain/`; barrel export; consistent `validate()` pattern; but 63% field coverage gap and no auth schemas |
| Data integrity enforcement | 25 / 100 | No navigation guards; no autosave; CPF/phone/email/URL unvalidated; no cross-field rules; no server error field mapping |
| Performance discipline | 70 / 100 | `React.memo` on `FormField` and `Button`; `createPortal` for modals; no expensive computations; no observable re-render issues at current scale |
| Error handling standardization | 30 / 100 | `role="alert"` used consistently; `FormField` error animation respects `prefers-reduced-motion`; but hybrid English messages, banner-only auth errors, no field-level server errors |
| Reusability & abstraction | 55 / 100 | `CrudPage` pattern is strong; `FormField`, `Input`, `Button` are reusable; but `PasswordInput` API gap, `ContactForm` isolation, `LoginPage` raw inputs, parallel `.field` class |
| Multi-step form robustness | 60 / 100 | No multi-step forms exist — not a current risk; `CitizenRecordsForm` section-based layout is adequate; score reflects absence of risk, not presence of capability |
| Localization completeness | 35 / 100 | Field labels fully in Portuguese; auth messages in Portuguese; but Zod messages in English across all 7 domain forms; status labels untranslated; `PasswordInput` strength labels use technical terms |
| Documentation clarity | 65 / 100 | Schema co-location is self-documenting; `emptyForm` constants are clear; but no validation governance guide; deprecated shim has no removal timeline; `FormField` naming convention undocumented |

### 5.2 Overall Score

**Current Maturity Score: 46 / 100**

### 5.3 Maturity Stage

**Current stage: Fragmented → Standardizing**

The codebase sits at the boundary between Fragmented and Standardizing. The domain form layer has a coherent, repeatable structure (`CrudPage`, co-located Zod schemas, `FormField` wrappers) that represents genuine standardization progress. However, the auth form layer, the landing form, and the validation depth gaps pull the overall score into the Fragmented range.

### 5.4 Key Blockers Preventing Advancement to "Structured"

| Blocker | Required Action |
|---|---|
| Hybrid English validation messages | Replace Zod built-in messages with Portuguese custom messages across all 7 schemas |
| Zero cross-field validation | Implement Zod `.refine()` rules for the 5 documented required cross-field constraints |
| Auth form validation absence | Extend Zod (or a shared utility) to cover auth and account management forms |
| No server error field mapping | Implement a field-level error mapping layer in `CrudPage` and auth form handlers |
| Parallel implementations | Consolidate `LoginPage`, `Auth.module.css` `.field` class, and `ContactForm` into the shared system |

---

## 6. Executive Summary

### Overall Forms & Validation Health Score: 46 / 100

---

### Key Strengths

1. **Consistent domain form architecture.** All 7 domain module forms follow the identical `CrudPage<TItem, TForm>` pattern with co-located Zod schemas in `src/validation/domain/`. This uniformity means improvements to the pattern propagate to all 7 modules simultaneously.

2. **Clean schema co-location.** The `src/validation/domain/` directory is a well-structured, barrel-exported validation layer. The `validate(form, t)` function pattern is consistent across all 7 schemas, making the localization fix (P0-01) a targeted, low-risk change.

3. **Solid component foundation.** `FormField`, `Input`, and `Button` are token-compliant, accessibility-aware, and `React.memo`-wrapped. The global form utility classes (`.form-stack`, `.form-grid`, `.form-section`) are adopted consistently across all domain forms, providing a reliable layout foundation for future improvements.

---

### Major Risks

1. **Silent data loss on every form.** No navigation guard exists on any of the 17 forms. Press release body content and event descriptions — potentially hundreds of characters — are permanently discarded on accidental modal close or browser navigation. This is the highest-impact UX risk in the system and affects all roles. *(P0-02, P0-03)*

2. **Invalid PII entering the database.** CPF, phone, email, and URL fields across AppointmentForm, CitizenRecordsForm, MediaContactForm, ClippingForm, and SocialMediaForm have no format validation in their Zod schemas. The system accepts and stores `"abc"` as a valid CPF. For a government communication system handling citizen identity data, this is a data quality and downstream processing risk. *(P0-04, P0-05, P1-01, P1-02)*

3. **Approval workflow bypass.** The press release publication workflow (`draft → review → approved → published`) is enforced only at the API level. Any `assessor` with write access can set status directly to `published` from the frontend, bypassing review and approval. This is a governance and editorial integrity risk for official government communications. *(P0-06)*

---

### Estimated Investment

| Item | Value |
|---|---|
| Total developer-days | ~43 dev-days |
| Timeline (3–5 engineers, 2-week sprints) | 14 weeks across 4 phases |
| Phase 1 (critical stabilization) | ~9.5 dev-days — Weeks 1–2 |
| Phase 2 (standardization) | ~16 dev-days — Weeks 3–6 |
| Phase 3 (performance & resilience) | ~16.5 dev-days — Weeks 7–10 |
| Phase 4 (governance & maturity) | ~10 dev-days — Weeks 11–14 |

**Risk if delayed:**
- Every day without a navigation guard is a day where staff and citizens lose form data silently.
- Every record created with an unvalidated CPF or email degrades the citizen database, and remediation cost grows with record volume.
- Every press release published without approval review is an editorial governance failure for an official government communication channel.

---

### Recommendation

**Moderate forms refactor required.**

The domain form architecture is sound and does not require a structural overhaul. The required work is targeted: replace Zod English messages with Portuguese custom messages, add a navigation guard to `CrudPage`, extend schema depth for PII fields, enforce approval workflow constraints, and consolidate the parallel auth form implementations. Phase 1 alone — approximately 9.5 dev-days — eliminates the three major risks identified above and delivers measurable improvement to form reliability and data integrity across all 7 modules.
