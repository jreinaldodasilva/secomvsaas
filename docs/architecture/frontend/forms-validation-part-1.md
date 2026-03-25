# Secom Frontend — Forms, Validation & Data Entry Audit
## Part 1: Executive Summary & Form Inventory

> **Document scope:** Static analysis of the frontend source tree.
> All findings are grounded in observable code. Speculative assumptions are explicitly marked.
> This document cross-references `overview-part1.md`, `component-library-part-1.md`, `component-library-part-2.md`, and `navigation-userflows-part-1.md`. Findings already established in those documents are not re-documented here.

---

## 1. Executive Summary

### 1.1 Overall Assessment

The Secom frontend form ecosystem is **structurally uniform and architecturally sound** for its scope. All seven domain module forms follow an identical pattern, driven by the `CrudPage<TItem, TForm>` generic abstraction. This uniformity is the ecosystem's greatest strength and its most significant constraint.

| Dimension | Rating | Summary |
|---|---|---|
| Form ecosystem maturity | 🟨 Moderate | Consistent structure; validation depth is shallow |
| Validation robustness | 🟧 Partial | Zod schemas present but underutilized; many fields lack rules |
| Accessibility level | 🟧 Partial | Core primitives are compliant; auth forms and citizen portal have gaps |
| Localization completeness | 🟨 Moderate | Field labels fully localized; validation messages are hybrid (Zod English + i18n key prefix) |
| Mobile readiness | 🟨 Moderate | Layout collapses correctly; `inputMode` used selectively; no autofill on domain forms |
| Data-entry risk profile | 🟧 Elevated | No navigation guards on any form; no autosave; no draft state |
| Scalability readiness | 🟩 Good | CrudPage pattern scales cleanly; validation schema co-location is maintainable |

### 1.2 Critical Findings Summary

| Severity | Finding | Scope |
|---|---|---|
| 🟥 | Validation messages are hybrid: Zod's built-in English messages are appended to i18n field name keys, producing strings like `"Título — String must contain at least 5 character(s)"` | All 7 domain forms |
| 🟥 | No navigation guard on any form — unsaved data is silently lost on modal close or route change | All forms |
| 🟧 | CPF fields accept any string — no format validation (11 digits, check digit) | Appointments, CitizenRecords |
| 🟧 | Phone fields accept any string — no format or length validation | Appointments, CitizenRecords, MediaContacts |
| 🟧 | Email fields in domain forms have no format validation in the Zod schema | CitizenRecords, MediaContacts |
| 🟧 | URL fields (`sourceUrl`, `mediaUrl`) have no format validation | Clippings, SocialMedia |
| 🟧 | `status` field on press releases is editable by all roles with write access — no approval workflow constraint at the form level | PressReleases |
| 🟧 | Validation triggers only on submit — no `onBlur` or `onChange` feedback | All domain forms |
| 🟧 | `CitizenPortalForm.tsx` is a deprecated re-export shim that should be removed | CitizenPortal module |
| 🟨 | Status option labels in select elements use raw enum values (e.g., `"no_show"`, `"draft"`) instead of translated labels | Appointments, PressReleases, SocialMedia |
| 🟨 | `ContactForm` (landing page) is entirely isolated from the shared component system | Landing page |
| 🟨 | `CitizenProfilePage` is read-only with no self-service edit capability | Citizen portal |
| 🟩 | `helpText` in `FormField` renders above the input (CSS `order: 3`) — unusual but not blocking | All forms using `helpText` |

### 1.3 Secom-Specific Summary

- **Module coverage:** All 7 modules have forms. Structure is consistent. Validation depth varies.
- **Citizen portal separation:** Structurally enforced at layout, auth context, and route levels. Citizen-facing forms (`CitizenRegisterPage`, `CitizenLoginPage`) use a distinct visual style (`Auth.module.css`) but share the same `PasswordInput` component.
- **Approval workflows:** The press release status field is conditionally shown only in edit mode, which is a partial constraint. No field-level enforcement of valid status transitions (e.g., preventing a direct jump from `draft` to `published`) exists in the frontend.
- **Role-based fields:** Conditional fields are handled via the `editing` prop pattern (status fields hidden on create). No role-based field visibility is implemented at the form component level — role enforcement is at the route and API levels.

---

## 2. Form Inventory

### 2.1 Complete Form Inventory Table

