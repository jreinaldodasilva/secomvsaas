# Sintgesp – Test Data Population Prompt, Test Dataset & QA Guide

## 1. Master Prompt – Test Data Population, Seeding Script & Documentation

Use the prompt below with an LLM or internal tooling to **design, generate, and document** a complete test dataset **and the script that populates it** for the Sintgesp platform.

---

### **Prompt: Sintgesp Full Test Environment Generator**

You are acting as a **senior full-stack QA & platform simulation engineer** for the Sintgesp sports practice management system.

Before producing any output, you must **read, analyze, and extract requirements from ALL existing Sintgesp documentation**, including but not limited to:

* Backend architecture and MongoDB schema documentation
* Frontend architecture, component library, and state management docs
* Navigation, user flows, forms, validation, UX, and accessibility documentation

You must treat the existing documentation as the **single source of truth** for:

* Data models and relationships
* Role permissions and access rules
* Validation constraints
* Frontend behaviour and UI expectations

No assumptions may contradict the documented architecture. Any ambiguity must be explicitly noted in the output documentation as an assumption or open question.

Your task is to **design, generate, and document** a complete **test environment** that simulates real-world usage of Sintgesp across:

* Backend (Node.js / Express / MongoDB)
* Frontend (React / Vite / role-based routing)
* Authentication (staff + athlete portals)
* Clinical workflows (athletes, appointments, treatment, notes)

You must produce **three deliverables**:

1. **A runnable data population script** (seed script)
2. **Comprehensive documentation of all generated accounts and data**
3. **A full testing guide describing expected frontend and backend behaviour**

---

### **Global Rules & Constraints**

* Use **Brazilian locale defaults** (names, phone formats, Portuguese text, CPF placeholders).
* Follow Sintgesp’s **multi-tenant department isolation model** strictly.
* All MongoDB documents must use valid ObjectId references.
* Emails must be unique, clearly marked as test accounts, and grouped by role.
* Passwords must be compatible with Sintgesp auth (bcrypt/JWT). If hashing is abstracted, clearly document plaintext → hash mapping.
* Dates must cover **historical, current, and future** ranges to exercise dashboards, filters, and reports.
* Respect backend validation (Zod / express-validator) and frontend form constraints.

---

### **Prompt: Sintgesp Test Data Seeder**

You are acting as a **backend test data generator** for the Sintgesp sports practice management platform.

Your task is to **populate a MongoDB database** with realistic, production-like **test data** that simulates an active sports department using the system.

#### **General Rules**

* Use **Brazilian locale defaults** (names, phone formats, CPF placeholders, Portuguese text).
* All data must be **internally consistent** and reference valid ObjectIds.
* Emails must be unique and clearly marked as test accounts.
* Passwords should be hashed using the platform’s standard auth mechanism (use placeholder values if hashing is abstracted).
* Respect role-based access and ownership (department → staff → athletes → appointments).
* Dates should span **past, present, and near future** to test reporting and calendar views.

---

### **Entities to Create & Populate via Script**

Your seeding script must create the following entities **in the correct dependency order**, ensuring referential integrity.

#### 1. System Administrators

* 2 global administrators
* role = SUPER_ADMIN / ADMIN
* Not scoped to departments
* Purpose: platform-wide access, audits, configuration

#### 2. Departments

Create **2 departments**, each with:

* name, CNPJ (fake), address, phone, timezone
* operating hours (weekday + Saturday)
* default appointment types
* operatories / rooms

#### 3. Department Administrators

* 1 admin per department
* role = CLINIC_ADMIN
* Scoped strictly to one department

#### 4. SportsCoordinators (Instructors)

* 3 sportsCoordinators per department
* role = SPORTS_COORDINATOR
* specialties (Ortodontia, Implantodontia, Clínica Geral)
* weekly availability schedules
* linked instructor profiles

#### 5. Department Staff

* 2 staff users per department
* role = STAFF / RECEPTION
* scheduling and athlete access only

#### 6. Athletes

* 20 athletes per department
* Mix of:

  * active / inactive
  * insured / uninsured
  * recurring / one-time visitors
* Full demographic and contact data

#### 7. Medical & Sports Records

For at least 10 athletes per department:

* medical histories
* allergies, medications, chronic conditions
* sports chart data
* consent forms

#### 8. Appointments

* Past (completed)
* Today (checked-in, in-progress)
* Future (scheduled)
* Edge cases: cancelled, rescheduled, no-show

#### 9. Clinical Outputs

For completed appointments:

* clinical notes
* performed procedures
* evaluations

---

### **Output Requirements**

1. Return structured JSON per collection
2. Clearly separate collections
3. Include comments explaining relationships
4. Flag edge cases (missing insurance, cancelled appointments, no-shows)

---

## 2. Test Account Inventory & Documentation Output

The generator must also output **human-readable documentation** describing every account and dataset created.

### 2.1 Global Accounts

