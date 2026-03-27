# UI Layout & Style Audit — Secom Frontend

## 1. Executive Summary

### Overall assessment
- **Layout system maturity:** **Medium**. There is a clear shell structure (`PublicLayout`, `DashboardLayout`, `CitizenPortalLayout`) and reusable page/form/table primitives, but layout composition is still partly ad hoc at page level.
- **Design system scalability level:** **Medium**. The token foundation is strong (`src/styles/tokens/index.css`) and broadly used, but there are still hardcoded values, duplicated style patterns, and some inline layout styles.
- **Visual hierarchy effectiveness:** **Medium-High**. Most key pages use strong H1/H2 patterns and sectioning; however, hierarchy depth is shallow (no H4-H6 in app/pages) and CTA emphasis is inconsistent across modules.
- **Alignment with modern UI standards (2023–2025):** **Medium**. Surfaces, radii, subtle elevation, and responsive behavior exist; gaps remain in container consistency, composable layout abstractions, and dashboard/table information rhythm.

### Top 5 layout/style risks
1. 🟧 **Container and width fragmentation across shells** (`1200px`, `1400px`, `72rem`, and page-local widths).
2. 🟧 **Layout abstraction gap** (no shared `Stack/Grid/Container` primitives for app-level composition).
3. 🟧 **Styling duplication across auth/citizen auth surfaces** (parallel implementations of card/header/form patterns).
4. 🟨 **Token bypass hotspots** (hardcoded `px`, rgba/hex, and inline style objects in key reusable components).
5. 🟨 **Dashboard/data table density patterns are reusable but visually heavy** (header contrast and border-heavy table rhythm reduce scanability at scale).

### Facts vs interpretation
- **Facts:** Findings are based on implementation in `src/layouts`, `src/pages`, `src/components/UI`, `src/styles/tokens/index.css`, and `src/styles/global.css`.
- **Interpretation:** Comparisons to modern SaaS/government standards are evaluative and based on composition patterns observed in code.

---

## 2. Layout Architecture Audit

### Facts (from code)
- Three primary shells are consistently route-mapped:
  - `PublicLayout` for landing/auth/legal/fallback routes.
  - `DashboardLayout` for staff modules.
  - `CitizenPortalLayout` for citizen routes.
- Staff shell uses sticky top app header + centered content wrapper (`max-width: 1400px`).
- Public/citizen shells rely on tokenized container widths (`--container-max-width: 1200px`) in key areas.
- Global `.container` exists but is rarely used directly in page composition.
- Sticky usage is consistent for dashboard/citizen headers; no sticky secondary action bars in CRUD pages.

### Deliverable

| Page | Layout Pattern | Grid System | Container Strategy | Consistency | Issues |
| ---- | -------------- | ----------- | ------------------ | ----------- | ------ |
| `/admin/*` (DashboardLayout) | Sticky top nav + centered content | Flex shell + page-level grids | Fixed centered wrapper (`1400px`) | Medium | 🟧 Different max width from token container; dual-width strategy across app |
| `/admin/dashboard` | Banner + stats grid + 2-widget grid | CSS Grid (`4-col`, then `2-col`) | Inherits dashboard wrapper | Medium-High | 🟨 Dense top layer; widget/table-like stacks can feel compact on medium screens |
| Domain CRUD pages (`/press-releases`, etc.) | Page header + card-wrapped table + modal forms | Mostly linear + DataTable responsive card mode on mobile | Inherits dashboard wrapper | High | 🟨 Page layout mostly standardized, but wrapper in `CrudPage` still uses inline style |
| `/admin/users` | Custom header + table wrapper + modals | Flex + DataTable | Inherits dashboard wrapper | Medium-High | 🟨 Slightly separate styling idiom from generic CRUD pages |
| `/settings/profile` | Banner + stacked cards | Flex column | Inherits dashboard wrapper | Medium | 🟨 Custom visual grammar increases style divergence |
| `/` landing | Fixed top header + hero + section blocks | Grid + flex + bento patterns | `--max-width-6xl` sections | Medium | 🟧 Uses alternate container token set vs app shells |
| `/portal/*` (CitizenPortalLayout) | Sticky top bar + optional bottom nav + centered main | Flex shell + page grids | `--container-max-width` | High | 🟨 `display: contents` used in top nav wrapper can reduce maintainability |
| `/portal/dashboard` | Welcome banner + quick cards + info card | Auto-fit grid + card layout | Inherits citizen container | High | 🟩 Clear chunking and navigation affordance |
| `/portal/appointments` | Title + card list + pagination | Vertical list | Inherits citizen container | Medium-High | 🟨 Reimplements pagination style vs shared table pagination patterns |
| `/portal/profile` | Header + card sections + edit grid | 2-col edit grid -> single col mobile | Inherits citizen container | Medium-High | 🟨 Has standalone form field system separate from shared `FormField` abstractions |

