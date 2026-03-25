# Secom Frontend — Forms, Validation & Data Entry Audit
## Part 2: Input Component Library Audit & Critical Forms Deep Dive

---

## 3. Input Component Library Audit

### 3.1 Component Audit Table

| Component | Input Type | Variants | Validation Support | Accessibility Level | Localization | Issues |
|---|---|---|---|---|---|---|
| `Input` | text, email, password, search, tel, url, number | 3 variants (default, filled, floating) × 3 sizes (sm, md, lg) | `error`, `success`, `isLoading` props; `aria-invalid`; `aria-describedby` | 🟩 Good | `aria-label="obrigatório"` on required marker | Low usage (2 imports) despite rich API; not used in auth pages |
| `PasswordInput` | password (toggleable to text) | strength indicator on/off | None (no `error` prop) | 🟧 Partial | Toggle button uses `t('password.show/hide')` | No `error` prop — cannot display field-level errors; strength colors are hardcoded hex values |
| `FormField` | Wrapper (any child) | — | `error`, `helpText`, `required` props; `aria-describedby` injected into child | 🟩 Good | `aria-label="obrigatório"` on required marker | `helpText` renders above input (CSS `order: 3`) — visually appears below label, not below input |
| `Button` | submit, button, reset | 7 variants × 3 sizes | `isLoading` disables and shows spinner | 🟩 Good | `"Carregando..."` is hardcoded Portuguese in `sr-only` span | `aria-busy` set only when `isLoading`; no `aria-label` override for icon-only usage |
| `Modal` | Container | 5 sizes (sm, md, lg, xl, full) | — | 🟩 Good | Close button uses `t('common.close')` | `useId()` generates unique IDs — duplicate ID risk from previous docs is resolved |
| `ConfirmDialog` | Confirmation | — | `isLoading` on confirm button | 🟧 Partial | Confirm button label defaults to `t('common.delete')` — always "Excluir" regardless of action | Confirm label is not always appropriate (e.g., deactivating a user) |
| `DataTable` | Search input (inline) | — | None | 🟧 Partial | Search placeholder via prop | Search input has no `label` element — relies on `placeholder` only; `aria-label` absent |
| `StatusBadge` | Display only | 5 color variants | — | 🟧 Partial | Status keys not translated — raw enum values displayed | No `aria-label`; color alone conveys meaning (WCAG 1.4.1 risk) |

### 3.2 State Support Matrix

