# Codebase Structure

**Analysis Date:** 2026-08-25

## Directory Layout

```
smart-resume-matcher/
├── app/                    # All application code
│   ├── routes/             # Pages + API routes (React Router file routes)
│   ├── components/         # Feature + UI components
│   │   ├── resume/         # Resume wizard, CV upload, previews, forms
│   │   ├── bio/            # Bio generator history panel
│   │   ├── job/            # Job history, requirements display
│   │   ├── layout/         # Header
│   │   └── ui/             # shadcn-style primitives
│   ├── hooks/              # State + persistence hooks
│   ├── lib/                # Services, AI providers, types, exports
│   ├── db/                 # Drizzle client + schemas
│   ├── types/              # Ambient type declarations
│   └── welcome/            # Branding assets
├── doc/adr/                # Architecture Decision Records (0001-0004)
├── drizzle/                # Generated migrations (sqlite/ + postgres/)
├── public/                 # Static assets, PWA icons
├── scripts/                # Scratch/agent scripts (ralph/)
├── .github/workflows/      # ci.yml + deploy-dokku.yml
├── .planning/codebase/     # This codebase map
├── Dockerfile              # Multi-stage production image
├── vite.config.ts          # Vite + react-router + tailwind + PWA
├── vitest.config.ts        # Test config + scoped coverage thresholds
├── react-router.config.ts  # ssr: true
├── biome.json              # Lint/format
├── pnpm-workspace.yaml     # pnpm 11 settings + overrides
├── app.json                # Dokku app config
└── drizzle.config.ts       # Drizzle Kit (sqlite/postgres)
```

## Directory Purposes

**app/routes/:**
- Purpose: Route components — one file per route, wired in `app/routes.ts`
- Contains: `home.tsx`, `resume.tsx`, `bio.tsx`, `job.tsx`, `login.tsx`, `signup.tsx`, `api.auth.$.tsx`, `api.resume.tsx`
- Key files: `bio.tsx` (Bio Generator page), `job.tsx` (tailoring, 577 lines), `resume.tsx` (wizard, 520 lines)

**app/components/resume/:**
- Purpose: Everything for building/importing/exporting a resume
- Contains: `cv-upload.tsx` (extract→parse→edit), `json-upload.tsx`, `form-wizard.tsx`, eight section forms, `resume-preview.tsx`, `resume-comparison-view.tsx` (935 lines), `tailored-resume-preview.tsx` (782 lines)
- Key files: `cv-upload.tsx` + `cv-upload.test.tsx`

**app/lib/:**
- Purpose: Pure services, AI adapters, domain types, export logic
- Contains: `bio-generator.ts`, `resume-parser.ts`, `cv-extract.ts`, `ai-chat.ts`, `ai-connection.ts`, `job-parser.ts`, `resume-tailor.ts`, `apply-suggestion.ts`, `export-docx.ts` (593), `export-pdf.tsx` (507), `export-json.ts`, `types.ts`, `auth.server.ts`, `auth-client.ts`, `env.ts`, `utils.ts`
- Key files: `types.ts` (all Zod schemas), `bio-generator.ts` + `.test.ts`

**app/hooks/:**
- Purpose: Per-feature state + persistence
- Contains: `use-resume-storage.ts` (localStorage + cloud sync), `use-ai-settings.ts`, `use-bio-history.ts` + `.test.ts`, `use-job-history.ts`, `use-session.ts`, `use-network-status.ts`

**app/db/:**
- Purpose: Database client + schema
- Contains: `index.ts` (dialect switch), `schema/index.ts` (re-export), `schema/sqlite.ts`, `schema/postgres.ts`

**doc/adr/:**
- Purpose: Architecture decision records
- Contains: `0001` pdfjs pin, `0002` vitest coverage strategy, `0003` CV import pipeline, `0004` Dokku deploy pipeline, `README.md` index

## Key File Locations

**Entry Points:**
- `app/root.tsx`: SSR root + hydration + PWA registration
- `app/routes.ts`: route table
- `app/routes/api.auth.$.tsx`: Better Auth handler

**Configuration:**
- `vite.config.ts`: build plugins + PWA
- `vitest.config.ts`: test env + coverage `include`/thresholds
- `biome.json`: lint/format rules
- `pnpm-workspace.yaml`: pnpm 11 settings + dependency overrides
- `Dockerfile`: production image (build + runner stages)

**Core Logic:**
- `app/lib/bio-generator.ts`: bio prompt building + response parsing
- `app/lib/resume-parser.ts`: CV text → typed Resume
- `app/lib/cv-extract.ts`: file → text (pdf/docx/txt/md)
- `app/lib/types.ts`: all Zod schemas + types

**Testing:**
- `app/lib/bio-generator.test.ts` (36 tests)
- `app/lib/resume-parser.test.ts` (8 tests)
- `app/components/resume/cv-upload.test.tsx` (2 tests, jsdom)
- `app/hooks/use-bio-history.test.ts` (12 tests)

## Naming Conventions

**Files:**
- Kebab-case for most files: `bio-generator.ts`, `cv-upload.tsx`, `use-resume-storage.ts`
- Route files: `route-name.tsx` under `app/routes/`
- Tests: co-located `<name>.test.ts(x)`

**Directories:**
- Plural, lowercase feature dirs: `routes/`, `components/`, `hooks/`, `lib/`, `db/`, `ui/`

## Where to Add New Code

**New Feature:**
- Primary code: `app/routes/<feature>.tsx` + register in `app/routes.ts`
- Feature logic: `app/lib/<feature>.ts`; state/persistence: `app/hooks/use-<feature>.ts`
- Tests: `app/lib/<feature>.test.ts` (and add to `coverage.include` in `vitest.config.ts`)

**New Component/Module:**
- Implementation: `app/components/<feature>/<component>.tsx`; shared primitives in `app/components/ui/`

**Utilities:**
- Shared helpers: `app/lib/utils.ts`, `app/lib/types.ts` (schemas)

## Special Directories

**drizzle/:**
- Purpose: Generated migrations, split by dialect
- Generated: Yes (via `drizzle-kit generate`)
- Committed: Yes

**build/ + .react-router/:**
- Purpose: Production build output + typegen
- Generated: Yes
- Committed: No (gitignored)

**data/:**
- Purpose: Local SQLite database file
- Generated: Yes (runtime)
- Committed: No

**coverage/:**
- Purpose: Vitest coverage reports
- Generated: Yes
- Committed: No

---

*Structure analysis: 2026-08-25*
