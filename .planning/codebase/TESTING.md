# Testing Patterns

**Analysis Date:** 2026-08-19

## Test Framework

**Runner:**
- Vitest 4.1
- Config: `vitest.config.ts` (node environment, `~/` alias, v8 coverage)

**Assertion Library:**
- Vitest `expect` + `@testing-library/jest-dom` matchers

**Run Commands:**
```bash
pnpm test             # Run all tests once
pnpm test:coverage    # Run with coverage (CI-enforced thresholds)
```

## Test File Organization

**Location:**
- Co-located with the module under test (`app/lib/*.test.ts`, `app/components/resume/*.test.tsx`, `app/hooks/*.test.ts`)

**Naming:**
- `<module>.test.ts(x)`

**Structure:**
```
app/lib/bio-generator.test.ts
app/lib/resume-parser.test.ts
app/components/resume/cv-upload.test.tsx
app/hooks/use-bio-history.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
describe("parseAIResponse", () => {
  describe("JSON responses", () => {
    it("parses a plain JSON object", () => {
      expect(parseAIResponse(JSON.stringify(validResult))).toEqual(validResult);
    });
  });
});
```

**Patterns:**
- Setup: `beforeEach(() => localStorage.clear())` or `vi.resetAllMocks()`
- Teardown: `@testing-library/react` auto-cleanup
- Assertion: `toEqual` (deep), `toHaveLength`, `toBeNull`, `toHaveBeenCalledWith`

## Mocking

**Framework:** Vitest (`vi.mock`, `vi.mocked`, `vi.fn`)

**Patterns:**
```typescript
// Module mock (hoisted)
vi.mock("~/lib/ai-chat", () => ({
  callOpenRouter: vi.fn(),
  callOpenAI: vi.fn(),
  // ...
}));

// Per-test behavior
vi.mocked(callOpenRouter).mockResolvedValue(JSON.stringify(bioResult));
vi.mocked(callOpenRouter).mockRejectedValue(new Error("boom"));
```

```typescript
// Component/hook: real PersonalInfoForm, other sections mocked
vi.mock("~/components/resume/experience-form", () => ({ ExperienceForm: () => null }));
const { result } = renderHook(() => useBioHistory());
act(() => result.current.addEntry(makeResult("a")));
```

**What to Mock:**
- AI provider calls (`~/lib/ai-chat`, `~/lib/resume-parser`)
- Settings hooks (`~/hooks/use-ai-settings`)
- Section forms that aren't the focus of the test

**What NOT to Mock:**
- The form under validation test (`PersonalInfoForm` stays real in `cv-upload.test.tsx`)
- The module under test

## Fixtures and Factories

**Test Data:**
```typescript
const validResult = {
  funCasual: ["First fun bio", "Second fun bio"],
  professional: ["First pro bio", "Second pro bio"],
};

function makeResult(tag: string): BioResult {
  return {
    funCasual: [`fun-${tag}-1`, `fun-${tag}-2`],
    professional: [`pro-${tag}-1`, `pro-${tag}-2`],
  };
}
```

**Location:**
- Inline in each test file (no shared fixtures dir)

## Coverage

**Requirements:** Enforced — `coverage.include` scoped to tested modules, thresholds statements 70 / lines 70 / functions 65 / branches 65 (see `vitest.config.ts` and ADR-0002)

**View Coverage:**
```bash
pnpm test:coverage
```

## Test Types

**Unit Tests:**
- 55 tests across 4 files: bio-generator parsing + `generateBios` provider dispatch, resume-parser normalization, CV upload edit flow, bio-history hook

**Integration Tests:**
- None

**E2E Tests:**
- Not used (manual preview testing instead)

## Common Patterns

**Async Testing:**
```typescript
it("fails on an empty provider response", async () => {
  vi.mocked(callOpenRouter).mockResolvedValue("");
  const result = await generateBios(resume, settingsFor("openrouter", "k"));
  expect(result).toEqual({ success: false, error: "Empty response from AI" });
});
```

**Error Testing:**
```typescript
it("returns null for malformed JSON", () => {
  expect(parseAIResponse('{"funCasual": [unclosed')).toBeNull();
});
```

**Hook/DOM testing:** `// @vitest-environment jsdom` docblock for component/hook files.

---

*Testing analysis: 2026-08-19*
