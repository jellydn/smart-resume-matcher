# 2. Vitest coverage enforcement strategy

Date: 2026-08-19

## Status

Accepted

## Context

The project added a Vitest suite (bio-generator, resume-parser, CV-upload edit flow, bio-history hook) and wanted CI to *enforce* coverage so a regression that drops coverage fails the build, rather than tests merely passing. The app has a large surface of as-yet-untested code, so a naive whole-project threshold would be either unrealistically high or meaninglessly low.

## Decision

Enforce coverage only over the modules that actually have tests, via an explicit `coverage.include` list in `vitest.config.ts`, and keep a single global threshold over that included set:

- Provider `v8` (`@vitest/coverage-v8`), reporters `text` + `json-summary`.
- `include` lists the tested modules (currently `bio-generator.ts`, `resume-parser.ts`, `cv-upload.tsx`, `use-bio-history.ts`).
- Thresholds are a global average over that set (currently statements 70 / lines 70 / functions 65 / branches 65).
- The CI `test` job runs `pnpm test:coverage`; a breached threshold exits non-zero and fails the job.

The process for growing coverage is documented in the config comment and README: when a module gains its first test file, add its path to `include`, run `pnpm test:coverage`, read the `All files` row, and raise the matching threshold to that number **rounded down to the nearest 5**. The round-down leaves a few points of headroom for minor V8/Node-version variance.

The same CI job then reads `coverage/coverage-summary.json` via `github-script` and upserts a "Test coverage" PR comment (keyed on an `<!-- coverage-comment -->` marker) so the numbers are visible without opening CI logs.

## Consequences

### 📋 Positive

- Coverage regressions fail CI — a removed or weakened test that drops coverage below the threshold breaks the build.
- Scoping to `include` means the bar reflects *tested* code, not the untested app surface; newly tested modules join the enforced set.
- The round-down-to-nearest-5 rule is mechanical and documented, so raising thresholds is not a judgment call.
- The PR comment keeps the numbers discoverable; the `json-summary` mechanism is self-contained (no third-party coverage service).

### 📋 Negative

- The threshold is a global average over the included set: one low-coverage module (e.g. `cv-upload.tsx` at ~53%) drags the average down and can mask a regression in a high-coverage module. Per-glob thresholds would be stricter.
- `include` is manually maintained — a module can gain a test file without being added, silently remaining unenforced.
- Headroom is thin (a few points), so small fluctuations can still trip CI; the numbers are tied to the pinned Node 24 / V8 version.
