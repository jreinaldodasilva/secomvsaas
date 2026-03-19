# Secom Prompt Alignment — Complete Index

## Project: Secom (secomvsaas)

**Status**: ✅ Complete
**Date**: 2024
**Total Prompts Updated**: 67 files
**All Files Preserved**: Yes

---

## Quick Navigation

### Documentation
- **[Alignment Analysis](./ALIGNMENT_ANALYSIS.md)** – Initial analysis of alignment gaps
- **[Alignment Update Summary](./ALIGNMENT_UPDATE_SUMMARY.md)** – Comprehensive summary of all changes

### By Category

#### Backend Prompts (26 files)
- Architecture: `architecture-review.md`, `architecture-roadmap.md`, `architecture-quick-wins-implementation.md`, `architecture-roadmap-implementation.md`
- API: `api-endpoints-review.md`, `api-roadmap.md`
- Auth: `auth-authorization-security-review.md`, `auth-roadmap.md`
- Business Logic: `business-logic-review.md`, `business-logic-roadmap.md`
- Code Quality: `code-quality-review.md`, `code-quality-roadmap.md`
- Database: `database-review.md`, `database-roadmap.md`
- Comprehensive: `comprehensive-modular-review.md`
- Integration: `external-services-review.md`, `integration-roadmap.md`
- Performance: `performance-infrastructure-roadmap.md`, `performance-quality-code-review.md`
- Testing: `testing-strategy-roadmap.md`
- Documentation: `update-api-design-documentation.md`, `update-architecture-documentation.md`, `update-auth-security-documentation.md`, `update-business-logic-documentation.md`, `update-code-quality-documentation.md`, `update-mongodb-architecture-documentation.md`

#### Frontend Prompts (26 files)
- Architecture: `architecture-review.md`, `architecture-roadmap.md`, `architecture-quick-wins-implementation.md`, `architecture-roadmap-implementation.md`
- Components: `component-library-review.md`, `component-library-roadmap.md`
- Forms: `forms-validation-review.md`, `forms-validation-roadmap.md`
- Navigation: `navigation-userflows-review.md`, `navigation-userflows-roadmap.md`
- Performance: `performance-code-quality-review.md`, `performance-code-quality-roadmap.md`
- State: `state-management-review.md`, `state-management-roadmap.md`
- UX/Accessibility: `ux-accessibility-review.md`, `ux-accessibility-roadmap.md`, `ux-accessibility-quick-wins-implementation.md`, `ux-accessibility-roadmap-implementation.md`
- Comprehensive: `comprehensive-modular-review.md`
- Documentation: `update-architecture-documentation.md`, `update-component-library-documentation.md`, `update-forms-validation-documentation.md`, `update-navigation-userflows-documentation.md`, `update-state-management-documentation.md`, `update-ux-documentation.md`

#### Fullstack Prompts (6 files)
- `comprehensive-api-improvement-roadmap-implementation.md`
- `comprehensive-frontback-end-integration-review.md`
- `integration-roadmap-implementation.md`
- `optimized-frontback-end-integration-review.md`
- `request-response-ui-data-interface-review.md`
- `roadmap.md`

#### General Prompts (9 files)
- `architecture-change.md`
- `cra-to-vite-migration.md`
- `documentation-alignment.md`
- `manual-testing-guide.md`
- `rbac-implementation.md` ⭐ (Major Update)
- `readme-generation.md`
- `seed-data-test-script-review.md` ⭐ (Major Update)
- `setup-review.md` ⭐ (Major Update)
- `testing-data-population.md`

---

## Key Updates Applied

### 1. Project Context
✅ Added explicit Secom project context to all prompts
- Communication management system for Secretaria de Comunicação
- 7 modules: press-releases, media-contacts, clipping, events, appointments, citizen-portal, social-media
- 5 roles: admin, assessor, social_media, atendente, citizen

### 2. Terminology Standardization
✅ Replaced generic terms with Secom-specific terminology
- "user" → role-specific (assessor, atendente, citizen, admin)
- "entity" → module-specific (press-release, media-contact, clipping, event, appointment)
- "module" → Secom module names
- "role" → Secom roles (admin, assessor, social_media, atendente, citizen)

### 3. Architecture Alignment
✅ Updated to reference Secom's actual architecture
- Modular monolith with domain-driven organization
- Multi-tenancy implementation
- RBAC patterns
- BullMQ background job processing
- Redis caching

### 4. Technology Stack
✅ Updated technology references to match actual stack
- React 18, Node.js, Express, TypeScript
- MongoDB 8 + Mongoose
- Redis 7
- BullMQ
- Vite, Zustand, React Query
- Vitest, Jest, Cypress

### 5. API Routes
✅ Added specific Secom API route examples
- `/api/v1/press-releases`
- `/api/v1/media-contacts`
- `/api/v1/clipping`
- `/api/v1/events`
- `/api/v1/appointments`
- `/api/v1/citizen-portal`
- `/api/v1/social-media`

### 6. Role-Based Guidance
✅ Added Secom-specific role definitions and permissions
- admin – Full system access
- assessor – Press release and media management
- social_media – Social media content management
- atendente – Citizen service and appointments
- citizen – Public portal access

### 7. Module-Specific Analysis
✅ Added guidance for analyzing each Secom module
- Press Releases
- Media Contacts
- Clipping
- Events
- Appointments
- Citizen Portal
- Social Media

