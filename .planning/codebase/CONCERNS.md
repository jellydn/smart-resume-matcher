# Codebase Concerns

**Analysis Date:** 2026-08-25

## Tech Debt

**Large UI components:**
- Issue: `resume-comparison-view.tsx` (~935 lines) and `tailored-resume-preview.tsx` (~782 lines) exceed comfortable single-file size; `export-docx.ts` (~593) is a long builder
- Files: `app/components/resume/resume-comparison-view.tsx`, `app/components/resume/tailored-resume-preview.tsx`, `app/lib/export-docx.ts`
- Impact: Hard to navigate; changes risk regression in unrelated sections
- Fix approach: Split comparison view into per-section subcomponents; extract export builders into per-section helpers

- **Corepack/Docker pin drift:**
- Issue: `Dockerfile` pins `pnpm@10.34.5` via corepack, but `package.json` declares `pnpm@11.20.0` — the runtime resolves 11.20.0, so the pin is stale/misleading
- Files: `Dockerfile`, `package.json`
- Impact: Confusing; a future pnpm-10-specific assumption would silently run against 11
- Fix approach: Align the corepack pin to 11.20.0 (or drop the explicit prepare since `packageManager` governs)

**README provider naming drift:**
- Issue: README AI-provider table says "WebLLM", but the code's browser provider is Chrome's experimental `window.ai` ("Browser AI")
- Files: `README.md`, `app/lib/types.ts`, `app/lib/ai-connection.ts`
- Impact: Users may look for a WebLLM option that doesn't exist
- Fix approach: Rename the README row to "Browser AI (window.ai, Chrome 127+)"

## Known Bugs

- **PDF ligature/hyphenation artifacts:** extracted PDF text can contain broken ligatures and hyphenated line splits
- Symptoms: garbled words in parsed resumes from PDFs
- Files: `app/lib/cv-extract.ts`
- Trigger: PDFs with complex typography; mitigated by the editable preview before confirm
- Workaround: user reviews/edits the draft; paste text directly for scanned/image PDFs (no text layer)

## Security Considerations

**API keys in localStorage:**
- Risk: AI provider keys stored in browser localStorage under `resume-matcher-ai-settings`; any XSS could exfiltrate them
- Files: `app/hooks/use-ai-settings.ts`
- Current mitigation: keys never leave the browser; app is client-side rendered for these features; no third-party scripts
- Recommendations: Consider session-only storage or an explicit "clear keys" affordance; document the tradeoff

**Auth secret required at boot:**
- Risk: `better-auth` refuses to start with the default secret (verified in container test) — a misconfigured deploy fails loudly (good), but the error message doesn't name `BETTER_AUTH_SECRET`
- Files: `app/lib/auth.server.ts`, `app.json`
- Current mitigation: `app.json` auto-generates the secret on Dokku
- Recommendations: none critical

## Performance Bottlenecks

**Whole-resume JSON to AI:**
- Problem: `createUserPrompt` serializes the entire resume JSON into every bio/job prompt; long resumes inflate tokens
- Files: `app/lib/bio-generator.ts`, `app/lib/resume-tailor.ts`
- Cause: no prompt summarization/section selection
- Improvement path: allow tone/length to trim included sections, or summarize first

**PDF worker startup:**
- Problem: first PDF upload pays worker + pdfjs load cost
- Files: `app/lib/cv-extract.ts`
- Cause: lazy import only on first use (already lazy, so acceptable)
- Improvement path: keep lazy; consider preloading after first interaction

## Fragile Areas

**Bio text-fallback parser:**
- Files: `app/lib/bio-generator.ts`
- Why fragile: regex-based heading/option splitting must tolerate LLM formatting variance (JSON first, text fallback second); heading must be full-line, options may be inline
- Safe modification: keep the JSON path primary; add regression tests for any regex change
- Test coverage: good (36 tests, incl. inline-option regression)

**Deploy pipeline:**
- Files: `.github/workflows/deploy-dokku.yml`, `Dockerfile`, `pnpm-workspace.yaml`
- Why fragile: depends on deploy-branch alignment (`branch: main`), force-push semantics, and the pnpm-11 `verifyDepsBeforeRun: false` setting being present in the runner image (ADR-0004)
- Safe modification: any change must keep `pnpm-workspace.yaml` copied into the runner stage; changing the deploy branch requires updating the workflow
- Test coverage: none automated — verified manually via local Docker build/boot

## Scaling Limits

- **localStorage per-feature caps:** bio history and job history capped at 10 entries each (documented constants); resume is a single object
- **CV text cap:** `MAX_CV_TEXT_LENGTH = 30000` chars sent to AI; oversized CVs rejected with a message
- **File size cap:** 5 MB for CV uploads (`cv-extract.ts`)
- Scaling path: these are deliberate privacy-friendly limits; cloud sync exists only for the resume

## Dependencies at Risk

**pdfjs-dist pinned to v4:**
- Risk: pinned to v4.x while v5 is current; the v5 worker has known minification bugs ("toHex is not a function") that motivated the pin (ADR-0001)
- Impact: no feature updates; potential CVE exposure over time
- Migration plan: revisit on pdfjs v5 fixes; re-test the worker path in the browser

**nanoid override:**
- Risk: `nanoid@<3.3.18` forced to 3.3.18 (transitive via postcss/vite) for GHSA-2v37-7h3g-55p8
- Files: `pnpm-workspace.yaml`
- Impact: none today; revisit when vite upgrades drop the vulnerable line

## Missing Critical Features

- **Server-side/CI integration tests:** no tests exercise the API routes or DB layer; the `api.resume` cloud-sync path is untested
- **cv-extract.ts has no unit tests:** PDF/DOCX extraction is only verified manually (real-file end-to-end); a regression in mammoth/pdfjs wiring would go unnoticed in CI
- **E2E coverage:** no browser tests (Playwright/Cypress) for the multi-step flows (CV import → edit → confirm, generate → history)

## Test Coverage Gaps

- **`cv-extract.ts` (format detection + size gate):**
- What's not tested: `getCvFileFormat`, `MAX_CV_FILE_SIZE` gate, and the extraction dispatch
- Files: `app/lib/cv-extract.ts`
- Risk: format/size handling changes could regress silently
- Priority: Medium — add to `coverage.include` with dedicated tests when the extraction functions are made testable (they need File/ArrayBuffer shims)

- **`use-resume-storage.ts` (localStorage + cloud sync):**
- What's not tested: merge logic (local vs cloud `updatedAt`), debounced cloud save, 401 fallback
- Files: `app/hooks/use-resume-storage.ts`
- Risk: sync correctness is subtle and untested
- Priority: Medium

---

*Concerns audit: 2026-08-25*