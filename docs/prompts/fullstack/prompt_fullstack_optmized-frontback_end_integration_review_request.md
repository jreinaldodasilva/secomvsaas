Here is your **optimized and tightly scoped prompt**, focused exclusively on:

* Frontend ↔ Backend integration
* GET/POST correctness
* Data submission & retrieval
* Type alignment
* UI rendering accuracy
* Runtime behavior validation

All security, third-party integrations, performance, and infrastructure concerns have been removed.

---

# 🧠 Sintgesp Frontend–Backend Integration & Data Flow Audit

## 🎯 Objective

Conduct a **strict end-to-end integration audit** of the Sintgesp application focused only on:

1. Whether all **GET endpoints correctly retrieve data**
2. Whether all **POST endpoints correctly submit and persist data**
3. Whether the **frontend consumes backend APIs correctly**
4. Whether **shared types are fully aligned**
5. Whether the **UI renders backend data accurately and consistently**
6. Whether form submissions correctly reflect backend validation and responses**

This audit must validate both:

* ✅ Static type alignment
* ✅ Runtime request/response behavior
* ✅ Correct UI state transitions

Exclude:

* ❌ Security deep analysis
* ❌ Performance optimization
* ❌ Third-party integrations
* ❌ Infrastructure concerns

---

# 🔎 GLOBAL AUDIT REQUIREMENTS

You must:

1. Trace real request flows (not assumptions).
2. Inspect actual source code (backend, shared, frontend).
3. Perform live API testing (Swagger, Postman, curl, or browser devtools).
4. Compare real responses against TypeScript definitions.
5. Identify mismatches between:

   * Backend DTOs
   * Shared types
   * Frontend usage
6. Classify findings:

   * 🔴 Critical (breaks data flow)
   * 🟠 High (data mismatch / UI incorrect)
   * 🟡 Medium (type drift / partial inconsistency)
   * 🟢 Low (minor inconsistency)

Every issue must include:

* Description
* Where it occurs
* Reproduction steps
* Expected vs actual behavior
* Suggested fix

---

# 1️⃣ ENDPOINT INVENTORY (GET & POST ONLY)

Generate a complete list of:

* All GET endpoints
* All POST endpoints

### Required Table

| Endpoint | Method | Controller | Request DTO | Response DTO | Used in Frontend? | Working? | Notes |
| -------- | ------ | ---------- | ----------- | ------------ | ----------------- | -------- | ----- |

Validate:

* GET endpoints return expected data structure
* POST endpoints persist data correctly
* Response payload matches DTO definition
* Frontend calls correct URLs
* HTTP methods are correctly used

---

# 2️⃣ TYPE ALIGNMENT AUDIT (CRITICAL)

Compare across:

* Backend DTO definitions
* Shared package (`@sintgesp/shared`)
* Frontend imports and usage

### Required Table

| Type | Backend Exists | In Shared | Used in Frontend | Field Match? | Drift? | Severity |
| ---- | -------------- | --------- | ---------------- | ------------ | ------ | -------- |

Validate:

* Field names
* Optional vs required
* Nullability
* Enums
* Date formats
* Nested objects
* Pagination structures

Identify:

* Duplicate type definitions in frontend
* Missing shared exports
* Frontend-only DTO variations

---

# 3️⃣ GET FLOW VALIDATION (DATA RETRIEVAL)

For every GET endpoint used by the frontend:

### Validate:

1. Endpoint returns correct status (200).
2. Response matches expected TypeScript type.
3. Frontend properly maps response data.
4. React Query (or equivalent) cache updates correctly.
5. UI renders:

   * Lists correctly
   * Empty states correctly
   * Loading states correctly
   * Error states correctly

### Required Table

| Component/Hook | Endpoint | Expected Type | Actual Response | UI Correct? | Issues |
| -------------- | -------- | ------------- | --------------- | ----------- | ------ |

Also verify:

* Pagination works (if applicable)
* Filters/sorting parameters function correctly
* Data refresh works after mutations

---

# 4️⃣ POST FLOW VALIDATION (DATA SUBMISSION)

Trace complete submission flows:

Form → Frontend DTO → API Request → Backend Validation → DB → Response → UI Update

### Validate:

1. Form data structure matches backend DTO.
2. Required fields align between frontend and backend.
3. Validation errors are correctly returned.
4. Frontend properly handles:

   * 200 success
   * 400 validation errors
   * 500 errors
5. UI updates correctly after successful POST:

   * List refresh
   * Modal closes
   * Form resets
   * Notifications shown

### Required Table

| Form/Component | Endpoint | Request Type | Backend DTO Match? | Success Flow Works? | Error Handling Works? | Issues |
| -------------- | -------- | ------------ | ------------------ | ------------------- | --------------------- | ------ |

---

# 5️⃣ FRONTEND VALIDATION VS BACKEND VALIDATION

Compare:

* Frontend form schemas (Zod/Yup/etc.)
* Backend validation schemas

Identify:

* Rule mismatches
* Required field inconsistencies
* Enum mismatches
* Date parsing inconsistencies
* Different error messages for same rule

Deliver:

| Field | Frontend Rule | Backend Rule | Aligned? | Notes |
| ----- | ------------- | ------------ | -------- | ----- |

---

# 6️⃣ UI DATA RENDERING ACCURACY

Verify that UI components:

* Display all backend fields correctly
* Do not omit required fields
* Correctly format:

  * Dates
  * Currency
  * Enums
  * Boolean values
* Handle null/undefined safely
* Do not crash on missing optional fields

Check:

* Detail pages
* List views
* Dashboard summaries
* Create/update flows

Deliver:

| Page | Data Source | Rendering Correct? | Missing Fields? | Formatting Issues? |
| ---- | ----------- | ------------------ | --------------- | ------------------ |

---

# 7️⃣ RUNTIME FAILURE TESTING

Test manually:

* Network failure
* Backend returns 400
* Backend returns 500
* Backend returns unexpected shape
* Empty arrays
* Null values

Evaluate:

* Does UI break?
* Is error shown?
* Is state consistent?
* Is retry possible?

---

# 8️⃣ INTEGRATION GAP SUMMARY

Provide:

### A. Critical Breakpoints

* Broken POST flows
* Broken GET rendering
* DTO mismatches causing runtime risk

### B. Type Drift Report

* Backend vs Shared differences
* Shared vs Frontend differences

### C. UI Inconsistency Report

* Rendering bugs
* Missing data
* Incorrect formatting

---

# 9️⃣ REMEDIATION ROADMAP

Organize by priority:

| Priority | Issue | Layer | Impact | Suggested Fix | Effort |
| -------- | ----- | ----- | ------ | ------------- | ------ |

Categories:

* Immediate fixes (breaking flows)
* Type alignment refactors
* Validation synchronization
* UI rendering corrections

---

# 📦 REQUIRED OUTPUT FILES

Generate:

1. `docs/fullstack/Sintgesp-Frontend-Backend-Integration-Audit.md`
2. `docs/fullstack/Sintgesp-DTO-Drift-Report.md`
3. `docs/fullstack/Sintgesp-GET-POST-Validation-Report.md`
4. `docs/fullstack/Sintgesp-UI-Data-Consistency-Report.md`
5. `docs/fullstack/Sintgesp-Integration-Remediation-Roadmap.md`

Each issue must include:

* Description
* Location
* Reproduction
* Expected vs actual
* Severity
* Fix recommendation

---

# 🏁 Completion Criteria

The audit is complete only if:

* All GET endpoints used by frontend are verified.
* All POST flows are validated end-to-end.
* All DTO mismatches are documented.
* All UI data rendering inconsistencies are identified.
* A concrete remediation plan is delivered.

