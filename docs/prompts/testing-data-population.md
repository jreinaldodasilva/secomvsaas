# Secom – Test Data Population Prompt, Test Dataset & QA Guide

## 1. Master Prompt – Test Data Population, Seeding Script & Documentation

Use the prompt below with an LLM or internal tooling to **design, generate, and document** a complete test dataset **and the script that populates it** for the Secom platform.

---

### **Prompt: Secom Full Test Environment Generator**

You are acting as a **senior full-stack QA & platform simulation engineer** for the Secom government communications management system.

Before producing any output, you must **read, analyze, and extract requirements from ALL existing Secom documentation**, including but not limited to:

* Backend architecture and MongoDB schema documentation
* Frontend architecture, component library, and state management docs
* Navigation, user flows, forms, validation, UX, and accessibility documentation

You must treat the existing documentation as the **single source of truth** for:

* Data models and relationships
* Role permissions and access rules
* Validation constraints
* Frontend behaviour and UI expectations

No assumptions may contradict the documented architecture. Any ambiguity must be explicitly noted in the output documentation as an assumption or open question.

Your task is to **design, generate, and document** a complete **test environment** that simulates real-world usage of Secom across:

* Backend (Node.js / Express / MongoDB)
* Frontend (React / Vite / role-based routing)
* Authentication (staff + citizen portals)
* Officeal workflows (citizens, agendamentos, action, notes)

You must produce **three deliverables**:

1. **A runnable data population script** (seed script)
2. **Comprehensive documentation of all generated accounts and data**
3. **A full testing guide describing expected frontend and backend behaviour**

---

### **Global Rules & Constraints**

* Use **Brazilian locale defaults** (names, phone formats, Portuguese text, CPF placeholders).
* Follow Secom’s **single-tenant data model** strictly.
* All MongoDB documents must use valid ObjectId references.
* Emails must be unique, clearly marked as test accounts, and grouped by role.
* Passwords must be compatible with Secom auth (bcrypt/JWT). If hashing is abstracted, clearly document plaintext → hash mapping.
* Dates must cover **historical, current, and future** ranges to exercise dashboards, filters, and reports.
* Respect backend validation (Zod / express-validator) and frontend form constraints.

---

### **Prompt: Secom Test Data Seeder**

You are acting as a **backend test data generator** for the Secom government communications management platform.

Your task is to **populate a MongoDB database** with realistic, production-like **test data** that simulates an active Secom office using the system.

#### **General Rules**

* Use **Brazilian locale defaults** (names, phone formats, CPF placeholders, Portuguese text).
* All data must be **internally consistent** and reference valid ObjectIds.
* Emails must be unique and clearly marked as test accounts.
* Passwords should be hashed using the platform’s standard auth mechanism (use placeholder values if hashing is abstracted).
* Respect role-based access and ownership (tenant → staff → citizens → agendamentos).
* Dates should span **past, present, and near future** to test reporting and calendar views.

---

### **Entities to Create & Populate via Script**

Your seeding script must create the following entities **in the correct dependency order**, ensuring referential integrity.

#### 1. System Administrators

* 2 global administrators
* role = super_admin / ADMIN
* Not scoped to tenants
* Purpose: platform-wide access, audits, configuration

#### 2. Tenants

Create **2 tenants**, each with:

* name, CNPJ (fake), address, phone, timezone
* operating hours (weekday + Saturday)
* default agendamento types
* meeting rooms

#### 3. Tenant Administrators

* 1 admin per tenant
* role = admin
* Scoped strictly to one tenant

#### 4. Assessors (Assessors)

* 3 assessors per tenant
* role = assessor
* specialties (Assessoria de Imprensa, Mídias Sociais, Atendimento ao Cidadão)
* weekly availability schedules
* linked assessor profiles

#### 5. Tenant Staff

* 2 staff users per tenant
* role = atendente / atendente
* scheduling and citizen access only

#### 6. CitizenProfiles

* 20 citizens per tenant
* Mix of:

  * active / inactive
  * active / inactive
  * recurring / one-time visitors
* Full demographic and contact data

#### 7. Service Records

For at least 10 citizens per tenant:

* service histories
* preferences, notes, observations
* service record data
* authorization forms

#### 8. Agendamentos

* Past (completed)
* Today (checked-in, in-progress)
* Future (scheduled)
* Edge cases: cancelled, rescheduled, no-show

#### 9. Officeal Outputs

For completed agendamentos:

* officeal notes
* performed procedures
* assessments

---

### **Output Requirements**

1. Return structured JSON per collection
2. Clearly separate collections
3. Include comments explaining relationships
4. Flag edge cases (missing status, cancelled agendamentos, no-shows)

---

## 2. Test Account Inventory & Documentation Output

The generator must also output **human-readable documentation** describing every account and dataset created.

### 2.1 Global Accounts

| Role         | Email                                               | Password | Scope  | Notes                  |
| ------------ | --------------------------------------------------- | -------- | ------ | ---------------------- |
| System Admin | [admin@secom.gov.br.gov.br.test](mailto:admin@secom.gov.br.gov.br.test)   | Test@123 | Global | Full platform access   |
| System Admin | [admin2@secom.gov.br.gov.br.test](mailto:admin2@secom.gov.br.gov.br.test) | Test@123 | Global | Audit & backup testing |

---

### 2.2 Tenant A – Sede

**Tenant:** Secom Principal

**Tenant Admin:**

* [admin.principal@secom.gov.br.test](mailto:admin.principal@secom.gov.br.test)