### 8. Validation & Testing
✅ Updated validation and testing references
- Secom-specific entity validation
- Secom-specific test data requirements
- Secom-specific workflow validation
- Role-based access testing

### 9. Frontend Patterns
✅ Updated frontend prompts with Secom UI patterns
- Role-based UI rendering
- Module page organization
- Citizen portal separation
- Form validation patterns
- Accessibility requirements

### 10. Backend Patterns
✅ Updated backend prompts with Secom business logic
- Tenant isolation
- RBAC enforcement
- Module communication
- Background job integration
- Validation standardization

---

## Major Updates (⭐)

### RBAC Implementation Prompt
**File**: `rbac-implementation.md`
**Changes**:
- Added Secom role definitions (admin, assessor, social_media, atendente, citizen)
- Added Secom permission matrix
- Added Secom module access rules
- Added Secom-specific validation checklist
- Added role → module mapping

### Seed Data Test Script Review Prompt
**File**: `seed-data-test-script-review.md`
**Changes**:
- Added all 7 Secom modules
- Added Secom-specific entity validation
- Added role-based data validation
- Added tenant isolation validation
- Added Secom-specific test data requirements
- Added module coverage assessment

### Setup Review Prompt
**File**: `setup-review.md`
**Changes**:
- Added Secom-specific setup requirements
- Added multi-tenancy setup guidance
- Added RBAC setup guidance
- Added module initialization guidance
- Added default tenant/user creation guidance
- Added Secom-specific configuration requirements

---

## Assumptions Made

### Project Structure
1. Multi-tenancy with Secretaria de Comunicação as default tenant
2. 7 domain modules organized by business function
3. Modular monolith architecture
4. Layered architecture (controllers, services, models, repositories)

### Technology
1. React 18 for frontend
2. Node.js/Express for backend
3. TypeScript for both
4. MongoDB 8 with Mongoose
5. Redis 7 for caching
6. BullMQ for background jobs
7. Vite for frontend build
8. Zustand for client state
9. React Query for server state

### Authentication & Authorization
1. JWT with httpOnly cookies
2. Role-based access control (RBAC)
3. 5 distinct roles with specific permissions
4. Tenant-based isolation

### API Design
1. RESTful API with `/api/v1/` prefix
2. Module-specific endpoints
3. Standard response envelope
4. Consistent error handling

### Testing
1. Vitest for frontend unit/integration tests
2. Jest for backend unit/integration tests
3. Cypress for e2e tests
4. Test data seeding for all modules

---

## Validation Results

### ✅ All Prompts Verified For:
- Secom project context added
- Generic references replaced with Secom-specific terms
- API route examples use actual Secom routes
- Technology references match actual stack
- Role references use Secom roles
- Module references use Secom modules
- Terminology is consistent
- No outdated architecture references
- Multi-tenancy patterns documented
- RBAC patterns documented
- Background job patterns documented
- Module organization patterns documented

---

## Usage Guidelines

### For Developers
1. Use prompts to understand Secom architecture
2. Reference prompts when implementing new features
3. Use prompts to guide code reviews
4. Use prompts to onboard new team members

### For AI Assistants
1. Use prompts to provide Secom-specific guidance
2. Reference prompts when analyzing code
3. Use prompts to generate Secom-aligned documentation
4. Use prompts to implement Secom-specific features

### For Documentation
1. Use prompts as reference for Secom patterns
2. Keep prompts synchronized with architecture
3. Update prompts when requirements change
4. Use prompts to maintain consistency

---

## Maintenance & Updates

### Quarterly Review
- Verify prompts align with current implementation
- Update for any architecture changes
- Add new prompts for new features

### When Adding New Modules
- Create module-specific prompts
- Update existing prompts to reference new module
- Document new module patterns

### When Changing Architecture
- Update all affected prompts
- Verify consistency across prompts
- Document architectural changes

### When Updating Technology
- Update technology references in all prompts
- Verify examples still work
- Document technology changes

---

## Future Improvements

### Suggested New Prompts
1. **Secom Module Creation** – Guide for creating new modules
2. **Secom Permission Design** – Guide for designing permissions
3. **Secom Tenant Management** – Guide for managing tenants
4. **Secom API Design** – Guide for designing API endpoints
5. **Secom Frontend Page Creation** – Guide for creating pages

### Suggested Enhancements
1. Create `PROMPTS_INDEX.md` for quick reference
2. Add cross-references between related prompts
3. Create prompt templates for consistency
4. Add prompt versioning for tracking changes
5. Create prompt testing framework

---

## Related Documentation

- **[Prompt Alignment Analysis](./ALIGNMENT_ANALYSIS.md)** – Initial analysis
- **[Prompt Alignment Update Summary](./ALIGNMENT_UPDATE_SUMMARY.md)** – Detailed changes
- **[Main Documentation Index](../README.md)** – Overall documentation structure
- **[Architecture Documentation](../architecture/)** – System design
- **[Roadmaps](../roadmaps/)** – Improvement plans

---

## Summary

All 67 prompt files have been successfully updated to align with Secom's specific context, terminology, architecture, and requirements. The prompts now provide Secom-specific guidance for analysis, implementation, and documentation tasks, ensuring that all AI-assisted work is grounded in the project's actual domain and technical reality.

**Status**: ✅ Complete and Ready for Use

