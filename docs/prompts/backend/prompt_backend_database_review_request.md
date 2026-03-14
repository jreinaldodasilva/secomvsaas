
## Improved Prompt — MongoDB Edition (AI-Ready)

Perform a comprehensive analysis of the **Secom MongoDB database** by inspecting collections, document schemas, indexes, validation rules, and access patterns.

The system supports **government communications workflows**, so data integrity, performance, and scalability are critical.
Assume a **production environment** with high read/write volume and long-term data growth.

If information is missing:

* Clearly **state assumptions**
* **Flag unknowns**
* **Recommend validation or monitoring steps**

---

## Objectives

* Document all MongoDB collections and document structures
* Analyze data modeling decisions (embedding vs referencing)
* Review indexes, validation rules, and migrations
* Identify performance risks and scalability bottlenecks
* Produce clear, actionable architecture documentation

---

## Tasks

---

### 1. Database & Collection Inventory

Create a complete inventory of all MongoDB databases and collections.

For each collection, document:

| Collection | Approx. Documents | Avg Document Size | Index Count | Validation Rules | Purpose |
| ---------- | ----------------- | ----------------- | ----------- | ---------------- | ------- |

📌 **Notes**

* Highlight core domain collections (citizens, agendamentos, tenants, users)
* Identify lookup/reference collections
* Flag collections with very large documents (>16MB risk)

**Deliverable**: Full collection inventory

---

### 2. Document Schema Documentation

For each major collection, document its **logical document schema**.

**Collection**: `citizens`

**Document Structure**:

```json
{
  "_id": ObjectId,
  "name": "string",
  "cpf": "string",
  "birthDate": "date",
  "email": "string | null",
  "phone": "string",
  "tenantId": ObjectId,
  "agendamentos": [ObjectId],
  "createdAt": ISODate,
  "updatedAt": ISODate,
  "deletedAt": ISODate | null
}
```

Document:

* Field name
* Data type
* Optional vs required
* Default values
* Index participation
* Field purpose

📌 **Notes**

* Highlight polymorphic fields or schema drift
* Flag deeply nested or unbounded arrays

**Deliverable**: Schema documentation for all major collections

---

### 3. Data Modeling Strategy Analysis

Analyze **how data is modeled** in MongoDB.

For each major relationship:

* Embedded vs referenced
* One-to-few vs one-to-many vs many-to-many
* Read vs write optimization trade-offs

Examples:

* CitizenProfiles ↔ Agendamentos
* Tenants ↔ Users
* CitizenProfiles ↔ CommunicationRecords

Classify decisions:

* 🟩 Correct MongoDB pattern
* 🟨 Acceptable but risky
* 🟧 Suboptimal modeling
* 🟥 Scalability or performance risk

📌 **Notes**

* Identify unbounded arrays
* Identify excessive `$lookup` usage
* Flag cross-database references

**Deliverable**: Data modeling assessment

---

### 4. Index & Query Performance Analysis

Document all indexes:

| Collection | Index Name | Fields | Type | Unique | Usage | Issues |
| ---------- | ---------- | ------ | ---- | ------ | ----- | ------ |

Analyze:

* Missing indexes for common filters
* Compound index ordering
* Over-indexing
* Sparse and partial index usage
* TTL indexes (if any)

**Query Patterns**

* High-frequency queries
* `$lookup` usage
* Aggregation pipelines
* Sorting without indexes
* Pagination strategy (skip/limit vs range queries)

📌 **Notes**

* Identify queries that could cause COLLSCAN
* Flag indexes that exceed RAM limits

**Deliverable**: Index and query performance report

---

### 5. Schema Validation & Data Integrity

Analyze MongoDB validation mechanisms:

* JSON Schema validation
* Required fields
* Enum constraints
* Format validation (CPF, email)
* Application vs database enforcement

Evaluate:

* Soft delete implementation
* Referential integrity risks
* Orphaned documents
* Duplicate data risks

📌 **Notes**

* Identify collections without validation
* Flag over-permissive schemas

**Deliverable**: Data integrity assessment

---

### 6. Migration & Data Evolution Strategy

Review how schema changes are handled.

Analyze:

* Migration scripts (if any)
* Backward compatibility strategy
* Document versioning
* Online vs offline migrations
* Bulk update safety

Classify risks:

* 🟥 Breaking changes without migration
* 🟧 Long-running updates
* 🟨 Missing version control
* 🟩 Safe evolution patterns

**Deliverable**: MongoDB migration strategy review

---

### 7. Scalability & Operational Readiness

Evaluate:

* Collection growth patterns
* Sharding readiness
* Shard keys (if applicable)
* Read/write hotspots
* Replica set configuration assumptions

Assess:

* Backup and restore strategy
* Monitoring (slow queries, index usage)
* TTL usage for transient data

**Deliverable**: Scalability and operations analysis

---

## Output Requirements

**Output File**:
`docs/backend/02-Secom-MongoDB-Architecture.md`

**Document Sections**:

1. MongoDB Overview
2. Collection Inventory
3. Document Schemas
4. Data Modeling Strategy
5. Index & Query Performance
6. Data Integrity & Validation
7. Migration & Schema Evolution
8. Scalability & Operations
9. Prioritized Improvement Recommendations

---

## Guidance for the AI

* Prefer **real MongoDB patterns**, not relational assumptions
* Be explicit about **trade-offs**
* Flag risks early and clearly
* Prioritize **read/write performance**
* Write for **backend engineers, DBAs, and system architects**
* If you need further information about backend architecture, refer to the 'docs/backend/01-Secom-Backend-Architecture-Overview.md' document.
