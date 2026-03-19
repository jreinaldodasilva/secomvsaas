# Prompt Alignment Analysis for Secomvsaas

## Project Context

**Secom** is a communication management system for the Secretaria de Comunicação (Communication Secretary), built on the vSaaS boilerplate.

### Key Characteristics
- **Domain**: Public sector communication management
- **Modules**: Press releases, media contacts, clipping, events, appointments, citizen portal, social media
- **Roles**: admin, assessor, social_media, atendente, citizen
- **Tech Stack**: React 18, Node.js/Express, TypeScript, MongoDB, Redis, BullMQ
- **Architecture**: Modular monolith with domain-driven organization

---

## Current Prompt Issues & Alignment Gaps

### 1. Generic Project References
**Issue**: Prompts use generic language like "the project" or "your application" without specific Secom context.
**Impact**: Developers may not understand domain-specific requirements.
**Fix**: Replace with explicit Secom references and domain context.

### 2. Missing Domain Context
**Issue**: Prompts don't reference Secom's specific modules or roles.
**Impact**: Analysis may miss domain-specific patterns or requirements.
**Fix**: Add Secom module references (press-releases, media-contacts, clipping, etc.).

### 3. Outdated Architecture References
**Issue**: Some prompts reference old project structures or patterns.
**Impact**: Recommendations may not align with current architecture.
**Fix**: Update to reflect current modular structure and domain organization.

### 4. Generic Terminology
**Issue**: Prompts use generic terms instead of Secom-specific ones.
**Examples**:
- "User" instead of "Assessor", "Atendente", "Citizen"
- "Entity" instead of "Press Release", "Media Contact", "Clipping"
- "Module" without specifying Secom modules

**Fix**: Use Secom-specific terminology consistently.

### 5. Missing Secom-Specific Patterns
**Issue**: Prompts don't reference Secom's specific patterns like:
- Tenant-based multi-tenancy
- Role-based access control (RBAC)
- Domain module organization
- Citizen portal patterns

**Fix**: Add explicit references to these patterns.

### 6. Incomplete Technology Stack References
**Issue**: Some prompts don't mention key technologies like:
- BullMQ for background jobs
- Redis for caching
- Mongoose for MongoDB
- React Query for server state

**Fix**: Update technology references to match actual stack.

### 7. Missing API Route References
**Issue**: Prompts don't reference Secom's actual API routes.
**Examples**: `/api/v1/press-releases`, `/api/v1/media-contacts`, etc.

**Fix**: Add specific route examples.

### 8. Vague Validation References
**Issue**: Prompts mention "validation" without referencing Secom's validation patterns.
**Fix**: Reference actual validation schemas and patterns.

### 9. Missing Frontend Module References
**Issue**: Frontend prompts don't reference Secom's specific pages and components.
**Fix**: Add references to actual frontend structure.

### 10. Incomplete Testing Guidance
**Issue**: Prompts don't reference Secom's testing setup (Vitest, Jest, Cypress).
**Fix**: Add specific testing framework references.

---

## Files to Update

### Backend Prompts (26 files)
1. architecture-review.md
2. architecture-roadmap.md
3. architecture-quick-wins-implementation.md
4. architecture-roadmap-implementation.md
5. api-endpoints-review.md
6. api-roadmap.md
7. auth-authorization-security-review.md
8. auth-roadmap.md
9. business-logic-review.md
10. business-logic-roadmap.md
11. code-quality-review.md
12. code-quality-roadmap.md
13. comprehensive-modular-review.md
14. database-review.md
15. database-roadmap.md
16. external-services-review.md
17. integration-roadmap.md
18. performance-infrastructure-roadmap.md
19. performance-quality-code-review.md
20. testing-strategy-roadmap.md
21. update-api-design-documentation.md
22. update-architecture-documentation.md
23. update-auth-security-documentation.md
24. update-business-logic-documentation.md
25. update-code-quality-documentation.md
26. update-mongodb-architecture-documentation.md

### Frontend Prompts (26 files)
1. architecture-review.md
2. architecture-roadmap.md
3. architecture-quick-wins-implementation.md
4. architecture-roadmap-implementation.md
5. component-library-review.md
6. component-library-roadmap.md
7. comprehensive-modular-review.md
8. forms-validation-review.md
9. forms-validation-roadmap.md
10. navigation-userflows-review.md
11. navigation-userflows-roadmap.md
12. performance-code-quality-review.md
13. performance-code-quality-roadmap.md
14. state-management-review.md
15. state-management-roadmap.md
16. ux-accessibility-review.md
17. ux-accessibility-roadmap.md
18. ux-accessibility-quick-wins-implementation.md
19. ux-accessibility-roadmap-implementation.md
20. update-architecture-documentation.md
21. update-component-library-documentation.md
22. update-forms-validation-documentation.md
23. update-navigation-userflows-documentation.md
24. update-state-management-documentation.md
25. update-ux-documentation.md

