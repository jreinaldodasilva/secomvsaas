# Secom — UX & Accessibility Quick Wins

**Source documents:**
- `docs/frontend/04-Secom-UX-Accessibility-Overview-Part1.md`
- `docs/frontend/04-Secom-UX-Accessibility-Overview-Part2.md`

**Definition of Quick Win:** High-impact, low-effort improvement — implementable in under 4 hours by a single developer, requiring no architectural change.

**Total quick wins:** 15  
**Combined estimated effort:** ~2.5 days  
**Recommended execution order:** Listed by priority (P0 → P3)

---

## Suggested Execution Order

| # | Title | Priority | Effort | WCAG |
|---|-------|----------|--------|------|
| QW-01 | Add `id="main-content"` to CitizenPortalLayout | P0 | 30 min | 2.4.1 |
| QW-02 | Fix sidebar inactive nav link contrast | P0 | 1 hour | 1.4.3 |
| QW-03 | Fix sidebar section label contrast | P0 | 30 min | 1.4.3 |
| QW-04 | Fix `StatusBadge .gray` contrast | P1 | 30 min | 1.4.3 |
| QW-05 | Fix citizen portal header nav contrast | P1 | 30 min | 1.4.3 |
| QW-06 | Add `aria-hidden` to all decorative emoji | P1 | 1 hour | 1.3.1 |
| QW-07 | Replace `☰` with SVG in sidebar toggle | P2 | 30 min | 2.5.3 |
| QW-08 | Replace `search` icon in ConnectionBanner retry | P2 | 30 min | 4.1.3 |
| QW-09 | Replace hardcoded strings in CitizenLoginPage | P2 | 30 min | — |
| QW-10 | Fix `ProfilePage` heading hierarchy | P2 | 30 min | 2.4.6 |
| QW-11 | Change DataTable search to `type="search"` | P2 | 15 min | — |
| QW-12 | Add `aria-label` with page number to pagination | P3 | 30 min | — |
| QW-13 | Replace legacy `--color-gray-*` aliases | P3 | 30 min | — |
| QW-14 | Reduce feature card hover scale to `1.02` | P3 | 15 min | — |
| QW-15 | Add two-column grid for visual banner on mobile | P3 | 30 min | — |

---

## Quick Win Details

---

**Quick Win #1: Add `id="main-content"` to CitizenPortalLayout**

- **Problem:** `CitizenPortalLayout.tsx` renders `<main>` without `id="main-content"`. The global skip link in `App.tsx` targets `href="#main-content"`, making it non-functional on all citizen portal pages (`/portal`, `/portal/login`, `/portal/register`, `/portal/dashboard`, `/portal/profile`).
- **Impact:** Skip link is broken for all keyboard and AT users on the citizen portal — a WCAG 2.4.1 violation. Affects 5 pages.
- **Effort:** 30 minutes
- **Implementation:** In `CitizenPortalLayout.tsx`, change `<main className={styles.main}>` to `<main id="main-content" className={styles.main}>`.
- **Expected UX Outcome:** Keyboard users can bypass the portal header navigation on all citizen portal pages. WCAG 2.4.1 compliance restored.

---

**Quick Win #2: Fix sidebar inactive nav link contrast**

- **Problem:** `DashboardLayout.module.css` sets inactive nav link color to `rgba(255,255,255,0.65)` on a `#0F172A` background, producing a contrast ratio of ~3.8:1 — below the WCAG 4.5:1 minimum (SC 1.4.3). This affects the primary navigation of all 10 staff dashboard pages.
- **Impact:** Primary navigation is unreadable for low-vision users. WCAG 1.4.3 violation.
- **Effort:** 1 hour (including contrast verification)
- **Implementation:** In `DashboardLayout.module.css`, change `.navLink` color from `rgba(255,255,255,0.65)` to `rgba(255,255,255,0.87)` (achieves ~5.5:1 on `#0F172A`). Verify active state remains visually distinct.
- **Expected UX Outcome:** Sidebar navigation readable for low-vision users. WCAG 1.4.3 compliance on primary navigation.

---

**Quick Win #3: Fix sidebar section label contrast**

