# Secom API Endpoints & Design Review

## Comprehensive API Architecture & Design Audit

You are a **Senior Backend Architect performing a production-grade API audit** of the Secom system.

**Project Context**: Secom is a communication management system for the Secretaria de Comunicação managing:
- **Modules**: Press releases, media contacts, clipping, events, appointments, citizen portal, social media
- **Roles**: admin, assessor, social_media, atendente, citizen
- **Architecture**: Modular monolith with domain-driven organization
- **API**: RESTful with `/api/v1/` prefix

Use the following documents as your primary sources of truth:

* `docs/architecture/backend/overview-part-1.md`
* `docs/architecture/backend/overview-part-2.md`
* `docs/architecture/backend/overview-part-3.md`
* `docs/roadmaps/backend/architecture-improvement.md`
* `docs/roadmaps/backend/quick-wins.md`

Assume:

* This is a **government communications system** handling sensitive data
* The API is in production or near-production
* The system must meet **high standards of security, scalability, data integrity, and maintainability**
* It uses **MongoDB + Mongoose**
* It implements **multi-tenancy with RBAC**

If information is missing:

* Explicitly state assumptions
* Identify documentation gaps
* Flag architectural risks
* Do NOT invent endpoints or behavior without stating assumptions

---

## Audit Objectives

Produce a **deep architectural analysis** of the API layer focusing on:

1. API surface completeness for all Secom modules
2. REST design quality and consistency
3. Consistency & predictability across modules
4. Scalability patterns for multi-tenancy
5. Security & data scoping for tenant isolation
6. Long-term maintainability risks
7. Developer experience and API usability

This is not a superficial checklist review — it is an engineering audit.

---

## Required Output File

```
docs/architecture/backend/api-design.md
```

Note: Consider splitting the document into multiple files due to its size. For example, create files such as `docs/architecture/backend/api-design-part-1.md`, `docs/architecture/backend/api-design-part-2.md`, and so on.

---

## Required Sections

1. Executive Summary
2. API Overview (Secom modules and endpoints)
3. Complete API Endpoint Inventory (organized by module)
4. RESTful Design Evaluation
5. Request & Response Pattern Analysis
6. Pagination, Filtering & Sorting Architecture
7. API Versioning Strategy
8. Multi-Tenancy & Security Boundary Review
9. Rate Limiting & Abuse Protection
10. API Documentation Quality
11. Architectural Risk Matrix
12. Scoring Summary

---

## Secom-Specific Analysis Points

When analyzing the API, pay special attention to:

* **Module Organization**: How the 7 Secom modules are represented in API routes
* **Role-Based Access**: How different roles (admin, assessor, social_media, atendente, citizen) access different endpoints
* **Tenant Isolation**: How multi-tenancy is enforced at the API level
* **Data Scoping**: How tenant data is properly scoped in responses
* **Module Communication**: How modules interact through the API
* **Status Workflows**: How different modules handle status transitions (e.g., press release approval workflow)

---

## Formatting & Style Requirements

* Use structured Markdown
* Prefer tables for inventories and comparisons
* Use diagrams where they add clarity
* Maintain a neutral, technical tone
* Avoid speculative assumptions
* Avoid step-by-step refactoring instructions
* Write for senior backend engineers

---

## Quality Expectations

The analysis should:

* Provide architectural clarity specific to Secom's domain
* Reveal technical and organizational risks
* Support onboarding and long-term maintenance
* Serve as a baseline for refactoring or scaling discussions
* Document how Secom's specific requirements (multi-tenancy, RBAC, modular structure) are implemented in the API

