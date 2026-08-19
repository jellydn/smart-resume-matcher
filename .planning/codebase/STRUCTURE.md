# Codebase Structure

**Analysis Date:** 2026-08-19

## Directory Layout

```
smart-resume-matcher/
├── app/                     # Application source
│   ├── routes.ts            # Route registry
│   ├── root.tsx             # Document shell + providers
│   ├── routes/              # Page/API route modules
│   ├── components/          # UI + feature components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── resume/          # Resume forms, upload, preview
│   │   ├── job/             # Job description panels
│   │   ├── bio/             # Bio history panel
│   │   └── layout/          # Header
│   ├── hooks/               # State + localStorage hooks
│   ├── lib/                 # Services, AI, parsing, export
│   ├── db/                  # Drizzle schema (sqlite/postgres)
│   ├── types/               # Ambient type declarations
│   └── welcome/             # Landing assets
├── doc/adr/                 # Architecture decision records
├── .planning/codebase/      # This codebase map
├── .github/workflows/       # CI + deploy
├── public/                  # Static assets (favicon, logos)
├── data/                    # Local SQLite DB (gitignored)
├── drizzle/                 # Generated migrations
├── scripts/                 # Build/deploy scripts
├── vite.config.ts           # Vite + PWA config
├── react-router.config.ts   # SSR config
├── tsconfig.json            # TypeScript config (strict, ~ alias)
├── biome.json               # Lint/format config
├── drizzle.config.ts        # Dialect-conditional DB config
├── pnpm-workspace.yaml      # pnpm settings + overrides
└── package.json             # Scripts + dependencies
```

## Directory Purposes

**app/routes:**
- Purpose: page + API entry points
- Contains: route modules (`home.tsx`, `resume.tsx`, `bio.tsx`, `job.tsx`, `login.tsx`, `signup.tsx`, `api.auth.$.tsx`, `api.resume.tsx`)
- Key files: `app/routes.ts` (registry)

**app/components:**
- Purpose: reusable UI + feature sections
- Contains: shadcn/ui primitives, `resume/` (8 section forms, `cv-upload`, `resume-preview`), `bio/`, `job/`, `layout/`
- Key files: `cv-upload.tsx`, `form-wizard.tsx`, `bio-history-panel.tsx`

**app/hooks:**
- Purpose: state + persistence
- Contains: `use-resume-storage.ts`, `use-job-history.ts`, `use-bio-history.ts`, `use-ai-settings.ts`, `use-session.ts`, `use-network-status.ts`

**app/lib:**
- Purpose: domain services
- Contains: `ai-chat.ts`, `ai-connection.ts`, `bio-generator.ts`, `job-parser.ts`, `resume-parser.ts`, `resume-tailor.ts`, `cv-extract.ts`, `apply-suggestion.ts`, `export-*`, `auth.server.ts`, `auth-client.ts`, `env.ts`, `types.ts`, `utils.ts`

**app/db:**
- Purpose: Drizzle schema + dialect selection
- Key files: `schema/index.ts` (barrel), `schema/sqlite.ts`, `schema/postgres.ts`

## Key File Locations

**Entry Points:**
- `app/routes.ts`: route registry
- `app/root.tsx`: app shell

**Configuration:**
- `vite.config.ts`, `react-router.config.ts`, `tsconfig.json`, `biome.json`, `drizzle.config.ts`, `pnpm-workspace.yaml`

**Core Logic:**
- `app/lib/types.ts`: all zod schemas + types
- `app/lib/ai-chat.ts`: AI provider dispatch
- `app/lib/resume-tailor.ts`: tailoring service

**Testing:**
- `app/lib/bio-generator.test.ts`, `app/lib/resume-parser.test.ts`, `app/components/resume/cv-upload.test.tsx`, `app/hooks/use-bio-history.test.ts`
- `vitest.config.ts` (coverage config)

## Naming Conventions

**Files:**
- kebab-case for utilities/hooks/forms: `use-bio-history.ts`, `cv-extract.ts`, `personal-info-form.tsx`
- shadcn/ui primitives kebab-case: `alert-dialog.tsx`
- Route files kebab-case; API splats use `$.`: `api.auth.$.tsx`

**Directories:**
- kebab-case feature dirs: `components/resume`, `components/bio`

## Where to Add New Code

**New Feature:**
- Primary code: `app/routes/<feature>.tsx` + `app/lib/<feature>.ts` + `app/components/<feature>/`
- Tests: co-located `<module>.test.ts(x)`

**New Component/Module:**
- Implementation: `app/components/<area>/<name>.tsx`

**Utilities:**
- Shared helpers: `app/lib/utils.ts` (or a new `app/lib/<name>.ts`)

## Special Directories

**doc/adr:**
- Purpose: architecture decision records
- Generated: No
- Committed: Yes

**data/ (SQLite):**
- Purpose: local DB file
- Generated: Yes
- Committed: No (gitignored)

**drizzle/ (migrations):**
- Purpose: generated SQL migrations
- Generated: Yes
- Committed: Yes

**coverage/:**
- Purpose: vitest coverage reports
- Generated: Yes
- Committed: No (gitignored)

---

*Structure analysis: 2026-08-19*