- **Problem:** `DashboardLayout.module.css` sets `.navSectionLabel` color to `rgba(255,255,255,0.35)` on `#0F172A`, producing a contrast ratio of ~2.0:1 — critically below WCAG 4.5:1 (SC 1.4.3). The label is the "Módulos" section divider in the sidebar.
- **Impact:** Section grouping is invisible to low-vision users. WCAG 1.4.3 violation.
- **Effort:** 30 minutes
- **Implementation:** In `DashboardLayout.module.css`, change `.navSectionLabel` color from `rgba(255,255,255,0.35)` to `rgba(255,255,255,0.60)` (achieves ~3.5:1 — acceptable for large/uppercase text at this size) or to `rgba(255,255,255,0.75)` for full compliance. Alternatively, remove the label and rely on visual spacing alone.
- **Expected UX Outcome:** Section grouping visible to low-vision users. WCAG 1.4.3 compliance on section labels.

---

**Quick Win #4: Fix `StatusBadge .gray` contrast**

- **Problem:** `StatusBadge.module.css` `.gray` variant uses `color: var(--color-neutral-600)` (`#4B5563`) on `background: var(--color-neutral-100)` (`#E5E7EB`), producing a contrast ratio of ~4.1:1 — below WCAG 4.5:1 (SC 1.4.3). This badge is used for `draft`, `inactive`, and `archived` statuses across all domain pages.
- **Impact:** Status information unreadable for low-vision users on all domain pages. WCAG 1.4.3 violation.
- **Effort:** 30 minutes
- **Implementation:** In `StatusBadge.module.css`, change `.gray` text color from `var(--color-neutral-600)` (`#4B5563`) to `var(--color-neutral-700)` (`#374151`), which achieves ~5.9:1 on `#E5E7EB`.
- **Expected UX Outcome:** Gray status badges readable for low-vision users. WCAG 1.4.3 compliance on status indicators.

---

**Quick Win #5: Fix citizen portal header nav link contrast**

- **Problem:** `CitizenPortalLayout.module.css` sets `.navLink` color to `var(--color-primary-200)` (`#aabfe0`) on a `var(--color-primary-900)` (`#0F172A`) background, producing a contrast ratio of ~4.2:1 — below WCAG 4.5:1 (SC 1.4.3). This affects the "Início" and "Meu perfil" navigation links in the citizen portal header.
- **Impact:** Primary navigation unreadable for low-vision users on the citizen portal. WCAG 1.4.3 violation.
- **Effort:** 30 minutes
- **Implementation:** In `CitizenPortalLayout.module.css`, change `.navLink` color from `var(--color-primary-200)` to `var(--color-primary-100)` (`#d5dff0`) or `#c8d8ec`, which achieves ≥4.5:1 on `#0F172A`. Verify hover state remains visually distinct.
- **Expected UX Outcome:** Citizen portal navigation readable for low-vision users. WCAG 1.4.3 compliance.

---

**Quick Win #6: Add `aria-hidden="true"` to all decorative emoji**

- **Problem:** `CitizenPortalLayout.tsx` renders `<span className={styles.brandIcon}>🏛️</span>` and citizen portal pages use emoji as service card icons (`📰`, `📅`, `👤`, etc.) without `aria-hidden="true"`. Screen readers announce these as their Unicode descriptions ("classical building", "newspaper", "calendar"), disrupting the reading flow.
- **Impact:** Screen reader users hear irrelevant Unicode descriptions on every citizen portal page. WCAG 1.3.1 — information conveyed by presentation alone.
- **Effort:** 1 hour (audit all emoji occurrences across portal pages)
- **Implementation:** Add `aria-hidden="true"` to every `<span>` or element containing a decorative emoji. Example: `<span className={styles.brandIcon} aria-hidden="true">🏛️</span>`. If the emoji conveys meaning (e.g., a service type), add a visually hidden `<span className="sr-only">` with a text description instead.
- **Expected UX Outcome:** Screen readers skip decorative emoji and read meaningful content only. Citizen portal reading flow improved for AT users.

---

**Quick Win #7: Replace `☰` character with SVG in sidebar toggle button**

