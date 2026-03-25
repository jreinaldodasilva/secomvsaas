# Forms & Validation Quick Wins
## Secom — Secretaria de Comunicação

> **Source documents:** `forms-validation-part-1.md`, `forms-validation-part-2.md`, `forms-validation-part-3.md`
> **Scope:** Low-effort improvements directly supported by the source documents.
> **Criteria:** Each quick win is independently deliverable, requires no new dependencies, and produces measurable improvement to form reliability, validation consistency, or data-entry integrity.

---

## Quick Win #1: Replace Zod English Messages with Portuguese Custom Messages

**Form/Validation Problem**
All 7 domain `validate()` functions produce hybrid messages by concatenating a translated field label with Zod's built-in English issue message. Users see strings like `"Título — String must contain at least 5 character(s)"` and `"Categoria — Invalid enum value. Expected 'nota_oficial' | 'comunicado' | ..."`. This is the most visible validation defect in the system — a Portuguese government application surfacing technical English to all staff roles.

**Impact**
Affects every validation error shown across all 7 domain modules (PressReleases, MediaContacts, Clippings, Events, Appointments, CitizenRecords, SocialMedia). Non-technical staff (`atendente`, `assessor`, `social_media`) cannot act on English Zod phrasing. Enum exposure (`"Invalid enum value. Expected 'nota_oficial' | ..."`) leaks internal constants to end users.

**Effort**
2–3 dev-days

**Implementation Steps**
1. In each of the 7 `validate()` functions in `src/validation/domain/*.ts`, replace the `issue.message` concatenation with a `t()` call using a structured i18n key (e.g., `t('validation.minLength', { min: 5 })`).
2. Add the corresponding Portuguese message entries to `pt-BR.json` for each validation rule type used across the schemas (`minLength`, `required`, `invalidEnum`, `invalidEmail`, `invalidUrl`, `invalidFormat`).
3. For enum fields, replace the raw Zod enum message with a generic Portuguese string (e.g., `"Selecione uma opção válida"`) — do not expose enum values.

**Risk Level**
Low — changes are isolated to `src/validation/domain/*.ts` and `pt-BR.json`. No component changes required. The `validate()` function signature is unchanged.

**Source**
Part1 §1.2, Part3 §5.3, Part3 §6.1, Part3 §6.2

---

## Quick Win #2: Add Navigation Guard to `CrudPage` Modal Close

**Form/Validation Problem**
No form in the codebase implements a dirty-state check before modal close. `CrudPage`'s `onClose` handler calls `setModalOpen(false)` directly with no unsaved-changes check. All form state is held in `useState` and is permanently discarded on modal close. This affects all 17 forms — press release body content, event descriptions, and citizen PII are silently lost.

**Impact**
Silent data loss is the highest-impact UX risk in the system. The `CrudPage` pattern is used by all 7 domain modules, so a single fix propagates to all of them simultaneously. The `atendente` role entering citizen records (9 fields) and the `assessor` role writing press release content are the most affected.

**Effort**
1 dev-day

**Implementation Steps**
1. In `CrudPage`, track whether the form has been modified since it was opened (compare current form state to `emptyForm` or the original record).
2. On modal close (X button, overlay click, or `Escape`), if the form is dirty, show a `ConfirmDialog` asking the user to confirm discarding changes.
3. If the user confirms, proceed with close and reset form state. If they cancel, keep the modal open.

**Risk Level**
Low — `CrudPage` is the single entry point for all domain form modals. The `ConfirmDialog` component already exists and is used for delete confirmations.

**Source**
Part1 §1.2, Part1 §2.1, Part2 §4.1, Part3 §7.5, Part3 §8

---

## Quick Win #3: Add Zod Format Validation for CPF, Email, and URL Fields

**Form/Validation Problem**
29 of 46 schema fields (63%) use bare `z.string()` with no validation rules. The most critical gaps are: CPF fields accept any string (including `"abc"`); email fields in `citizenSchema` and `mediaContactSchema` use `z.string()` without `.email()`; URL fields in `clippingSchema.sourceUrl` and `socialMediaSchema.mediaUrl` use `z.string()` without `.url()`. The `CitizenRecordsForm` email field uses `type="email"` for browser-level validation but the Zod schema does not enforce it — programmatic or non-browser submissions bypass the check entirely.