### Key questions answered
- **Reusable layout system or ad hoc?** Reusable at shell level, partially ad hoc at page composition level.
- **Modern SaaS dashboard conventions?** Partially yes (cards, widgets, quick actions, sticky app header), but consistency and density tuning are incomplete.
- **Predictable grid structure?** Predictable inside each page type, less predictable across the full app due to mixed container and section systems.

---

## 3. Component Composition Analysis

### Facts (from code)
- Strong reusable primitives: `CrudPage`, `DataTable`, `Modal`, `FormField`, `Card`, `Button`, `Input`.
- Most domain modules compose around `CrudPage`, reducing per-module layout drift.
- No shared app-wide layout primitives such as `Stack`, `Inline`, `Grid`, `Container` components.
- Page-level composition frequently relies on custom CSS per feature page.

### Deliverable

| Component | Layout Pattern | Reusability | Alignment | Issues |
| --------- | -------------- | ----------- | --------- | ------ |
| `CrudPage` | Header + actions + table + modal + confirms | High | Medium-High | 🟨 Uses inline layout/surface style objects instead of class/tokens-only composition |
| `DataTable` | Toolbar + table + responsive card rows + pagination | High | High | 🟨 Visual rhythm is border-heavy and header is high-contrast; can feel dense |
| `FormField` + global `form-*` classes | Label/input/help/error blocks with grid/section wrappers | High | High | 🟩 Good baseline composability and consistency |
| `Card` | Variant + size + padding + interactive | Medium-High | High | 🟩 Good primitive, but many pages still custom-build card surfaces directly |
| `DashboardLayout` header/nav | Permission-gated nav + user cluster + mobile drawer | Medium-High | Medium-High | 🟨 Complex component; repeated nav links across desktop/mobile branches |
| `CitizenPortal` page components | Card/list sections with dedicated CSS module | Medium | Medium | 🟨 Good clarity, but duplicates patterns already present in global/UI components |
| Auth pages (`Auth.module.css` vs citizen auth styles) | Card + gradient header + form body + footer link row | Low-Medium (cross-context) | Medium | 🟧 Parallel implementations suggest composition reuse opportunity |

### Focus findings
- **Composable like Radix/shadcn style systems?** Partially. Primitive set exists but not a full composition layer.
- **Excessive custom layout per component?** Moderate. Dashboards, profile pages, and citizen auth/profile sections still carry substantial custom layout logic.

---

## 4. Visual Hierarchy Evaluation

### Facts (from code)
- Heading usage found in app/pages/components: `h1` (21), `h2` (24), `h3` (7), `h4-h6` (0).
- Most major screens have explicit `h1` and section `h2`.
- CTA hierarchy is clear on landing/dashboard banners, weaker on dense table pages where primary action competes with structural controls.

### Deliverable

