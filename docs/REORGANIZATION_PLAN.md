# Documentation Reorganization Plan

## Proposed New Structure

```
docs/
├── README.md                          # Main documentation index
├── architecture/
│   ├── README.md
│   ├── backend/
│   │   ├── README.md
│   │   ├── overview-part-1.md
│   │   ├── overview-part-2.md
│   │   └── overview-part-3.md
│   └── frontend/
│       ├── README.md
│       ├── overview-part-1.md
│       ├── overview-part-2.md
│       ├── ux-accessibility-part-1.md
│       └── ux-accessibility-part-2.md
├── roadmaps/
│   ├── README.md
│   ├── backend/
│   │   ├── README.md
│   │   ├── architecture-improvement.md
│   │   └── quick-wins.md
│   └── frontend/
│       ├── README.md
│       ├── architecture-improvement.md
│       ├── ux-accessibility-improvement.md
│       └── quick-wins.md
├── implementation/
│   ├── README.md
│   ├── improvements.md
│   ├── improvements-r2.md
│   ├── improvements-r3.md
│   ├── schedule.md
│   ├── schedule-phase-2.md
│   ├── schedule-phase-3.md
│   ├── schedule-phase-4.md
│   └── schedule-phase-5.md
├── operations/
│   ├── README.md
│   ├── infrastructure-resilience-runbook.md
│   └── secrets-rotation-runbook.md
└── prompts/
    ├── README.md
    ├── backend/
    │   ├── README.md
    │   ├── architecture-review.md
    │   ├── architecture-roadmap.md
    │   ├── architecture-quick-wins-implementation.md
    │   ├── architecture-roadmap-implementation.md
    │   ├── api-endpoints-review.md
    │   ├── api-roadmap.md
    │   ├── auth-authorization-security-review.md
    │   ├── auth-roadmap.md
    │   ├── business-logic-review.md
    │   ├── business-logic-roadmap.md
    │   ├── code-quality-review.md
    │   ├── code-quality-roadmap.md
    │   ├── comprehensive-modular-review.md
    │   ├── database-review.md
    │   ├── database-roadmap.md
    │   ├── external-services-review.md
    │   ├── integration-roadmap.md
    │   ├── performance-infrastructure-roadmap.md
    │   ├── performance-quality-code-review.md
    │   ├── testing-strategy-roadmap.md
    │   ├── update-api-design-documentation.md
    │   ├── update-architecture-documentation.md
    │   ├── update-auth-security-documentation.md
    │   ├── update-business-logic-documentation.md
    │   ├── update-code-quality-documentation.md
    │   └── update-mongodb-architecture-documentation.md
    ├── frontend/
    │   ├── README.md
    │   ├── architecture-review.md
    │   ├── architecture-roadmap.md
    │   ├── architecture-quick-wins-implementation.md
    │   ├── architecture-roadmap-implementation.md
    │   ├── forms-validation-review.md
    │   ├── forms-validation-roadmap.md
    │   ├── navigation-userflows-review.md
    │   ├── navigation-userflows-roadmap.md
    │   ├── ux-accessibility-review.md
    │   ├── ux-accessibility-roadmap.md
    │   ├── ux-accessibility-quick-wins-implementation.md
    │   ├── ux-accessibility-roadmap-implementation.md
    │   ├── component-library-review.md
    │   ├── component-library-roadmap.md
    │   ├── comprehensive-modular-review.md
    │   ├── performance-code-quality-review.md
    │   ├── performance-code-quality-roadmap.md
    │   ├── state-management-review.md
    │   ├── state-management-roadmap.md
    │   ├── update-architecture-documentation.md
    │   ├── update-component-library-documentation.md
    │   ├── update-forms-validation-documentation.md
    │   ├── update-navigation-userflows-documentation.md
    │   ├── update-state-management-documentation.md
    │   └── update-ux-documentation.md
    ├── fullstack/
    │   ├── README.md
    │   ├── comprehensive-api-improvement-roadmap-implementation.md
    │   ├── integration-roadmap-implementation.md
    │   ├── roadmap.md
    │   ├── comprehensive-frontback-end-integration-review.md
    │   ├── optimized-frontback-end-integration-review.md
    │   └── request-response-ui-data-interface-review.md
    ├── cra-to-vite-migration.md
    ├── architecture-change.md
    ├── documentation-alignment.md
    ├── rbac-implementation.md
    ├── seed-data-test-script-review.md
    ├── manual-testing-guide.md
    ├── testing-data-population.md
    ├── readme-generation.md
    └── setup-review.md
```