**Assessors:**

* [assessor.silva@secom.gov.br.test](mailto:assessor.silva@secom.gov.br.test) – Assessoria de Imprensa
* [assessor.moura@secom.gov.br.test](mailto:assessor.moura@secom.gov.br.test) – Mídias Sociais
* [assessor.lima@secom.gov.br.test](mailto:assessor.lima@secom.gov.br.test) – Atendimento ao Cidadão

**Staff:**

* [atendente1.paulista@secom.gov.br.test](mailto:atendente1.paulista@secom.gov.br.test)
* [atendente2.paulista@secom.gov.br.test](mailto:atendente2.paulista@secom.gov.br.test)

**CitizenProfiles:**

* [cidadao01.paulista@secom.gov.br.test](mailto:cidadao01.paulista@secom.gov.br.test) → cidadao20

---

### 2.3 Tenant B – Campinas

(Same structure as Tenant A with unique identifiers and emails)

---

### 2.4 Required Documentation Artifacts

The output must include:

* Account tables (role, email, permissions)
* Tenant → staff → citizen hierarchy diagrams
* Agendamento timelines per tenant
* Known edge cases and why they exist

-----|------|----------|------|
| System Admin | [admin@secom.gov.br.gov.br.test](mailto:admin@secom.gov.br.gov.br.test) | Test@123 | Full system access |
| System Admin | [admin2@secom.gov.br.gov.br.test](mailto:admin2@secom.gov.br.gov.br.test) | Test@123 | Redundancy testing |

---

### 2.2 Tenant A – Sede

**Tenant:** Secom Principal

**Tenant Admin:**

* [admin.principal@secom.gov.br.test](mailto:admin.principal@secom.gov.br.test)

**Assessors:**

* [assessor.silva@secom.gov.br.test](mailto:assessor.silva@secom.gov.br.test) – Assessoria de Imprensa
* [assessor.moura@secom.gov.br.test](mailto:assessor.moura@secom.gov.br.test) – Mídias Sociais
* [assessor.lima@secom.gov.br.test](mailto:assessor.lima@secom.gov.br.test) – Atendimento ao Cidadão

**Staff:**

* [atendente1.paulista@secom.gov.br.test](mailto:atendente1.paulista@secom.gov.br.test)
* [atendente2.paulista@secom.gov.br.test](mailto:atendente2.paulista@secom.gov.br.test)

**CitizenProfiles:**

* [cidadao01.paulista@secom.gov.br.test](mailto:cidadao01.paulista@secom.gov.br.test)
* [cidadao02.paulista@secom.gov.br.test](mailto:cidadao02.paulista@secom.gov.br.test)
* ... up to cidadao20

---

### 2.3 Tenant B – Campinas

(Same structure as Tenant A with unique identifiers)

---

## 3. Seeding Script Requirements

The solution must include a **clear, executable script** that populates the database.

### 3.1 Script Characteristics

* Language: TypeScript (Node.js)
* Uses existing Mongoose models
* Idempotent (safe to re-run in test environments)
* Logs created ObjectIds and relationships

### 3.2 Execution Order

1. Create system admins
2. Create tenants
3. Create tenant admins
4. Create assessors (assessors)
5. Create staff
6. Create citizens
7. Create service records
8. Create agendamentos
9. Create officeal notes & assessments

### 3.3 Script Output

* Console summary
* JSON artifact with all created entities
* Markdown or HTML documentation

------|-----------|------|
| Admins | Seed script / DB | Not UI-exposed |
| Tenants | Admin dashboard | Required before staff |
| Staff & Assessors | Admin → Assessors | Role-based forms |
| CitizenProfiles | Admin / Reception | Multi-step form |
| Agendamentos | Calendar module | Drag & form creation |
| Officeal Notes | Officeal view | Assessor-only |

---

## 4. Technical Assumptions

* Database: MongoDB
* Relationships via ObjectId references
* Soft deletes enabled
* Status-driven workflows (scheduled, completed, cancelled)
* Zod validation rules respected
* Timezone-aware datetime storage

---

## 5. Full Platform Testing Guide (Frontend + Backend)

This section must guide a tester through **realistic end‑to‑end usage** of the platform using the generated data.

### 5.1 Authentication & Authorization

* Login as each role
* Verify JWT/session handling
* Confirm route protection (admin vs citizen)
* Attempt forbidden access paths

### 5.2 Frontend Behaviour Expectations

* Role-based navigation menus
* Correct data scoping by tenant
* Form validation feedback (CPF, phone, email)
* Calendar rendering with mixed agendamento states

### 5.3 Backend Behaviour Expectations

* Correct filtering by tenant ObjectId
* Audit logs generated for key actions
* Status transitions enforced (scheduled → completed)
* Validation errors returned consistently

### 5.4 Core Workflows

**AdministrativeAssistant:**

* Register citizen
* Book agendamento
* Reschedule and cancel

**Assessor:**

* View daily schedule
* Open citizen profile
* Complete agendamento
* Add officeal notes

**CitizenProfile:**

* Login to portal
* View agendamentos
* Review assessments

### 5.5 Edge Case Testing

* No-show agendamentos
* Inactive citizens
* Missing status
* Overlapping assessor schedules

---

## 6. Success Criteria

* No broken references
* No validation errors on load
* Realistic UX flows
* Data usable for demos, QA, and automation tests

---

**Document version:** 1.0
**Purpose:** QA, demos, automated testing, onboarding