| Form Name | Location | Role(s) | Field Count | Validation Strategy | Multi-Step | Dynamic Fields | Primary Issues |
|---|---|---|---|---|---|---|---|
| Staff Login | `pages/Login/LoginPage.tsx` | All staff | 2 | None (submit-only, server errors) | No | No | No client-side validation; raw `<input>` not using `Input` component |
| Citizen Login | `pages/CitizenPortal/CitizenLoginPage.tsx` | citizen | 2 | None (submit-only, server errors) | No | No | No client-side validation |
| Staff Register | `pages/Register/RegisterPage.tsx` | Public | 4 | Inline (submit-only) | No | No | No schema; no email format check; no password confirm field |
| Citizen Register | `pages/CitizenPortal/CitizenRegisterPage.tsx` | citizen | 3 | Inline imperative (submit-only) | No | No | Isolated validation logic; no email format check; no password confirm |
| Forgot Password | `pages/ForgotPassword/ForgotPasswordPage.tsx` | All | 1 | None (submit-only) | No | No | No email format validation |
| Reset Password | `pages/ResetPassword/ResetPasswordPage.tsx` | All | 1 | None (submit-only) | No | No | No password confirm field; no strength enforcement |
| Accept Invite | `pages/AcceptInvite/AcceptInvitePage.tsx` | All | 2 | None (submit-only) | No | No | No password confirm field |
| Change Password | `pages/Settings/ProfilePage.tsx` | All staff | 2 | None (submit-only) | No | No | No current-password strength check; no confirm field |
| Invite User | `pages/Admin/Users/UsersPage.tsx` (modal) | admin, super_admin | 2 | None (submit-only) | No | No | No email format validation; role options show raw enum values |
| Press Release Create/Edit | `pages/Domain/PressReleases/PressReleaseForm.tsx` | assessor, admin, super_admin | 7 (create) / 8 (edit) | Zod schema + `validatePressRelease()` | No | Yes (`status` on edit only) | Zod English messages; no approval workflow constraint; status labels are raw enum values |
| Media Contact Create/Edit | `pages/Domain/MediaContacts/MediaContactForm.tsx` | assessor, admin, super_admin | 6 | Zod schema + `validateMediaContact()` | No | No | No email/phone format validation in schema |
| Clipping Create/Edit | `pages/Domain/Clippings/ClippingForm.tsx` | assessor, admin, super_admin | 7 | Zod schema + `validateClipping()` | No | No | No URL format validation; no date range constraint |
| Event Create/Edit | `pages/Domain/Events/EventForm.tsx` | assessor, admin, super_admin | 6 | Zod schema + `validateEvent()` | No | No | No end-before-start cross-field validation; checkbox not wrapped in `FormField` |
| Appointment Create/Edit | `pages/Domain/Appointments/AppointmentForm.tsx` | atendente, admin, super_admin | 6 (create) / 7 (edit) | Zod schema + `validateAppointment()` | No | Yes (`status` on edit only) | No CPF/phone format validation; no time-slot availability check; status labels are raw enum values |
| Citizen Record Create/Edit | `pages/Domain/CitizenRecords/CitizenRecordsForm.tsx` | atendente, admin, super_admin | 9 (create) / 8 (edit) | Zod schema + `validateCitizen()` | No | Yes (`userId` on create only) | No CPF/email/phone format validation; `userId` is a free-text field |
| Social Media Create/Edit | `pages/Domain/SocialMedia/SocialMediaForm.tsx` | social_media, admin, super_admin | 4 (create) / 5 (edit) | Zod schema + `validateSocialMedia()` | No | Yes (`status` on edit only) | No URL format validation; platform/status labels are raw enum values; `editStatus` is outside the Zod schema |
| Contact Form (Landing) | `components/ContactForm/ContactForm.tsx` | Public | 5 | Inline imperative (submit-only) | No | No | Entirely isolated from shared component system; simulated submission (no real API call) |

### 2.2 Aggregate Metrics

| Metric | Value |
|---|---|
| Total forms identified | 17 |
| Domain module forms (CrudPage pattern) | 7 |
| Auth/account forms | 7 |
| Admin utility forms | 1 (Invite User) |
| Public/landing forms | 1 (Contact Form) |
| Multi-step forms | 0 |
| Forms with dynamic fields | 4 (PressRelease, Appointment, CitizenRecord, SocialMedia) |
| Forms using Zod schemas | 7 (all domain forms) |
| Forms with inline imperative validation | 3 (CitizenRegister, ContactForm, RegisterPage) |
| Forms with no client-side validation | 7 (Login, CitizenLogin, ForgotPassword, ResetPassword, AcceptInvite, ChangePassword, InviteUser) |
| Average field count (domain forms) | 6.4 |
| Average field count (auth forms) | 2.3 |
| Most complex form (field count) | CitizenRecordsForm — 9 fields (create mode) |
| Most complex form (logic density) | AppointmentForm — 2 sections, conditional status, `inputMode` hints, datetime conversion in `buildPayload` |

### 2.3 Forms with Cross-Field Validation

| Form | Cross-Field Rule | Implemented? |
|---|---|---|
| Event | `endsAt` must be after `startsAt` | ❌ No |
| Appointment | `scheduledAt` must be in the future | ❌ No |
| Register / CitizenRegister / AcceptInvite / ResetPassword | Password confirmation match | ❌ No |
| CitizenRecord | `userId` must reference a valid user | ❌ No (free-text field) |
| PressRelease | Status transitions must follow workflow order | ❌ No |

No form in the codebase implements cross-field validation. This is the most significant validation gap.

### 2.4 Forms with Conditional Role-Based Fields

Role-based field visibility is not implemented at the form component level. The `editing` prop drives conditional field display (status fields hidden on create). Role-based field differences are enforced at the route level, not within form components.

| Form | Conditional Field | Condition |
|---|---|---|
| PressReleaseForm | `status` select | `editing === true` |
| AppointmentForm | `status` select | `editing === true` |
| SocialMediaForm | `editStatus` select | `editing === true` |
| CitizenRecordsForm | `userId` input | `editing === false` |

### 2.5 Module Consistency Assessment

All 7 domain forms share the same structural pattern:
- `form-stack` root class
- `form-grid` for paired fields
- `FormField` wrapper for each field
- `form-actions` submit row with a single `Button`
- Validation via `validate(form, t)` called in `CrudPage.handleSubmit`

This consistency is a significant maintainability strength. The only structural divergence is `AppointmentForm` and `CitizenRecordsForm`, which use `form-section` groupings — the most complex forms in the domain set.

**Citizen-facing vs. staff forms:** Citizen-facing auth forms (`CitizenLoginPage`, `CitizenRegisterPage`) use `Auth.module.css` scoped styles, which is visually and structurally distinct from the staff dashboard forms. The staff-facing citizen record management form (`CitizenRecordsForm`) uses the same `.form-stack` pattern as all other domain forms — it is not visually differentiated from other staff forms.
