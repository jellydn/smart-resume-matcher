# Architecture

**Analysis Date:** 2026-08-25

## Pattern Overview

**Overall:** React Router SSR app with a client-heavy, privacy-first core. The resume/job/bio features run largely in the browser (localStorage persistence, optional AI-provider calls direct from the client), with a thin server layer for SSR, auth, and optional cloud resume sync.

**Key Characteristics:**
- File-based routes (`app/routes.ts`) with SSR (`ssr: true`); heavy interactive logic lives in route components + hooks
- Result-envelope pattern: AI-facing services return `{ success, result?, error? }` instead of throwing
- Zod as the single source of truth for types and runtime validation (`app/lib/types.ts`)
- localStorage-first storage with an optional authenticated cloud sync layer (`/api/resume`)
- Lazy-loaded heavy extraction libraries (pdfjs worker, mammoth) only when a format is used

## Layers

**Routes:**
- Purpose: Pages + API endpoints; wire hooks, services, and UI
- Location: `app/routes/`
- Contains: `home`, `resume` (wizard), `bio` (generator), `job` (tailor), `login`, `signup`, `api.auth.*`, `api.resume`
- Depends on: hooks, lib services, components
- Used by: the router (`app/routes.ts`)

**Components:**
- Purpose: Reusable UI (feature components + shadcn-style primitives)
- Location: `app/components/` (`resume/`, `bio/`, `job/`, `layout/`, `ui/`)
- Contains: `cv-upload.tsx` (extract→parse→edit flow), `bio-history-panel.tsx`, resume section forms, `form-wizard.tsx`, previews, `ui/*` primitives
- Depends on: hooks, lib, `ui/`

**Hooks:**
- Purpose: State + persistence for a slice of data
- Location: `app/hooks/`
- Contains: `use-resume-storage` (localStorage + cloud sync), `use-ai-settings`, `use-bio-history`, `use-job-history`, `use-session`, `use-network-status`
- Depends on: lib (`types.ts`, `auth-client`)

**Services (lib):**
- Purpose: Pure logic + AI orchestration, no React
- Location: `app/lib/`
- Contains: `bio-generator.ts`, `resume-parser.ts`, `cv-extract.ts`, `ai-chat.ts`, `ai-connection.ts`, `job-parser.ts`, `resume-tailor.ts`, `export-*`
- Depends on: `types.ts`, `ai-chat.ts`

**Data / DB:**
- Purpose: Persistence and auth
- Location: `app/db/` (`index.ts`, `schema/`), `app/lib/auth.server.ts`
- Contains: Drizzle client, SQLite/Postgres schemas, Better Auth server
- Depends on: `env.ts`

## Data Flow

**Resume storage (local-first with cloud sync):**
1. `useResumeStorage` loads from localStorage (`resume-matcher-resume-data`) on mount
2. If authenticated, also fetches `/api/resume`; the newer of local vs cloud `updatedAt` wins
3. Every change writes localStorage immediately and debounces a cloud POST (1s) when logged in
4. `/api/resume` (`routes/api.resume.tsx`) persists via Drizzle `userResumes` table keyed by user

**CV import pipeline (extract → parse → edit → confirm):**
1. User uploads PDF/DOCX/TXT/MD or pastes text in `cv-upload.tsx`
2. `cv-extract.ts` extracts text client-side (pdfjs worker / mammoth / file.text), 5 MB cap
3. `resume-parser.ts` sends the text to the selected AI provider, extracts fenced/plain JSON, normalizes every field, validates with `resumeSchema`
4. Result opens as an editable draft (Preview/Edit toggle over the eight section forms); personal-info validity gates "Use This Resume"
5. Confirm → `setResume` → persisted via `useResumeStorage`

**Bio generation:**
1. `bio.tsx` requires a profile (name present) or shows the CV-upload entry point
2. `generateBios` builds the prompt from the resume JSON + length/custom-prompt options, calls the provider
3. `parseAIResponse` tries JSON first, falls back to text parsing (tone headings must be full-line; options may be inline)
4. Success → result tabs (fun & casual / professional) + saved to `useBioHistory` (localStorage, max 10)

**Job tailoring:**
1. `job.tsx` takes a job description (+ optional LinkedIn URL), `job-parser.ts` extracts requirements via AI
2. `resume-tailor.ts` compares resume vs requirements → match score, skill matches, suggestions
3. Suggestions are accepted/rejected in `resume-comparison-view.tsx`; final resume exported as PDF/DOCX

**State Management:**
- No global store; per-feature hooks own their slice of state (React `useState`/`useEffect`)
- Persistence is localStorage keyed per feature (`resume-matcher-*`), cloud sync only for the resume
- Auth state via Better Auth client (`useSession`)

## Key Abstractions

**Result envelope:**
- Purpose: Uniform success/error return for AI operations
- Examples: `BioGenerationResult`, `ResumeParserResult`, `ResumeTailoringServiceResult`, `JobParserResult` in `app/lib/types.ts`
- Pattern: `{ success: boolean; result?: T; error?: string }` — callers branch on `success`

**Zod schema layer:**
- Purpose: Single typed schema per domain object; reused for validation, parsing, and type inference
- Examples: `resumeSchema`, `bioResultSchema`, `jobRequirementsSchema` in `app/lib/types.ts`
- Pattern: `z.object(...)` + `z.infer<>`; `safeParse` at storage boundaries and after AI normalization

**AI provider adapter:**
- Purpose: One chat-call API across five providers
- Examples: `callOpenRouter`/`callOpenAI`/`callAnthropic`/`callOllama`/`callBrowserAI` in `app/lib/ai-chat.ts`
- Pattern: thin functions returning the assistant text; consumers switch on `settings.provider`

**Normalization pass:**
- Purpose: Coerce loose LLM JSON into valid typed data
- Examples: `normalizeParsedResume` (`resume-parser.ts`), `parseAIResponse` (`bio-generator.ts`)
- Pattern: per-field coercion helpers (`asString`, `asArray`, enum fallbacks) before schema validation

## Entry Points

**Server:**
- Location: `app/root.tsx` + `app/routes.ts`
- Triggers: `react-router build` → `react-router-serve ./build/server/index.js`
- Responsibilities: SSR, route matching, API routes

**Client:**
- Location: `app/root.tsx` (hydration + PWA registration)
- Triggers: browser load
- Responsibilities: hydrate the SSR markup, run the interactive feature code

**Worker:**
- Location: `pdfjs-dist/build/pdf.worker.mjs?worker` (Vite module worker)
- Triggers: PDF extraction in `cv-extract.ts`
- Responsibilities: off-main-thread PDF text parsing

## Error Handling

**Strategy:** Result envelopes for AI flows; try/catch around storage and network with `console.error`; user-facing error strings surfaced in UI alerts.

**Patterns:**
- Services catch provider errors and return `{ success: false, error: message }` (no unhandled throws across the AI boundary)
- Storage hooks wrap `localStorage` reads/writes in try/catch, warn on invalid schema, fall back to defaults
- Cloud sync degrades gracefully: 401 → treat as anonymous, network failure → `syncStatus: "error"`, keep local data
- Unsupported/oversized CV files throw a descriptive error caught by the upload UI

## Cross-Cutting Concerns

**Logging:** `console.warn`/`console.error` (dev + container logs); no structured logging

**Validation:** Zod everywhere — schemas in `types.ts`, `safeParse` at storage load, after AI normalization, and in API route handlers

**Authentication:** Better Auth email/password; optional — the app works fully anonymous (localStorage); login adds cloud resume sync

---

*Architecture analysis: 2026-08-25*