## File Path Mapping (Old → New)

### Architecture Documents
| Old Path | New Path |
|----------|----------|
| `backend/01-Secom-Backend-Architecture-Overview-Part1.md` | `architecture/backend/overview-part-1.md` |
| `backend/01-Secom-Backend-Architecture-Overview-Part2.md` | `architecture/backend/overview-part-2.md` |
| `backend/01-Secom-Backend-Architecture-Overview-Part3.md` | `architecture/backend/overview-part-3.md` |
| `frontend/01-Secom-Frontend-Architecture-Overview-Part1.md` | `architecture/frontend/overview-part-1.md` |
| `frontend/02-Secom-Frontend-Architecture-Overview-Part2.md` | `architecture/frontend/overview-part-2.md` |
| `frontend/04-Secom-UX-Accessibility-Overview-Part1.md` | `architecture/frontend/ux-accessibility-part-1.md` |
| `frontend/04-Secom-UX-Accessibility-Overview-Part2.md` | `architecture/frontend/ux-accessibility-part-2.md` |

### Roadmap Documents
| Old Path | New Path |
|----------|----------|
| `backendroadmaps/01-Secom-Backend-Architecture-Improvement-Roadmap.md` | `roadmaps/backend/architecture-improvement.md` |
| `backendroadmaps/01-Secom-Backend-Architecture-Quick-Wins.md` | `roadmaps/backend/quick-wins.md` |
| `frontendroadmaps/01-Secom-Frontend-Architecture-Improvement-Roadmap.md` | `roadmaps/frontend/architecture-improvement.md` |
| `frontendroadmaps/01-Secom-Frontend-Architecture-Quick-Wins.md` | `roadmaps/frontend/quick-wins.md` |
| `frontendroadmaps/04-Secom-UX-Accessibility-Improvement-Roadmap.md` | `roadmaps/frontend/ux-accessibility-improvement.md` |
| `frontendroadmaps/04-Secom-UX-Accessibility-Quick-Wins.md` | `roadmaps/frontend/quick-wins.md` |

### Implementation Documents
| Old Path | New Path |
|----------|----------|
| `implementations/IMPROVEMENTS.md` | `implementation/improvements.md` |
| `implementations/IMPROVEMENTS-R2.md` | `implementation/improvements-r2.md` |
| `implementations/IMPROVEMENTS-R3.md` | `implementation/improvements-r3.md` |
| `implementations/IMPROVEMENT_SCHEDULE.md` | `implementation/schedule.md` |
| `implementations/IMPROVEMENT_SCHEDULE_PHASE2.md` | `implementation/schedule-phase-2.md` |
| `implementations/IMPROVEMENT_SCHEDULE_PHASE3.md` | `implementation/schedule-phase-3.md` |
| `implementations/IMPROVEMENT_SCHEDULE_PHASE4.md` | `implementation/schedule-phase-4.md` |
| `implementations/IMPROVEMENT_SCHEDULE_PHASE5.md` | `implementation/schedule-phase-5.md` |

### Operations Documents
| Old Path | New Path |
|----------|----------|
| `operations/INFRASTRUCTURE_RESILIENCE_RUNBOOK.md` | `operations/infrastructure-resilience-runbook.md` |
| `operations/SECRETS_ROTATION_RUNBOOK.md` | `operations/secrets-rotation-runbook.md` |

