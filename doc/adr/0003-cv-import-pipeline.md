# 3. CV import pipeline: client-side extraction, AI parsing, editable preview

Date: 2026-08-19

## Status

Accepted

## Context

The resume entry point (JSON upload or manual form) was extended to accept a raw CV — a PDF/DOCX/TXT/MD file or pasted text — and turn it into the app's structured `Resume`. The app is privacy-first (localStorage persistence, optional fully-in-browser AI providers), so the pipeline had to avoid a server round-trip for the document itself, while still tolerating the variance of LLM output.

## Decision

Adopt a three-stage, human-in-the-loop pipeline:

1. **Client-side text extraction** (`cv-extract.ts`) — PDF via `pdfjs-dist` (lazy `import` + Vite `?worker` module worker; version pinned per ADR-0001), DOCX via `mammoth`, TXT/MD read directly. A 5 MB cap and extension-based format detection guard the input. Heavy libraries load only when their format is actually used.
2. **AI parsing to a typed `Resume`** (`resume-parser.ts`) — the extracted text goes through the shared `ai-chat.ts` provider layer (OpenRouter/OpenAI/Anthropic/Ollama/Browser AI) with a no-fabrication system prompt. The response is extracted from plain or fenced JSON, then run through a normalization pass that coerces every field (strings, arrays, booleans, and enum fallbacks for skill/language/open-source levels) before a final `resumeSchema.safeParse`. Missing required fields fall back to placeholders (`"Unknown"`, `"Not specified"`, `"email@example.com"`).
3. **Editable confirmation** (`cv-upload.tsx`) — the parsed result opens as a draft backed by the same eight validated section forms used in the `/resume` wizard, with a Preview/Edit toggle and personal-info validity gating the final "Use This Resume" action, which persists via `useResumeStorage`.

## Consequences

### 📋 Positive

- Privacy-first: the document is read in the browser; only its text (not the file) reaches the AI provider.
- Robust to LLM output variance: the normalization pass plus zod validation turns slightly-off JSON into valid typed data.
- Human review catches extraction/parsing errors before data is persisted.
- Reuses the existing section forms rather than a parallel editor; heavy PDF/DOCX libraries are lazy-loaded.

### 📋 Negative

- Client-side extraction is format-limited: scanned/image PDFs produce no text (the UI suggests pasting instead), and pdfjs is pinned to v4 (ADR-0001).
- PDF ligature/hyphenation artifacts leak into the parsed text; the editable step mitigates but doesn't eliminate them.
- Normalization placeholders can silently mask missing data if a user confirms without reviewing the draft.
- Two independently-failing AI steps (bio generation and resume parsing share the provider layer) each need their own error path.