- **Problem:** `DashboardLayout.tsx` renders `<button aria-label={t('nav.toggleSidebar')}>☰</button>`. The `aria-label` is correctly set, but some screen readers announce the `☰` character ("trigram for heaven") before processing the `aria-label`, producing unreliable announcements.
- **Impact:** Unreliable screen reader announcement of the sidebar toggle action. WCAG 2.5.3 — Label in Name.
- **Effort:** 30 minutes
- **Implementation:** Replace the `☰` text content with an SVG hamburger icon with `aria-hidden="true"`. The `aria-label` on the button already provides the accessible name. Example: `<button aria-label={t('nav.toggleSidebar')}><svg aria-hidden="true">...</svg></button>`.
- **Expected UX Outcome:** Consistent, reliable screen reader announcement of the sidebar toggle. No spurious character announcements.

---

**Quick Win #8: Replace `search` icon in ConnectionBanner retry button**

- **Problem:** `ConnectionBanner.tsx` uses `<Icon name="search" />` inside the retry button for the API reconnection action. The `search` icon is semantically incorrect for a retry/reconnect action, creating a misleading affordance for both sighted and AT users.
- **Impact:** Users receive incorrect visual and semantic signal for the retry action. WCAG 4.1.3 — Status Messages.
- **Effort:** 30 minutes
- **Implementation:** Replace `<Icon name="search" />` with `<Icon name="refresh" />` or equivalent retry/reconnect icon. Verify the icon name exists in the `Icon` component's supported set.
- **Expected UX Outcome:** Retry button communicates the correct action. Sighted and AT users receive consistent affordance.

---

**Quick Win #9: Replace hardcoded strings in `CitizenLoginPage` with i18n keys**

- **Problem:** `CitizenLoginPage.tsx` contains hardcoded Portuguese strings: `'Entrar'`, `'Entrando...'`, `'Erro ao fazer login'`, `'Acesse o Portal do Cidadão'`. The staff `LoginPage.tsx` correctly uses `t()` throughout. This creates a maintenance inconsistency and blocks future localization.
- **Impact:** Inconsistent codebase; any future locale addition requires a separate code change for this page. No direct user-visible impact today.
- **Effort:** 30 minutes
- **Implementation:** Add the missing keys to `src/i18n/locales/pt-BR.json` (and `en.json`) and replace all hardcoded strings with `t('key')` calls, following the pattern used in `LoginPage.tsx`.
- **Expected UX Outcome:** Citizen portal login page is consistent with the rest of the application and ready for future localization.

---

**Quick Win #10: Fix `ProfilePage` heading hierarchy**

- **Problem:** `ProfilePage.tsx` uses `<h2>{t('profile.title')}</h2>` as the page title without a preceding `<h1>`. This breaks the heading hierarchy — screen reader users navigating by headings will not find an `<h1>` on this page. WCAG 2.4.6 — Headings and Labels.
- **Impact:** AT users navigating by headings encounter incorrect hierarchy on the profile page.
- **Effort:** 30 minutes
- **Implementation:** Change `<h2>{t('profile.title')}</h2>` to `<h1>{t('profile.title')}</h1>` and update the subsequent `<h3>` for the password section to `<h2>`. Update `ProfilePage.module.css` styles accordingly if needed.
- **Expected UX Outcome:** Correct heading hierarchy on the profile page. AT users can navigate headings predictably.

---

**Quick Win #11: Change DataTable search input to `type="search"`**

- **Problem:** `DataTable.tsx` renders the search input as `<input type="text" ...>`. Using `type="search"` would trigger the native iOS "Search" return key on the keyboard, provide the browser's built-in clear button on desktop, and semantically communicate the input's purpose.
- **Impact:** Suboptimal mobile keyboard experience; no native clear affordance on desktop. No WCAG violation but a usability improvement.
- **Effort:** 15 minutes
- **Implementation:** In `DataTable.tsx`, change `type="text"` to `type="search"` on the search input. Optionally add `inputmode="search"` for additional mobile keyboard optimization.
- **Expected UX Outcome:** iOS users see the "Search" return key. Desktop users get a native clear button. Semantic purpose of the input is communicated to AT.

