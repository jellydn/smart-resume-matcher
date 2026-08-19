# Codebase Concerns

**Analysis Date:** 2026-08-19

## Tech Debt

**Coverage `include` list is manual:**
- Issue: a module can gain a test file without being added to `coverage.include` in `vitest.config.ts`, silently staying unenforced
- Files: `vitest.config.ts`
- Impact: coverage thresholds can regress unnoticed for the new module
- Fix approach: a lint/check that every `*.test.ts(x)` has its source in `include` (or move to a glob)

**Redundant `removeItem` in bio history:**
- Issue: `clearHistory` calls `localStorage.removeItem`, but the save effect immediately re-persists `[]`, so the remove is dead
- Files: `app/hooks/use-bio-history.ts`
- Impact: harmless (history is cleared either way), but misleading
- Fix approach: drop `removeItem` or skip the save after a clear

**Two DB dialects to keep in sync:**
- Issue: sqlite schema (text ids) and postgres schema (uuid ids) are parallel files that must stay structurally identical
- Files: `app/db/schema/sqlite.ts`, `app/db/schema/postgres.ts`
- Impact: drift risk; postgres path is lightly exercised
- Fix approach: single Drizzle schema with a shared column builder, or CI parity check

## Known Bugs

**PDF text-extraction artifacts:**
- Symptoms: ligature glyphs (`fi`→`~`), line-wrap hyphens appear in extracted text
- Files: `app/lib/cv-extract.ts`
- Trigger: PDFs with embedded-font ligatures / hyphenated line breaks
- Workaround: the AI parse smooths most of it; the editable preview lets users fix the rest

## Security Considerations

**AI API keys in localStorage:**
- Risk: keys are stored client-side and read by the browser; any XSS or malicious extension could exfiltrate them
- Files: `app/hooks/use-ai-settings.ts`
- Current mitigation: privacy-first design (keys never touch the server); README warns about local key storage
- Recommendations: keep clear warnings; consider a server proxy for keyed providers

**Anthropic direct-browser-access header:**
- Risk: `anthropic-dangerous-direct-browser-access` signals browser CORS access; key is exposed to the client by design
- Files: `app/lib/ai-chat.ts`, `app/lib/ai-connection.ts`
- Current mitigation: user-supplied key; no server-side relay
- Recommendations: document the trade-off; optionally route Anthropic through a backend

## Performance Bottlenecks

**Lazy-loaded extraction libs:**
- Problem: pdfjs/mammoth are heavy; first PDF/DOCX upload triggers a large dynamic import
- Files: `app/lib/cv-extract.ts`
- Cause: pdfjs worker + mammoth bundle load on demand (intentional)
- Improvement path: acceptable for now; preload only if CV upload becomes a hot path

## Fragile Areas

**AI response parsing:**
- Files: `app/lib/bio-generator.ts`, `app/lib/resume-parser.ts`, `app/lib/job-parser.ts`
- Why fragile: depends on LLM output shape; each has its own `extractJsonObject` + fallback (duplicated logic)
- Safe modification: change one parser at a time; the 55-test suite covers bio/parser paths but not `job-parser`
- Test coverage: `job-parser.ts` untested; `resume-parser.ts` at ~54.7% statements

**CV upload component:**
- Files: `app/components/resume/cv-upload.tsx`
- Why fragile: 300+ lines orchestrating extract→parse→edit→confirm with 8 forms
- Safe modification: `cv-upload.test.tsx` covers the edit/confirm flow but not the file-extraction paths
- Test coverage: ~53% statements

## Scaling Limits

**localStorage resume/history:**
- Current capacity: ~5 MB per origin
- Limit: large resumes + history entries could approach quota
- Scaling path: move to IndexedDB or the existing `user_resumes` DB table if cloud sync is enabled

## Dependencies at Risk

**pdfjs-dist (pinned v4):**
- Risk: pinned behind current major (v5/v6 require native `Uint8Array#toHex`, Chrome 129+)
- Impact: missing newer pdfjs features/fixes
- Migration plan: see ADR-0001 — re-verify the native dependency on upgrade or set a minimum browser version

**TypeScript 7 / Vite 8 / React Router 8:**
- Risk: bleeding-edge majors with less ecosystem stability
- Impact: occasional breaking changes in minor updates
- Migration plan: pin and upgrade deliberately via Renovate

## Missing Critical Features

**No E2E tests:**
- Problem: no Playwright/Cypress coverage of the full UI flows
- Blocks: automated confidence for cross-page flows (resume import → bio/job)

**No server-side AI relay:**
- Problem: all keyed AI providers are called from the browser
- Blocks: safe use of paid provider keys without client exposure

## Test Coverage Gaps

**Untested service modules:**
- What's not tested: `cv-extract.ts` (PDF/DOCX/TXT extraction), `job-parser.ts`, `resume-tailor.ts`, `ai-connection.ts`, `apply-suggestion.ts`, `export-{pdf,docx,json}`, `auth.server.ts`
- Files: `app/lib/cv-extract.ts`, `app/lib/job-parser.ts`, `app/lib/resume-tailor.ts`, `app/lib/ai-connection.ts`
- Risk: regressions in parsing/extraction/export go unnoticed (not in `coverage.include`)
- Priority: Medium

**Low-coverage tested modules:**
- What's not tested: `resume-parser.ts` normalization branches (~54.7%), `cv-upload.tsx` file-extraction + reset paths (~53%)
- Files: `app/lib/resume-parser.ts`, `app/components/resume/cv-upload.tsx`
- Risk: edge-case regressions
- Priority: Low

---

*Concerns audit: 2026-08-19*
