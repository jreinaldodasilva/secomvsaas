# Secom Frontend — Forms, Validation & Data Entry Audit
## Part 3: Validation Architecture, Form UX, Mobile Experience & Secom-Specific Patterns

---

## 5. Validation Architecture & Pattern Analysis

### 5.1 Validation Library Usage

| Context | Library | Location |
|---|---|---|
| Domain forms (7 modules) | Zod (`z.object`, `safeParse`) | `src/validation/domain/*.ts` |
| Citizen register | Inline imperative | `CitizenRegisterPage.tsx` |
| Staff register | None | `RegisterPage.tsx` |
| Contact form (landing) | Inline imperative + regex | `ContactForm.tsx` |
| All auth forms (login, forgot, reset, invite, change password) | None | Respective page files |

Zod is used exclusively in the domain validation layer. Auth and account management forms have no schema-based validation. This split is the primary architectural inconsistency in the validation ecosystem.

### 5.2 Schema Architecture

```
src/validation/domain/
├── index.ts          ← barrel export of all 7 schemas
├── pressRelease.ts   ← pressReleaseSchema + validatePressRelease()
├── appointment.ts    ← appointmentSchema + validateAppointment()
├── event.ts          ← eventSchema + validateEvent()
├── mediaContact.ts   ← mediaContactSchema + validateMediaContact()
├── clipping.ts       ← clippingSchema + validateClipping()
├── citizenPortal.ts  ← citizenSchema + validateCitizen()
└── socialMedia.ts    ← socialMediaSchema + validateSocialMedia()
```

Each file exports:
- A Zod schema object
- A `FormState` TypeScript type inferred from the schema
- An `emptyForm` constant
- A `validate(form, t)` function returning `Record<string, string>`

This is a clean, co-located architecture. All domain validation is centralized in one directory. There is no duplication of schema definitions across files.

### 5.3 Validation Function Pattern

All 7 domain `validate()` functions follow an identical structure:

```typescript
export function validateX(form: XFormState, t: (k: string) => string): Record<string, string> {
  const result = xSchema.safeParse(form);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) errors[field] = `${t(`domain.x.fields.${field}`)} — ${issue.message}`;
  }
  return errors;
}
```

The error message format is: `{translated field label} — {Zod's built-in English message}`.

Example output: `"Título — String must contain at least 5 character(s)"`

This is the most critical localization defect in the validation system. The field label is correctly translated via `t()`, but the Zod message is always in English and uses technical phrasing (`"String must contain at least..."`, `"Invalid enum value"`).

### 5.4 Zod Schema Depth Analysis

| Schema | Fields | Fields with Rules | Fields with Only `z.string()` | Cross-Field Rules |
|---|---|---|---|---|
| `pressReleaseSchema` | 7 | 4 (`title`, `content`, `category`, `status`) | 3 (`subtitle`, `summary`, `tags`) | 0 |
| `appointmentSchema` | 7 | 3 (`citizenName`, `service`, `scheduledAt`) | 4 (`citizenCpf`, `citizenPhone`, `notes`, `status`) | 0 |
| `eventSchema` | 6 | 2 (`title`, `startsAt`) | 4 (`description`, `location`, `endsAt`, `isPublic`*) | 0 |
| `mediaContactSchema` | 6 | 2 (`name`, `outlet`) | 4 (`email`, `phone`, `beat`, `notes`) | 0 |
| `clippingSchema` | 7 | 3 (`title`, `source`, `sentiment`) | 4 (`sourceUrl`, `publishedAt`, `summary`, `tags`) | 0 |
| `citizenSchema` | 9 | 1 (`fullName`) | 8 (`userId`, `cpf`, `phone`, `email`, `address`, `neighborhood`, `city`, `state`) | 0 |
| `socialMediaSchema` | 4 | 2 (`platform`, `content`) | 2 (`mediaUrl`, `scheduledAt`) | 0 |

> *`isPublic` is `z.boolean()` — not a string, but has no additional constraints.

**Key finding:** Across all 7 schemas, 29 out of 46 fields (63%) use bare `z.string()` with no validation rules. This means the Zod layer only enforces presence/type for a minority of fields. The schemas define the shape of the data but do not enforce domain-specific constraints (email format, CPF format, URL format, date ranges, etc.).

### 5.5 Validation Trigger Timing