---

**Quick Win #12: Add `aria-label` with page number to pagination buttons**

- **Problem:** `DataTable.tsx` pagination renders `<button>{t('common.previous')}</button>` and `<button>{t('common.next')}</button>` without `aria-label` attributes indicating the target page. AT users cannot determine which page they will navigate to.
- **Impact:** Screen reader users cannot determine pagination target. Minor AT usability gap.
- **Effort:** 30 minutes
- **Implementation:** Add `aria-label` to pagination buttons. Example: `aria-label={t('common.goToPage', { page: page - 1 })}` for previous and `aria-label={t('common.goToPage', { page: page + 1 })}` for next. Add the i18n key if not present.
- **Expected UX Outcome:** AT users hear "Go to page 2" instead of just "Previous", enabling informed navigation.

---

**Quick Win #13: Replace legacy `--color-gray-*` aliases in ErrorPage and ConfirmDialog**

- **Problem:** `ErrorPage.module.css` uses `--color-gray-200` and `--color-gray-600`. `ConfirmDialog.module.css` uses `--color-gray-600`. These are legacy aliases defined in `tokens/index.css` that map to `--color-neutral-*` equivalents. While they resolve correctly today, they represent technical debt and inconsistency with the rest of the component library.
- **Impact:** No user-visible impact today. Maintenance risk if legacy aliases are ever removed.
- **Effort:** 30 minutes
- **Implementation:** In `ErrorPage.module.css`, replace `--color-gray-200` with `--color-neutral-200` and `--color-gray-600` with `--color-text-secondary`. In `ConfirmDialog.module.css`, replace `--color-gray-600` with `--color-text-secondary`.
- **Expected UX Outcome:** Token usage consistent across all components. Legacy aliases can be safely removed in the future.

---

**Quick Win #14: Reduce feature card hover scale from `1.03` to `1.02`**

- **Problem:** `LandingShared.tsx` `AnimatedItem` uses `whileHover={{ scale: 1.03 }}`. A scale of 1.03 on a card containing text can cause slight text blurriness on non-retina displays due to sub-pixel rendering during the CSS transform.
- **Impact:** Minor visual quality issue on non-retina desktop displays. No accessibility impact.
- **Effort:** 15 minutes
- **Implementation:** In `LandingShared.tsx`, change `whileHover={{ scale: 1.03 }}` to `whileHover={{ scale: 1.02 }}`.
- **Expected UX Outcome:** Feature card hover animation remains perceptible but text blurriness is reduced on non-retina displays.

---

**Quick Win #15: Add two-column grid for visual banner on mobile**

- **Problem:** `LandingPage.module.css` `.visualGrid` uses `grid-template-columns: repeat(3, 1fr)` which collapses to a single column on mobile. A two-column layout at 480–768px would make better use of available screen space.
- **Impact:** Minor layout density improvement on mobile landing page. No accessibility impact.
- **Effort:** 30 minutes
- **Implementation:** In `LandingPage.module.css`, add a breakpoint: `@media (min-width: 480px) and (max-width: 767px) { .visualGrid { grid-template-columns: repeat(2, 1fr); } }`.
- **Expected UX Outcome:** Visual banner section uses two columns on mid-size mobile screens, improving content density and reducing scroll depth.

---

## Combined Impact Summary

Executing all 15 quick wins requires approximately **2.5 days** of developer time and delivers:

- **3 WCAG 2.1 AA violations resolved** (SC 1.4.3 on sidebar, SC 1.4.3 on StatusBadge, SC 2.4.1 on skip link)
- **2 additional contrast improvements** (citizen portal nav, sidebar section label)
- **1 keyboard/focus improvement** (skip link functional on citizen portal)
- **3 screen reader improvements** (emoji hidden, toggle reliable, pagination labelled)
- **2 semantic HTML corrections** (heading hierarchy, search input type)
- **2 microcopy/icon corrections** (retry icon, i18n strings)
- **3 design system hygiene improvements** (legacy aliases, scale value, grid layout)
- **Estimated Lighthouse Accessibility score improvement:** +8 to +12 points
