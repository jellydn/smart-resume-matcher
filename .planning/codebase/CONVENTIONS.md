# Coding Conventions

**Analysis Date:** 2026-08-25

## Naming Patterns

**Files:**
- Kebab-case: `bio-generator.ts`, `use-resume-storage.ts`, `resume-comparison-view.tsx`
- Tests co-located as `<name>.test.ts(x)`

**Functions:**
- `camelCase`; verbs first for actions (`generateBios`, `parseAIResponse`, `normalizeParsedResume`, `extractTextFromCvFile`)
- React hooks prefixed `use` (`useBioHistory`, `useResumeStorage`)

**Variables:**
- `camelCase`, descriptive; derived/validated values named for what they hold (`hasProfile`, `isLoaded`, `syncStatus`)

**Types:**
- `PascalCase` interfaces/types; Zod schemas named `<domain>Schema` (`resumeSchema`, `bioResultSchema`); inferred types via `z.infer` (`Resume`, `BioResult`)

## Code Style

**Formatting:**
- Biome (tabs, double quotes, trailing commas default)
- `import type` for type-only imports (enforced by `verbatimModuleSyntax` in tsconfig)

**Linting:**
- Biome `recommended` preset; `noUnusedVariables: error`; a11y relaxations for static element interactions
- `organizeImports` on (assist action)

## Import Organization

**Order:**
1. External packages (lucide-react, react, zod, etc.)
2. `~/`-aliased internal modules (components, hooks, lib, types)
3. Relative imports (rare; e.g. `+types` route files)

**Path Aliases:**
- `~/*` → `./app/*` (tsconfig `paths` + Vite `resolve.tsconfigPaths` + Vitest alias)

## Error Handling

**Patterns:**
- AI services return result envelopes `{ success, result?, error? }` — callers branch on `success`, never catch-and-rethrow across the boundary
- Storage hooks wrap `localStorage` in try/catch, `console.warn` on invalid schema, `console.error` on failures, fall back to safe defaults
- API handlers return `{ success, error }` JSON; auth failures return 401 handled gracefully by the client
- User-facing error messages are short strings surfaced in `Alert` components

## Logging

**Framework:** `console` (warn/error) — no logging library

**Patterns:**
- `console.warn` for recoverable data issues (invalid localStorage schema, best-effort CI comment)
- `console.error` for real failures (storage read/write, cloud sync, extraction errors)
- No `console.log` in production code paths

## Comments

**When to Comment:**
- Explain *why* (rationale, invariants), not *what* — e.g. the pdfjs worker minification note in `cv-extract.ts`, the pnpm-11 config rationale in `pnpm-workspace.yaml`, the best-effort CI comment note
- Config files carry intent comments for deliberate non-obvious decisions (ADR references, override scopes)
- Regexes with subtle lookaheads get a short comment describing the contract (e.g. bio heading/option splitting)

**JSDoc/TSDoc:**
- Not used; type signatures + result envelopes self-document

## Function Design

**Size:** Small focused functions; large files are split by concern (e.g. parser helpers like `asString`/`asArray`/`asRecord` extracted per coercion)
- Note: some UI files are large (`resume-comparison-view.tsx` ~935 lines, `tailored-resume-preview.tsx` ~782) — pre-existing, flag for splitting

**Parameters:** Few, object options where >2 (`BioGenerationOptions`, `BioHistoryEntry` options param)

**Return Values:** Explicit; services return result envelopes; parsers return `T | null`; hooks return a named `XxxReturn` interface

## Module Design

**Exports:** Named exports throughout; one primary function/component per module

**Barrel Files:**
- `app/db/schema/index.ts` re-exports the dialect-selected schema
- `app/lib/types.ts` is the de-facto barrel for all domain types/schemas
- `ui/` components are imported directly (no barrel)

---

*Convention analysis: 2026-08-25*
