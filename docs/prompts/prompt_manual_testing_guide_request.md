
# 🧪 Secom Manual Testing Guide – Authoring Prompt (Chrome + Full Documentation Aware)

## 🎯 Mission

You are acting as a **Senior QA Engineer and Technical Documentation Specialist**.

Your task is to create a **comprehensive Manual Testing Guide** for the **Secom Office of Public Relations Management System**, intended for **real-world, end-to-end manual testing using Google Chrome**.

The guide must enable **any tester (QA, developer, product owner, or auditor)** to manually verify:

* Core business functionality
* UI/UX behavior
* Backend integrations
* Data consistency
* Multi-role and data scoping

⚠️ **Important:**
The guide is **not limited to the README or a single document**.
You must **use and reconcile all existing project documentation**, including but not limited to:

* README.md
* Test_Data_Documentation.md
* `/docs` architecture and design documents
* Backend API design and authentication docs
* Frontend architecture and navigation docs
* Seed scripts, configuration files, and environment variables

Assume the documentation set is **authoritative and complete**, and your output must reflect the **actual behavior of the system**, not assumptions.

---

## 🧠 Project Context (Authoritative)

### Product Overview

* **Name:** Secom – Office of Public Relations Management System
* **Domain:** Single-tenant government communications management (Assessoria de Comunicação)
* **Locale:** Brazilian Portuguese (pt-BR)
* **Compliance:** LGPD (partially implemented)
* **Access Modes:** Staff Portal and Citizen Portal

### Architecture & Stack

* **Frontend:** React 18, TypeScript, Vite, Zustand, TanStack Query, React Router, CSS Modules, Framer Motion
* **Backend:** Node.js 18+, Express, TypeScript, MongoDB (25+ collections), Redis, BullMQ
* **Authentication:** JWT + refresh tokens, dual authentication (staff vs citizen)
* **External Services:**

  * N/A (no payment integration)
  * N/A (no SMS integration)
  * Nodemailer (email via MailHog in dev)
  * Local file storage
* **Rate Limiting & Security:** Redis-based rate limiting, bcrypt password hashing, audit logging

### Deployment & URLs (Local Development)

* **Frontend:** `http://localhost:3000`
* **Backend API:** `http://localhost:5000`
* **Health Check:** `http://localhost:5000/health`

---

## 🧪 Test Data & Seeded Environment (Mandatory Usage)

Manual tests **must leverage the official seeded test data**, generated via:

```bash
npm run seed:test
```

### Global Rules

* **Password (all users):** `Test@123`
* **Email pattern:** `*@secom.gov.br.test`
* **Multi-tenant:** Strict tenant scoping
* **Date coverage:** Past 6 months, current day, next 3 months
* **Locale:** Brazilian names, CPF/CNPJ, addresses, phone numbers

### Roles & Accounts

* **System Admins (Global):**

  * `admin@secom.gov.br.gov.br.test`
  * `admin2@secom.gov.br.gov.br.test`

* **Tenant Admins, Assessors, Staff, CitizenProfiles**

  * Tenants: **Secom Principal** and **Secom Secundário**
  * Roles and permissions as defined in the seed data and RBAC documentation

* **Citizen Portal**

  * URL: `/citizen/login`
  * All citizens have verified emails and active portal access

All test cases must explicitly state **which role, tenant, and seeded account** is being used.

---

## 📋 Required Output

Generate **one Markdown file only**:

```
MANUAL_TESTING_GUIDE.md
```

The document must be:

* Structured and professional
* Checklist-oriented
* Fully executable without prior project knowledge
* Suitable for QA execution, UAT, and audits

Do **not** include commentary about how the guide was generated.

---

## 1️⃣ Test Environment Setup

Provide **precise, reproducible instructions** for preparing a clean test environment.

### Google Chrome Configuration

* Installing the latest stable Chrome
* Creating a fresh Chrome profile for testing
* Clearing cache, cookies, IndexedDB, and localStorage
* Disabling extensions
* Handling:

  * Third-party cookies
  * Popups and redirects
  * Mixed content warnings
* Using Chrome DevTools:

  * Console
  * Network tab
  * Application tab (storage, cookies)

### Application Setup

* Running frontend and backend locally
* Verifying MongoDB and Redis availability
* Confirming API health endpoint
* Optional Docker / Docker Compose setup

