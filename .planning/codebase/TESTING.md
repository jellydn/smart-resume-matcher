# Testing Patterns

**Analysis Date:** 2026-08-04

## Test Framework

**Runner:**
- None — no test runner is installed or configured in `package.json`

**Assertion Library:**
- None

**Run Commands:**
```bash
pnpm run lint        # Biome static checks (ci.yml runs `biome ci .`)
pnpm run typecheck   # react-router typegen + tsc (strict)
pnpm run build       # Production build (catches build-time errors)
```

These are the closest thing to a test suite; CI runs all three.

## Test File Organization

**Location:**
- No test files exist (`find` for `*.test.*` / `*.spec.*` returns nothing)

**Naming:**
- N/A

**Structure:**
```
N/A
```

## Test Structure

**Suite Organization:**
```typescript
// No test suites exist
```

**Patterns:**
- Validation is done at runtime via zod `.safeParse` rather than unit tests
- `tasks/invalid-resume.json` and `tasks/sample-resume.json` serve as manual fixtures for JSON-upload validation

## Mocking

**Framework:** N/A

**Patterns:**
```typescript
// AI provider calls are hard to mock — no test setup exists
```

**What to Mock:**
- AI provider HTTP calls (OpenRouter/OpenAI/Anthropic/Ollama/Browser AI) — would be required to test `job-parser.ts` / `resume-tailor.ts`

**What NOT to Mock:**
- Zod schema validation (it's pure and testable directly)

## Fixtures and Factories

**Test Data:**
```json
// tasks/sample-resume.json — valid resume; tasks/invalid-resume.json — malformed
```

**Location:**
- `tasks/` (sample JSON fixtures only; not referenced by any test runner)

## Coverage

**Requirements:** None enforced (no coverage tooling)

**View Coverage:**
```bash
# Not available
```

## Test Types

**Unit Tests:**
- Not used

**Integration Tests:**
- Not used

**E2E Tests:**
- Not used (no Playwright/Cypress)

## Common Patterns

**Async Testing:**
```typescript
// N/A — no tests
```

**Error Testing:**
```typescript
// N/A — no tests
```

## Recommendations

- Set up Vitest (the project already uses Vite) for unit tests on the highest-value pure modules: `app/lib/types.ts` (schemas), `app/lib/job-parser.ts` + `app/lib/resume-tailor.ts` (AI response parsing — this is where malformed AI JSON currently falls back silently), `app/lib/apply-suggestion.ts` (resume mutation logic)
- Export `parseAIResponse`/`parseJobDescription` internals for direct testing
- Manual QA flow today: run dev server, upload `tasks/sample-resume.json`, exercise `/job` with a pasted description

---

*Testing analysis: 2026-08-04*