| Form | onChange | onBlur | onSubmit |
|---|---|---|---|
| All 7 domain forms | ❌ | ❌ | ✅ |
| CitizenRegisterPage | ❌ | ❌ | ✅ |
| RegisterPage | ❌ | ❌ | ✅ |
| ContactForm | ✅ (clears error on change) | ❌ | ✅ |

All forms validate exclusively on submit. The `ContactForm` is the only form that clears individual field errors on `onChange` — a partial progressive disclosure pattern. No form validates on `onBlur`.

The submit-only pattern means users receive no feedback until they attempt to submit, which increases the cost of error correction on longer forms (CitizenRecordsForm with 9 fields, PressReleaseForm with 7 fields).

### 5.6 Server Validation Integration

Server errors are surfaced in two ways:

1. **Toast notifications** — `onError` callback in `CrudPage` calls `toast.error(err.message)`. The `err.message` comes from `ApiError.message`, which is the server's error message string. This is used for all domain form mutations.

2. **Error banners** — Auth forms catch `ApiError` and set a local `error` state string, rendered as a `<div role="alert">` banner above the form.

**No server error is mapped to an individual form field.** If the server returns a field-specific validation error (e.g., `"CPF already registered"`), it appears as a generic toast or banner, not inline next to the relevant field. This is a significant UX gap for forms with many fields.

### 5.7 Error Normalization Layer

There is no dedicated error normalization layer. The `ApiError` class (in `src/services/http.ts`) normalizes HTTP errors into a consistent `{ message, status, code }` shape, but field-level error mapping from server responses to form field errors is not implemented.

---

## 6. Validation Message Quality Review (Portuguese)

### 6.1 Message Inventory

The actual validation messages users see are composed at runtime by the `validate()` functions. The format is:

```
{t(`domain.{module}.fields.{field}`)} — {zod.issue.message}
```

The left side is correctly translated. The right side is always Zod's built-in English message.

### 6.2 Message Quality Table

| Issue | Severity | Example Output | Impact | Scope |
|---|---|---|---|---|
| Zod messages are in English | 🟥 | `"Título — String must contain at least 5 character(s)"` | Users see technical English in a Portuguese government application | All 7 domain forms |
| Zod messages use technical phrasing | 🟧 | `"Categoria — Invalid enum value. Expected 'nota_oficial' \| 'comunicado' \| ..."` | Exposes internal enum values to end users | PressRelease, Clipping, SocialMedia |
| Zod messages include character counts in English | 🟧 | `"Conteúdo — String must contain at least 10 character(s)"` | Grammatically incorrect in Portuguese context | PressRelease, MediaContact, Clipping |
| Vague required-field messages | 🟨 | `"Serviço — Required"` (from `z.string().min(1)` on empty string) | Does not tell user what to enter | Appointment, Event |
| `validateCitizen` has one hardcoded Portuguese message | 🟩 | `"ID do usuário — obrigatório"` | Correct language but inconsistent format with other errors | CitizenRecords |
| `CitizenRegisterPage` inline messages are correct Portuguese | 🟩 | `"O nome deve ter pelo menos 2 caracteres"` | Good — actionable and in Portuguese | CitizenRegister |
| `ContactForm` inline messages are correct Portuguese | 🟩 | `"Nome é obrigatório (mín. 2 caracteres)"` | Good — actionable and in Portuguese | ContactForm |

### 6.3 Auth Error Messages

Auth error messages are sourced from `pt-BR.json` via `t()` keys and are correctly in Portuguese:

| Key | Portuguese Message | Assessment |
|---|---|---|
| `auth.loginError` | `"Erro ao fazer login"` | 🟨 Vague — does not distinguish wrong password from account not found |
| `auth.registerError` | `"Erro ao criar conta"` | 🟨 Vague — server message may be more specific |
| `auth.resetError` | `"Erro ao redefinir senha"` | 🟨 Vague |
| `auth.forgotError` | `"Erro ao enviar e-mail de recuperação"` | 🟨 Vague |
| `auth.acceptInviteError` | `"Erro ao aceitar convite"` | 🟨 Vague |
| `auth.changePasswordError` | `"Erro ao alterar senha"` | 🟨 Vague |
| `auth.sessionExpired` | `"Sua sessão expirou. Por favor, faça login novamente."` | ✅ Clear and actionable |
| `auth.resetInvalidToken` | `"Link de redefinição inválido ou expirado."` | ✅ Clear and actionable |