| Page | Hierarchy Clarity | Scanability | CTA Visibility | Issues |
| ---- | ----------------- | ----------- | -------------- | ------ |
| Admin Dashboard | High | Medium-High | High | 🟨 Banner/stat/widget layers are clear but visually busy in first fold |
| Domain CRUD pages | Medium-High | Medium | Medium-High | 🟨 Table-first rhythm dominates; section segmentation minimal |
| Users admin page | High | Medium-High | High | 🟩 Clear title/count/primary invite action |
| Settings profile | Medium-High | Medium-High | Medium | 🟨 Emphasis is profile info first; password action is less visually prioritized |
| Landing page | High | High | High | 🟩 Strong hero + section hierarchy |
| Citizen dashboard | High | High | High | 🟩 Good chunking and action discoverability |
| Citizen appointments | Medium | Medium | Medium | 🟨 Functional but utilitarian; less hierarchy depth and contextual filtering |
| Citizen profile | High | Medium-High | Medium-High | 🟨 Read/edit modes are clear; dense form sections may benefit from stronger sub-group separators |

### Benchmark interpretation
- Closer to structured dashboard norms than legacy portal pages.
- Still below best-in-class precision (e.g., Linear/Notion-level rhythm) in data-heavy CRUD and table contexts.

---

## 5. Style System & Tokens

### Facts (from code)
- Central token system is comprehensive (color scales, semantic aliases, spacing, typography, radius, shadows, transitions, z-index, sizing, dark mode).
- Token usage is high in CSS (`var(--...)` usage: **1694 matches**).
- Hardcoded values still present (`hex/rgba/px/gradient` pattern matches: **530 matches** across CSS).
- Inline style usage exists in reusable components (notably `CrudPage` and some utility visuals).
- Multiple max-width systems coexist (`--container-max-width`, `--max-width-6xl`, and explicit `1400px`).

### Deliverable

| Style Area | Current State | Token Usage | Consistency | Issues |
| ---------- | ------------- | ----------- | ----------- | ------ |
| Color system | Strong semantic + scale foundation, light/dark support | High | Medium-High | 🟨 Some direct rgba/hex usage in modules and effects |
| Typography | Defined scale + weights + line-heights | Medium-High | Medium | 🟨 Heading depth limited (no H4-H6 usage), some pages rely on visual rather than semantic layering |
| Spacing | 8pt-based tokenized scale is broad | High | Medium-High | 🟨 Occasional ad hoc px/gap values remain |
| Radius/elevation | Modern radius and shadow tokens present | High | Medium-High | 🟨 Several components still override with custom shadows instead of semantic aliases |
| Containers/layout sizing | Tokens exist, but mixed implementations | Medium | Medium | 🟧 Container divergence is a structural scalability risk |

### Focus findings
- **Token-driven like modern systems?** Mostly yes, with moderate leakage.
- **Reskin potential without rewrites?** Good for core UI primitives; moderate friction remains due to page-specific hardcoded styling decisions.

---

## 6. Modern UI Pattern Assessment

### Deliverable

| Pattern | Present | Quality | Gap Severity | Notes |
| ------- | ------- | ------- | ------------ | ----- |
| Card-based UI surfaces | Yes | Good | 🟩 | Strong across dashboards, settings, citizen pages |
| Subtle shadows/depth | Yes | Good | 🟨 | Some shadows still custom/hardcoded instead of semantic tokens |
| Rounded corners (8px–16px norm) | Yes | Good | 🟩 | Radius tokens widely adopted |
| Soft palette | Yes | Good | 🟩 | Institutional palette balanced with neutral system |
| Minimal border strategy | Partial | Medium | 🟨 | Several sections remain border-heavy (tables/forms/cards stacking borders) |
| Surface separation clarity | Yes | Medium-High | 🟨 | Good in dashboards; can become dense in CRUD/table + modal stacks |
| Whitespace-first separation | Partial | Medium | 🟨 | Dividers still frequently used for grouping where spacing could carry hierarchy |

### Gap classification summary
- No evidence of a fully legacy pre-2018 UI baseline.
- Main modernization gaps are composability and consistency, not foundational visual capability.

---

## 7. Dashboard Layout Analysis

