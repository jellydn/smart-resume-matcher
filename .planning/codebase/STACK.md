# Technology Stack

**Analysis Date:** 2026-08-19

## Languages

**Primary:**
- TypeScript ^7.0.0 - entire app (`app/**`), config, and tests
- React 19.2.3 (JSX/TSX) - UI components and routes

**Secondary:**
- CSS (Tailwind v4 directives + CSS variables) - `app/app.css`
- YAML - `pnpm-workspace.yaml`, `.github/workflows/*.yml`
- JSON - `package.json`, `app.json`, `components.json`

## Runtime

**Environment:**
- Node.js >= 22.22.0 (`package.json` engines)

**Package Manager:**
- pnpm 11.20.0 (`packageManager` field)
- Lockfile: present (`pnpm-lock.yaml`)

## Frameworks

**Core:**
- React Router v7 (8.3.0) - full-stack framework (SSR, loaders/actions, route modules)
- Tailwind CSS v4 (via `@tailwindcss/vite`) - styling
- shadcn/ui + Radix UI primitives - component system
- Zod 4 - runtime schema validation
- Drizzle ORM 0.45 - typed DB layer (SQLite + PostgreSQL dialects)

**Testing:**
- Vitest 4.1 - test runner
- @testing-library/react 16 - component/hook testing
- jsdom 30 - DOM environment
- @vitest/coverage-v8 4.1 - coverage

**Build/Dev:**
- Vite 8 (via `@react-router/dev`) - bundling/dev server
- vite-plugin-pwa - PWA/service worker
- Biome 2.3 - lint + format
- drizzle-kit - migrations/studio

## Key Dependencies

**Critical:**
- `better-auth` - email/password auth with Drizzle adapter
- `better-sqlite3` - local SQLite driver
- `postgres` - PostgreSQL driver (production path)
- `ai-chat.ts` providers call OpenRouter/OpenAI/Anthropic/Ollama/Browser AI directly via `fetch`
- `pdfjs-dist` 4.10 - client-side PDF text extraction (pinned; see ADR-0001)
- `mammoth` - client-side DOCX text extraction
- `@react-pdf/renderer` + `docx` - PDF/DOCX resume export

**Infrastructure:**
- `@react-router/node` + `@react-router/serve` - server runtime
- `husky` + `lint-staged` - git hooks
- `drizzle-kit` - schema migrations

## Configuration

**Environment:**
- `DATABASE_TYPE` (`sqlite` | `postgres`), `DATABASE_PATH`, `DATABASE_URL` - validated by `app/lib/env.ts`
- `APP_URL`, `AUTH_TRUSTED_ORIGINS` - Better Auth trusted origins
- `VITE_OPENROUTER_API_KEY` / `VITE_OPENAI_API_KEY` / `VITE_ANTHROPIC_API_KEY` - optional build-time AI key hints (keys are actually stored client-side in localStorage)

**Build:**
- `vite.config.ts` (PWA manifest, tailwind, react-router plugins)
- `react-router.config.ts` (`ssr: true`)
- `tsconfig.json` (strict, `~/` path alias)
- `drizzle.config.ts` (dialect-conditional)
- `biome.json` (tab indent, double quotes, recommended rules)

## Platform Requirements

**Development:**
- Node >= 22.22.0, pnpm 11, `pnpm install` + `pnpm dev` (localhost:5173)

**Production:**
- Dokku (Dockerfile) or any Node host; SQLite by default, PostgreSQL supported

---

*Stack analysis: 2026-08-19*
