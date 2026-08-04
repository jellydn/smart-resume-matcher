# Coding Conventions

**Analysis Date:** 2026-08-04

Primary source: `AGENTS.md` (repo-adopted coding standards) + observed patterns. `CLAUDE.md` merely references `AGENTS.md`.

## Naming Patterns

**Files:**
- kebab-case for utilities and hooks (`use-resume-storage.ts`, `export-pdf.tsx`, `job-parser.ts`)
- shadcn/ui files kebab-case (`alert-dialog.tsx`, `dropdown-menu.tsx`)
- Route files kebab-case, api routes with `$.` splat (`api.auth.$.tsx`)
- AGENTS.md prescribes PascalCase for components; in practice `app/components/resume/form-wizard.tsx` is kebab-case

**Functions:**
- camelCase, descriptive (`handlePersonalInfoChange`, `saveToCloud`, `parseJobDescription`)
- Event handlers: `handle*` prefix (route modules)

**Variables:**
- camelCase; booleans often `is*`/`has*` prefixed (`isLoading`, `hasResume`, `isLoaded`)

**Types:**
- PascalCase with `Type` suffix for inferred schema types (`Resume`, `Experience`, `AISettings`)
- Schemas: PascalCase with `Schema` suffix (`resumeSchema`, `tailoringResultSchema`)

## Code Style

**Formatting:**
- Biome 2.3 (biome.json): tab indentation, double quotes, `formatWithErrors: true`
- Import organization: Biome `organizeImports` on (assist)

**Linting:**
- Biome with recommended rules; custom: `noUnusedVariables: error`, `noArrayIndexKey: off`, several a11y rules relaxed (`noStaticElementInteractions`, `noSvgWithoutTitle`, `useKeyWithClickEvents` off)
- CI enforces `biome ci .`

## Import Organization

**Order:**
1. React/external packages first (`react`, `react-router`, `lucide-react`, `zod`, `drizzle-orm`)
2. Internal `~/` path aliases (components, hooks, lib, db)
3. Type-only imports with `import type { }` per AGENTS.md (e.g., `import type { Resume } from "~/lib/types"`)
4. Generated route types: `import type { Route } from "./+types/<route>"`

**Path Aliases:**
- `~/*` → `./app/*` (tsconfig paths; resolved by vite-tsconfig-paths)

## Error Handling

**Patterns:**
- Zod `.safeParse` at trust boundaries; fall back to defaults or return structured errors (never crash)
- AI services return `{ success: false, error: string }` envelopes instead of throwing across boundaries (`resume-tailor.ts`, `job-parser.ts`)
- Route loaders/actions: try/catch → `Response.json({ error }, { status })` with 400/401/405/500
- ErrorBoundary in `app/root.tsx` with `isRouteErrorResponse`; dev-only stack traces
- Client UI: per-field validation errors + server error alert (see `login.tsx`)

## Logging

**Framework:** `console` (no logging library)

**Patterns:**
- `console.error` in catch blocks (storage, sync, API, AI calls)
- `console.warn` for recoverable validation issues (AI response fallback)

## Comments

**When to Comment:**
- Section-level comments for schema groups in `types.ts` (`// Experience Schema`)
- `// @ts-expect-error` for experimental Browser AI API
- API/endpoint and config intent comments in `.env.example`
- Minimal inline comments otherwise

**JSDoc/TSDoc:**
- Not used

## Function Design

**Size:**
- No enforced limit; `job.tsx` (577 lines) and `resume.tsx` (510 lines) are large route modules with many handlers

**Parameters:** Typed; options objects where many flags (e.g., `suggestionSchema`)

**Return Values:**
- Services return result envelopes `{ success, result? | error? }`
- Hooks return plain objects with flags (`isLoaded`, `syncStatus`)
- Schemas inferred to `Type` aliases

## Module Design

**Exports:**
- Named exports throughout; `export default` for route page components and root `App`
- Barrel exports where useful: `~/components/ui/*` via direct imports; `~/db/schema` index re-exports

**Barrel Files:**
- `app/db/schema/index.ts`: dialect-aware re-export (sqlite vs postgres tables)
- `app/routes.ts`: central route registry
- shadcn/ui: one file per primitive (no barrel)

---

*Convention analysis: 2026-08-04*