### Prompt Documents (Backend)
| Old Path | New Path |
|----------|----------|
| `prompts/backend/01-prompt_backend_architecture_review_request.md` | `prompts/backend/architecture-review.md` |
| `prompts/backend/01-prompt_backend_architecture_roadmap_create_request.md` | `prompts/backend/architecture-roadmap.md` |
| `prompts/backend/01-Secom-Backend-Architecture-Prompt_for_Quick_Wins_Implementation_request.md` | `prompts/backend/architecture-quick-wins-implementation.md` |
| `prompts/backend/01-Secom-Backend-Architecture-Prompt_for_Roadmap_Implementation_request.md` | `prompts/backend/architecture-roadmap-implementation.md` |
| `prompts/backend/02-prompt_backend_api_endpoints_review_request.md` | `prompts/backend/api-endpoints-review.md` |
| `prompts/backend/02-prompt_backend_api_roadmap_create_request.md` | `prompts/backend/api-roadmap.md` |
| `prompts/backend/03-prompt_backend_auth_authorization_security_review_request.md` | `prompts/backend/auth-authorization-security-review.md` |
| `prompts/backend/03-prompt_backend_auth_roadmap_create_request.md` | `prompts/backend/auth-roadmap.md` |
| `prompts/backend/prompt_backend_business_logic_review_request.md` | `prompts/backend/business-logic-review.md` |
| `prompts/backend/prompt_backend_business_logic_roadmap_create_request.md` | `prompts/backend/business-logic-roadmap.md` |
| `prompts/backend/prompt_backend_code_quality_review_request.md` | `prompts/backend/code-quality-review.md` |
| `prompts/backend/prompt_backend_code_quality_roadmap_create_request.md` | `prompts/backend/code-quality-roadmap.md` |
| `prompts/backend/prompt_backend_comprehensive_modular_review_docs_request.md` | `prompts/backend/comprehensive-modular-review.md` |
| `prompts/backend/prompt_backend_database_review_request.md` | `prompts/backend/database-review.md` |
| `prompts/backend/prompt_backend_database_roadmap_create_request.md` | `prompts/backend/database-roadmap.md` |
| `prompts/backend/prompt_backend_external_services_review_request.md` | `prompts/backend/external-services-review.md` |
| `prompts/backend/prompt_backend_integration_roadmap_create_request.md` | `prompts/backend/integration-roadmap.md` |
| `prompts/backend/prompt_backend_performance_infrastructure_roadmap_create_request.md` | `prompts/backend/performance-infrastructure-roadmap.md` |
| `prompts/backend/prompt_backend_performance_quality_code_review_request.md` | `prompts/backend/performance-quality-code-review.md` |
| `prompts/backend/prompt_backend_testing_strategy_roadmap_create_request.md` | `prompts/backend/testing-strategy-roadmap.md` |
| `prompts/backend/prompt_to_update_backend_api_design_documentation_request.md` | `prompts/backend/update-api-design-documentation.md` |
| `prompts/backend/prompt_to_update_backend_architecture_documentation_request.md` | `prompts/backend/update-architecture-documentation.md` |
| `prompts/backend/prompt_to_update_backend_auth_security_documentation_request.md` | `prompts/backend/update-auth-security-documentation.md` |
| `prompts/backend/prompt_to_update_backend_business_logic_documentation_request.md` | `prompts/backend/update-business-logic-documentation.md` |
| `prompts/backend/prompt_to_update_backend_code_quality_documentation_request.md` | `prompts/backend/update-code-quality-documentation.md` |
| `prompts/backend/prompt_to_update_backend_mongodb_architecture_documentation_request.md` | `prompts/backend/update-mongodb-architecture-documentation.md` |