Auth error messages fall back to these generic strings when `err instanceof ApiError` is false. When `err instanceof ApiError` is true, `err.message` (the server's message) is displayed directly — which may be in English or use technical phrasing depending on the backend implementation.

### 6.4 Status Label Localization Gap

Status option labels in `<select>` elements use raw enum values throughout the codebase:

| Form | Field | Raw Values Displayed |
|---|---|---|
| PressReleaseForm | `status` | `draft`, `review`, `approved`, `published`, `archived` |
| AppointmentForm | `status` | `pending`, `confirmed`, `completed`, `cancelled`, `no_show` |
| SocialMediaForm | `editStatus` | `draft`, `scheduled`, `published`, `failed` |
| UsersPage | role select (inline) | `admin`, `assessor`, `social_media`, `atendente` |

The `pt-BR.json` locale file does not define translations for these status values. The `StatusBadge` component also displays raw status keys when no `labelMap` is provided. This is a systemic gap — status values are defined as TypeScript constants but have no corresponding i18n entries.

---

## 7. Form UX & Data Entry Architecture Evaluation

### 7.1 Field Grouping Quality

| Form | Grouping Strategy | Assessment |
|---|---|---|
| PressReleaseForm | `form-grid` for title/subtitle, category/status; flat stack for content/summary/tags | ✅ Logical — related fields paired |
| AppointmentForm | Two `form-section` blocks: citizen data / scheduling | ✅ Strong — clear semantic separation |
| CitizenRecordsForm | Two `form-section` blocks: identification / address | ✅ Strong — mirrors real-world document structure |
| EventForm | Flat stack with one `form-grid` for dates; checkbox at bottom | ⚠️ Checkbox is outside `FormField` wrapper — inconsistent with other fields |
| MediaContactForm | Two `form-grid` rows (name/outlet, email/phone); flat for beat/notes | ✅ Logical |
| ClippingForm | Flat stack with two `form-grid` rows | ✅ Adequate |
| SocialMediaForm | One `form-grid` for platform/scheduledAt; flat for content/mediaUrl/status | ✅ Adequate |

### 7.2 Multi-Step vs. Single-Page Trade-offs

No form in the codebase is multi-step. All forms are single-page (rendered inside a modal). This is appropriate for the current field counts (2–9 fields). The `CitizenRecordsForm` (9 fields, 2 sections) is the closest candidate for a multi-step approach, but its current section-based layout is adequate.

### 7.3 Progressive Disclosure

Progressive disclosure is implemented only via the `editing` prop pattern — status fields are hidden on create and shown on edit. No other progressive disclosure patterns are present (no "show advanced options", no conditional sections based on field values).

### 7.4 Smart Defaults and Autofill

| Form | Smart Defaults | Autofill Support |
|---|---|---|
| PressReleaseForm | `category: 'comunicado'`, `status: 'draft'` | ❌ No `autoComplete` attributes |
| AppointmentForm | `status: 'pending'` | ❌ No `autoComplete` attributes |
| CitizenRecordsForm | None | ❌ No `autoComplete` attributes |
| EventForm | `isPublic: false` | ❌ No `autoComplete` attributes |
| Auth forms | None | ✅ `autoComplete` set correctly on all fields |
| CitizenRegisterPage | None | ✅ `autoComplete` set correctly |

Domain forms have no `autoComplete` attributes. This is a missed opportunity for browser autofill on fields like `email`, `tel`, and `name` in the citizen records and appointment forms — particularly relevant for the `atendente` role who may enter the same citizen's data repeatedly.

### 7.5 Autosave and Draft Behavior

No form in the codebase implements autosave or draft state. All form state is held in React `useState` within `CrudPage` and is lost when the modal closes. This is the most significant data-entry risk in the system.

### 7.6 Error Summary vs. Inline Feedback

| Form | Error Display Strategy |
|---|---|
| Domain forms (via `CrudPage`) | Inline — `FormField` renders error below each field |
| Auth forms | Banner — single `<div role="alert">` above the form |
| CitizenRegisterPage | Banner — single error string |
| ContactForm | Inline — per-field `<span role="alert">` |

Domain forms use inline errors (correct pattern for multi-field forms). Auth forms use banners (acceptable for 2-field forms). There is no error summary component for forms with many simultaneous errors.

### 7.7 Duplicate Field Logic

| Duplication | Forms Affected | Risk |
|---|---|---|
| CPF field (type, maxLength, inputMode, placeholder) | AppointmentForm, CitizenRecordsForm | 🟨 Medium — changes must be made in two places |
| Phone field (type, inputMode) | AppointmentForm, CitizenRecordsForm, MediaContactForm | 🟨 Medium |
| Password validation rules | CitizenRegisterPage, RegisterPage | 🟧 High — different implementations of the same rules |
| Email field | CitizenRecordsForm, MediaContactForm | 🟩 Low — simple field, low divergence risk |

---

## 8. Data Entry Risk Analysis

| Issue | Severity | Evidence | UX Impact | Business Risk |
|---|---|---|---|---|
| No navigation guard on any form | 🟥 | `CrudPage` modal close has no unsaved-changes check | Silent data loss on accidental modal close or browser back | Data loss; user frustration; re-entry required |
| No autosave or draft state | 🟥 | No `localStorage` or server-draft logic anywhere | Long-form content (press release body) lost on any interruption | Content loss for press release and event forms |
| CPF accepts any string | 🟧 | `z.string()` in `appointmentSchema`, `citizenSchema` | Invalid CPF data stored in database | Data quality degradation; downstream processing failures |
| Phone accepts any string | 🟧 | `z.string()` in all three schemas | Invalid phone data stored | Contact failures |
| Email in domain forms has no format validation | 🟧 | `z.string()` (not `.email()`) in `citizenSchema`, `mediaContactSchema` | Invalid emails stored | Communication failures |
| URL fields have no format validation | 🟧 | `z.string()` in `clippingSchema.sourceUrl`, `socialMediaSchema.mediaUrl` | Invalid URLs stored | Broken links in clipping and social media records |
| `scheduledAt` accepts past dates | 🟧 | `z.string().min(1)` — any non-empty string passes | Appointments can be created in the past | Scheduling integrity issues |
| No end-before-start validation on events | 🟧 | `eventSchema` has no cross-field rule | Events with `endsAt` before `startsAt` can be created | Calendar display errors; logical inconsistency |
| Status transitions unconstrained | 🟧 | `status` is a free `z.enum()` — any value selectable | Press releases can be published without review | Approval workflow bypass |
| No confirmation on modal close with dirty form | 🟧 | `CrudPage` `onClose={() => setModalOpen(false)}` — no dirty check | Users lose work without warning | Data loss |
| Delete confirmation present for all destructive actions | ✅ | `ConfirmDialog` used in `CrudPage` and `UsersPage` | — | — |
| `service` field in appointments is free text | 🟨 | `<input type="text">` with no options | Inconsistent service names across records | Reporting and filtering difficulties |
| `state` (UF) field is free text | 🟨 | `<input type="text" maxLength={2}>` | Invalid state codes possible | Address data quality |
| Status option labels are raw enum values | 🟨 | All status `<select>` elements | Poor readability for non-technical staff | User confusion; incorrect status selection |
| `CitizenPortalForm.tsx` is a deprecated shim | 🟨 | File comment: "can be deleted once all references are updated" | Dead code risk | Maintenance confusion |

---

## 9. Mobile Form Experience Overview

### 9.1 Layout Responsiveness

The `form-grid` class collapses from 2 columns to 1 column at `max-width: 600px` (defined in `global.css`). This is the primary responsive behavior for all domain forms. All forms are rendered inside `Modal` components, which are full-width on mobile.

### 9.2 Mobile-Friendly Forms

| Form | Mobile Assessment | Strengths |
|---|---|---|
| Staff Login | ✅ Good | 2 fields; `autoComplete`; `autoFocus`; `type="email"` |
| Citizen Login | ✅ Good | 2 fields; `autoComplete`; `type="email"` |
| Citizen Register | ✅ Good | 3 fields; `autoComplete`; `showStrength` indicator |
| Forgot Password | ✅ Good | 1 field; `autoComplete`; `autoFocus` |
| AppointmentForm | 🟨 Adequate | `inputMode` on CPF/phone; `type="datetime-local"` |
| MediaContactForm | 🟨 Adequate | `inputMode="tel"` on phone; `type="email"` on email |

### 9.3 Most Problematic Forms on Mobile

| Form | Issues |
|---|---|
| PressReleaseForm | `content` textarea (6 rows) requires significant scroll; no sticky submit button |
| CitizenRecordsForm | 9 fields across 2 sections; no `autoComplete`; no CEP autofill |
| EventForm | `type="datetime-local"` inconsistent across mobile browsers; checkbox not in `FormField` |
| SocialMediaForm | `content` textarea (4 rows); no character count for platform-specific limits |

### 9.4 Touch Target Sizes

- `Button` component: `--button-height-md: 2.75rem` (44px) — meets WCAG 2.5.5 minimum
- `Button` sm variant: overridden to `min-height: 2.75rem` on mobile via `global.css` media query — correct
- Form inputs: `--input-height-md: 2.75rem` (44px) — meets WCAG 2.5.5 minimum
- `EventForm` checkbox: `width: 1rem; height: 1rem` (16px) — **below WCAG 2.5.5 minimum of 44px**. The `accent-color` styling is correct but the touch target is too small.

### 9.5 iOS Zoom Prevention

`--input-font-size: 16px` is defined in tokens and applied in `Input.module.css`. The `global.css` media query sets `font-size: 16px` on all input types at `max-width: 767px`. This correctly prevents iOS auto-zoom on input focus.

However, domain form inputs (raw `<input>` elements inside `FormField`) inherit font size from `.form-stack input` in `global.css`, which sets `font-size: var(--font-size-base)` (1rem = 16px). This is correct.

### 9.6 Scroll Fatigue Risk

| Form | Field Count | Sections | Scroll Risk |
|---|---|---|---|
| CitizenRecordsForm | 9 | 2 | 🟧 High — longest form in the system |
| PressReleaseForm | 7–8 | 0 | 🟨 Medium — `content` textarea adds height |
| AppointmentForm | 6–7 | 2 | 🟨 Medium — two sections add padding |
| All others | 2–6 | 0–1 | 🟩 Low |

### 9.7 Performance Considerations

All domain forms are rendered inside `Modal` components, which use `createPortal`. Form state is held in `CrudPage`'s `useState` — no expensive computations on render. `FormField` and `Button` are `React.memo`-wrapped. No performance concerns are observable for the current field counts.

---

## 10. Secom-Specific Patterns

### 10.1 Role-Based Form Behavior

Role-based form behavior is implemented at three levels:

**Level 1 — Route access (enforced):** Users without the required permission cannot reach the page. `CrudPage` receives `writePermission` and `deletePermission` props and uses `hasPermission(user.role, permission)` to show/hide create and delete buttons.

**Level 2 — Edit-mode conditional fields (enforced):** Status fields are hidden on create and shown on edit via the `editing` prop. This is consistent across all 4 forms that have status fields.

**Level 3 — Role-specific field visibility within a form (not implemented):** No form component checks the current user's role to show or hide individual fields. For example, the `status` field in `PressReleaseForm` is visible to all users with write access — there is no distinction between an `assessor` (who should only move to `review`) and an `admin` (who can approve and publish).

### 10.2 Approval Workflow Analysis

The press release approval workflow (`draft → review → approved → published → archived`) is defined as a constant in `pressRelease.ts` but is not enforced at the form level:

```typescript
export const PRESS_RELEASE_STATUSES = ['draft', 'review', 'approved', 'published', 'archived'] as const;
```

The `status` select renders all 5 options for any user with write access. There is no:
- Filtering of available next-states based on current state
- Role-based restriction of which states a given role can set
- Confirmation step before publishing

This means an `assessor` with write access can set status to `published` directly, bypassing the review and approval steps. The workflow constraint exists only at the API level (if enforced there).

### 10.3 Citizen Portal Separation Assessment

| Dimension | Separation | Evidence |
|---|---|---|
| Auth context | ✅ Fully separate | `CitizenAuthContext` vs. `AuthContext` |
| Route guards | ✅ Fully separate | `ProtectedCitizenRoute` vs. `ProtectedRoute` |
| Layout | ✅ Fully separate | `CitizenPortalLayout` vs. `DashboardLayout` |
| URL namespace | ✅ Fully separate | `/portal/*` vs. `/admin/*` and domain routes |
| Visual style | ✅ Separate | `Auth.module.css` + `CitizenPortal.module.css` vs. dashboard styles |
| Form components | ⚠️ Partial | Citizen auth forms use `PasswordInput` and `Button` from shared UI — appropriate reuse |
| Shared component usage | ⚠️ Partial | `CitizenDashboardPage`, `CitizenProfilePage` do not use `Card` component — reimplement card surfaces locally |
| Self-service profile editing | ❌ Absent | `CitizenProfilePage` is read-only; no edit form for citizens to update their own data |

### 10.4 Appointment Booking — Domain-Specific Gaps

The appointment booking form (`AppointmentForm`) is used by `atendente` staff to book appointments on behalf of citizens. It is not a self-service citizen form. Key domain-specific gaps:

| Gap | Impact |
|---|---|
| No time-slot availability check | Double-booking possible |
| No future-date enforcement on `scheduledAt` | Past appointments can be created |
| `service` is free text | Inconsistent service names across records |
| No link between `citizenCpf` and an existing citizen record | Appointment and citizen record are not cross-referenced |
| Status labels are raw enum values (`no_show`) | Staff confusion |

### 10.5 Citizen Portal — Accessibility for Limited Digital Literacy

The citizen-facing forms (`CitizenLoginPage`, `CitizenRegisterPage`) are the entry points for citizens who may have limited digital literacy. Assessment:

| Dimension | Assessment |
|---|---|
| Field count | ✅ Minimal (2–3 fields) |
| Labels | ✅ Clear Portuguese labels with `htmlFor` association |
| Error messages | ⚠️ Banner-level only — not field-level |
| Password strength indicator | ⚠️ Adds complexity; rules shown in English-influenced technical terms ("Letra maiúscula", "Caractere especial") |
| Help text | ❌ No contextual help text on any citizen-facing field |
| LGPD consent | ⚠️ Cookie consent banner present; no explicit LGPD consent checkbox in registration form |
| `CitizenProfilePage` | ❌ Read-only with instruction to contact the Secretaria — no self-service |

---

## 11. High-Level Recommendations

### 11.1 Critical Priority

| Recommendation | Rationale | Affected Scope |
|---|---|---|
| Replace Zod's built-in English messages with Portuguese custom messages in all `validate()` functions | Current messages are technically English and expose internal Zod phrasing to users | All 7 domain forms |
| Add navigation guard (dirty-state check) before modal close and route change | Silent data loss is the highest-impact UX risk in the system | All forms via `CrudPage` |
| Add format validation for CPF, phone, email, and URL fields in Zod schemas | 63% of schema fields have no validation rules | Appointment, CitizenRecords, MediaContacts, Clippings, SocialMedia |

### 11.2 High Priority

| Recommendation | Rationale | Affected Scope |
|---|---|---|
| Add translated labels for all status and enum `<select>` options | Raw enum values (`no_show`, `draft`, `social_media`) are not user-friendly | PressRelease, Appointment, SocialMedia, UsersPage |
| Add cross-field validation for date ranges and password confirmation | Event end-before-start, appointment past-date, and password confirm are missing | Event, Appointment, Register, CitizenRegister, ResetPassword |
| Implement role-based status transition constraints in `PressReleaseForm` | Approval workflow can be bypassed at the frontend level | PressRelease |
| Add `autoComplete` attributes to domain form fields where applicable | Improves data entry speed for `atendente` role entering repeated citizen data | Appointment, CitizenRecords |
| Map server field-level errors to form fields | Server validation errors currently appear only as generic toasts | All domain forms |

### 11.3 Medium Priority

| Recommendation | Rationale | Affected Scope |
|---|---|---|
| Add `onBlur` validation trigger to domain forms | Submit-only validation increases error correction cost on longer forms | All domain forms |
| Replace `state` (UF) free-text input with a `<select>` of Brazilian state codes | Prevents invalid state entries | CitizenRecords |
| Add a `service` dropdown (or autocomplete) to `AppointmentForm` | Free-text service names produce inconsistent data | Appointment |
| Consolidate password validation logic into a shared utility | Duplicate implementations in `CitizenRegisterPage` and `RegisterPage` | Auth forms |
| Remove `CitizenPortalForm.tsx` deprecated shim | Dead code; maintenance confusion | CitizenPortal module |
| Add `error` prop to `PasswordInput` | Enables inline field-level error display for password fields | Auth forms |

### 11.4 Low Priority

| Recommendation | Rationale | Affected Scope |
|---|---|---|
| Add autosave or draft state for long-form content | Press release `content` and event `description` are at risk of loss | PressRelease, Event |
| Increase checkbox touch target in `EventForm` | Current 16px target is below WCAG 2.5.5 minimum | EventForm |
| Add character count to `content` fields with minimum length requirements | Users cannot see the 10-character minimum until submit | PressRelease |
| Add LGPD consent checkbox to `CitizenRegisterPage` | Explicit consent collection for citizen data | CitizenRegister |
| Tokenize `PasswordInput` strength indicator colors | 4 hardcoded hex values bypass the design token system | PasswordInput |
| Add `autoComplete` attributes to auth page inputs in `Auth.module.css` forms | Already present on most; verify completeness | Auth forms |
| Consider a self-service profile edit form for citizens | `CitizenProfilePage` is read-only; citizens cannot update their own data | Citizen portal |