### Facts (from code)
- Primary admin dashboard includes: hero banner, alert, stats grid (7 cards), two data widgets.
- Citizen dashboard includes: welcome banner, quick-link cards, info panel.
- Tables are centralized in `DataTable` with mobile card transformation.

### Deliverable

| Dashboard | Structure | Readability | Data Density | Issues |
| --------- | --------- | ----------- | ------------ | ------ |
| Admin dashboard (`/admin/dashboard`) | Strong modular sections | Medium-High | Medium-High | 🟨 First fold carries many competing visual accents; table-like widgets have compact rows |
| Citizen dashboard (`/portal/dashboard`) | Clear card-first structure | High | Medium | 🟩 Good digestibility and entry-point clarity |
| CRUD dashboards (domain pages) | Standardized header + table + modal CRUD | Medium | High | 🟧 Density in table pages can reduce quick scanning at scale, especially with many columns/actions |
| Users dashboard (`/admin/users`) | Custom table management page | Medium-High | Medium-High | 🟨 Good structure; role actions add interaction density in-row |

### Secom-specific focus
- Comparable in structure to mainstream SaaS admin patterns, but polish/readability in dense data contexts is still below Shopify/Supabase-level refinement.
- Information chunking is strong at macro level, weaker within dense tables and action cells.

---

## 8. Form Layout Review

### Facts (from code)
- Domain forms mostly follow shared global patterns: `.form-stack`, `.form-grid`, `.form-section`, `.form-actions`, and `FormField`.
- Required fields and error rendering are consistent in reusable forms.
- Citizen profile edit form uses custom field classes instead of `FormField` abstraction.
- Citizen auth uses shared global `.form-field` class but with local auth wrappers.

### Deliverable

| Form | Layout Clarity | Grouping | Responsiveness | Issues |
| ---- | -------------- | -------- | -------------- | ------ |
| Domain CRUD forms (Press/Media/Events/Appointments/Citizen/Social) | High | High | High | 🟩 Solid consistency and predictable interactions |
| Staff auth forms (`/login`, `/register`, etc.) | High | Medium-High | Medium-High | 🟨 Local auth styling duplicates patterns available elsewhere |
| Citizen login/register | Medium-High | Medium | Medium-High | 🟨 Clear and usable, but duplicates staff/auth and global form conventions |
| Citizen profile edit | Medium-High | High | Medium-High | 🟨 Uses custom input system instead of shared `FormField`; increases maintenance surface |
| Invite user modal form | High | Medium | High | 🟩 Straightforward modal form pattern |

### Focus findings
- Forms are generally optimized for speed and clarity.
- Main opportunity is convergence: fewer parallel form styling patterns across contexts.

---

## 9. Landing Page Evaluation

### Facts (from code)
- Public homepage combines utility gov bar, fixed translucent header, hero, bento area cards, and branded institutional content.
- Uses strong section rhythm and modern card/grid patterns.
- Includes external public-service quick links and trust-oriented messaging.

### Deliverable

| Page | Visual Appeal | Clarity | Accessibility | Issues |
| ---- | ------------- | ------- | ------------- | ------ |
| Landing (`/`) | High | High | Medium-High | 🟨 Some decorative emoji/icon content may need stronger non-visual equivalents in future audits |
| Citizen home (`/portal`) | Medium-High | High | High | 🟩 Feels service-oriented, clear and approachable |
| Legal pages | Medium | High | High | 🟩 Simple and readable long-form structure |

### Secom focus
- Current public/citizen experience reads as a **modern government service** more than a legacy institutional portal.

---

## 10. Role-Based Layout Consistency

### Facts (from code)
- Role gating is route-based (`ProtectedRoute`, permission wrappers) and nav-item-based (`PermissionGate`).
- Staff roles share one visual shell (`DashboardLayout`), with module access filtered by permission.
- Citizen role uses entirely separate shell (`CitizenPortalLayout`) and dedicated page set.

### Deliverable

