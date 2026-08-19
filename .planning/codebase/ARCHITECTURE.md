# Architecture

**Analysis Date:** 2026-08-19

## Pattern Overview

**Overall:** React Router v7 full-stack app (SSR) with a thin client-heavy service layer.

**Key Characteristics:**
- Route modules as entry points (`app/routes.ts` → `app/routes/*.tsx`)
- Zod schemas as the single source of truth for all domain shapes (`app/lib/types.ts`)
- "Result envelope" pattern for AI/services: `{ success, result?/resume?/requirements?, error? }`
- Privacy-first: resume data and AI keys live in localStorage; AI calls are made client-side
- Dialect-conditional DB layer (SQLite/PostgreSQL via one schema API)

## Layers

**Routes:**
- Purpose: page/API entry points, orchestration, user interaction
- Location: `app/routes.ts`, `app/routes/*.tsx`
- Contains: pages (`home`, `resume`, `bio`, `job`, `login`, `signup`), API handlers (`api.auth.$.tsx`, `api.resume.tsx`)
- Depends on: components, hooks, lib
- Used by: React Router server/renderer

**Components:**
- Purpose: reusable UI + feature sections
- Location: `app/components/{ui,resume,job,bio,layout}/`
- Contains: shadcn/ui primitives, form sections, panels, upload/preview components
- Depends on: lib (types/utils), hooks

**Hooks:**
- Purpose: state + browser persistence concerns
- Location: `app/hooks/`
- Contains: `use-resume-storage`, `use-job-history`, `use-bio-history`, `use-ai-settings`, `use-session`, `use-network-status`
- Depends on: lib (types)

**Lib (services):**
- Purpose: domain logic, AI calls, parsing, export
- Location: `app/lib/`
- Contains: `ai-chat.ts` (provider dispatch), `bio-generator.ts`, `job-parser.ts`, `resume-parser.ts`, `resume-tailor.ts`, `cv-extract.ts`, `export-{pdf,docx,json}`, `auth.server.ts`, `env.ts`
- Depends on: types, ai-chat, db

**DB:**
- Purpose: persistence for auth/users
- Location: `app/db/`, `app/db/schema/`
- Contains: drizzle schema (sqlite/postgres), dialect-aware barrel
- Depends on: `lib/env`

## Data Flow

**Resume import → tailoring/bio:**
1. User fills wizard, uploads JSON, or uploads/pastes CV (`cv-upload.tsx`)
2. CV text is extracted client-side (`cv-extract.ts`) and AI-parsed (`resume-parser.ts`) to a `Resume`
3. Editable preview confirms → `use-resume-storage` persists to localStorage (`resume-matcher-resume-data`)
4. `/job` tailors against a job description (`job-parser.ts` + `resume-tailor.ts`); `/bio` generates bios (`bio-generator.ts`)

**AI call shape:**
1. Feature builds `ChatMessage[]` (or prompt strings)
2. `ai-chat.ts` dispatches to the selected provider (`AISettings.provider`)
3. Response is parsed (`extractJsonObject` + zod `safeParse`, with text fallbacks) and returned in a result envelope

**State Management:**
- Local React state + localStorage hooks (no global store); `useResumeStorage`/`useJobHistory`/`useBioHistory` each own a storage key with zod validation on load

## Key Abstractions

**AI provider layer (`ai-chat.ts`):**
- Purpose: single dispatch surface for 5 providers
- Examples: `callOpenRouter`, `callOpenAI`, `callAnthropic`, `callOllama`, `callBrowserAI`
- Pattern: uniform `Promise<string>` return, provider-specific signatures

**Result envelopes:**
- Purpose: errors never cross AI boundaries untyped
- Examples: `BioGenerationResult`, `ResumeParserResult`, `JobParserResult`, `ResumeTailoringServiceResult`
- Pattern: `{ success: boolean; result?/resume?/requirements?; error? }`

**Zod schemas (`types.ts`):**
- Purpose: every domain type validated at trust boundaries
- Examples: `resumeSchema`, `bioResultSchema`, `bioHistorySchema`, `tailoringResultSchema`, `jobRequirementsSchema`

## Entry Points

**Route registry:**
- Location: `app/routes.ts`
- Triggers: HTTP requests
- Responsibilities: maps URLs to route modules (index `/`, `resume`, `bio`, `job`, `login`, `signup`, `api/auth/*`, `api/resume`)

**Root:**
- Location: `app/root.tsx`
- Triggers: every page
- Responsibilities: document shell, theme/offline/sync providers, ErrorBoundary

## Error Handling

**Strategy:** never throw across UI/AI boundaries; validate and degrade.

**Patterns:**
- Zod `.safeParse` at trust boundaries (localStorage load, AI response)
- Services return `{ success: false, error }` instead of throwing
- `console.warn` for recoverable parse fallbacks; `console.error` in catch blocks
- Route ErrorBoundary (`isRouteErrorResponse`) with dev-only stack traces

## Cross-Cutting Concerns

**Logging:** `console` only (no library)

**Validation:** Zod schemas, normalization pass before parse (`resume-parser.ts`)

**Authentication:** Better Auth server + client (`useSession`), email/password

---

*Architecture analysis: 2026-08-19*