### Test Data Preparation

* Running seed scripts
* Verifying seeded tenants, users, and roles
* Resetting test data between executions

---

## 2️⃣ Manual Test Plan Overview

Define:

* Scope of manual testing
* Testing objectives aligned with real user workflows
* Browser-specific risks (Chrome behavior)
* Entry and exit criteria

Include a **test tracking table**:

| Area                   | Priority | Tester | Status  | Notes |
| ---------------------- | -------- | ------ | ------- | ----- |
| Authentication         | High     | QA     | Pending |       |
| Multi-Tenant Isolation | High     | QA     | Pending |       |
| CitizenProfiles               | High     | QA     | Pending |       |
| Agendamentos           | High     | QA     | Pending |       |
| Payments               | High     | QA     | Pending |       |
| Notifications          | Medium   | QA     | Pending |       |

---

## 3️⃣ Test Case Design Standard (Strict)

Each test case **must include**:

* Test ID
* User role
* Tenant context
* Preconditions (including seeded account)
* Numbered steps
* Expected result
* Actual result (blank)
* Status (Pass / Fail)
* Notes / screenshot reference

### Mandatory Format Example

| Test ID | Role | Tenant | Preconditions | Steps | Expected Result | Actual Result | Status | Notes |
| ------- | ---- | ------ | ------------- | ----- | --------------- | ------------- | ------ | ----- |

---

## 4️⃣ Core Functional Areas (Based on Full Documentation Set)

Create **multiple detailed manual test cases per area**, including edge cases and failure scenarios.

### Authentication & Authorization

* Staff vs citizen login flows
* Role-based access control
* Tenant scoping
* Token expiration and refresh
* Invalid credentials

### Tenant & Multi-Tenant Management

* System admin cross-boundary access
* Tenant admin restrictions
* Cross-boundary data leakage prevention

### Citizen Profile Management

* Create, edit, deactivate, reactivate citizens
* Service history
* Attachments and documents (S3-backed)

### Agendamento Scheduling

* Booking by staff
* Assessor availability
* Overlap prevention
* Agendamento lifecycle statuses

### Officeal Workflows

* Service records
* Officeal notes
* Action plans
* Assessments

### Payments & PressReleases

* payment checkout (sandbox)
* Successful and failed payments
* Receipts and invoices

### Notifications & Background Jobs

* SMS via SMS provider
* Email via email provider/Nodemailer
* BullMQ job execution and retries

### UI / UX Validation

* Layout and navigation
* Loading, empty, and error states
* Animations and transitions
* Accessibility and usability

### Data Consistency

* MongoDB persistence
* Redis cache behavior
* State consistency after refresh

---

## 5️⃣ Chrome-Specific Compatibility Tests

Include explicit Chrome-focused validations:

| Area      | Test                       | Expected Result | Notes |
| --------- | -------------------------- | --------------- | ----- |
| Cookies   | Session persistence        | JWT retained    |       |
| Storage   | Local/session storage      | Correct values  |       |
| Popups    | Modals & payment gateway            | Not blocked     |       |
| Redirects | Auth & payment flows       | Work correctly  |       |
| DevTools  | No critical console errors |                 |       |

---

## 6️⃣ Bug Reporting & Issue Tracking

Define:

* Reporting workflow (e.g., GitHub Issues)
* Required evidence (screenshots, console logs, network traces)
* Severity classification
* Retest and regression flow

### Mandatory Bug Template

```md
**Title:**  
**Environment:** Chrome vXX, OS  
**User Role:**  
**Tenant:**  
**Preconditions:**  
**Steps to Reproduce:**  
**Expected Result:**  
**Actual Result:**  
**Severity:** Critical / Major / Minor / UI  
**Attachments:** Screenshots / Logs
```

---

## 7️⃣ Acceptance Criteria

The guide is accepted only if:

* All major features documented across the project are covered
* All test cases use real seeded accounts
* Data scoping is validated
* Chrome-specific behavior is addressed
* No automated tools are referenced
* All steps are clear, reproducible, and unambiguous

---

## 8️⃣ Final Constraints

* Output **only** the contents of `MANUAL_TESTING_GUIDE.md`
* Do **not** invent features, roles, or workflows
* Base everything on the **entire documentation set**
* Assume the tester is technical but unfamiliar with Secom


