# Codebase Structure

**Analysis Date:** 2026-08-04

## Directory Layout

```
smart-resume-matcher/
├── app/                    # All application source code
│   ├── components/         # React UI components
│   │   ├── ui/             # shadcn/ui primitives (button, card, dialog, ...)
│   │   ├── resume/         # Resume-related components (forms, previews, comparison)
│   │   ├── job/            # Job description components
│   │   ├── layout/         # Header, page chrome
│   │   └── *.tsx           # Theme provider, indicators, settings dialog
│   ├── hooks/              # Custom React hooks (storage, auth, ai-settings, ...)
│   ├── lib/                # Domain logic, AI integration, exports, auth, env
│   ├── db/                 # Drizzle client + dialect-specific schema
│   ├── routes/             # Route modules (home, resume, job, login, signup, api/*)
│   ├── root.tsx            # Root layout, ErrorBoundary
│   ├── routes.ts           # Route config
│   ├── app.css             # Tailwind v4 entry + theme tokens
│   └── welcome/            # Welcome page (legacy/example)
├── drizzle/                # Generated migration files (sqlite + postgres out dirs)
├── public/                 # Static assets (logo, favicon)
├── scripts/ralph/          # Ralph agent automation scripts
├── tasks/                  # Sample resumes + PRD
├── .github/workflows/      # CI (biome, typecheck, build)
└── *.config.ts|json        # vite, drizzle, react-router, biome, tsconfig, components.json
```

## Directory Purposes

**`app/routes/`:**
- Purpose: URL→component/module mapping (config-based routing)
- Contains: 7 route modules + auto-generated `+types/`
- Key files: `resume.tsx`, `job.tsx`, `api.resume.tsx`, `api.auth.$.tsx`

**`app/components/`:**
- Purpose: Reusable UI
- Contains: 13 shadcn primitives, 8 resume form/preview components, job panels, layout
- Key files: `resume/form-wizard.tsx`, `resume/resume-comparison-view.tsx`, `resume/tailored-resume-preview.tsx`

**`app/hooks/`:**
- Purpose: Stateful behavior
- Contains: 5 hooks
- Key files: `use-resume-storage.ts` (localStorage + cloud sync), `use-ai-settings.ts`

**`app/lib/`:**
- Purpose: Domain model, AI integration, file export, auth, env validation
- Contains: `types.ts` (all zod schemas), AI service functions, export utilities
- Key files: `types.ts`, `resume-tailor.ts`, `job-parser.ts`, `auth.server.ts`

**`app/db/`:**
- Purpose: Data access layer
- Contains: client (`index.ts`), legacy `schema.ts`, `schema/{index,sqlite,postgres}.ts`
- Key files: `index.ts`, `schema/index.ts`

## Key File Locations

**Entry Points:**
- `app/root.tsx`: Root layout + ErrorBoundary
- `app/routes.ts`: Route table

**Configuration:**
- `vite.config.ts`: Vite + Tailwind + PWA
- `tsconfig.json`: strict TS, `~/*` path alias
- `biome.json`: lint/format/import organization
- `drizzle.config.ts`: DB dialect-aware config
- `react-router.config.ts`: SSR flag

**Core Logic:**
- `app/lib/types.ts`: Domain model (schemas + inferred types)
- `app/lib/resume-tailor.ts` / `job-parser.ts`: AI orchestration
- `app/lib/auth.server.ts` + `auth-client.ts`: Auth
- `app/db/index.ts`: DB client selection
- `app/routes/api.resume.tsx`: Resume cloud sync endpoint

**Testing:**
- None (no test directory/files)

## Naming Conventions

**Files:**
- kebab-case for utilities/hooks (`use-resume-storage.ts`, `export-pdf.tsx`)
- PascalCase for component files (`button.tsx` is kebab within `ui/`, but resume components like `form-wizard.tsx` follow kebab; see note below)

**Directories:**
- Lowercase, semantic grouping (`components/resume/`, `components/ui/`)
- Path alias `~/` maps to `app/`

Note: There is mixed file naming in practice — `app/components/ui/*` files are kebab-case (`alert-dialog.tsx`), while the AGENTS.md convention documents kebab-case for utilities and PascalCase for components; `form-wizard.tsx` (kebab) is the current dominant pattern.

## Where to Add New Code

**New Feature (e.g., new resume section):**
- Primary code: `app/components/resume/<name>-form.tsx` + wire into `app/routes/resume.tsx` wizard steps
- Domain: add schema to `app/lib/types.ts`
- Tests: none (no test setup)

**New Route:**
- Implementation: `app/routes/<name>.tsx` + register in `app/routes.ts`

**New AI provider:**
- Implementation: add `call*` function in `app/lib/resume-tailor.ts` + `job-parser.ts` + `ai-connection.ts`, extend `aiProviderSchema` + labels in `types.ts`

**New Component/Module:**
- Implementation: `app/components/<area>/`

**Utilities:**
- Shared helpers: `app/lib/utils.ts` or new kebab-case file in `app/lib/`

## Special Directories

**`drizzle/`:**
- Purpose: Generated migration SQL + snapshots (`0000_cool_madelyne_pryor.sql`, `meta/`); `sqlite/` and `postgres/` subdirs for dialect-specific out
- Generated: Yes (drizzle-kit)
- Committed: Yes

**`scripts/ralph/`:**
- Purpose: Ralph autonomous-agent automation (progress, prompts, prd)
- Generated: No
- Committed: Yes

**`tasks/`:**
- Purpose: Sample resume JSONs and PRD used for testing/development
- Generated: No
- Committed: Yes

**`.freebuff/`:**
- Purpose: Freebuff desktop app data
- Generated: Yes
- Committed: No (untracked)

---

*Structure analysis: 2026-08-04*
