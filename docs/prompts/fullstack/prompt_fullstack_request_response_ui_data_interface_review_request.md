Here is a **production-grade, implementation-driven audit prompt** tailored to your requirements.

This is designed to force **end-to-end interface validation**, not superficial UI review.

It enforces:

* Request ↔ Response contract validation
* DTO/schema alignment
* Frontend rendering correctness
* Form workflows correctness
* Multi-tenant and role enforcement consistency
* Registration & update flow integrity

---

# 🔎 Sintgesp – Request/Response Interface & UI Data Integrity Audit

You are a **Senior Fullstack Architect performing a deep integration audit** of the Sintgesp system.

This is **not a documentation review**.
This is an **implementation-driven, end-to-end interface validation audit**.

You must analyze:

* Backend route handlers
* Controllers / services
* DTOs / schemas
* Mongoose models
* API responses
* Frontend API calls
* Frontend state management
* UI rendering logic
* Forms and submission workflows
* Role/tenant filtering

If documentation exists, treat it as **secondary context only**.

If evidence is missing:

* Explicitly state “No implementation evidence found”
* Classify as risk
* Do NOT assume correct behavior

---

# 🎯 Audit Objectives

Perform a deep, implementation-level validation of:

1. Request → Controller → Service → Database → Response integrity
2. API response shape consistency
3. DTO ↔ Model ↔ UI alignment
4. UI rendering completeness and correctness
5. Registration workflows (department, staff, athlete)
6. Update/edit workflows
7. Data mutation side effects
8. Error handling & user feedback correctness
9. Multi-tenant data scoping correctness
10. Silent failures or partial updates

This must read like a **formal internal architecture validation report**, not a checklist.

---

# 📁 Required Output Location

```
docs/fullstack/04-Sintgesp-Request-Response-Interface-Audit.md
```

If necessary, split into:

```
docs/fullstack/04-Sintgesp-Request-Response-Interface-Audit-Part1.md
docs/fullstack/04-Sintgesp-Request-Response-Interface-Audit-Part2.md
...
```

---

# 🧠 Evidence Hierarchy (Mandatory)

1. Backend implementation (routes, services, models)
2. Frontend API calls and hooks
3. Frontend UI components
4. State management logic
5. Validation schemas
6. Documentation (secondary only)

If frontend expects fields not returned by backend → classify as **interface mismatch**.

If backend returns fields never rendered → classify as **dead response surface**.

---

# 📑 Required Analysis Structure

Each section must include:

* Implementation Evidence
* Findings
* Risk Classification
* Architectural Impact
* Recommended Fix
* Refactor Complexity (Low / Medium / High)

---

# 1️⃣ API Contract & DTO Consistency Audit

## 1.1 Request Validation Consistency

For each major entity:

* Department
* Staff
* Athlete
* Appointments
* Billing (if applicable)

Verify:

* Request body validation schema
* Type definitions
* DTO definitions
* Mongoose schema alignment
* Required vs optional consistency
* Default values consistency
* Enum validation consistency

### Identify:

* Fields accepted but not persisted
* Fields persisted but not validated
* Fields required in DB but optional in API
* Silent data truncation
* Type coercion inconsistencies

Deliver:

* Contract Consistency Score (0–100)
* Critical mismatches list

---

## 1.2 Response Shape Integrity

For each entity endpoint:

* Compare response payload vs frontend expectations
* Check nested population consistency
* Check ID formats consistency (_id vs id)
* Verify date serialization format
* Verify numeric precision handling
* Detect leaking internal fields (__v, internal flags, secrets)

Classify:

* 🟥 Critical (data corruption / security leak)
* 🟧 High (incorrect UI rendering)
* 🟨 Medium (minor mismatch)
* 🟩 Clean

Deliver:

* Response Integrity Rating
* Overexposed data list
* Missing data list

---

# 2️⃣ Frontend Rendering & Data Display Accuracy

For each major UI view:

* Dashboard
* Department settings
* Staff management
* Athlete records
* Appointment management
* Billing view (if exists)

Verify:

* All returned fields are displayed correctly
* No stale state after mutation
* No hidden but sensitive data exposed
* Proper loading/error states
* Pagination consistency
* Sorting consistency
* Filtering consistency
* Role-based conditional rendering correctness

Identify:

