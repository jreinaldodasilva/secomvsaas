Here is a **clear, structured, execution-ready alignment prompt** designed to synchronize:

* `docs/fullstack/document.md`
* All `docs/backend/` reviews
* All `docs/frontend/` reviews

The goal is **cross-document consistency, removal of contradictions, and creation of a unified architectural truth source**.

---

# 🧠 Sintgesp Cross-Review Alignment & Consistency Audit

## 🎯 Objective

Perform a **cross-document alignment audit** to ensure that:

* `docs/fullstack/document.md`
* All files inside `docs/backend/`
* All files inside `docs/frontend/`

are:

* ✅ Structurally consistent
* ✅ Architecturally aligned
* ✅ Terminologically synchronized
* ✅ Free of contradictions
* ✅ Describing the same system reality
* ✅ Reflecting the current source code behavior

This task is not a rewrite.
It is a **systematic alignment and drift detection exercise**.

---

# 🔎 Global Alignment Requirements

You must:

1. Read all documents in:

   * `docs/fullstack/`
   * `docs/backend/`
   * `docs/frontend/`
2. Extract:

   * Architecture descriptions
   * Data flow descriptions
   * DTO definitions
   * API structure references
   * Validation descriptions
   * State management explanations
   * Naming conventions
   * Folder structures
3. Compare them for:

   * Contradictions
   * Outdated references
   * Terminology drift
   * Missing cross-references
   * Duplicated or conflicting guidance

All inconsistencies must be documented.

---

# 1️⃣ ARCHITECTURE ALIGNMENT

Compare how architecture is described across:

* Backend documentation
* Frontend documentation
* Fullstack document

### Validate:

* Layer definitions match (Controller → Service → Repository, etc.)
* Data flow descriptions are consistent
* Shared package usage is consistently described
* API versioning strategy matches everywhere
* State management description aligns with real usage
* Folder structure explanations do not conflict

### Deliverable

| Topic | Fullstack Doc | Backend Docs | Frontend Docs | Aligned? | Conflict Description | Fix Recommendation |
| ----- | ------------- | ------------ | ------------- | -------- | -------------------- | ------------------ |

---

# 2️⃣ API CONTRACT CONSISTENCY

Cross-check:

* Endpoint descriptions in backend docs
* Endpoint usage in frontend docs
* API explanations in fullstack document

### Validate:

* Same endpoint naming
* Same route structure
* Same request/response shape references
* Same response envelope description
* Same pagination explanation

### Deliverable

| Endpoint | Backend Doc Ref | Frontend Doc Ref | Fullstack Ref | Consistent? | Notes |
| -------- | --------------- | ---------------- | ------------- | ----------- | ----- |

---

# 3️⃣ DTO & SHARED TYPE ALIGNMENT

Compare documentation references to:

* Backend DTO definitions
* Shared package types
* Frontend type usage documentation

Identify documentation drift such as:

* DTO documented but not implemented
* Implemented but undocumented types
* Mismatched field definitions across docs
* Different naming in frontend vs backend documentation

### Deliverable

| Type | Mentioned in Backend Docs | Mentioned in Frontend Docs | Mentioned in Fullstack Doc | Consistent Definition? | Notes |
| ---- | ------------------------- | -------------------------- | -------------------------- | ---------------------- | ----- |

---

# 4️⃣ DATA FLOW DESCRIPTION CONSISTENCY

Compare how data flow is explained:

Example areas:

* Form submission flow
* GET request lifecycle
* POST lifecycle
* Error handling flow
* Validation pipeline
* State update after mutation

Check if:

* The same steps are described consistently.
* The same terminology is used.
* Frontend and backend explanations complement rather than contradict each other.

---

# 5️⃣ TERMINOLOGY & NAMING STANDARDIZATION

Extract terminology used across all docs:

Examples:

* “DTO” vs “Schema”
* “Service layer” vs “Business layer”
* “Hook” vs “Data instructor”
* “Shared types” vs “Common models”
* “Envelope response” vs “Standard response”

Identify:

* Synonyms used inconsistently
* Conflicting naming conventions
* Outdated terminology

Deliver:

| Term | Backend Usage | Frontend Usage | Fullstack Usage | Unified Term Recommendation |

---

# 6️⃣ REVIEW FINDINGS CONSOLIDATION

Compare:

* Findings from backend reviews
* Findings from frontend reviews
* Findings from fullstack review

Identify:

* Issues mentioned in one document but missing in others
* Duplicate issues described differently
* Severity mismatches
* Missing cross-references

Deliver:

| Issue | Mentioned In | Missing From | Severity Consistent? | Action Needed |

---

# 7️⃣ STRUCTURAL DOCUMENT ALIGNMENT

Ensure all documents:

* Follow similar section ordering where logical
* Use consistent headings
* Follow consistent severity classification
* Use consistent table formats
* Have aligned roadmap structures

Deliver:

| Document | Structure Consistent? | Missing Sections? | Suggested Reordering |

---

# 8️⃣ OUTPUT REQUIREMENTS

Generate:

1. `docs/fullstack/Sintgesp-Documentation-Alignment-Report.md`
2. `docs/fullstack/Sintgesp-Architecture-Consistency-Matrix.md`
3. `docs/fullstack/Sintgesp-DTO-Documentation-Drift-Report.md`
4. `docs/fullstack/Sintgesp-Term-Standardization-Guide.md`
5. `docs/fullstack/Sintgesp-Documentation-Unification-Roadmap.md`

---

# 9️⃣ REMEDIATION ROADMAP

Create a phased plan:

| Phase   | Focus                       | Documents Updated   | Goal                           |
| ------- | --------------------------- | ------------------- | ------------------------------ |
| Phase 1 | Critical contradictions     | Fullstack + Backend | Remove architectural conflicts |
| Phase 2 | DTO alignment               | All layers          | Eliminate type drift           |
| Phase 3 | Terminology standardization | All docs            | Unified vocabulary             |
| Phase 4 | Structural normalization    | All docs            | Consistent formatting          |

---

# 🏁 Success Criteria

Alignment is complete only if:

* No architectural contradictions remain.
* API descriptions match across all documents.
* DTO references are consistent everywhere.
* Terminology is standardized.
* All review findings are synchronized.
* A unified documentation roadmap exists.

---

If you want, I can now generate:

* A **lighter token version**
* A **multi-step execution version for staged AI runs**
* Or a **strict diff-based version that produces patch-ready changes**
