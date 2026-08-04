# Technology Stack

**Analysis Date:** 2026-08-04

## Languages

**Primary:**
- TypeScript 5.9 - Application code (routes, components, lib, db)
- CSS - Tailwind CSS v4 utilities and app-wide variables (`app/app.css`)

**Secondary:**
- JSON - Resume data, PWA manifest, config files

## Runtime

**Environment:**
- Node.js 22 (per CI setup)
- React Router v7 server-side rendering (`react-router.config.ts`: `ssr: true`)

**Package Manager:**
- pnpm 10.28.0
- Lockfile: present (`pnpm-lock.yaml`)

## Frameworks

**Core:**
- React 19.2 - UI framework
- React Router 7.12 - Full-stack routing (config-based via `app/routes.ts`)
- Tailwind CSS 4.1 + @tailwindcss/vite - Styling
- Zod 4.3 - Runtime validation, single source of truth for types (`app/lib/types.ts`)

**Testing:**
- None configured (no test runner, no test files found)

**Build/Dev:**
- Vite 7.1 + react-router dev plugin
- Drizzle ORM 0.45 + drizzle-kit 0.31 - Database schema/migrations
- vite-tsconfig-paths - Path alias resolution
- vite-plugin-pwa - PWA/service worker support
- Biome 2.3 - Linting, formatting, import organization
- Husky 9 + lint-staged 16 - Git hooks

## Key Dependencies

**Critical:**
- better-auth 1.4 - Authentication (email/password), Drizzle adapter
- better-sqlite3 12.6 - Local SQLite driver (development database)
- postgres 3.4 - postgres.js driver (Vercel production database)
- @react-pdf/renderer 4.3 - PDF export
- docx 9.5 - DOCX export
- lucide-react - Icon set
- shadcn/ui components (Radix UI primitives) - UI component library

**Infrastructure:**
- file-saver - Client-side file downloads
- isbot - Bot detection for SSR
- tailwind-merge + clsx - Class composition (`cn()` util)
- class-variance-authority - Component variants

## Configuration

**Environment:**
- `app/lib/env.ts` validates process.env with zod at startup
- `DATABASE_TYPE` = `sqlite` (default) or `postgres`
- `DATABASE_PATH` = SQLite file path (default `./data/sqlite.db`)
- `DATABASE_URL` = Postgres connection string (required when postgres)
- VITE_* AI provider keys (OpenRouter, OpenAI, Anthropic) used client-side
- `.env.example` documents all variables; `.env` is gitignored

**Build:**
- `vite.config.ts` (plugins, PWA config)
- `tsconfig.json` (strict mode, `~/*` → `./app/*` paths)
- `biome.json` (tabs, double quotes, recommended rules)
- `drizzle.config.ts` (dialect-aware schema + out dirs)
- `react-router.config.ts` (SSR enabled)
- `components.json` (shadcn/ui config)

## Platform Requirements

**Development:**
- Node 22+, pnpm 10
- `pnpm install` then `pnpm run dev` (http://localhost:5173)

**Production:**
- Vercel (target per repo branches/env docs); SQLite locally, Postgres on Vercel
- CI: GitHub Actions (`ci.yml`) - biome check, typecheck, build

---

*Stack analysis: 2026-08-04*