### Prompt Documents (Frontend)
| Old Path | New Path |
|----------|----------|
| `prompts/frontend/01-prompt_frontend_architecture_review_request.md` | `prompts/frontend/architecture-review.md` |
| `prompts/frontend/01-prompt_frontend_architecture_roadmap_create_request.md` | `prompts/frontend/architecture-roadmap.md` |
| `prompts/frontend/01-Secom-Frontend-Architecture-Prompt_for_Quick_Wins_Implementation_request.md` | `prompts/frontend/architecture-quick-wins-implementation.md` |
| `prompts/frontend/01-Secom-Frontend-Architecture-Prompt_for_Roadmap_Implementation_request.md` | `prompts/frontend/architecture-roadmap-implementation.md` |
| `prompts/frontend/02-prompt_frontend_forms_validation_review_request.md` | `prompts/frontend/forms-validation-review.md` |
| `prompts/frontend/02-prompt_frontend_forms_validation_roadmap_create_request.md` | `prompts/frontend/forms-validation-roadmap.md` |
| `prompts/frontend/03-prompt_frontend_navigation_userflows_review_request.md` | `prompts/frontend/navigation-userflows-review.md` |
| `prompts/frontend/03-prompt_frontend_navigation_userflows_roadmap_create_request.md` | `prompts/frontend/navigation-userflows-roadmap.md` |
| `prompts/frontend/04-prompt_frontend_ux_accessibility_review_request.md` | `prompts/frontend/ux-accessibility-review.md` |
| `prompts/frontend/04-prompt_frontend_ux_accessibility_roadmap_request.md` | `prompts/frontend/ux-accessibility-roadmap.md` |
| `prompts/frontend/04-Secom-Frontend-UX-Accessibility-Prompt_for_Quick_Wins_Implementation_request.md` | `prompts/frontend/ux-accessibility-quick-wins-implementation.md` |
| `prompts/frontend/04-Secom-Frontend-UX-Accessibility-Prompt_for_Roadmap_Implementation_request.md` | `prompts/frontend/ux-accessibility-roadmap-implementation.md` |
| `prompts/frontend/prompt_frontend_component_library_review_request.md` | `prompts/frontend/component-library-review.md` |
| `prompts/frontend/prompt_frontend_component_library_roadmap_create_request.md` | `prompts/frontend/component-library-roadmap.md` |
| `prompts/frontend/prompt_frontend_comprehensive_modular_review_docs_request.md` | `prompts/frontend/comprehensive-modular-review.md` |
| `prompts/frontend/prompt_frontend_performance_code_quality_review_request.md` | `prompts/frontend/performance-code-quality-review.md` |
| `prompts/frontend/prompt_frontend_performance_code_quality_roadmap_request.md` | `prompts/frontend/performance-code-quality-roadmap.md` |
| `prompts/frontend/prompt_frontend_state_management_review_request.md` | `prompts/frontend/state-management-review.md` |
| `prompts/frontend/prompt_frontend_state_management_roadmap_create_request.md` | `prompts/frontend/state-management-roadmap.md` |
| `prompts/frontend/prompt_to_update_frontend_architecture_documentation_request.md` | `prompts/frontend/update-architecture-documentation.md` |
| `prompts/frontend/prompt_to_update_frontend_component_library_documentation_request.md` | `prompts/frontend/update-component-library-documentation.md` |
| `prompts/frontend/prompt_to_update_frontend_forms_validation_documentation_request.md` | `prompts/frontend/update-forms-validation-documentation.md` |
| `prompts/frontend/prompt_to_update_frontend_navigation_userflows_documentation_request.md` | `prompts/frontend/update-navigation-userflows-documentation.md` |
| `prompts/frontend/prompt_to_update_frontend_state_management_documentation_request.md` | `prompts/frontend/update-state-management-documentation.md` |
| `prompts/frontend/prompt_to_update_frontend_ux_documentation_request.md` | `prompts/frontend/update-ux-documentation.md` |

### Prompt Documents (Fullstack)
| Old Path | New Path |
|----------|----------|
| `prompts/fullstack/prompt_for_comprehensive-API-Improvement-Roadmap-implementation-request.md` | `prompts/fullstack/comprehensive-api-improvement-roadmap-implementation.md` |
| `prompts/fullstack/prompt_for_integration_roadmap_implementation_request.md` | `prompts/fullstack/integration-roadmap-implementation.md` |
| `prompts/fullstack/prompt_for_roadmap_request.md` | `prompts/fullstack/roadmap.md` |
| `prompts/fullstack/prompt_fullstack_comprehensive_frontback_end_integration_review_request.md` | `prompts/fullstack/comprehensive-frontback-end-integration-review.md` |
| `prompts/fullstack/prompt_fullstack_optmized-frontback_end_integration_review_request.md` | `prompts/fullstack/optimized-frontback-end-integration-review.md` |
| `prompts/fullstack/prompt_fullstack_request_response_ui_data_interface_review_request.md` | `prompts/fullstack/request-response-ui-data-interface-review.md` |

