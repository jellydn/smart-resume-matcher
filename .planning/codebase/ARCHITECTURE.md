# Architecture

**Analysis Date:** 2026-08-04

## Pattern Overview

**Overall:** React Router v7 full-stack SSR application — single TypeScript codebase serving both server (loaders/actions, auth, db) and client (interactive resume forms, AI calls). Feature-route + layered-lib structure with a central validated domain model.

**Key Characteristics:**
- Config-based routing (`app/routes.ts`) with route modules exporting `loader`, `action`, `meta`, and default component
- Zod schemas in `app/lib/types.ts` are the single source of truth for domain types; everything (forms, storage, AI responses) validates against them
- Client-first UX: resume data and AI settings persist to localStorage; optional cloud sync when authenticated
- AI orchestration runs in the browser (provider API keys stored locally, never sent to the server)
- Database layer is dialect-aware (SQLite local / Postgres production) behind one `db` export

## Layers

**Routes (pages):**
- Purpose: Page components + data loading/mutation for each URL
- Location: `app/routes/`
- Contains: `home.tsx`, `resume.tsx`, `job.tsx`, `login.tsx`, `signup.tsx`, `api.resume.tsx`, `api.auth.$.tsx`
- Depends on: hooks, lib, components
- Used by: React Router (mapped in `app/routes.ts`)

**Components:**
- Purpose: Reusable UI — shadcn/ui primitives, resume form sections, job/requirements displays, layout chrome
- Location: `app/components/` (subdirs `ui/`, `resume/`, `job/`, `layout/`)
- Contains: FormWizard, ResumeComparisonView, TailoredResumePreview, Header, JsonUpload, etc.
- Depends on: `~/lib`, `~/hooks`, `~/components/ui`
- Used by: route modules

**Hooks:**
- Purpose: Encapsulate stateful behavior — storage, sync, auth session, network status
- Location: `app/hooks/`
- Contains: `use-resume-storage.ts`, `use-ai-settings.ts`, `use-job-history.ts`, `use-session.ts`, `use-network-status.ts`
- Depends on: `~/lib`, better-auth client
- Used by: route modules and components

**Lib (domain + integration):**
- Purpose: Domain model, AI providers, export, auth server, env validation
- Location: `app/lib/`
- Contains: `types.ts` (schemas), `ai-connection.ts`, `job-parser.ts`, `resume-tailor.ts`, `export-pdf.tsx`, `export-docx.ts`, `export-json.ts`, `apply-suggestion.ts`, `auth.server.ts`, `auth-client.ts`, `env.ts`, `utils.ts`
- Depends on: external SDKs (better-auth, docx, @react-pdf/renderer), zod
- Used by: routes, components, hooks

**DB:**
- Purpose: Drizzle client + dialect-specific schema
- Location: `app/db/` (`index.ts`, `schema.ts` legacy, `schema/{index,sqlite,postgres}.ts`)
- Depends on: `~/lib/env`, drizzle-orm, better-sqlite3, postgres
- Used by: `auth.server.ts`, `api.resume.tsx`

## Data Flow

**Resume Tailoring (primary flow):**
1. User fills/imports resume on `/resume` → `useResumeStorage` saves to localStorage (debounced cloud sync via `/api/resume` when logged in)
2. User pastes job description on `/job` → `parseJobDescription` calls configured AI provider → validated `JobRequirements`
3. `tailorResume` sends resume + requirements to AI → validated `TailoringResult` (matchScore, matchedSkills, suggestions)
4. User accepts/rejects suggestions → `applySuggestionToResume`/`revertSuggestionFromResume` mutate resume state → persisted via storage hook
5. Export via `exportResumeAsPdf`/`exportResumeAsDocx`/`exportResumeAsJson`

**Auth Flow:**
1. Client `authClient` (better-auth react) hits `/api/auth/*` route
2. Server `auth.server.ts` uses Drizzle adapter against `~/db` (users/sessions/accounts tables)
3. `useSession` exposes session state; `api.resume.tsx` guards with `auth.api.getSession`

**Cloud Resume Sync:**
1. On mount with auth: `useResumeStorage` loads localStorage + `/api/resume`, picks newest by `updatedAt` timestamp
2. On resume change: debounced (1s) POST to `/api/resume` → upsert `user_resumes` row

**State Management:**
- Local component state + custom hooks (no global store; React Context only for theme)
- Server state: no cache layer; loaders query DB directly per request
- Persistence: localStorage (primary), Drizzle tables (secondary/cloud)

## Key Abstractions

**Zod schemas (`app/lib/types.ts`):**
- Purpose: Runtime-validated domain model (Resume, JobRequirements, TailoringResult, AISettings)
- Examples: `resumeSchema`, `tailoringResultSchema`, `jobRequirementsSchema`
- Pattern: schema-first; types inferred via `z.infer`; `empty*` defaults exported

**AI provider abstraction:**
- Purpose: Uniform interface over OpenRouter/OpenAI/Anthropic/Ollama/Browser AI
- Examples: `job-parser.ts`, `resume-tailor.ts`, `ai-connection.ts`
- Pattern: per-provider `call*` functions + `switch (provider)` dispatch; result objects `{ success, result|error }`

**Result envelope:**
- Purpose: Graceful failure handling in AI service functions
- Examples: `JobParserResult`, `ResumeTailoringServiceResult`
- Pattern: discriminated `success` boolean with either payload or error message (no thrown exceptions across service boundary)

**`cn()` utility (`app/lib/utils.ts`):**
- Purpose: Merge Tailwind classes with clsx + tailwind-merge
- Pattern: standard shadcn/ui helper

## Entry Points

**App entry:**
- Location: `app/root.tsx`
- Triggers: any request to the app
- Responsibilities: HTML shell, ThemeProvider, Header, OfflineIndicator, ErrorBoundary, `<Outlet/>`

**Server build entry:**
- Location: React Router conventions (`react-router.config.ts` ssr:true); routes from `app/routes.ts`

**Auth route:**
- Location: `app/routes/api.auth.$.tsx`
- Triggers: any `/api/auth/*` request
- Responsibilities: proxies better-auth server handlers

**Resume sync API:**
- Location: `app/routes/api.resume.tsx`
- Triggers: GET (load) / POST (save) to `/api/resume`
- Responsibilities: session guard, zod validation, upsert resume data

## Error Handling

**Strategy:** ErrorBoundary at root; try/catch in route loaders/actions; result-envelope in service layer; validation via zod `.safeParse` everywhere data crosses a trust boundary.

**Patterns:**
- `isRouteErrorResponse` in `app/root.tsx` ErrorBoundary (404 vs generic; stack only in dev)
- `safeParse` + fallback defaults for storage loads and AI responses (`job-parser.ts`, `resume-tailor.ts`, `use-resume-storage.ts`)
- JSON error responses with proper status codes (`api.resume.tsx`: 400/401/405/500)

## Cross-Cutting Concerns

**Logging:** `console.error`/`console.warn` inline; no logging framework.

**Validation:** Zod at every boundary — form schemas (`login.tsx`), resume schema (`api.resume.tsx`), AI outputs (`tailoringResultSchema`), env (`env.ts`).

**Authentication:** better-auth email/password; session guard on server API; client-aware rendering (optional cloud sync).

---

*Architecture analysis: 2026-08-04*