**Impact**
Invalid PII (CPF, email) and invalid URLs are stored in the database without rejection. Affects AppointmentForm, CitizenRecordsForm, MediaContactForm (email/phone), ClippingForm (URL), and SocialMediaForm (URL). For a government system handling citizen identity data, this is a data quality and downstream processing risk.

**Effort**
2 dev-days

**Implementation Steps**
1. In `appointmentSchema` and `citizenSchema`, add a CPF format refinement: 11 digits, numeric only, with check digit validation (a standard Brazilian CPF algorithm).
2. In `citizenSchema` and `mediaContactSchema`, replace `z.string()` with `z.string().email()` on email fields.
3. In `clippingSchema` and `socialMediaSchema`, replace `z.string()` with `z.string().url()` on URL fields.
4. Ensure all new Zod refinements use custom Portuguese messages (aligned with Quick Win #1).

**Risk Level**
Low — schema changes are isolated to `src/validation/domain/*.ts`. No component changes required. Existing valid data is unaffected; only new submissions are validated.

**Source**
Part1 §1.2, Part1 §2.3, Part2 §4.3, Part3 §5.4, Part3 §8

---

## Quick Win #4: Translate Status and Enum `<select>` Option Labels

**Form/Validation Problem**
All status `<select>` elements across PressReleaseForm, AppointmentForm, SocialMediaForm, and the UsersPage role select display raw TypeScript constant values: `draft`, `review`, `approved`, `published`, `archived`, `pending`, `confirmed`, `completed`, `cancelled`, `no_show`, `scheduled`, `failed`, `admin`, `assessor`, `social_media`, `atendente`. The `pt-BR.json` locale file has no translations for these values. `StatusBadge` also displays raw keys when no `labelMap` is provided.

**Impact**
Non-technical staff (`atendente`, `assessor`, `social_media`) cannot reliably interpret status options. `no_show` is particularly opaque. Incorrect status selection risk is highest for `atendente` staff managing appointment statuses and `assessor` staff managing press release workflow states.

**Effort**
1 dev-day

**Implementation Steps**
1. Add translation entries to `pt-BR.json` for all status and role enum values (e.g., `"status.draft": "Rascunho"`, `"status.no_show": "Não compareceu"`, `"role.assessor": "Assessor de Imprensa"`).
2. Update each `<select>` option rendering to use `t()` for the display label while keeping the raw enum value as the `value` attribute.
3. Update `StatusBadge` to use the same i18n keys when no `labelMap` is provided.

**Risk Level**
Low — display-only change. The `value` attribute of each `<option>` remains the raw enum string; only the visible label changes. No schema or API changes required.

**Source**
Part1 §1.2, Part1 §2.1, Part2 §3.1, Part3 §6.4

---

## Quick Win #5: Replace Hardcoded Colors with Semantic Tokens in `PasswordInput` and `Auth.module.css`

**Form/Validation Problem**
`PasswordInput.tsx` uses 4 hardcoded hex values for the strength indicator (`#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60`). These do not match the semantic token values (`--color-error: #D32F2F`). `Auth.module.css` contains 7 hardcoded hex values for error, info, and success banners. Both bypass the design token system defined in `src/styles/tokens/index.css`. `PasswordInput` is used in 6 auth forms; `Auth.module.css` is used by all auth pages.

**Impact**
Visual inconsistency between the strength indicator and other error states across all auth forms. Theme changes or design system updates require manual edits in multiple files instead of a single token update. The mismatch is observable: the strength indicator's "error" red (`#e74c3c`) differs from the form error red (`#D32F2F`).

**Effort**
1 dev-day

**Implementation Steps**
1. In `PasswordInput.tsx`, replace the 4 hardcoded hex values with references to `--color-error`, `--color-warning`, `--color-success` CSS custom properties (via inline style or a CSS Module class per strength level).
2. In `Auth.module.css`, replace the 7 hardcoded hex values with `var(--color-error)`, `var(--color-success)`, `var(--color-info)` from `src/styles/tokens/index.css`.

**Risk Level**
Low — visual-only change. No logic or API changes. The token values are already defined and used correctly in `FormField.module.css` and `Input.module.css`.

**Source**
Part2 §3.8

---

## Quick Win #6: Add `error` Prop to `PasswordInput`

**Form/Validation Problem**
`PasswordInput` has no `error` prop and cannot display field-level validation errors. In all auth forms where it is used, password errors are displayed as a banner above the form rather than inline next to the field. This is the only shared component in the form system that lacks error state support — `Input`, `FormField`, and `Button` all support error or loading states.

**Impact**
Inline error display is architecturally impossible for password fields across all 6 auth forms (Login, Register, CitizenRegister, AcceptInvite, ResetPassword, ChangePassword). The banner pattern forces users to read a generic message and infer which field caused the error, which is particularly problematic when both email and password fields are present.

**Effort**
1 dev-day

**Implementation Steps**
1. Add an `error?: string` prop to `PasswordInput`'s TypeScript interface.
2. Render the error message below the input using the same `<p role="alert">` pattern used by `FormField` and `Input`.
3. Apply `aria-invalid="true"` and `aria-describedby` pointing to the error element when `error` is present.
4. Style the error state using `var(--color-error)` (aligned with Quick Win #5).

**Risk Level**
Low — additive change to `PasswordInput`. Existing usages without the `error` prop are unaffected. No breaking changes.

**Source**
Part2 §3.1, Part2 §3.2, Part2 §3.5

---

## Quick Win #7: Add Cross-Field Validation for Event Date Range and Appointment Future-Date

**Form/Validation Problem**
Zero cross-field validation rules exist across all 17 forms. The two most impactful missing rules are: (1) `EventForm` — `endsAt` must be after `startsAt`; (2) `AppointmentForm` — `scheduledAt` must be in the future. Both are documented as unimplemented in Part 1 §2.3. Events with inverted date ranges and past appointments can be created and stored without rejection.

**Impact**
Events with `endsAt` before `startsAt` produce calendar display errors and logical inconsistencies. Past appointments undermine scheduling integrity. Both are citizen-service-facing forms managed by `assessor` and `atendente` roles respectively.

**Effort**
1 dev-day

**Implementation Steps**
1. In `eventSchema`, add a Zod `.refine()` rule: `endsAt > startsAt`, with a Portuguese error message attached to the `endsAt` path.
2. In `appointmentSchema`, add a Zod `.refine()` rule: `scheduledAt` must be a date-time string representing a future moment, with a Portuguese error message attached to the `scheduledAt` path.
3. Ensure the `validate()` functions for both schemas correctly extract the cross-field error path and map it to the `errors` record so `FormField` can display it inline.

**Risk Level**
Low — Zod `.refine()` is additive. Existing valid data is unaffected. The `validate()` function pattern already handles `issue.path[0]` extraction.

**Source**
Part1 §1.2, Part1 §2.3, Part2 §4.2, Part3 §8


---

## Quick Win #8: Add Password Confirmation Field to Auth Forms

**Form/Validation Problem**
No password confirmation field exists in Register, CitizenRegister, AcceptInvite, or ResetPassword forms. Password typos are undetectable — a user who miskeys their password during registration or reset has no way to catch the error before submission. This is documented as a missing cross-field rule in Part 1 §2.3.

**Impact**
Affects all 4 account creation and recovery flows. Citizens registering via `CitizenRegisterPage` are the most at-risk group — a typo locks them out of a newly created account with no recovery path visible at the form level. Staff using AcceptInvite and ResetPassword face the same risk.

**Effort**
1.5 dev-days

**Implementation Steps**
1. Add a `confirmPassword` field to each of the 4 forms.
2. Add a cross-field validation rule (Zod `.refine()` or inline imperative check consistent with the form's existing pattern) that compares `password` and `confirmPassword`.
3. Display the mismatch error inline next to the `confirmPassword` field using `PasswordInput` with the `error` prop added in Quick Win #6.
4. Consolidate the password match logic into a shared utility to avoid duplication across the 4 forms.

**Risk Level**
Low — additive field addition. No existing validation logic is removed. The `PasswordInput` component is already used in all 4 forms.

**Source**
Part1 §2.1, Part1 §2.3, Part2 §4.4, Part3 §11.3

---

## Quick Win #9: Consolidate Duplicate Password Validation Logic

**Form/Validation Problem**
Password validation rules are duplicated between `CitizenRegisterPage` and `RegisterPage` — same rules (length ≥ 8, uppercase, digit), different implementations. Divergence has already occurred: `PasswordInput` shows a "special character" strength rule that `RegisterPage` does not enforce, while `CitizenRegisterPage` also does not enforce it despite showing it in the UI. Two implementations of the same rules with observable inconsistency.

**Impact**
A rule change (e.g., adding a minimum special character requirement) must be applied in two places. The existing divergence means the visual strength indicator and the actual enforced rules are already out of sync for both forms — users see a requirement that is not enforced.

**Effort**
1 dev-day

**Implementation Steps**
1. Extract password validation rules into a shared utility function (e.g., `src/validation/shared/passwordRules.ts`) that returns a structured result (valid/invalid per rule).
2. Replace the inline imperative checks in both `CitizenRegisterPage` and `RegisterPage` with calls to the shared utility.
3. Align the `PasswordInput` strength indicator rules with the rules actually enforced by the shared utility — either enforce the special character rule or remove it from the UI.

**Risk Level**
Low — refactor of existing logic into a shared location. No behavior change if rules are kept identical. The alignment of strength indicator rules with enforced rules is a correctness fix, not a new constraint.

**Source**
Part2 §4.4, Part3 §7.7, Part3 §11.3

---

## Quick Win #10: Add `onBlur` Validation Trigger to Domain Forms

**Form/Validation Problem**
All 7 domain forms validate exclusively on submit. The `ContactForm` is the only form that clears individual field errors on `onChange`. No form validates on `onBlur`. Users receive no feedback until they attempt to submit, which increases the error-correction cost on longer forms — CitizenRecordsForm (9 fields) and PressReleaseForm (7 fields) are the most affected.

**Impact**
Staff completing long forms must submit to discover errors, then scroll back to find and fix each field. For `atendente` staff entering citizen records with 9 fields across 2 sections, this is a significant friction point. `onBlur` validation is the standard progressive disclosure pattern for multi-field forms.

**Effort**
2 dev-days

**Implementation Steps**
1. In `CrudPage`, add a `touched` state tracking which fields have been blurred.
2. Pass an `onBlur` handler to each `FormField` that marks the field as touched and runs validation for that field.
3. Display errors only for touched fields (or all fields after the first submit attempt) — this prevents showing errors on fields the user hasn't interacted with yet.
4. Keep the existing submit-time full validation as the final gate.

**Risk Level**
Low-Medium — `CrudPage` is the single entry point for all domain form modals, so the change propagates to all 7 modules. The risk is that `onBlur` validation may surface errors earlier than users expect; the "touched" guard mitigates this.

**Source**
Part1 §1.2, Part3 §5.5, Part3 §11.2

---

## Quick Win #11: Translate Phone Field Validation and Add Format Constraint

**Form/Validation Problem**
Phone fields in AppointmentForm, CitizenRecordsForm, and MediaContactForm use bare `z.string()` with no format or length validation. Any string passes. The fields use `inputMode="tel"` (correct mobile optimization) but the schema does not enforce a valid Brazilian phone number format.

**Impact**
Invalid phone data stored across 3 forms covering citizen appointments, citizen identity records, and media contact management. Contact failures for both citizen services and media relations workflows. Changes must currently be made in 3 separate schema files.

**Effort**
1 dev-day

**Implementation Steps**
1. Create a shared phone validation refinement (e.g., Brazilian mobile/landline format: 10–11 digits, optionally formatted) in `src/validation/shared/`.
2. Apply the refinement to `citizenPhone` in `appointmentSchema`, `phone` in `citizenSchema`, and `phone` in `mediaContactSchema`.
3. Use a Portuguese custom message (e.g., `"Telefone inválido. Use o formato (00) 00000-0000"`).

**Risk Level**
Low — additive schema change. Existing valid phone numbers are unaffected if the regex is permissive enough to accept both formatted and unformatted valid numbers.

**Source**
Part1 §1.2, Part2 §4.3, Part3 §5.4, Part3 §8

---

## Quick Win #12: Replace `state` (UF) Free-Text Input with a Brazilian State `<select>`

**Form/Validation Problem**
The `state` field in CitizenRecordsForm is a free-text `<input type="text" maxLength={2}>`. Only `maxLength={2}` constrains the input — no validation against the 27 valid Brazilian state codes (UF). Invalid state codes (e.g., `"XX"`, `"BR"`) pass validation and are stored.

**Impact**
Address data quality degradation for citizen records managed by `atendente` staff. Invalid state codes cannot be used for geographic filtering or reporting. A `<select>` with the 27 UF codes eliminates the entire class of invalid entries without requiring schema validation.

**Effort**
0.5 dev-days

**Implementation Steps**
1. Replace the `<input type="text" maxLength={2}>` for `state` with a `<select>` containing the 27 Brazilian state codes (AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO) with their full names as display labels.
2. Update the Zod schema to use `z.enum([...UF_CODES])` instead of `z.string()`.
3. Add a Portuguese error message for invalid selection.

**Risk Level**
Low — the field is already constrained to 2 characters; replacing it with a `<select>` is strictly more restrictive. Existing valid records are unaffected.

**Source**
Part2 §4.3, Part3 §8, Part3 §11.3

---

## Quick Win #13: Remove `CitizenPortalForm.tsx` Deprecated Shim

**Form/Validation Problem**
`CitizenPortalForm.tsx` is a deprecated re-export shim with a file comment explicitly stating it can be deleted once all references are updated. It is dead code that creates maintenance confusion and risks accidental use in future development.

**Impact**
Low immediate impact, but the file's presence creates a false impression that it is an active form component. Any developer adding a new citizen portal feature may import it instead of the correct component. Dead code increases the cognitive surface area of the codebase.

**Effort**
0.5 dev-days

**Implementation Steps**
1. Verify no active imports of `CitizenPortalForm.tsx` exist in the codebase (the file comment indicates references should already be updated).
2. Delete the file.
3. If any test files reference it, update them to import the correct component directly.

**Risk Level**
Very Low — the file is a re-export shim; deleting it cannot break functionality if all references have been updated as the comment indicates.

**Source**
Part1 §1.2, Part1 §2.1, Part3 §8

---

## Quick Win #14: Add `autoComplete` Attributes to Domain Form Fields

**Form/Validation Problem**
No domain form field has an `autoComplete` attribute. Auth forms correctly set `autoComplete` on all fields (`email`, `current-password`, `new-password`, `name`). Domain forms — particularly AppointmentForm and CitizenRecordsForm — contain fields like `citizenName`, `citizenPhone`, `email`, `address`, `city` that would benefit from browser autofill, especially for `atendente` staff who enter the same citizen's data repeatedly.

**Impact**
Slower data entry for `atendente` staff. No browser autofill for name, email, phone, and address fields in the two most data-intensive forms. The `atendente` role is the primary user of both AppointmentForm and CitizenRecordsForm.

**Effort**
0.5 dev-days

**Implementation Steps**
1. Add `autoComplete="name"` to `citizenName` (AppointmentForm) and `fullName` (CitizenRecordsForm).
2. Add `autoComplete="email"` to `email` (CitizenRecordsForm, MediaContactForm).
3. Add `autoComplete="tel"` to `citizenPhone` (AppointmentForm) and `phone` (CitizenRecordsForm, MediaContactForm).
4. Add `autoComplete="street-address"` to `address`, `autoComplete="address-level2"` to `city`, `autoComplete="address-level1"` to `state` (CitizenRecordsForm).

**Risk Level**
Very Low — `autoComplete` is a hint to the browser; it does not affect validation logic or form submission. Additive HTML attribute change only.

**Source**
Part2 §4.3, Part3 §7.4, Part3 §11.2

---

## Quick Win #15: Add LGPD Consent Checkbox to `CitizenRegisterPage`

**Form/Validation Problem**
`CitizenRegisterPage` collects citizen name, email, and password but has no explicit LGPD (Lei Geral de Proteção de Dados) consent checkbox. A cookie consent banner is present on the site, but no explicit data processing consent is collected at the point of citizen account creation. This is documented as a compliance gap in Part 3 §10.5.

**Impact**
Regulatory compliance risk for citizen data collection under Brazilian LGPD. The citizen portal is the public-facing entry point for citizens interacting with a government communication system. Explicit consent at registration is a standard LGPD requirement for data processing.

**Effort**
0.5 dev-days

**Implementation Steps**
1. Add a required checkbox field to `CitizenRegisterPage` with a label linking to the privacy policy (e.g., `"Li e concordo com a Política de Privacidade e autorizo o tratamento dos meus dados conforme a LGPD"`).
2. Add a validation rule that the checkbox must be checked before submission (inline imperative check consistent with the form's existing pattern, or a Zod boolean refinement).
3. Display an inline error if the user attempts to submit without checking the box.

**Risk Level**
Low — additive field. No existing validation logic is changed. The checkbox is a required gate before submission; it does not affect the API payload (consent is recorded at the point of account creation, not sent as a form field).

**Source**
Part3 §10.5, Part3 §11.4

---

## Quick Wins Summary

| # | Title | Effort | Priority | Modules Affected | Source |
|---|---|---|---|---|---|
| QW-01 | Replace Zod English messages with Portuguese custom messages | 2–3 dev-days | P0 | All 7 domain modules | Part1, Part3 |
| QW-02 | Add navigation guard to `CrudPage` modal close | 1 dev-day | P0 | All 7 domain modules | Part1, Part3 |
| QW-03 | Add Zod format validation for CPF, email, and URL fields | 2 dev-days | P0 | Appointments, CitizenRecords, MediaContacts, Clippings, SocialMedia | Part1, Part2, Part3 |
| QW-04 | Translate status and enum `<select>` option labels | 1 dev-day | P1 | PressReleases, Appointments, SocialMedia, Admin/Users | Part1, Part3 |
| QW-05 | Replace hardcoded colors with semantic tokens in `PasswordInput` and `Auth.module.css` | 1 dev-day | P1 | All auth forms | Part2 |
| QW-06 | Add `error` prop to `PasswordInput` | 1 dev-day | P1 | All auth forms | Part2 |
| QW-07 | Add cross-field validation for event date range and appointment future-date | 1 dev-day | P0 | Events, Appointments | Part1, Part2, Part3 |
| QW-08 | Add password confirmation field to auth forms | 1.5 dev-days | P1 | Register, CitizenRegister, AcceptInvite, ResetPassword | Part1, Part2, Part3 |
| QW-09 | Consolidate duplicate password validation logic | 1 dev-day | P1 | Register, CitizenRegister | Part2, Part3 |
| QW-10 | Add `onBlur` validation trigger to domain forms | 2 dev-days | P1 | All 7 domain modules | Part1, Part3 |
| QW-11 | Translate phone field validation and add format constraint | 1 dev-day | P1 | Appointments, CitizenRecords, MediaContacts | Part1, Part2, Part3 |
| QW-12 | Replace `state` (UF) free-text input with Brazilian state `<select>` | 0.5 dev-days | P2 | CitizenRecords | Part2, Part3 |
| QW-13 | Remove `CitizenPortalForm.tsx` deprecated shim | 0.5 dev-days | P1 | CitizenPortal | Part1, Part3 |
| QW-14 | Add `autoComplete` attributes to domain form fields | 0.5 dev-days | P2 | Appointments, CitizenRecords, MediaContacts | Part2, Part3 |
| QW-15 | Add LGPD consent checkbox to `CitizenRegisterPage` | 0.5 dev-days | P2 | CitizenPortal | Part3 |
| **Total** | | **~17 dev-days** | | | |

### Secom-Specific Notes

- **Shared component wins (QW-01, QW-04, QW-05, QW-10):** These four quick wins operate at the `CrudPage` or shared component level and propagate to all 7 domain modules simultaneously — the highest leverage changes in the list.
- **Localization wins applicable across all modules (QW-01, QW-04):** Portuguese message normalization and status label translation are systemic fixes. Once `pt-BR.json` is extended with validation message keys and status translations, all 7 modules benefit without per-module changes.
- **Citizen-facing integrity wins (QW-03, QW-07, QW-08, QW-15):** CPF/email format validation, cross-field date rules, password confirmation, and LGPD consent collectively address the primary data integrity and compliance risks for citizen-facing forms (CitizenRegisterPage, AppointmentForm, CitizenRecordsForm).
- **Token alignment (QW-05):** `PasswordInput` is used in 6 auth forms. Replacing 4 hardcoded hex values with `var(--color-error)`, `var(--color-success)`, `var(--color-warning)` aligns all auth form validation states with the token system in a single component change.