### Fullstack Prompts (6 files)
1. comprehensive-api-improvement-roadmap-implementation.md
2. comprehensive-frontback-end-integration-review.md
3. integration-roadmap-implementation.md
4. optimized-frontback-end-integration-review.md
5. request-response-ui-data-interface-review.md
6. roadmap.md

### General Prompts (9 files)
1. architecture-change.md
2. cra-to-vite-migration.md
3. documentation-alignment.md
4. manual-testing-guide.md
5. rbac-implementation.md
6. readme-generation.md
7. seed-data-test-script-review.md
8. setup-review.md
9. testing-data-population.md

**Total: 67 prompt files to update**

---

## Alignment Strategy

### Phase 1: Core Context Updates
- Add Secom project context to all prompts
- Replace generic "project" references with "Secom"
- Add domain context (communication management, public sector)

### Phase 2: Terminology Standardization
- Replace generic "user" with specific roles (assessor, atendente, citizen, admin)
- Replace generic "entity" with Secom modules (press-release, media-contact, clipping, event, appointment, citizen-portal, social-media)
- Use consistent terminology across all prompts

### Phase 3: Architecture Alignment
- Reference Secom's modular structure
- Reference tenant-based multi-tenancy
- Reference RBAC patterns
- Reference domain-driven organization

### Phase 4: Technology Stack Alignment
- Reference specific technologies (React 18, Express, MongoDB, Redis, BullMQ)
- Reference specific testing frameworks (Vitest, Jest, Cypress)
- Reference specific build tools (Vite)
- Reference specific state management (Zustand, React Query)

### Phase 5: API & Route Alignment
- Reference actual Secom API routes
- Reference actual Secom modules
- Reference actual Secom data models

### Phase 6: Validation & Testing
- Reference Secom's validation patterns
- Reference Secom's testing setup
- Reference Secom's test data structure

---

## Key Replacements

### Generic → Secom-Specific

| Generic | Secom-Specific | Context |
|---------|----------------|---------|
| "the project" | "Secom" | Project name |
| "your application" | "Secom system" | System reference |
| "user" | "assessor/atendente/citizen/admin" | Role-specific |
| "entity" | "press-release/media-contact/clipping/event/appointment" | Module-specific |
| "module" | "Secom module (press-releases, media-contacts, etc.)" | Specific modules |
| "API endpoint" | "/api/v1/press-releases, /api/v1/media-contacts, etc." | Actual routes |
| "database model" | "Mongoose schema for press-releases, media-contacts, etc." | Specific models |
| "frontend page" | "Press Releases page, Media Contacts page, etc." | Actual pages |
| "role" | "admin, assessor, social_media, atendente, citizen" | Secom roles |
| "permission" | "create-press-release, approve-press-release, etc." | Secom permissions |

---

## Assumptions About Secomvsaas

Based on README and project structure:

1. **Multi-tenancy**: System supports multiple tenants (Secretaria de Comunicação is default)
2. **RBAC**: Role-based access control with 5 roles
3. **Modular Architecture**: 7 main modules organized by domain
4. **Tech Stack**: React 18, Node.js, Express, TypeScript, MongoDB, Redis
5. **API Versioning**: `/api/v1/` prefix
6. **State Management**: Zustand for client state, React Query for server state
7. **Build Tool**: Vite for frontend
8. **Testing**: Vitest (frontend), Jest (backend), Cypress (e2e)
9. **Background Jobs**: BullMQ for async processing
10. **Authentication**: JWT with httpOnly cookies

---

## Validation Checklist

After updating all prompts, verify:

- [ ] All generic "project" references replaced with "Secom"
- [ ] All generic "user" references replaced with specific roles
- [ ] All generic "entity" references replaced with Secom modules
- [ ] All API route examples use actual Secom routes
- [ ] All technology references match actual stack
- [ ] All role references use Secom roles (admin, assessor, social_media, atendente, citizen)
- [ ] All module references use Secom modules
- [ ] All terminology is consistent across all prompts
- [ ] No outdated architecture references remain
- [ ] All prompts reflect current project structure

---

## Next Steps

1. Update all 67 prompt files with Secom-specific context
2. Create a summary document of changes per file
3. Verify consistency across all prompts
4. Test prompts with actual Secom codebase
5. Document any new assumptions or patterns discovered

