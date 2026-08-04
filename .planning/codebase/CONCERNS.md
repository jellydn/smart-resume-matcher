# Codebase Concerns

**Analysis Date:** 2026-08-04

## Tech Debt

**Schema shadowing — `./schema` resolves to legacy file, not the dispatcher:**
- Issue: `app/db/index.ts` does `import * as schema from "./schema"`. Both `app/db/schema.ts` (legacy sqlite tables) and `app/db/schema/index.ts` (new dialect dispatcher) exist. With `moduleResolution: "bundler"`, the exact file `schema.ts` wins over the directory index — so the dispatcher is dead code for the app, and `drizzlePostgres` receives sqlite-typed tables even in postgres mode.
- Files: `app/db/index.ts`, `app/db/schema.ts`, `app/db/schema/index.ts`, `app/routes/api.resume.tsx` (`import { userResumes } from "~/db/schema"` — same shadowing)
- Impact: Postgres support ("DB on Vercel") is not actually wired into the runtime path; auth and resume sync keep using sqlite-typed schema.
- Fix approach: delete `app/db/schema.ts` so `~/db/schema` resolves to `schema/index.ts`, then re-run typecheck + a postgres-mode smoke test.

**Auth adapter hardcoded to sqlite:**
- Issue: `app/lib/auth.server.ts` calls `drizzleAdapter(db, { provider: "sqlite" })` unconditionally, even when the DB is postgres.
- Files: `app/lib/auth.server.ts`
- Impact: On Vercel/postgres, better-auth queries are generated for sqlite dialect and `db` is type-cast to the sqlite client (`app/db/index.ts` re-export), so auth may fail or misbehave in production.
- Fix approach: select provider from `env.databaseType` (or `isPostgres`).

**Postgres `uuid` ids vs better-auth string ids:**
- Issue: `app/db/schema/postgres.ts` declares `uuid("id").defaultRandom()`; better-auth's default `createId()` generates nanoid-style strings, not UUIDs — inserts into the `uuid` columns will likely be rejected.
- Files: `app/db/schema/postgres.ts`, `app/lib/auth.server.ts`
- Impact: Registration/login on postgres can fail at insert time.
- Fix approach: use `text` ids (like the sqlite schema) or configure better-auth's id generator to emit UUIDs.

**Migration path change orphans existing migration:**
- Issue: `drizzle.config.ts` now emits to `./drizzle/sqlite` / `./drizzle/postgres` (empty dirs), but the only real migration (`drizzle/0000_cool_madelyne_pryor.sql` + `meta/`) lives at `drizzle/`. `pnpm db:migrate` (sqlite) will search `./drizzle/sqlite`, find nothing, and never apply the existing migration.
- Files: `drizzle.config.ts`, `package.json` (db:* scripts), `drizzle/`
- Impact: Local dev DBs can't be migrated with the new config; postgres generations diverge from current state.
- Fix approach: reconcile the `out` directory with existing migration files (either move files or point config back at `./drizzle`).

**Unreachable error branch + silent fallback:**
- Issue: `env.ts` defines `isPostgres = type === "postgres" && !!url`, so inside `app/db/index.ts`'s `if (isPostgres)` block the URL is always set — the `throw` for a missing URL is dead code. Conversely, `DATABASE_TYPE=postgres` without `DATABASE_URL` silently falls back to sqlite.
- Files: `app/lib/env.ts`, `app/db/index.ts`
- Impact: Misconfigured production env runs sqlite (or fails at runtime) instead of failing fast.
- Fix approach: guard on `env.databaseType === "postgres"` and throw when `DATABASE_URL` is missing.

**Unnecessary indirection in db export:**
- Issue: `export const dbExport = db as ReturnType<typeof drizzle<typeof schema>>; export { dbExport as db };` — two-step alias plus a cast to the sqlite-typed client hides the actual dialect from consumers.
- Files: `app/db/index.ts`
- Impact: Type lies propagate the sqlite-vs-postgres mismatch to every consumer.
- Fix approach: export the union-typed value directly.

## Known Bugs

**AI response parsing silently degrades:**
- Symptoms: when an AI provider returns invalid JSON, `parseAIResponse` logs a warning and returns defaults (`matchScore: 0`, empty suggestions) — user sees a "successful" but empty tailoring.
- Files: `app/lib/resume-tailor.ts`, `app/lib/job-parser.ts`
- Trigger: malformed/incomplete AI output (common with weaker models or token truncation)
- Workaround: none user-facing; re-run tailoring

**Job history `clearHistory` unreachable:**
- Symptoms: `useJobHistory` exposes `clearHistory`, but the `job.tsx` UI only wires `deleteEntry` (per-entry delete).
- Files: `app/hooks/use-job-history.ts`, `app/routes/job.tsx`
- Trigger: none (dead API) — minor
- Workaround: N/A

## Security Considerations

**API keys stored in localStorage:**
- Risk: AI provider keys (`VITE_*`) persisted in the browser; XSS in this app would leak them. README claims "encrypted API keys" but no encryption library is present in `package.json`.
- Files: `app/hooks/use-ai-settings.ts`, `app/lib/auth-client.ts`
- Current mitigation: keys are client-side only, never sent to the app server; server routes are session-guarded
- Recommendations: verify/implement actual client-side encryption, or move key usage server-side behind an ephemeral relay