### Prompt Documents (Root Level)
| Old Path | New Path |
|----------|----------|
| `prompts/prompt_cra_to_vite_request.md` | `prompts/cra-to-vite-migration.md` |
| `prompts/prompt_for_change_the_architecture.md` | `prompts/architecture-change.md` |
| `prompts/prompt_for_documentation_alignement.md` | `prompts/documentation-alignment.md` |
| `prompts/prompt_for_implement_RBAC_request.md` | `prompts/rbac-implementation.md` |
| `prompts/prompt_for_seed_data_test_script_review_request.md` | `prompts/seed-data-test-script-review.md` |
| `prompts/prompt_manual_testing_guide_request.md` | `prompts/manual-testing-guide.md` |
| `prompts/prompt_populating_for_testing_request.md` | `prompts/testing-data-population.md` |
| `prompts/prompt_readme_generation_request.md` | `prompts/readme-generation.md` |
| `prompts/prompt_setup_review_request.md` | `prompts/setup-review.md` |

## Renamed Files/Folders

### Folder Renames
- `backend/` → `architecture/backend/`
- `frontend/` → `architecture/frontend/`
- `backendroadmaps/` → `roadmaps/backend/`
- `frontendroadmaps/` → `roadmaps/frontend/`
- `implementations/` → `implementation/`

### File Naming Conventions Applied
- Removed numeric prefixes (01-, 02-, 04-) for cleaner naming
- Converted UPPERCASE_SNAKE_CASE to kebab-case
- Removed redundant "Secom-" and "request" suffixes
- Standardized part numbering (Part1 → part-1)
- Simplified prompt file names for clarity

## Organizational Rationale

### Architecture Directory
- **Purpose**: Core system design and technical documentation
- **Rationale**: Groups all architectural overviews by layer (backend/frontend)
- **Benefit**: Clear separation of concerns, easy to find system design docs

### Roadmaps Directory
- **Purpose**: Future improvements and enhancement plans
- **Rationale**: Separates strategic planning from current architecture
- **Benefit**: Distinguishes "what is" from "what should be"

### Implementation Directory
- **Purpose**: Execution tracking and improvement schedules
- **Rationale**: Consolidates all improvement tracking in one place
- **Benefit**: Single source of truth for implementation status

### Operations Directory
- **Purpose**: Operational procedures and runbooks
- **Rationale**: Keeps operational knowledge separate from architecture
- **Benefit**: Easy access to operational procedures

### Prompts Directory
- **Purpose**: AI assistant prompts for various tasks
- **Rationale**: Organized by scope (backend/frontend/fullstack) and task type
- **Benefit**: Reusable prompts organized by context

## Navigation Improvements

### Root README.md
- Index of all documentation sections
- Quick links to key documents
- Overview of documentation structure

### Section README.md Files
- `architecture/README.md`: Overview of system design
- `roadmaps/README.md`: Guide to improvement roadmaps
- `implementation/README.md`: Implementation tracking overview
- `operations/README.md`: Operational procedures index
- `prompts/README.md`: Prompt library guide
- `prompts/backend/README.md`: Backend prompts index
- `prompts/frontend/README.md`: Frontend prompts index
- `prompts/fullstack/README.md`: Fullstack prompts index

## Benefits of This Reorganization

1. **Improved Discoverability**: Clear folder hierarchy makes it easy to find documents
2. **Better Navigation**: README files at each level provide context and links
3. **Consistent Naming**: Kebab-case naming is more web-friendly and readable
4. **Logical Grouping**: Related documents are organized together
5. **Scalability**: Structure supports future documentation growth
6. **Reduced Cognitive Load**: Clear separation of concerns (architecture vs. roadmaps vs. operations)
7. **Professional Structure**: Follows common documentation patterns

## Implementation Notes

- All file contents remain unchanged
- No files are deleted or merged
- Only structure and naming are modified
- Empty `history/` directory can be removed or kept for future use
- All existing links should be updated to reflect new paths
