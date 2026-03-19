Below is the **improved, document-scoped roadmap prompt**, tailored specifically for:

* `docs/frontend/07-Secom-Performance-Quality-Security.md`

This version ensures the roadmap and quick wins are created **exclusively from this document**, not the entire frontend folder.

---

# ✅ Improved Prompt — Roadmap from Performance, Quality & Security Document Only

## 🎯 Objective

Using **only** the content from:

* `docs/frontend/07-Secom-Performance-Quality-Security.md`

Create a **prioritized, actionable improvement roadmap** focused strictly on:

* Frontend performance
* Code quality
* Testing & reliability
* Security
* Observability
* Build & bundle optimization

Do **NOT** use any other frontend documentation.
Do **NOT** infer issues outside what is explicitly stated or clearly implied in this document.

The goal is to transform documented gaps, risks, and recommendations into:

* A structured prioritized backlog
* A quantified technical debt report
* A sprint-based execution roadmap
* A high-impact quick wins list
* Measurable performance & security targets

---

# 🧩 Scope Rules

* Work strictly from the Performance, Quality & Security document.
* Extract all explicit issues, risks, weaknesses, and improvement notes.
* Convert narrative observations into concrete engineering tasks.
* Provide realistic effort estimates (hours/days/weeks).
* Distinguish between performance debt, quality debt, and security risk.

---

# 📋 Tasks

---

## 1️⃣ Issue Compilation & Prioritization

Extract all documented issues and categorize them.

---

### 🟥 P0 – Critical (Security, Stability, Production Risk)

Issues that:

* Introduce security vulnerabilities
* Expose sensitive data
* Cause performance bottlenecks
* Risk outages or crashes
* Break CI/CD integrity

| # | Issue | Type (Perf / Quality / Security) | Impact | Users Affected | Effort | Dependencies |
| - | ----- | -------------------------------- | ------ | -------------- | ------ | ------------ |

---

### 🟧 P1 – High Priority (Major Degradation or Risk)

Same table structure.

---

### 🟨 P2 – Medium Priority (Optimization & Structural Improvements)

Same table structure.

---

### 🟩 P3 – Low Priority (Enhancements / Best Practices)

Same table structure.

---

### Deliverable:

A complete, categorized, effort-estimated performance/quality/security issue list.

---

## 2️⃣ Quick Wins Identification

Identify high-impact, low-effort improvements such as:

* Removing unused dependencies
* Enabling compression
* Code splitting adjustments
* Lazy loading improvements
* Adding missing ESLint rules
* Increasing test coverage in critical paths
* Fixing obvious bundle bloat
* Enabling HTTP caching
* Implementing security headers
* Fixing console errors
* Removing debug logs from production

---

### Format:

**Quick Win #1: [Title]**

* **Problem**
* **Category** (Performance / Quality / Security)
* **Impact**
* **Effort**
* **Implementation Suggestion**
* **Expected Outcome**

Provide 10–20 quick wins.

---

### Deliverable:

Structured Quick Wins list with clear implementation guidance.

---

## 3️⃣ Technical Debt Quantification

Estimate effort for:

### Performance Debt

* Bundle size optimization: ? days
* Rendering optimization: ? days
* Network optimization: ? days
* Caching improvements: ? days

### Quality Debt

* Test coverage gaps: ? days
* Refactoring complexity hotspots: ? days
* Linting / static analysis debt: ? days
* Type safety gaps: ? days

### Security Debt

* Vulnerability mitigation: ? days
* Dependency upgrades: ? days
* Secure token handling: ? days
* Environment configuration hardening: ? days

---

**Total Estimated Effort:** ? weeks

Classify debt severity:

* Critical production risk
* Structural maintainability risk
* Optimization opportunity

---

### Deliverable:

Quantified technical debt report broken down by category.

---

## 4️⃣ Implementation Roadmap

Create a realistic sprint-based roadmap.

---

### Sprint 1 (Weeks 1–2): Critical Stabilization & Security

* [ ] Fix security vulnerabilities
* [ ] Implement security headers
* [ ] Remove exposed sensitive configurations
* [ ] Fix production console errors
* [ ] Patch high-risk dependencies

---

### Sprint 2 (Weeks 3–4): Performance Optimization

* [ ] Implement code splitting
* [ ] Optimize bundle size
* [ ] Add lazy loading
* [ ] Improve caching strategy
* [ ] Optimize rendering bottlenecks

---

### Sprint 3 (Weeks 5–6): Code Quality & Testing

* [ ] Increase test coverage
* [ ] Refactor large modules
* [ ] Improve linting enforcement
* [ ] Add CI quality gates

---

### Sprint 4 (Weeks 7–8): Monitoring & Observability

* [ ] Implement error tracking
* [ ] Add performance monitoring
* [ ] Introduce production logging standards
* [ ] Add uptime and performance dashboards

---

Each sprint must include:

* Task list
* Effort estimates
* Dependencies
* Expected impact

---

### Deliverable:

Detailed sprint-by-sprint roadmap.

---

## 5️⃣ Success Metrics

Define measurable KPIs based on document findings.

---

### Current Baseline (Estimate from document)

* Lighthouse performance score: ?
* Bundle size: ? KB
* First Contentful Paint (FCP): ?
* Largest Contentful Paint (LCP): ?
* Time to Interactive (TTI): ?
* Test coverage: ?%
* Known vulnerabilities: ?
* Error rate: ?

---

### 3-Month Target Goals

* Lighthouse score >90
* Bundle size reduced by ≥30%
* LCP <2.5s
* TTI <3s
* Test coverage >80%
* Zero high-severity vulnerabilities
* Production error rate <0.5%

---

### Deliverable:

Performance & security success metrics dashboard definition.

---

## 6️⃣ Executive Summary (2–3 Pages)

Include:

* Overall Performance Score (/100)
* Code Quality Score (/100)
* Security Risk Score (/100)
* Top 3 Critical Risks
* Top 3 Optimization Opportunities
* Estimated Total Effort
* Timeline
* Business Risk if No Action is Taken
* ROI of Improvements

Audience:

* CTO
* Engineering Manager
* Security Lead
* Product Leadership

---

# 📂 Output Files

---

## File 1:

`docs/frontendroadmaps/07-Secom-Performance-Quality-Security-Roadmap.md`

Must include:

* Prioritized issue list
* Technical debt breakdown
* Sprint roadmap
* Effort estimates
* Dependencies
* Success metrics

---

## File 2:

`docs/frontendroadmaps/07-Secom-Performance-Quality-Security-Quick-Wins.md`

Must include:

* All quick wins
* Implementation guidance
* Expected measurable impact
* Effort estimates
* Suggested execution order

---

# 🚨 Important Constraints

* Use only `07-Secom-Performance-Quality-Security.md`.
* Do not mix architecture, UX, state management, or component issues unless explicitly referenced in this document.
* Avoid generic recommendations — every item must trace back to documented gaps.
* Be realistic with effort estimates.
* Convert qualitative descriptions into actionable engineering tasks.

