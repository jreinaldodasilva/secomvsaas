# Secom Seed Script Review & Alignment Audit

## Target: `backend/scripts/seedTestData.ts`

---

## Objective

Conduct a **comprehensive technical review** of the seed testing script located at:

```
backend/scripts/seedTestData.ts
```

The goal is to ensure that the seed script:

* ✅ Reflects the current Secom backend architecture
* ✅ Uses up-to-date models and DTOs for all Secom modules
* ✅ Aligns with database schemas
* ✅ Matches shared types (if applicable)
* ✅ Produces data compatible with frontend expectations
* ✅ Does not introduce type drift or invalid states
* ✅ Respects validation rules and required fields
* ✅ Is maintainable, deterministic, and safe to run
* ✅ Covers all Secom modules (press-releases, media-contacts, clipping, events, appointments, citizen-portal, social-media)

This is an alignment and correctness audit — not just a code review.

---

## Global Review Requirements

You must:

1. Inspect:
   * Database models (Mongoose schemas)
   * Backend DTO definitions
   * Validation schemas
   * Shared types (if applicable)
   * Frontend assumptions about data shape

2. Compare seed data fields against:
   * Required schema fields
   * Enum definitions
   * Default values
   * Relations (foreign keys / references)
   * Secom-specific fields (tenant, role, module-specific data)

3. Detect:
   * Missing required fields
   * Outdated field names
   * Invalid enum values
   * Hardcoded legacy values
   * Inconsistent relationships
   * Duplicate data risks
   * Invalid date formats
   * Nullability violations
   * Missing Secom module data
   * Invalid role assignments

All inconsistencies must be documented.

---

## Secom-Specific Entities to Validate

### 1. Users
- Roles: admin, assessor, social_media, atendente, citizen
- Tenant assignment
- Permissions/role mapping
- Profile completeness

### 2. Press Releases
- Status workflow (draft, pending-approval, approved, published)
- Assessor assignment
- Tenant association
- Required fields (title, content, date)

### 3. Media Contacts
- Contact types (journalist, media-outlet, etc.)
- Assessor assignment
- Tenant association
- Contact information validation

### 4. Clipping
- Source information
- Date ranges
- Relevance scoring
- Tenant association

### 5. Events
- Event types
- Date/time validity
- Location information
- Attendee management
- Tenant association

### 6. Appointments
- Appointment types
- Citizen assignment
- Atendente assignment
- Status workflow
- Tenant association

### 7. Citizen Portal
- Citizen profiles
- Profile completeness
- Privacy settings
- Tenant association

### 8. Social Media
- Platform types (Twitter, Facebook, Instagram, LinkedIn)
- Content scheduling
- Status workflow
- Social_media role assignment
- Tenant association

---

## 1️⃣ Model & Schema Alignment

For each Secom entity being seeded:

* Identify the corresponding database model.
* Compare seed object fields with schema definition.
* Verify:
  * Required fields are present
  * Optional fields are valid
  * Default values are respected
  * Types match (string, number, Date, boolean, enum, array, nested objects)
  * Secom-specific fields (tenant, role, status) are correct

### Deliverable

| Entity | Schema Fields Match? | Missing Fields | Invalid Fields | Enum Mismatch? | Secom-Specific Fields Valid? | Notes |
|--------|----------------------|----------------|----------------|----------------|------------------------------|-------|

---

## 2️⃣ Relationship & Referential Integrity

Verify:

* Foreign key references exist
* Relationship order is correct (e.g., Users created before PressReleases)
* No orphan records are created
* IDs are correctly reused
* Circular dependencies are avoided
* Tenant references are consistent
* Role assignments are valid

### Validate:

* Many-to-one (e.g., PressRelease → User/Assessor)
* One-to-many (e.g., User → PressReleases)
* Many-to-many (if applicable)
* Tenant isolation (all records belong to correct tenant)

### Deliverable

| Entity | Relationship Valid? | Dependency Order Correct? | Risk of Orphan Data? | Tenant Isolation Valid? | Notes |

---

## 3️⃣ DTO & Shared Type Alignment

Compare seeded objects with:

* Backend DTO definitions
* Shared types (if exported)
* Frontend type expectations

Ensure:

* Field names match
* Optional vs required alignment
* Enum values match shared definitions
* Date serialization matches frontend expectations
* No undocumented fields are introduced
* Secom-specific fields are properly typed

### Deliverable

| Type | Matches Backend DTO? | Matches Shared Type? | Drift? | Severity | Secom-Specific Fields Correct? | Notes |

---

## 4️⃣ Validation Compatibility

Determine whether seeded data would:

* Pass backend validation middleware
* Trigger validation errors
* Violate business logic constraints
* Respect Secom-specific rules (role permissions, module access, etc.)

If validation is bypassed in the seed script, document risks.

### Deliverable

| Entity | Would Pass Validation? | Violates Business Rules? | Violates Secom Rules? | Notes |

---

## 5️⃣ Data Realism & Frontend Compatibility

Evaluate whether the seeded data:

* Covers realistic scenarios for Secom workflows
* Covers edge cases (empty states, partial states)
* Reflects typical Secom usage patterns
* Matches frontend UI assumptions
* Represents all Secom roles appropriately
* Covers all Secom modules

Check for:

* Meaningful names (realistic press release titles, contact names, etc.)
* Realistic timestamps
* Valid enum states (status workflows, role assignments)
* Proper status transitions
* Data variety (avoid overly uniform records)
* Secom-specific data patterns (tenant separation, role-based data)

### Deliverable

| Entity | Realistic? | Covers Edge Cases? | Suitable for UI Testing? | Secom-Specific Patterns Covered? | Notes |

---

## 6️⃣ Script Structure & Safety

Review script implementation quality:

### Evaluate:

* Idempotency (can it be safely re-run?)
* Duplicate prevention
* Transaction usage (if applicable)
* Environment safeguards (dev/test only)
* Logging clarity
* Error handling
* Async handling correctness
* Connection closing safety
* Clear teardown/reset strategy
* Tenant seeding strategy

### Deliverable

| Category | Status | Risk Level | Improvement Suggestion |
|----------|--------|------------|------------------------|

---

## 7️⃣ Secom-Specific Validation

Verify Secom-specific requirements:

* [ ] All 5 roles are seeded (admin, assessor, social_media, atendente, citizen)
* [ ] All 7 modules have representative data
* [ ] Tenant isolation is properly demonstrated
* [ ] Role-based data access is testable
* [ ] Status workflows are complete
* [ ] Cross-module relationships are valid
* [ ] Citizen portal data is separate from admin data
* [ ] Social media data uses correct platform types

### Deliverable

| Requirement | Met? | Notes |

---

## 8️⃣ Drift & Risk Summary

Produce:

### A. Critical Issues

* Schema mismatches
* Broken relationships
* Invalid enum usage
* Missing required fields
* Secom-specific rule violations

### B. Medium Risks

* Unrealistic test data
* Validation bypass
* Poor relationship modeling
* Incomplete module coverage

### C. Low Risks

* Naming inconsistencies
* Minor formatting issues

Classify each as:

* 🔴 Critical
* 🟠 High
* 🟡 Medium
* 🟢 Low

---

## 9️⃣ Remediation Plan

Provide a prioritized roadmap:

| Priority | Issue | Impact | Suggested Fix | Effort |
|----------|-------|--------|---------------|--------|

Categories:

* Immediate fixes (schema mismatches)
* Structural improvements
* Data realism improvements
* Secom-specific coverage improvements
* Script hardening
* Type synchronization

---

## 📦 Required Output Files

Generate:

1. `docs/scripts/Secom-Seed-Script-Alignment-Report.md`
2. `docs/scripts/Secom-Seed-DTO-Drift-Report.md`
3. `docs/scripts/Secom-Seed-Integrity-Risk-Assessment.md`
4. `docs/scripts/Secom-Seed-Refactor-Recommendations.md`
5. `docs/scripts/Secom-Seed-Module-Coverage-Report.md`

---

## 🏁 Completion Criteria

The review is complete only if:

* All seeded entities are verified against schemas.
* All relationships are validated.
* All DTO mismatches are documented.
* Validation compatibility is confirmed.
* Script safety risks are identified.
* Secom-specific requirements are verified.
* All 7 modules have adequate test data.
* A concrete remediation roadmap is delivered.

