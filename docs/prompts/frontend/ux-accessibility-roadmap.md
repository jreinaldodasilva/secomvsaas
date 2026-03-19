Below is the **improved, document-scoped prompt**, tailored specifically for:

* `docs/architecture/frontend/ux-accessibility-part-1.md`
* `docs/architecture/frontend/ux-accessibility-part-2.md`

This version ensures the roadmap is created **exclusively from these UX & Accessibility documents**, not the entire frontend folder.

---

# ✅ Improved Prompt — Roadmap from UX & Accessibility Documentation Only

## 🎯 Objective

Using **only** the content from:

* `docs/architecture/frontend/ux-accessibility-part-1.md`
* `docs/architecture/frontend/ux-accessibility-part-2.md`

Create a **prioritized, actionable UX & Accessibility improvement roadmap**.

Do **NOT** use any other frontend documentation.
Do **NOT** infer issues outside what is explicitly stated or clearly implied in these three documents.

The goal is to transform the documented gaps, risks, and improvement notes into:

* A structured backlog
* Effort-based prioritization
* Sprint-ready roadmap
* Quick wins list
* Measurable UX & accessibility success targets

---

# 🧩 Scope Rules

* Work strictly from the UX & Accessibility documentation.
* Extract issues explicitly mentioned or strongly implied.
* Convert qualitative observations into structured action items.
* Provide realistic effort estimates.
* Focus on WCAG 2.1 AA compliance, usability, accessibility patterns, and interaction quality.

---

# 📋 Tasks

---

## 1️⃣ Issue Compilation & Prioritization

Extract all UX and accessibility issues and categorize them:

### 🟥 P0 – Critical (Compliance or Severe UX Risk)

Issues that:

* Block accessibility
* Violate WCAG 2.1 AA
* Prevent task completion
* Create legal or compliance risk

| # | Issue | UX/Accessibility Impact | Users Affected | Effort | Dependencies |
| - | ----- | ----------------------- | -------------- | ------ | ------------ |

---

### 🟧 P1 – High Priority (Strong UX Degradation)

Same table structure.

---

### 🟨 P2 – Medium Priority (Improvements & Enhancements)

Same table structure.

---

### 🟩 P3 – Low Priority (Nice-to-Have Refinements)

Same table structure.

---

### Deliverable:

A complete, categorized, effort-estimated UX & Accessibility issue list.

---

## 2️⃣ Quick Wins Identification

Identify **high-impact, low-effort improvements** such as:

* Contrast fixes
* Focus state improvements
* ARIA attribute additions
* Keyboard navigation corrections
* Error message clarity updates
* Microcopy improvements
* Accessible labels
* Motion reduction toggles

Format:

---

**Quick Win #1: [Title]**

* **Problem**
* **Impact**
* **Effort (hours/days)**
* **Implementation Suggestion**
* **Expected UX Outcome**

---

Provide 10–20 quick wins.

### Deliverable:

A structured Quick Wins list with implementation guidance.

---

## 3️⃣ Accessibility Debt Assessment

Estimate UX & accessibility-related technical debt:

* WCAG compliance gaps: ? days
* Semantic HTML corrections: ? days
* ARIA implementation debt: ? days
* Focus & keyboard navigation fixes: ? days
* Screen reader optimization: ? days
* Motion & animation compliance: ? days
* UX consistency improvements: ? days

**Total Estimated Effort:** ? weeks

Also classify debt severity:

* Critical compliance debt
* Structural UX debt
* Design system accessibility gaps

### Deliverable:

Quantified accessibility & UX debt report.

---

## 4️⃣ Implementation Roadmap

Create a sprint-based roadmap focused strictly on UX & accessibility.

---

### Sprint 1 (Weeks 1–2): Critical Accessibility Compliance

* [ ] Fix WCAG violations
* [ ] Implement proper semantic structure
* [ ] Ensure keyboard operability
* [ ] Add missing ARIA roles
* [ ] Improve error feedback accessibility

---

### Sprint 2 (Weeks 3–4): High Priority UX Fixes

* [ ] Improve focus management
* [ ] Standardize feedback patterns
* [ ] Enhance form accessibility
* [ ] Improve navigation clarity

---

### Sprint 3–4 (Weeks 5–8): UX Consistency & Enhancement

* [ ] Improve motion design compliance
* [ ] Refine microcopy and accessibility messaging
* [ ] Implement UX analytics tracking for accessibility

---

Each sprint must include:

* Clear tasks
* Effort estimate
* Dependencies
* Expected impact

---

### Deliverable:

Detailed sprint-by-sprint UX & accessibility roadmap.

---

## 5️⃣ Success Metrics

Define measurable UX & accessibility goals.

### Current Baseline (Estimate from documentation):

* WCAG compliance level: ?
* Accessibility score (Lighthouse): ?
* Keyboard navigation completeness: ?
* Screen reader compatibility level: ?
* UX consistency rating: ?

---

### 3-Month Target Goals:

* Full WCAG 2.1 AA compliance
* Accessibility score >95
* 100% keyboard navigable flows
* Standardized focus patterns across system
* Error states fully accessible
* Reduced user drop-off due to usability issues

---

### Deliverable:

UX & accessibility metrics dashboard definition.

---

## 6️⃣ Executive Summary (2–3 Pages)

Include:

* Overall UX Health Score (/100)
* Overall Accessibility Compliance Score (/100)
* Top 3 Critical Risks
* Top 3 High-Impact Improvements
* Estimated Total Effort
* Timeline
* Risk if No Action is Taken
* Business Impact of Improvements

This summary should be written for:

* CTO
* Head of Product
* Compliance stakeholders

---

# 📂 Output Files

---

## File 1:

`ux-accessibility-improvement.md`

Must contain:

* Prioritized issue list
* Accessibility debt quantification
* Sprint roadmap
* Effort estimates
* Dependencies
* Success metrics

---

## File 2:

`ux-accessibility-quick-wins.md`

Must contain:

* All quick wins
* Implementation guidance
* Expected impact
* Estimated effort
* Suggested order of execution

---

# 🚨 Important Constraints

* Use only the UX & Accessibility documents.
* Do not mix in architecture, state, or component-level issues unless explicitly mentioned in these files.
* Be realistic with effort estimates.
* Avoid generic statements — tie every item to documented gaps.
* Convert observations into actionable engineering tasks.

