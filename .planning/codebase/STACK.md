# Technology Stack

**Analysis Date:** 2026-08-25

## Languages

**Primary:**
- TypeScript 7 (`typescript` ^7.0.0) - Entire app: routes, components, lib, hooks, tests
- CSS via Tailwind CSS 4 utilities (`tailwindcss` ^4.1.13, `@tailwindcss/vite`)

**Secondary:**
- SQL (SQLite dialect default, PostgreSQL dialect optional) - Drizzle schema + migrations
- Node.js scripts - `scripts/ralph/` (agent scratch), CI shell steps

## Runtime

**Environment:**
- Node.js >= 22.22.0 (`engines.node`), CI and Docker run Node 24
- React 19.2.3 with React Router 8.3.0 (SSR enabled in `react-router.config.ts`)

**Package Manager:**
- pnpm 11.20.0 (`packageManager` field, corepack)
- Lockfile: `pnpm-lock.yaml` (frozen in CI and Docker)
- pnpm 11 config lives in `pnpm-workspace.yaml` (`verifyDepsBeforeRun`, `minimumReleaseAge`, `allowBuilds`, `overrides`)

## Frameworks

**Core:**
- React Router 8.3.0 - File-based routing (`app/routes.ts`), SSR via `@react-router/serve`
- React 19.2.3 - UI runtime
- Tailwind CSS 4 - Styling (Vite plugin, no config file; `app/app.css`)

**Testing:**
- Vitest 4.1.11 - Test runner (`vitest.config.ts`)
- @testing-library/react 16 + jest-dom 7 - Component tests (jsdom environment)
- @vitest/coverage-v8 - Coverage provider

**Build/Dev:**
- Vite 8 (`vite.config.ts`) - Bundler; react-router + tailwind + PWA plugins
- vite-plugin-pwa 1.3 - PWA manifest + Workbox runtime caching
- Biome 2.x - Lint + format + import organization (`biome.json`)
- Drizzle Kit 0.31.8 - Migrations for SQLite and Postgres

## Key Dependencies

**Critical:**
- `zod` ^4.3.5 - All domain types + validation (`app/lib/types.ts`); runtime schema parsing
- `better-auth` ^1.4.10 - Email/password auth, session management (Drizzle adapter)
- `drizzle-orm` ^0.45.1 + `better-sqlite3` ^13 - Persistence (local SQLite; `postgres` client for PG)
- `pdfjs-dist` ^4.10.38 - Client-side PDF text extraction (pinned to v4, ADR-0001)
- `mammoth` ^1.12.1 - Client-side DOCX text extraction
- `docx` ^9.5.1 - DOCX export
- `@react-pdf/renderer` ^4.3.2 - PDF export

**Infrastructure:**
- `@radix-ui/*` - Headless primitives for the shadcn-style `ui/` components
- `lucide-react` - Icons
- `class-variance-authority`, `clsx`, `tailwind-merge` - Component styling utilities
- `file-saver` - Client file downloads
- `isbot` - Bot detection (SSR)

## Configuration

**Environment:**
- `app/lib/env.ts` - Zod-validated `DATABASE_TYPE`/`DATABASE_PATH`/`DATABASE_URL`
- `app/lib/auth.server.ts` - Reads `AUTH_TRUSTED_ORIGINS` / `APP_URL`
- `app.json` - Dokku app config (env defaults, healthcheck, auto-generated `BETTER_AUTH_SECRET`)
- `.env.example` - Documented templates (SQLite/Postgres)

**Build:**
- `vite.config.ts` - Tailwind, react-router, PWA plugins
- `react-router.config.ts` - `ssr: true`
- `tsconfig.json` - strict, `~/*` path alias to `./app/*`, bundler resolution
- `vitest.config.ts` - test env + scoped coverage
- `biome.json` - tabs, double quotes, recommended rules
- `Dockerfile` - multi-stage build; `pnpm run start` via `react-router-serve`

## Platform Requirements

**Development:**
- Node >= 22.22 + pnpm 11 (corepack); `pnpm install`, `pnpm run dev` (port 5173)
- Docker for local image verification (optional)

**Production:**
- Dokku (Dockerfile build, SQLite volume mounted at `/app/data`); CI via GitHub Actions
- Required env: `BETTER_AUTH_SECRET` (auth refuses to boot without it), `APP_URL` (trusted origin)
- Default: SQLite at `/app/data/sqlite.db`; Postgres via `DATABASE_TYPE=postgres` + `DATABASE_URL`

---

*Stack analysis: 2026-08-25*
