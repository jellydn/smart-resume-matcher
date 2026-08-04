# External Integrations

**Analysis Date:** 2026-08-04

## APIs & External Services

**AI Providers (resume tailoring + job parsing):**
- OpenRouter - Chat completions (`anthropic/claude-3.5-haiku` model)
  - SDK/Client: direct `fetch` to `https://openrouter.ai/api/v1/chat/completions`
  - Auth: `VITE_OPENROUTER_API_KEY` / apiKeys in localStorage
- OpenAI - Chat completions (`gpt-4o-mini` model)
  - SDK/Client: direct `fetch` to `https://api.openai.com/v1/chat/completions`
  - Auth: `VITE_OPENAI_API_KEY` / localStorage
- Anthropic - Messages API (`claude-3-haiku-20240307`)
  - SDK/Client: direct `fetch` to `https://api.anthropic.com/v1/messages`
  - Auth: `VITE_ANTHROPIC_API_KEY` / localStorage
- Ollama - Local chat (`llama3.2` via `http://localhost:11434/api/chat`)
  - Auth: none (local)
- Browser AI (WebLLM) - `window.ai.languageModel` experimental API
  - Auth: none (in-browser, free)

All provider calls live in `app/lib/ai-connection.ts` (connection tests), `app/lib/job-parser.ts` (job analysis), and `app/lib/resume-tailor.ts` (tailoring).

## Data Storage

**Databases:**
- SQLite (local development) - file at `./data/sqlite.db`
  - Connection: `DATABASE_PATH`
  - Client: better-sqlite3 + `drizzle-orm/better-sqlite3`
- PostgreSQL (production/Vercel) - via `DATABASE_URL`
  - Connection: `DATABASE_URL`
  - Client: postgres.js + `drizzle-orm/postgres-js`

Schema split by dialect: `app/db/schema/sqlite.ts`, `app/db/schema/postgres.ts`, dispatched from `app/db/schema/index.ts`.

**File Storage:**
- Local filesystem only (SQLite file). No external object storage.

**Caching:**
- Browser localStorage for resume data, AI settings, job history
- Service worker runtime caching for Google Fonts (CacheFirst, 1-year TTL) via `vite-plugin-pwa` in `vite.config.ts`

## Authentication & Identity

**Auth Provider:**
- better-auth 1.4 (email/password only)
- Implementation: server instance in `app/lib/auth.server.ts` with Drizzle adapter; client in `app/lib/auth-client.ts`; server routes proxied at `app/routes/api.auth.$.tsx`
- Session expiry: 7 days, sliding update every 24h
- Note: Drizzle adapter currently hardcodes `provider: "sqlite"` (`app/lib/auth.server.ts`)

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry/other)

**Logs:**
- `console.error` / `console.warn` throughout routes, hooks, and lib
- React Router `ErrorBoundary` in `app/root.tsx` (stack only in dev)

## CI/CD & Deployment

**Hosting:**
- Vercel (target; postgres setup documented in `.env.example` and README)

**CI Pipeline:**
- GitHub Actions `.github/workflows/ci.yml` on push/PR to `main`/`develop`:
  - `biome ci .` (quality)
  - `pnpm run typecheck` (type check)
  - `pnpm run build` (build)

## Environment Configuration

**Required env vars:**
- `DATABASE_TYPE` (`sqlite` default / `postgres`)
- `DATABASE_URL` (when postgres)
- `DATABASE_PATH` (sqlite path, has default)
- Optional client-side: `VITE_OPENROUTER_API_KEY`, `VITE_OPENAI_API_KEY`, `VITE_ANTHROPIC_API_KEY`

**Secrets location:**
- Server: env vars (`.env`, gitignored)
- Client: localStorage under `api-keys` (encrypted client-side per README; AI keys never sent to server)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None (auth callbacks handled internally by better-auth route `api/auth/*`)

---

*Integration audit: 2026-08-04*
