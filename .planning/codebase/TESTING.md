# Testing Patterns

**Analysis Date:** 2026-08-25

## Test Framework

**Runner:**
- Vitest 4.1.11
- Config: `vitest.config.ts` (alias `~` → `./app`, default environment `node`)

**Assertion Library:**
- Vitest built-in (`expect`, `describe`, `it`) + `@testing-library/jest-dom` matchers in component tests

**Run Commands:**
```bash
pnpm test                # Run all tests
pnpm vitest run <file>   # Run a single file (watch with `pnpm vitest` or `--watch`)
pnpm test:coverage       # Run with coverage (v8, text + json-summary reporters)
```

## Test File Organization

**Location:**
- Co-located next to the module under test: `app/lib/bio-generator.test.ts` beside `app/lib/bio-generator.ts`

**Naming:**
- `<source-name>.test.ts` / `.test.tsx`

**Structure:**
```
app/
├── lib/
│   ├── bio-generator.test.ts      (36 tests)
│   ├── resume-parser.test.ts      (8 tests)
├── components/resume/
│   ├── cv-upload.test.tsx         (2 tests, jsdom)
├── hooks/
│   ├── use-bio-history.test.ts    (12 tests)
```

## Test Structure

**Suite Organization:**
```typescript
describe("parseAIResponse", () => {
	it("parses plain JSON object", () => {
		// ...
	});
});
```
Grouped by function under test; full behavior matrix per function (JSON, fenced JSON, headings, inline options, malformed).

**Patterns:**
- Pure-function unit tests (no mocks needed for `bio-generator` / `resume-parser` — parsers are deterministic given input)
- Hook tests drive React state via `@testing-library/react` `renderHook` + `act` (localStorage mocked with a stub object)
- Component tests (`cv-upload.test.tsx`) use jsdom environment (per-file `// @vitest-environment jsdom`) and mock the AI layer / FileReader

## Mocking

**Framework:** Vitest `vi.mock` / `vi.fn` / `vi.stubGlobal`

**Patterns:**
```typescript
// localStorage stub for hook tests
const store = new Map<string, string>();
vi.stubGlobal("localStorage", {
	getItem: (k: string) => store.get(k) ?? null,
	setItem: (k: string, v: string) => void store.set(k, v),
	removeItem: (k: string) => void store.delete(k),
	clear: () => store.clear(),
});
```

**What to Mock:**
- Network callers (`callOpenRouter`, `callOpenAI`, …) when testing orchestrators like `generateBios` / `parseResumeText`
- `localStorage`, `navigator.clipboard`, `URL.createObjectURL` in browser-context tests

**What NOT to Mock:**
- The parsing/normalization logic itself — `parseAIResponse` and `normalizeParsedResume` are tested with real inputs including the user's real-world bio format

## Fixtures and Factories

**Test Data:**
- Inline literals per test (sample CV text, sample bio responses with headings/JSON)
- Real-world regression fixtures: the exact "Fun & Casual version / Professional version" bio text from the feature request, plus same-line inline options

**Location:**
- Inline in test files; no shared fixture directory

## Coverage

**Requirements:** Enforced in CI — `pnpm test:coverage` in the `test` job; scoped include + thresholds in `vitest.config.ts` (strategies in ADR-0002).

- `include`: `app/lib/bio-generator.ts`, `app/lib/resume-parser.ts`, `app/components/resume/cv-upload.tsx`, `app/hooks/use-bio-history.ts`
- Thresholds: statements 70, lines 70, functions 65, branches 65 (raised as modules gain tests — round down to nearest 5)

**View Coverage:**
```bash
pnpm test:coverage
```

## Test Types

**Unit Tests:**
- Parser correctness (JSON vs text fallback, headings vs inline options, malformed input)
- Resume normalization (field coercion, enum fallbacks, placeholder defaults)
- History hook behavior (load/save/delete/clear, dedupe, cap at 10)
- CV upload edit flow (draft updates, personal-info validation gates confirm)

**Integration Tests:**
- Not used (no server/DB integration tests; AI layers mocked at the call boundary)

**E2E Tests:**
- Not used

## Common Patterns

**Async Testing:**
```typescript
await act(async () => {
	await result.current.addEntry(bioResult, { length: "short" });
});
```
or `await waitFor(() => expect(...))` when asserting post-effect state.

**Error Testing:**
- Malformed JSON / missing required fields → `null` result, empty-safe defaults, or envelope `{ success: false, error }`
- Assert no throw for garbage input; assert fallbacks ("Unknown", "Not specified", "email@example.com")

---

*Testing analysis: 2026-08-25*