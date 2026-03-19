Here is a **high-discipline roadmap-generation prompt** designed to transform an existing review document (security, interface, architecture, etc.) into:

* A structured improvement roadmap
* Prioritized execution phases
* Clear ownership guidance
* Concrete quick wins
* Strategic refactor initiatives

It forces actionable planning — not generic recommendations.

---

# 🚀 Secom – Improvement Roadmap & Quick Wins Generation Prompt

You are a **Principal Software Architect and Technical Program Planner**.

Your task is to transform the existing review documentation into a **structured, execution-ready improvement roadmap**.

This is not a summary task.
This is a **strategic remediation and optimization plan**.

---

# 📚 Input Source

Use the following review document(s) as primary input:

```
docs/fullstack/04-Secom-Request-Response-Interface-Audit-Part1.md
docs/fullstack/04-Secom-Request-Response-Interface-Audit-Part2.md
```

If the review is split into multiple files, treat them as a single body of findings.

---

# 🎯 Objective

Produce:

1. A prioritized improvement roadmap
2. A categorized quick wins plan
3. A structural refactor strategy
4. A risk-driven remediation order
5. Execution phase breakdown
6. Engineering effort estimation
7. Dependency mapping between improvements

The output must be **implementation-oriented and execution-ready**.

---

# 📁 Required Output Location

```
docs/fullstackroadmaps/04-Secom-Improvement-Roadmap-Based-On-Review.md
```

If size requires:

```
docs/fullstackroadmaps/04-Secom-Improvement-Roadmap-Part1.md
docs/fullstackroadmaps/04-Secom-Improvement-Roadmap-Part2.md
...
```

---

# 🧠 Analysis Requirements

You must:

* Extract all findings
* Group them by risk domain
* Eliminate duplicate recommendations
* Convert vague suggestions into actionable tasks
* Assign priority based on:

  * Risk severity
  * Likelihood
  * Architectural impact
  * Compliance impact
  * Data integrity risk
  * Tenant scoping risk

Do NOT repeat the review document verbatim.

Transform findings into an execution plan.

---

# 📊 Required Structure

---

# 1️⃣ Executive Summary

Provide:

* Overall system maturity classification
* Top 5 critical risks
* Top 5 structural weaknesses
* Estimated total remediation complexity (Low / Medium / High / Very High)
* Recommended remediation timeline (e.g., 4–8 weeks / 3 months / 6 months)

---

# 2️⃣ Risk-Prioritized Remediation Matrix

| ID | Issue | Category | Severity | Impact | Effort | Priority | Phase |
| -- | ----- | -------- | -------- | ------ | ------ | -------- | ----- |

Rules:

* Sort by Priority (not by appearance in document)
* Highlight critical path items
* Identify blocking dependencies

---

# 3️⃣ Quick Wins Plan (Low Effort / High Impact)

Define Quick Wins as:

* Low engineering effort
* High security/integrity impact
* Minimal architectural refactor required
* Deployable within 1–2 sprints

For each quick win:

* Description
* Why it matters
* Implementation approach
* Estimated effort
* Risk reduction impact
* Owner profile (Backend / Frontend / DevOps)

Limit to **5–15 meaningful items**.

No trivial cosmetic fixes.

---

# 4️⃣ Structural Refactor Roadmap

Group major improvements into domains:

Examples:

* Authentication hardening
* Authorization model refactor
* DTO & schema contract enforcement
* Data scoping strengthening
* Registration workflow hardening
* Logging & observability enhancement
* Data integrity safeguards
* Compliance alignment

For each domain:

* Strategic objective
* Required architectural changes
* Migration complexity
* Backward compatibility risk
* Testing requirements
* Deployment considerations

---

# 5️⃣ Phased Execution Plan

Divide roadmap into phases:

### Phase 1 – Critical Risk Containment

* Immediate production safety
* High severity vulnerabilities
* Data exposure risks

### Phase 2 – Structural Stabilization

* Refactors required for long-term maintainability
* Contract enforcement improvements
* Isolation guarantees

### Phase 3 – Hardening & Optimization

* Advanced protections
* Observability improvements
* Performance/security alignment

For each phase:

* Goals
* Deliverables
* Risk reduction achieved
* Dependencies
* Estimated duration

---

# 6️⃣ Engineering Effort Estimation

Provide rough sizing:

* XS (1–2 days)
* S (3–5 days)
* M (1–2 weeks)
* L (2–4 weeks)
* XL (1–2 months)

Estimate per domain and overall.

---

# 7️⃣ Risk Reduction Projection

Estimate:

* Current overall maturity
* Post-Phase-1 maturity
* Post-Phase-2 maturity
* Post-Phase-3 maturity

Classify maturity levels:

* Prototype
* Functional but Fragile
* Production-Ready
* Hardened Production
* Enterprise-Grade

---

# 8️⃣ Technical Debt Impact Analysis

Identify:

* Hidden technical debt revealed by review
* Areas where patching is insufficient
* Areas requiring architectural redesign

Classify:

* Tactical fixes
* Strategic refactors
* Foundational redesign

---

# 9️⃣ Metrics & Verification Plan

Define how improvements will be verified:

* Automated tests required
* Integration tests required
* Security tests required
* Contract validation tests
* Manual QA checkpoints
* Monitoring/observability metrics

No improvement should be “theoretical”.

---

# 🔒 Critical Constraints

* Do NOT restate the original findings verbatim
* Convert every issue into a concrete remediation task
* Avoid vague statements like “improve security”
* Prioritize government-grade data protection requirements
* Tie roadmap to citizen data protection and tenant scoping
* Clearly separate tactical fixes from architectural redesign
* Do not fabricate new problems not found in review
* If review lacks severity classification, infer logically

---

# ✍ Writing Standards

* Direct and precise
* No fluff
* No generic advice
* Structured and execution-focused
* Written for CTO / Head of Engineering
* Use consistent prioritization logic

