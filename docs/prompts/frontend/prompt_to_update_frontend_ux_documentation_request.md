Here is the fully structured, enterprise-grade version of your prompt for the **Frontend UX & Accessibility** domain:

---

# Improved Prompt

Carefully review the following UX & Accessibility roadmap documents:

* `docs/frontendroadmaps/06-Sintgesp-UX-Accessibility-Improvement-Roadmap.md`
* `docs/frontendroadmaps/06-Sintgesp-UX-Accessibility-Quick-Wins.md`

Your objectives are to:

1. Update the following documentation files so they accurately reflect all **implemented UX, accessibility, and interaction improvements**:

   * `docs/frontend/06-Sintgesp-UX-Accessibility-Part1.md`
   * `docs/frontend/06-Sintgesp-UX-Accessibility-Part2.md`
   * `docs/frontend/06-Sintgesp-UX-Accessibility-Part3.md`

2. Create a new roadmap document defining the **remaining unimplemented UX and accessibility issues**, including a structured and prioritized execution plan.

---

# Phase 1 – Update UX & Accessibility Documentation

---

## Step 1 – Analyze the Roadmaps

Identify which improvements and Quick Wins have been:

* ✅ Completed
* 🟡 Partially implemented
* ❌ Not implemented

Extract changes affecting:

### UX Architecture

* Layout consistency
* Design system alignment
* Visual hierarchy
* Spacing and grid systems
* Responsive design behavior
* Adaptive UI strategies
* Dark mode consistency
* Typography scaling

### Interaction & Feedback

* Loading states
* Skeleton screens
* Empty states
* Success and error feedback
* Microinteractions
* Animation & motion guidelines
* Transition consistency
* Button & action affordances
* Confirmation patterns

### Accessibility (WCAG 2.1 AA or target standard)

* Semantic HTML usage
* ARIA roles and attributes
* Keyboard navigation support
* Focus management
* Focus trapping in modals
* Screen reader compatibility
* Color contrast compliance
* Accessible error messaging
* Accessible form labeling
* Skip links
* Landmark roles
* Reduced motion support
* Accessible data tables
* Accessible modals and dialogs
* Accessible tooltips

### Mobile UX

* Touch target sizing
* Gesture interactions
* Responsive layout behavior
* Safe area handling
* Virtual keyboard handling
* Scroll and overflow management

### Performance & Perceived Performance

* Interaction latency
* Layout shifts
* Motion performance
* Progressive enhancement strategies

---

# Step 2 – Update Each Documentation File

---

## 1️⃣ `06-Sintgesp-UX-Accessibility-Part1.md`

* Update core UX architecture principles.
* Reflect implemented layout and design consistency improvements.
* Align documentation with current component design system.
* Remove outdated layout patterns.
* Update responsive and adaptive behavior documentation.
* Reflect implemented accessibility baseline standards.

---

## 2️⃣ `06-Sintgesp-UX-Accessibility-Part2.md`

* Update interaction and feedback patterns.
* Document implemented loading, empty, and error states.
* Reflect animation and microinteraction improvements.
* Align focus management and keyboard navigation patterns with implementation.
* Remove deprecated UX behaviors.

---

## 3️⃣ `06-Sintgesp-UX-Accessibility-Part3.md`

* Update complex UX flows (multi-step interactions, modals, dashboards, etc.).
* Reflect accessibility improvements in data-heavy interfaces.
* Document mobile-specific UX refinements.
* Align performance-related UX optimizations with implementation.
* Ensure compliance references match implemented standard.

---

# Documentation Requirements

* Reflect only implemented improvements.
* Do not duplicate roadmap content.
* Remove outdated UX patterns.
* Preserve structure unless clarity requires refactoring.
* Ensure consistent terminology across all three files.
* Ensure alignment with:

  * Component Library documentation
  * Forms & Validation documentation
  * Navigation & User Flows documentation
  * Performance & Security documentation
  * Backend API behavior affecting UX

Each file must describe the **current operational UX and accessibility architecture**, not planned changes.

---

# Phase 2 – Create UX & Accessibility Remaining Roadmap

Create a new roadmap file, for example:

`docs/frontendroadmaps/06-Sintgesp-UX-Accessibility-Remaining-Roadmap.md`

Obs: Consider splitting the document into multiple files due to its size. For example, create files such as 'docs/frontendroadmaps/06-Sintgesp-UX-Accessibility-Remaining-Roadmap-Part1.md', 'docs/frontendroadmaps/06-Sintgesp-UX-Accessibility-Remaining-Roadmap-Part2.md', and so on

---

## The new roadmap must include:

---

### 1. Remaining Issues Grouped by Domain

Organize partially implemented and unimplemented issues into:

* Design System Consistency Gaps
* Layout & Responsive Issues
* Interaction & Feedback Gaps
* Focus & Keyboard Navigation Issues
* ARIA & Semantic Markup Gaps
* Color Contrast Violations
* Screen Reader Compatibility Issues
* Motion & Reduced Motion Compliance
* Mobile UX Improvements
* Accessibility in Complex Components
* Error State & Feedback Inconsistencies
* Performance-Related UX Improvements

---

### 2. Prioritization

Each item must be categorized:

* 🔥 Critical (WCAG violations, blocking accessibility issues)
* ⚠️ High Priority
* 📌 Medium Priority
* 🧩 Nice to Have

---

### 3. Required Implementation Strategy Per Item

For every remaining issue include:

* Problem Description
* Current State
* Target State
* WCAG Criteria Affected (if applicable)
* UX Risk Level
* Legal/Compliance Risk (if applicable)
* Proposed Architectural or UX Solution
* Breaking Change Risk (Yes/No)
* Migration Strategy (if required)
* Estimated Complexity (Low / Medium / High)
* Performance Impact (if relevant)
* Dependencies

---

### 4. Phased Execution Plan

Organize into:

* Quick Wins
* Accessibility Compliance Stabilization Phase
* UX Consistency Standardization Phase
* Mobile UX Refinement Phase
* Interaction & Motion Optimization Phase
* Long-Term UX Architecture Evolution

---

# Constraints

* Do not modify existing roadmap files.
* Do not use scripts or shell commands.
* Do not invent undocumented UX features.
* Base updates strictly on implemented roadmap items.
* Ensure cross-document consistency.
* Explicitly flag inconsistencies between documentation and implementation.
* Ensure compliance target (e.g., WCAG 2.1 AA) is consistently referenced.

---

# Expected Output

After completing both phases, provide:

1. Summary of updates made to each of the three UX documentation files
2. Sections added, modified, or removed (per file)
3. List of roadmap items reflected as completed
4. Structured summary of the new Remaining Roadmap
5. Identified accessibility compliance gaps
6. Identified UX risk areas
7. Legal/compliance risk assessment summary
8. Maintainability and scalability risk assessment summary