| Component | Default | Error | Disabled | Loading | Success |
|---|---|---|---|---|---|
| `Input` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PasswordInput` | ✅ | ❌ | ✅ (via `disabled` attr) | ❌ | ❌ |
| `FormField` | ✅ | ✅ | ❌ (no disabled styling) | ❌ | ❌ |
| `Button` | ✅ | ❌ | ✅ | ✅ | ❌ |
| `Modal` | ✅ | ❌ | ❌ | ❌ | ❌ |

`PasswordInput` is the most significant gap: it has no `error` prop and cannot display field-level validation errors. In all auth forms where it is used, errors are displayed as a banner above the form rather than inline next to the field.

### 3.3 Controlled vs. Uncontrolled Patterns

All form inputs in the codebase are **fully controlled** — `value` and `onChange` are always provided. There are no uncontrolled inputs (`defaultValue` without `value`). This is consistent and correct.

### 3.4 Integration with Validation Library

Domain forms use a two-layer pattern:
1. Zod schema (`safeParse`) in `src/validation/domain/*.ts`
2. `validate(form, t)` function that maps Zod issues to `Record<string, string>` errors
3. Errors passed as `errors` prop to `FormField` via `CrudPage`

Auth forms do not use Zod. They use either:
- No client-side validation (most auth forms)
- Inline imperative checks (`CitizenRegisterPage`, `RegisterPage`)

The `Input` component accepts an `error` prop directly and renders it with `role="alert"`. `FormField` also accepts an `error` prop and renders it with `role="alert"`. When both are used together (which does not currently occur in the codebase), there would be duplicate error announcements.

### 3.5 Keyboard Support and Screen Reader Compatibility

| Component | Tab Order | Enter/Space | Escape | Arrow Keys | Screen Reader |
|---|---|---|---|---|---|
| `Input` | ✅ Natural | ✅ (form submit) | ✅ (clears if `showClearButton`) | N/A | ✅ `aria-invalid`, `aria-describedby` |
| `PasswordInput` | ✅ Natural | ✅ | ❌ | N/A | ⚠️ Toggle button has `aria-label`; no `aria-describedby` for strength |
| `FormField` | ✅ (passes through) | ✅ | ✅ | N/A | ✅ `aria-describedby` injected into child |
| `Modal` | ✅ Focus trap | ✅ | ✅ | N/A | ✅ `role="dialog"`, `aria-modal`, `aria-labelledby` |
| `Button` | ✅ | ✅ | N/A | N/A | ✅ `aria-busy` on loading |
| `DataTable` search | ✅ | ✅ | N/A | N/A | ⚠️ No `aria-label` on search input |

### 3.6 Label Association (`htmlFor`) Assessment

| Context | Pattern | Correct? |
|---|---|---|
| `FormField` wrapping a raw `<input id="fieldName">` | `<label htmlFor={name}>` where `name` matches the child's `id` | ✅ Yes — by convention; relies on the form author setting `id` equal to `name` |
| `Input` component | `<label htmlFor={inputId}>` where `inputId = id \|\| useId()` | ✅ Yes — auto-generated if not provided |
| `PasswordInput` | `<label htmlFor={props.id}>` | ⚠️ Partial — `id` must be passed by caller; no auto-generation |
| Auth page raw inputs | `<label htmlFor="email">` + `<input id="email">` | ✅ Yes |
| `DataTable` search | No `<label>` | ❌ No label association |
| `EventForm` checkbox | `<label className="form-check"><input type="checkbox">` | ⚠️ Implicit association (input inside label) — valid HTML but no `id`/`htmlFor` |

The `FormField` label association relies on a **naming convention**: the `name` prop must match the child input's `id`. This is consistently followed across all 7 domain forms but is not enforced by TypeScript — a mismatch would silently break label association.

### 3.7 Error Message Semantics

| Location | Element | ARIA | Animation |
|---|---|---|---|
| `FormField` error | `<p role="alert" id="{name}-error">` | `aria-describedby` on input | `errorIn` keyframe (0.15s) |
| `Input` error | `<p role="alert" id="{id}-error">` | `aria-invalid="true"`, `aria-describedby` | None |
| Auth form banner | `<div role="alert">` | None | None |
| `CitizenRegisterPage` error | `<div role="alert">` | None | None |

`role="alert"` is used consistently for error messages. The `FormField` error also has an entry animation, which respects `prefers-reduced-motion` via the global CSS rule.

### 3.8 Token Usage Consistency in Form Components

| Component | Token Usage | Hardcoded Values | Severity |
|---|---|---|---|
| `FormField.module.css` | ✅ All colors via tokens | None | — |
| `Input.module.css` | ✅ All colors via tokens | None | — |
| `PasswordInput.tsx` | ❌ Strength colors hardcoded in JS | `#e74c3c`, `#f39c12`, `#2ecc71`, `#27ae60` | 🟧 High |
| `Auth.module.css` | ❌ Multiple hardcoded hex values | 7 values (error/info/success banners) | 🟧 High |
| `global.css` form utilities | ✅ All via tokens | None | — |

The `PasswordInput` strength indicator is the most impactful token violation in the form system — it is used in 5 forms (Login, Register, CitizenRegister, AcceptInvite, ResetPassword, ChangePassword) and its colors do not match the semantic token values (`--color-error: #D32F2F` vs. hardcoded `#e74c3c`).

### 3.9 Global Form Utility Class Adoption

| Class | Defined In | Used By | Consistent? |
|---|---|---|---|
| `.form-stack` | `global.css` | All 7 domain forms, ProfilePage, InviteUser modal | ✅ Yes |
| `.form-grid` | `global.css` | All 7 domain forms | ✅ Yes |
| `.form-section` | `global.css` | AppointmentForm, CitizenRecordsForm | ✅ Yes (where applicable) |
| `.form-actions` | `global.css` | All 7 domain forms | ✅ Yes |
| `.form-check` | `global.css` | EventForm (checkbox) | ✅ Yes |
| `.form-field` | `global.css` | LoginForm (raw), auth pages | ⚠️ Inconsistent — auth pages use `Auth.module.css` `.field` class instead |

Auth pages use a parallel `.field` class defined in `Auth.module.css` rather than the global `.form-field`. This is a deliberate visual differentiation (auth pages have a distinct card layout) but creates two parallel field-wrapper implementations.

---

## 4. Critical Forms Deep Dive

### 4.1 Press Release Create/Edit Form

**Metadata**

| Attribute | Value |
|---|---|
| Form name | PressReleaseForm |
| Target roles | assessor, admin, super_admin |
| Business objective | Create and manage official press communications with category classification and status tracking |
| Entry route | `/press-releases` → "Novo comunicado" button or row "Editar" |
| Exit route | Modal close → list view |
| Approximate LOC | 55 (form component) + 35 (schema) + 95 (page) = 185 total |

**Field Breakdown**

| Field | Type | Required | Default | Validation | Conditional? |
|---|---|---|---|---|---|
| `title` | `<input type="text">` | ✅ | `''` | `z.string().min(5)` | No |
| `subtitle` | `<input type="text">` | ❌ | `''` | None | No |
| `content` | `<textarea rows={6}>` | ✅ | `''` | `z.string().min(10)` | No |
| `summary` | `<textarea rows={2}>` | ❌ | `''` | None | No |
| `category` | `<select>` | ❌ | `'comunicado'` | `z.enum(PRESS_RELEASE_CATEGORIES)` | No |
| `tags` | `<input type="text">` | ❌ | `''` | None | No |
| `status` | `<select>` | ❌ | `'draft'` | `z.enum(PRESS_RELEASE_STATUSES)` | Edit mode only |

No mask usage. No `inputMode` hints. No derived fields. Tags are a comma-separated string converted to an array in `buildPayload`.

**Validation Review**

- Library: Zod (`z.object`) in `src/validation/domain/pressRelease.ts`
- Schema reuse: Schema is the single source of truth; `validatePressRelease()` wraps `safeParse`
- Cross-field validation: ❌ None
- Async validation: ❌ None
- Trigger timing: Submit-only (via `CrudPage.handleSubmit`)
- Server error mapping: Server errors surface as toast notifications (`onError` callback) — not mapped to individual fields

**Critical gap — approval workflow:** The `status` field allows any transition between any status value (`draft → published` in one step). No field-level constraint enforces the intended workflow (`draft → review → approved → published`). This is a business logic risk: a user with write access could publish a press release that has never been reviewed.

**UX Evaluation**

| Indicator | Finding |
|---|---|
| ✅ | Two-column grid for title/subtitle keeps related fields visually paired |
| ✅ | `helpText` on tags field explains comma-separated format |
| ✅ | Category defaults to `'comunicado'` — the most common type |
| ⚠️ | `content` textarea (6 rows) has no character count or minimum length indicator — users don't know the 10-character minimum until submit |
| ⚠️ | Status select options display raw enum values (`draft`, `review`, `approved`, `published`, `archived`) — not translated |
| ⚠️ | No cancel button in `form-actions` — only "Salvar"; closing requires clicking the modal X or overlay |
| ❌ | No navigation guard — closing the modal discards all unsaved content silently |

**Mobile Experience Review**

| Issue | Severity |
|---|---|
| `content` textarea (6 rows) requires significant vertical scroll on small screens | 🟨 Medium |
| No `inputMode` on any field — `title` and `subtitle` would benefit from `inputMode="text"` (already default, no issue) | 🟩 Low |
| Modal is full-width on mobile (CSS handles this) | ✅ |
| Submit button is right-aligned in `form-actions` — on narrow screens this is fine but a full-width button would be more touch-friendly | 🟩 Low |

---

### 4.2 Appointment Create/Edit Form

**Metadata**

| Attribute | Value |
|---|---|
| Form name | AppointmentForm |
| Target roles | atendente, admin, super_admin |
| Business objective | Schedule citizen service appointments with identity capture and time slot assignment |
| Entry route | `/appointments` → "Novo agendamento" or row "Editar" |
| Exit route | Modal close → list view |
| Approximate LOC | 65 (form) + 30 (schema) + 80 (page) = 175 total |

**Field Breakdown**

| Field | Type | Required | Default | Validation | Conditional? |
|---|---|---|---|---|---|
| `citizenName` | `<input type="text">` | ✅ | `''` | `z.string().min(2)` | No |
| `citizenCpf` | `<input type="text" inputMode="numeric" maxLength={11}>` | ❌ | `''` | `z.string()` (any string) | No |
| `citizenPhone` | `<input type="text" inputMode="tel">` | ❌ | `''` | `z.string()` (any string) | No |
| `service` | `<input type="text">` | ✅ | `''` | `z.string().min(1)` | No |
| `scheduledAt` | `<input type="datetime-local">` | ✅ | `''` | `z.string().min(1)` | No |
| `notes` | `<textarea rows={3}>` | ❌ | `''` | `z.string()` (any string) | No |
| `status` | `<select>` | ❌ | `'pending'` | `z.string().optional()` | Edit mode only |

`inputMode="numeric"` on CPF and `inputMode="tel"` on phone are correct mobile optimizations. `maxLength={11}` on CPF is a partial constraint (no check digit validation). `scheduledAt` uses `type="datetime-local"` which provides a native date/time picker.

**Validation Review**

- Library: Zod in `src/validation/domain/appointment.ts`
- Cross-field validation: ❌ None — no future-date check on `scheduledAt`, no time-slot conflict detection
- Async validation: ❌ None — no availability check against existing appointments
- Trigger timing: Submit-only

**Critical gaps:**
1. CPF accepts any string — `"abc"` passes validation. No Luhn-style check digit validation.
2. `scheduledAt` accepts any non-empty string — a past date passes validation.
3. No time-slot availability check — double-booking is possible at the frontend level.
4. Status option labels are raw enum values (`pending`, `confirmed`, `completed`, `cancelled`, `no_show`).

**UX Evaluation**

| Indicator | Finding |
|---|---|
| ✅ | Two `form-section` groupings ("Dados do Cidadão" / "Agendamento") reduce cognitive load |
| ✅ | `inputMode="numeric"` on CPF triggers numeric keyboard on mobile |
| ✅ | `inputMode="tel"` on phone triggers telephone keyboard on mobile |
| ✅ | `placeholder="00000000000"` on CPF communicates expected format |
| ⚠️ | CPF placeholder shows 11 digits without formatting — Brazilian users expect `000.000.000-00` |
| ⚠️ | `service` is a free-text field — no dropdown of available services; risk of inconsistent data entry |
| ⚠️ | Status labels are raw enum values — `no_show` is not user-friendly |
| ❌ | No future-date constraint on `scheduledAt` — past appointments can be created |

**Mobile Experience Review**

| Issue | Severity |
|---|---|
| `type="datetime-local"` renders a native picker — behavior varies significantly across browsers and mobile OS | 🟨 Medium |
| Two `form-section` blocks add vertical height — scroll required on small screens | 🟨 Medium |
| CPF `maxLength={11}` without masking means users must type without visual formatting feedback | 🟨 Medium |

---

### 4.3 Citizen Record Create/Edit Form (Staff View)

**Metadata**

| Attribute | Value |
|---|---|
| Form name | CitizenRecordsForm |
| Target roles | atendente, admin, super_admin |
| Business objective | Create and maintain citizen identity records for service personalization |
| Entry route | `/citizen-portal` → "Novo registro" or row "Editar" |
| Exit route | Modal close → list view |
| Approximate LOC | 75 (form) + 35 (schema) + 85 (page) = 195 total |

**Field Breakdown**

| Field | Type | Required | Default | Validation | Conditional? |
|---|---|---|---|---|---|
| `userId` | `<input type="text">` | ✅ (create) | `''` | Custom check in `validateCitizen` | Create mode only |
| `fullName` | `<input type="text">` | ✅ | `''` | `z.string().min(2)` | No |
| `cpf` | `<input type="text" inputMode="numeric" maxLength={11}>` | ❌ | `''` | `z.string()` (any string) | No |
| `phone` | `<input type="text" inputMode="tel">` | ❌ | `''` | `z.string()` (any string) | No |
| `email` | `<input type="email">` | ❌ | `''` | `z.string()` (no `.email()`) | No |
| `address` | `<input type="text">` | ❌ | `''` | `z.string()` (any string) | No |
| `neighborhood` | `<input type="text">` | ❌ | `''` | `z.string()` (any string) | No |
| `city` | `<input type="text">` | ❌ | `''` | `z.string()` (any string) | No |
| `state` | `<input type="text" maxLength={2}>` | ❌ | `''` | `z.string()` (any string) | No |

`type="email"` on the email field provides browser-level format validation, but the Zod schema uses `z.string()` without `.email()` — so the schema validation does not enforce email format. `maxLength={2}` on state is a partial constraint (no validation against valid Brazilian state codes).

**Validation Review**

- Library: Zod + custom `userId` check in `validateCitizen(form, editing, t)`
- The `editing` parameter is passed to `validateCitizen` — the only form in the codebase where the validation function receives an edit-mode flag
- Cross-field validation: ❌ None
- `userId` is validated as required on create via an imperative check outside the Zod schema — inconsistent with the Zod-first pattern

**UX Evaluation**

| Indicator | Finding |
|---|---|
| ✅ | Two `form-section` groupings ("Identificação" / "Endereço") are semantically appropriate |
| ✅ | `inputMode` hints on CPF and phone |
| ⚠️ | `userId` is a free-text field — no lookup or autocomplete to link to an existing citizen auth account |
| ⚠️ | `state` field is a free-text input — a `<select>` with Brazilian state codes (UF) would prevent invalid entries |
| ⚠️ | No postal code (CEP) field — address entry is fully manual with no autofill |
| ❌ | Email field uses `type="email"` (browser validation) but Zod schema uses `z.string()` — inconsistent validation layers |

---

### 4.4 Citizen Register Form (Public Portal)

**Metadata**

| Attribute | Value |
|---|---|
| Form name | CitizenRegisterPage |
| Target roles | citizen (public) |
| Business objective | Self-service citizen account creation for portal access |
| Entry route | `/portal/register` (public) |
| Exit route | Success → `/portal/dashboard`; failure → same page with error banner |
| Approximate LOC | 85 |

**Field Breakdown**

| Field | Type | Required | Default | Validation | Conditional? |
|---|---|---|---|---|---|
| `name` | `<input type="text" minLength={2} autoComplete="name">` | ✅ | `''` | Inline: `name.trim().length < 2` | No |
| `email` | `<input type="email" autoComplete="email">` | ✅ | `''` | None (browser only) | No |
| `password` | `PasswordInput showStrength autoComplete="new-password">` | ✅ | `''` | Inline: length ≥ 8, uppercase, digit | No |

**Validation Review**

- Library: None — inline imperative checks in `handleSubmit`
- Password rules checked: length ≥ 8, at least one uppercase, at least one digit
- Password rules NOT checked: special character (despite `PasswordInput` showing it as a strength rule)
- No email format validation beyond browser's `type="email"` behavior
- No password confirmation field
- Error display: single banner above form (not field-level)

**UX Evaluation**

| Indicator | Finding |
|---|---|
| ✅ | `autoComplete` attributes set correctly (`name`, `email`, `new-password`) |
| ✅ | `autoFocus` on name field |
| ✅ | `PasswordInput` with `showStrength` gives real-time feedback |
| ⚠️ | Password strength rules shown in `PasswordInput` include "special character" but the submit validation does not enforce it — inconsistency between visual feedback and actual requirement |
| ⚠️ | No password confirmation field — typos in password are undetectable |
| ⚠️ | Error banner is form-level, not field-level — user must infer which field caused the error |
| ⚠️ | No email format validation in submit handler — relies entirely on browser `type="email"` |
| ❌ | Validation logic is duplicated between `CitizenRegisterPage` and `RegisterPage` (staff) — same rules, different implementations |

**Mobile Experience Review**

| Issue | Severity |
|---|---|
| `type="email"` triggers email keyboard on mobile ✅ | — |
| `PasswordInput` strength indicator adds significant vertical height | 🟩 Low |
| `autoComplete="new-password"` enables password manager autofill ✅ | — |
| Card layout (`max-width: 520px`) is responsive and centered | ✅ |

---

### 4.5 Staff Login Form

**Metadata**

| Attribute | Value |
|---|---|
| Form name | LoginPage (staff) |
| Target roles | All staff |
| Business objective | Staff authentication entry point |
| Entry route | `/login` (public) |
| Exit route | Success → `state.from` or `/admin/dashboard`; failure → same page with error banner |
| Approximate LOC | 75 (LoginPage) + 47 (LoginForm component) = 122 total |

**Note:** Two login form implementations exist: `LoginPage.tsx` (used in routing) and `LoginForm.tsx` (a standalone component used in tests and potentially embeddable). They are functionally equivalent but structurally different — `LoginPage` uses raw `<input>` elements with `Auth.module.css`, while `LoginForm` uses the `Input` component.

**Field Breakdown**

| Field | Type | Required | Default | Validation | Conditional? |
|---|---|---|---|---|---|
| `email` | `<input type="email" autoComplete="email">` | ✅ (HTML) | `''` | None (browser only) | No |
| `password` | `PasswordInput autoComplete="current-password">` | ✅ (HTML) | `''` | None | No |

**Validation Review**

- No client-side validation beyond HTML `required` and `type="email"` browser behavior
- All validation is server-side; errors surface as a banner
- Session-expired state is communicated via `location.state.reason === 'session_expired'` — shown as an info banner

**UX Evaluation**

| Indicator | Finding |
|---|---|
| ✅ | `autoComplete` attributes correct (`email`, `current-password`) |
| ✅ | `autoFocus` on email field |
| ✅ | Session-expired message shown as info banner (not error) — correct tone |
| ✅ | "Forgot password" link visible before submit |
| ⚠️ | No client-side validation — empty form submission makes a network request |
| ⚠️ | `LoginForm` component and `LoginPage` are parallel implementations — `LoginForm` uses `Input` component; `LoginPage` uses raw inputs. The `LoginForm` component is only used in tests |
| ⚠️ | `PasswordInput` has no `error` prop — password errors cannot be shown inline |