* Fields never rendered
* UI showing outdated data
* Inconsistent formatting (dates, currency, CPF)
* Broken edit forms (not prefilled correctly)
* Partial updates not reflected in UI

Deliver:

* UI Data Accuracy Score
* Stale State Risk Level
* Rendering Mismatch Summary

---

# 3️⃣ Registration Workflow Validation

## 3.1 New Department Registration Flow

Trace:

Frontend form → Validation → API call → Backend validation → DB write → Response → UI state update

Verify:

* Required fields enforced consistently
* Tenant isolation correctly initialized
* Default roles created correctly
* Admin user created correctly
* Password flow correct
* No orphaned department possible
* Atomicity of operation (transaction or compensation)

Identify:

* Partial registration risk
* Duplicate department risk
* Privilege escalation risk
* Cross-tenant contamination risk

Deliver:

* Registration Integrity Score
* Critical risks

---

## 3.2 Staff Account Creation

Verify:

* Role assignment validation
* Department scoping enforcement
* Email uniqueness handling
* Password handling security
* Invitation vs direct creation logic
* Default permissions correctness

Detect:

* Over-privilege defaults
* Cross-department assignment risk
* Broken update logic

Deliver:

* Staff Provisioning Risk Level

---

## 3.3 Athlete Registration

Verify:

* Required medical fields validation
* CPF uniqueness (if applicable)
* Department scoping enforcement
* Assigned instructor enforcement
* Sensitive field handling
* Data normalization

Detect:

* Duplicate athlete risk
* Orphan records risk
* Cross-tenant data insertion risk

Deliver:

* Athlete Registration Integrity Rating

---

# 4️⃣ Update & Modification Workflows

For each entity (Department, Staff, Athlete):

Verify:

* Partial updates vs full updates consistency
* PATCH vs PUT correctness
* Immutable field protection
* Role change restrictions
* Department change restrictions
* Audit trail on modifications
* Concurrency issues
* Lost update risk

Detect:

* Mass assignment vulnerabilities
* Privilege escalation via update
* Silent validation bypass
* UI not reflecting updated state

Deliver:

* Update Safety Score
* Mutation Risk Summary

---

# 5️⃣ Error Handling & Feedback Integrity

Evaluate:

* Backend error consistency
* HTTP status correctness
* Frontend error interpretation
* Field-level validation display
* Generic vs detailed error handling
* Security-sensitive error leakage

Detect:

* 200 OK on failure
* Silent frontend failure
* Misleading success messages
* Unhandled promise chains

Deliver:

* Error Handling Maturity Rating

---

# 6️⃣ Multi-Tenant Data Interface Validation

Verify:

* All list endpoints filtered by department
* All create endpoints attach clinicId correctly
* All update/delete enforce department ownership
* Frontend never requests cross-tenant data
* No tenantId controlled by frontend input

Simulate:

* Cross-tenant request tampering
* Role manipulation in request payload

Deliver:

* Tenant Interface Isolation Confidence Level
* Cross-Tenant Risk Assessment

---

# 7️⃣ Data Mutation & Side Effects

Evaluate:

* Cascade behavior correctness
* Orphan cleanup logic
* Soft delete vs hard delete consistency
* Referential integrity assumptions
* Transaction usage (if any)

Deliver:

* Data Consistency Risk Score

---

# 📊 Final Interface Integrity Scorecard

| Category                        | Score (0–100) |
| ------------------------------- | ------------- |
| Request Validation Integrity    |               |
| Response Shape Consistency      |               |
| UI Rendering Accuracy           |               |
| Registration Workflow Integrity |               |
| Update Workflow Safety          |               |
| Tenant Interface Isolation      |               |
| Error Handling Robustness       |               |
| Overall Interface Maturity      |               |

Classify overall maturity as:

* Prototype
* Functional but Fragile
* Production-Ready
* Hardened
* Enterprise-Grade

---

# 🔒 Critical Constraints

* Do NOT assume behavior not proven by implementation
* If missing validation → classify as risk
* If frontend expects fields not returned → classify as contract violation
* If backend returns fields not used → classify as unnecessary exposure
* Treat healthcare data as high integrity requirement
* Prioritize athlete data correctness over UI convenience
* No vague recommendations
* No generic advice
* Tie every finding to architectural impact