**Better-auth trustedOrigins hardcoded:**
- Risk: `trustedOrigins: ["http://localhost:5173"]` in `app/lib/auth.server.ts` will reject production origins (Vercel domain) during OAuth/redirect flows.
- Files: `app/lib/auth.server.ts`
- Current mitigation: none (email/password only today, so impact is limited)
- Recommendations: derive trusted origins from the request/env

## Performance Bottlenecks

**Large client components:**
- Problem: `app/components/resume/resume-comparison-view.tsx` (935 lines), `tailored-resume-preview.tsx` (782 lines), `export-docx.ts` (593 lines) are large single modules
- Files: `app/components/resume/*`, `app/lib/export-docx.ts`, `app/lib/export-pdf.tsx`
- Cause: monolithic rendering/preview logic
- Improvement path: split into smaller components; lazy-load export libs (PDF renderer is heavy)

**AI calls are blocking full-page state:**
- Problem: analyze/tailor run in the browser with full resume + job text in one prompt; no streaming, no cancellation
- Files: `app/routes/job.tsx`, `app/lib/resume-tailor.ts`
- Cause: single-shot prompts with `max_tokens: 4000`
- Improvement path: streaming responses, chunked analysis, abort controllers

## Fragile Areas

**`app/routes/job.tsx` (577 lines):**
- Files: `app/routes/job.tsx`
- Why fragile: many interdependent state slices (jobDescription, requirements, tailoringResult, errors) + handlers
- Safe modification: add one state slice + one handler per feature, keep result-envelope error flow
- Test coverage: none

**`use-resume-storage.ts` sync logic:**
- Files: `app/hooks/use-resume-storage.ts`
- Why fragile: local vs cloud conflict resolution by `updatedAt` timestamp; debounced writes + mount race conditions
- Safe modification: keep `isInitialLoad` guard semantics; test conflict-resolution cases
- Test coverage: none

**Dialect schema duplication:**
- Files: `app/db/schema/sqlite.ts`, `app/db/schema/postgres.ts`
- Why fragile: two parallel table definitions that must stay in sync manually
- Safe modification: change columns in both files; verify with `db:generate` for each dialect
- Test coverage: none

## Scaling Limits

**SQLite on serverless:**
- Current capacity: single-file DB, fine for local single-user
- Limit: better-sqlite3 is a native module and single-connection; not suitable for Vercel serverless concurrency
- Scaling path: the postgres path (work-in-progress; see Tech Debt above)

**localStorage quotas:**
- Current capacity: ~5-10MB per origin; resume JSON is small, AI settings trivial
- Limit: job history capped at 10 entries (`MAX_JOB_HISTORY_ENTRIES`)
- Scaling path: fine for current data sizes

## Dependencies at Risk

**`@types/pg` (devDependency):**
- Risk: unused — the runtime driver is `postgres` (postgres.js), which has no need for `@types/pg` (that types the `pg` driver)
- Impact: dead dependency, slight install overhead
- Migration plan: remove from `package.json` + lockfile

**Browser AI / WebLLM (`window.ai`):**
- Risk: experimental API behind `@ts-expect-error`; not universally available
- Impact: browser provider fails on most browsers
- Migration plan: graceful fallback messaging already present ("Browser AI not available")

## Missing Critical Features

**No tests:**
- Problem: zero automated tests; CI only lints, typechecks, and builds
- Blocks: safe refactors of the large components, confident changes to storage/sync and AI parsing logic

**No error monitoring:**
- Problem: no Sentry/error tracking in production
- Blocks: diagnosing AI provider failures and cloud-sync errors post-deploy

**LinkedIn URL scraping not implemented:**
- Problem: `/job` accepts a LinkedIn URL but only validates the format; the description must still be pasted manually (URL is not fetched/scraped)
- Files: `app/routes/job.tsx`
- Blocks: the advertised "paste the LinkedIn job URL" flow is only partially real

## Test Coverage Gaps

**AI parsing logic (untested):**
- What's not tested: `parseAIResponse` in `job-parser.ts` / `resume-tailor.ts` — JSON extraction + schema fallback
- Files: `app/lib/job-parser.ts`, `app/lib/resume-tailor.ts`
- Risk: malformed AI output yields silent empty results
- Priority: High

**Resume mutation (apply/revert suggestions):**
- What's not tested: `applySuggestionToResume` / `revertSuggestionFromResume`
- Files: `app/lib/apply-suggestion.ts`
- Risk: accepted/undone edits could corrupt resume data
- Priority: High

**Storage/sync conflict resolution:**
- What's not tested: local-vs-cloud `updatedAt` merge in `use-resume-storage.ts`
- Files: `app/hooks/use-resume-storage.ts`
- Risk: data loss when switching devices/login state
- Priority: Medium

**Postgres dialect (untested):**
- What's not tested: any query against the postgres schema — plus the schema-shadowing bug means it likely never runs postgres tables
- Files: `app/db/schema/postgres.ts`, `app/db/index.ts`
- Risk: "DB on Vercel" feature silently non-functional
- Priority: High

---

*Concerns audit: 2026-08-04*
