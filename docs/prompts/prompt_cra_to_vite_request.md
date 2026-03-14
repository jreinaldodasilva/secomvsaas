# CRA → Vite Migration Prompt

## Role & Goal

You are a **senior frontend engineer** with deep expertise in **React**, **Create React App (CRA)**, and **Vite**.

Your task is to migrate an existing **Create React App** project to **Vite** while preserving functionality, behavior, and developer experience.

---

## Context

* The current project is a React application bootstrapped with **Create React App**
* The target setup is **Vite + React**
* The project may include:

  * TypeScript
  * Environment variables
  * Absolute imports
  * Static assets
  * CSS Modules, Sass, or Tailwind
  * Client-side routing
  * API calls
  * Automated tests

---

## Migration Objectives

1. Remove all CRA-specific tooling and configuration
2. Introduce Vite using current best practices
3. Preserve application behavior and structure
4. Improve build and development performance where possible
5. Avoid unnecessary refactors unless required for compatibility

---

## Tasks (Perform in Order)

### 1. Dependency & Script Migration

* Remove `react-scripts` and any CRA-only dependencies
* Add required Vite dependencies:

  * `vite`
  * `@vitejs/plugin-react`
* Update `package.json` scripts to:

  * `dev`
  * `build`
  * `preview`

---

### 2. Project Structure Changes

* Move `public/index.html` to the project root as `index.html`
* Create or update `src/main.tsx` (or `src/main.jsx`) as the new entry point
* Ensure React 18 `createRoot` API is used

---

### 3. Vite Configuration

* Create `vite.config.ts` or `vite.config.js`
* Configure:

  * React plugin
  * Path aliases (if the project previously used absolute imports)
  * Dev server proxy (if applicable)

---

### 4. Environment Variables

* Replace all `process.env.REACT_APP_*` references with `import.meta.env.VITE_*`
* Rename environment variables accordingly
* Ensure `.env`, `.env.local`, and `.env.production` files load correctly

---

### 5. Static Assets

* Update all asset references:

  * Remove `%PUBLIC_URL%`
  * Use root-relative paths (`/asset.png`) or ES module imports
* Verify assets in `/public` and `/src` resolve correctly

---

### 6. CRA Globals & Assumptions

* Replace CRA-specific globals:

  * `process.env.NODE_ENV` → `import.meta.env.MODE`
* Identify and remove CRA polyfills or assumptions
* Document any CRA conveniences that no longer exist

---

### 7. Styling

* Ensure existing styling continues to work:

  * Global CSS
  * CSS Modules
  * Sass / Less
  * Tailwind CSS (if present)
* Install required preprocessors if necessary

---

### 8. Testing (If Applicable)

* Identify the current testing setup
* Choose one approach:

  * Migrate to **Vitest**, or
  * Retain **Jest** with explicit configuration
* Clearly document the chosen strategy and any changes

---

### 9. Validation

* Run the application in development mode
* Build the production bundle
* Verify:

  * Application renders correctly
  * Routing works as expected
  * Environment variables resolve properly
  * Static assets load correctly
  * No CRA references remain

---

## Output Requirements

Provide results in **clearly separated sections**:

1. **Summary of Changes**
2. **Modified and New Files** (include full file contents where relevant)
3. **Deleted Dependencies**
4. **Migration Notes & Gotchas**
5. **Post-Migration Checklist**

---

## Constraints

* Do **not** introduce framework changes (no Next.js, no SSR)
* Do **not** refactor unrelated business logic
* Prefer minimal, safe changes
* Be explicit when something cannot be automated

---

## Tone & Style Guidelines

* Be precise and technical
* Explain *why* changes are made when not obvious
* Assume the reader is a professional developer

---

## Backend Safety Checklist (Non-Functional Verification)

> The CRA → Vite migration is frontend-only, but the following integration points **must be verified** to ensure the backend continues to work unchanged.

### 1. API Connectivity

* Confirm all API base URLs resolve correctly after env var renaming
* Verify no hardcoded `REACT_APP_*` references remain
* Ensure API paths (`/api`, `/graphql`, etc.) are unchanged

### 2. Environment Variables

* Map old → new names:

  * `REACT_APP_*` → `VITE_*`
* Update:

  * `.env` files
  * CI/CD environment variables
  * Hosting assessor configs (Vercel, Netlify, Docker, etc.)
* Confirm backend secrets are **not** exposed to the client

### 3. Dev Server Proxy (Local Development)

* If CRA used `proxy` in `package.json`, recreate it in `vite.config.*`
* Validate:

  * Auth flows
  * Cookies / headers
  * CORS behavior

### 4. Static File Serving (Production)

* Update backend static path assumptions:

  * CRA output: `build/`
  * Vite output: `dist/`
* Verify:

  * Correct index fallback for SPA routing
  * Asset paths resolve correctly

### 5. Routing & Deep Links

* Confirm backend still redirects all non-API routes to `index.html`
* Test deep links directly (page refresh on nested routes)

### 6. CI / CD Pipelines

* Update build commands:

  * `npm run build` now invokes Vite
* Update artifact paths if referenced explicitly
* Ensure cache steps do not assume CRA tooling

### 7. Monitoring & Error Reporting

* Verify frontend error reporting (Sentry, Datadog, etc.) still initializes
* Confirm source maps are uploaded correctly (Vite config may differ)

### 8. Final Backend Sanity Check

* Backend starts without modification
* API responds normally to the migrated frontend
* No increase in error rates after deployment

---

**Rule of Thumb:**

> If the backend only exposes APIs and serves static files, **no backend code changes should be required**—only configuration verification.
