Below is an improved, clearer, and more execution-oriented version of your prompt. It is structured to reduce ambiguity, enforce measurable outputs, and explicitly includes the additional documentation file as a reference source.

---

# ✅ Improved AI Prompt

## Secom Frontend – Performance, Code Quality, and Security Audit

Conduct a **comprehensive frontend technical audit** of the Secom application.

You must analyze:

* Application performance
* Core Web Vitals
* Bundle size and dependency impact
* Code quality and architecture
* TypeScript usage maturity
* React patterns and anti-patterns
* Error handling robustness
* Security practices (including LGPD considerations)
* Testing coverage and reliability

In addition to the source code and build artifacts, you must also read and use the architectural context provided in:

* `docs/architecture/frontend/overview.md`

Use this document to validate whether the implementation aligns with the intended architecture and frontend standards.

---

# 🔎 Required Materials

You have access to:

* Complete frontend source code
* Production build output
* Bundle analyzer results
* Chrome DevTools (Performance, Lighthouse, Network, Coverage)
* React DevTools Profiler
* Testing framework files (if present)
* `docs/architecture/frontend/overview.md`

---

# 📋 Audit Scope & Tasks

---

## 1️⃣ Performance Analysis

### Lighthouse Audits

Run Lighthouse on all key pages (minimum: Login, Dashboard, CitizenProfile List, Agendamentos).

Report results:

| Page  | Performance | Accessibility | Best Practices | SEO   |
| ----- | ----------- | ------------- | -------------- | ----- |
| Login | ?/100       | ?/100         | ?/100          | ?/100 |

Include:

* Major blocking resources
* Render-blocking scripts
* Large layout shifts
* Third-party performance impact

---

### Core Web Vitals

Measure:

* LCP (Largest Contentful Paint)
* FID (First Input Delay)
* CLS (Cumulative Layout Shift)

| Page  | LCP | FID | CLS | Pass/Fail |
| ----- | --- | --- | --- | --------- |
| Login | ?s  | ?ms | ?   | ?         |

Assess:

* Real vs lab data differences (if available)
* Mobile vs desktop performance
* Causes of failures

---

### Bundle & Dependency Analysis

Provide:

```
Total bundle size: ??? KB (gzipped)
Initial load JS: ??? KB
Largest route chunk: ??? KB
```

Identify:

Largest dependencies:

1. [package] — ??? KB
2. [package] — ??? KB

Largest internal modules:

1. [file] — ??? KB
2. [file] — ??? KB

Assess:

* Tree-shaking effectiveness
* Dead code
* Dynamic imports usage
* Code splitting strategy

---

### React DevTools Profiling

Identify:

* Components with excessive re-renders
* Expensive renders (>16ms)
* Inefficient memoization
* State colocations issues

Deliver insights with concrete examples.

---

### ✅ Deliverable

A **Complete Performance Audit Report** with severity classification:

* 🟥 Critical
* 🟧 High
* 🟨 Medium
* 🟩 Low

---

## 2️⃣ Code Quality Analysis

Evaluate overall maintainability and architectural alignment.

---

### TypeScript Usage

Assess:

* Strict mode: Enabled / Disabled
* `any` usage count
* Unsafe type assertions
* Type coverage estimate (%)
* Missing type definitions
* Usage of generics
* Domain type modeling quality

Provide:

| Metric        | Value |
| ------------- | ----- |
| Strict Mode   | ?     |
| any Count     | ?     |
| Type Coverage | ?%    |

---

### React Patterns Audit

#### ✅ Good Practices Found

* Functional components
* Custom hooks
* Clear separation of concerns
* Proper key props

#### ❌ Anti-Patterns Found

| Anti-Pattern                | Count | Examples   | Priority    |
| --------------------------- | ----- | ---------- | ----------- |
| Large components (>300 LOC) | ?     | [List]     | 🟧 High     |
| Props drilling (>3 levels)  | ?     | [Examples] | 🟧 High     |
| Missing useEffect deps      | ?     | [Examples] | 🟥 Critical |
| Business logic inside UI    | ?     | [Examples] | 🟧 High     |

---

### Code Organization

Evaluate:

* Folder structure consistency
* Domain separation
* File size distribution
* Duplication patterns
* Naming conventions
* Architecture alignment with `overview.md`

---

### ✅ Deliverable

A **Code Quality Report** with measurable findings and refactoring priorities.

---

## 3️⃣ Error Handling Analysis

Document:

* Error boundaries implementation
* API error handling consistency
* Centralized vs scattered handling
* Retry strategies
* User-facing error messaging clarity
* Error logging/monitoring integration (Sentry, etc.)

Classify findings:

* 🟥 Unhandled errors
* 🟧 Inconsistent patterns
* 🟨 Poor UX error messaging
* 🟩 Missing monitoring

---

### ✅ Deliverable

A structured **Error Handling Assessment**.

---

## 4️⃣ Security Review

---

### Authentication & Session Security

Assess:

* Token storage (localStorage, cookies, memory)
* Token refresh logic
* Expiration handling
* Password handling
* Session invalidation
* CSRF mitigation

---

### XSS & Injection Protection

Check:

* `dangerouslySetInnerHTML`
* Unsanitized user content
* Input validation
* URL parameter handling

---

### Data Security

Verify:

* Sensitive data in URLs
* Sensitive data in logs
* Console leaks
* LGPD compliance considerations
* Environment variable exposure

---

### API Security

Evaluate:

* API keys exposure
* Request validation
* HTTPS enforcement
* CORS configuration assumptions
* Rate-limiting assumptions

---

### Identify

* 🟥 Critical security issues
* 🟧 High-risk improvements
* 🟨 Best practice violations

---

### ✅ Deliverable

A **Frontend Security Audit Report**.

---

## 5️⃣ Testing Coverage

Document:

* Testing framework used (Jest / Vitest / None)
* Test distribution (Unit / Integration / E2E)
* Coverage percentage
* Untested critical flows:

  * Authentication
  * Form submissions
  * Data mutations
  * Error states

Provide:

| Type        | Count | Coverage |
| ----------- | ----- | -------- |
| Unit        | ?     | ?%       |
| Integration | ?     | ?%       |
| E2E         | ?     | ?%       |

---

### ✅ Deliverable

A **Testing Assessment Report** with risk analysis.

---

# 📄 Final Output Document

**File name:**
`performance-quality-security.md`

---

# 📚 Required Output Structure

1. Executive Summary
2. Performance Analysis
3. Core Web Vitals
4. Bundle Size Analysis
5. Code Quality Evaluation
6. TypeScript Usage
7. React Patterns Audit
8. Error Handling Assessment
9. Security Review
10. Testing Coverage
11. Prioritized Optimization Roadmap

---

# 🎯 Expectations

* Be evidence-based.
* Include metrics wherever possible.
* Provide concrete file references.
* Classify issues by severity.
* Align findings with the intended architecture described in `overview.md`.
* Conclude with a prioritized action plan (Quick Wins / Medium-Term / Strategic Improvements).