| Role | Layout Variation | Consistency | Issues |
| ---- | ---------------- | ----------- | ------ |
| `super_admin`, `admin`, `assessor`, `social_media`, `atendente` | Shared dashboard shell, varying nav/actions | High | 🟩 Low fragmentation at shell level |
| `citizen` | Separate citizen portal shell and pages | High within citizen context | 🟨 Style duplication vs staff/public auth patterns |
| Anonymous/public | Public layout shell | Medium-High | 🟨 Container strategy differs from internal shells |

### Secom-specific answer
- Role-based adaptation is structurally clean at routing/shell level.
- Fragmentation risk is more stylistic/component-level than route architecture.

---

## 11. Anti-Patterns & Risks

### Systemic issues identified
1. 🟧 **Container fragmentation**
- Evidence: `DashboardLayout` uses `1400px`, other contexts use `--container-max-width` and `--max-width-6xl`.
- Risk: Inconsistent rhythm and harder system-wide refinement.

2. 🟧 **Parallel style systems for similar page types**
- Evidence: `Auth.module.css` and `CitizenPortal.module.css` both define auth-card/header/footer/form presentation patterns.
- Risk: duplicated work and divergence over time.

3. 🟨 **Inline layout/surface styling in reusable containers**
- Evidence: `CrudPage` uses inline style blocks for structural wrappers.
- Risk: harder themeability and token governance.

4. 🟨 **No generic layout abstraction layer**
- Evidence: absence of shared app-level `Stack/Grid/Container` primitives despite repeated composition needs.
- Risk: ad hoc per-page CSS growth.

5. 🟨 **Border-heavy data UI rhythm**
- Evidence: table headers/rows/cards often stack borders + shadow + separators.
- Risk: lower scan efficiency in dense operational views.

6. 🟨 **Heading depth plateau (no H4-H6 usage)**
- Evidence: heading scan across pages/components shows only H1-H3.
- Risk: semantic depth and content chunking flexibility for larger pages.

### Unknowns
- **Actual runtime visual behavior under production data volume and tenant-specific branding:** *Not inferable from repository structure.*
- **Real user perception (task time, error rate, trust) by role:** *Not inferable from repository structure.*

---

## 12. High-Level Recommendations

1. **Unify container system across shells**
- Introduce a single canonical app container token family (and optional size variants).
- Replace explicit `1400px` and mixed max-width semantics with named container tokens.

2. **Create layout primitives for composition scalability**
- Add lightweight primitives (`Stack`, `Inline`, `Cluster`, `Grid`, `PageSection`, `PageContainer`) and migrate high-churn pages first.

3. **Converge auth and citizen-auth styling into shared patterns**
- Extract shared auth surface primitives (card header/body/footer, feedback banners, form spacing), then keep only context-specific accents local.

4. **Remove inline structural styles from reusable components**
- Move `CrudPage` inline wrappers to CSS module classes using tokens.

5. **Refine data-density ergonomics for table-heavy modules**
- Introduce density modes, clearer row grouping cues, and reduced border layering in primary table paths.

6. **Strengthen hierarchy semantics on complex pages**
- Establish heading-depth guidance (including when to use H3+ subsections in operations pages).

7. **Token governance hardening**
- Add lint/checks for disallowed hardcoded style patterns in CSS/TSX where token equivalents exist.

8. **Dashboard modernization pass (targeted)**
- Focus first on admin dashboard and CRUD table surfaces for whitespace rhythm, emphasis hierarchy, and interaction clarity.

---

## Appendix: Evidence Snapshot

- Core shells: `src/layouts/DashboardLayout/*`, `src/layouts/PublicLayout/*`, `src/layouts/CitizenPortalLayout/*`
- Route-role mapping: `src/routes/index.tsx`
- Tokens/global primitives: `src/styles/tokens/index.css`, `src/styles/global.css`
- CRUD + table baseline: `src/components/UI/CrudPage/CrudPage.tsx`, `src/components/UI/Table/DataTable.*`
- Key dashboards/pages: `src/pages/Admin/Dashboard/*`, `src/pages/Admin/Users/*`, `src/pages/CitizenPortal/*`, `src/pages/Landing/*`