| Role         | Email                                               | Password | Scope  | Notes                  |
| ------------ | --------------------------------------------------- | -------- | ------ | ---------------------- |
| System Admin | [admin@sintgesp.test](mailto:admin@sintgesp.test)   | Test@123 | Global | Full platform access   |
| System Admin | [admin2@sintgesp.test](mailto:admin2@sintgesp.test) | Test@123 | Global | Audit & backup testing |

---

### 2.2 Department A – São Paulo

**Department:** Sintgesp Paulista

**Department Admin:**

* [admin.paulista@sintgesp.test](mailto:admin.paulista@sintgesp.test)

**SportsCoordinators:**

* [dr.silva@sintgesp.test](mailto:dr.silva@sintgesp.test) – Ortodontia
* [dr.moura@sintgesp.test](mailto:dr.moura@sintgesp.test) – Implantodontia
* [dr.lima@sintgesp.test](mailto:dr.lima@sintgesp.test) – Clínica Geral

**Staff:**

* [recepcao1.paulista@sintgesp.test](mailto:recepcao1.paulista@sintgesp.test)
* [recepcao2.paulista@sintgesp.test](mailto:recepcao2.paulista@sintgesp.test)

**Athletes:**

* [paciente01.paulista@sintgesp.test](mailto:paciente01.paulista@sintgesp.test) → paciente20

---

### 2.3 Department B – Campinas

(Same structure as Department A with unique identifiers and emails)

---

### 2.4 Required Documentation Artifacts

The output must include:

* Account tables (role, email, permissions)
* Department → staff → athlete hierarchy diagrams
* Appointment timelines per department
* Known edge cases and why they exist

-----|------|----------|------|
| System Admin | [admin@sintgesp.test](mailto:admin@sintgesp.test) | Test@123 | Full system access |
| System Admin | [admin2@sintgesp.test](mailto:admin2@sintgesp.test) | Test@123 | Redundancy testing |

---

### 2.2 Department A – São Paulo

**Department:** Sintgesp Paulista

**Department Admin:**

* [admin.paulista@sintgesp.test](mailto:admin.paulista@sintgesp.test)

**SportsCoordinators:**

* [dr.silva@sintgesp.test](mailto:dr.silva@sintgesp.test) – Ortodontia
* [dr.moura@sintgesp.test](mailto:dr.moura@sintgesp.test) – Implantodontia
* [dr.lima@sintgesp.test](mailto:dr.lima@sintgesp.test) – Clínica Geral

**Staff:**

* [recepcao1.paulista@sintgesp.test](mailto:recepcao1.paulista@sintgesp.test)
* [recepcao2.paulista@sintgesp.test](mailto:recepcao2.paulista@sintgesp.test)

**Athletes:**

* [paciente01.paulista@sintgesp.test](mailto:paciente01.paulista@sintgesp.test)
* [paciente02.paulista@sintgesp.test](mailto:paciente02.paulista@sintgesp.test)
* ... up to paciente20

---

### 2.3 Department B – Campinas

(Same structure as Department A with unique identifiers)

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
2. Create departments
3. Create department admins
4. Create instructors (sportsCoordinators)
5. Create staff
6. Create athletes
7. Create medical & sports records
8. Create appointments
9. Create clinical notes & evaluations

### 3.3 Script Output

* Console summary
* JSON artifact with all created entities
* Markdown or HTML documentation

------|-----------|------|
| Admins | Seed script / DB | Not UI-exposed |
| Departments | Admin dashboard | Required before staff |
| Staff & SportsCoordinators | Admin → Instructors | Role-based forms |
| Athletes | Admin / Reception | Multi-step form |
| Appointments | Calendar module | Drag & form creation |
| Clinical Notes | Clinical view | SportsCoordinator-only |

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
* Confirm route protection (admin vs athlete)
* Attempt forbidden access paths

### 5.2 Frontend Behaviour Expectations

* Role-based navigation menus
* Correct data scoping by department
* Form validation feedback (CPF, phone, email)
* Calendar rendering with mixed appointment states

### 5.3 Backend Behaviour Expectations

* Correct filtering by department ObjectId
* Audit logs generated for key actions
* Status transitions enforced (scheduled → completed)
* Validation errors returned consistently

### 5.4 Core Workflows

**AdministrativeAssistant:**

* Register athlete
* Book appointment
* Reschedule and cancel

**SportsCoordinator:**

* View daily schedule
* Open athlete record
* Complete appointment
* Add clinical notes

**Athlete:**

* Login to portal
* View appointments
* Review evaluations

### 5.5 Edge Case Testing

* No-show appointments
* Inactive athletes
* Missing insurance
* Overlapping sportsCoordinator schedules

---

## 6. Success Criteria

* No broken references
* No validation errors on load
* Realistic UX flows
* Data usable for demos, QA, and automation tests

---

**Document version:** 1.0
**Purpose:** QA, demos, automated testing, onboarding
