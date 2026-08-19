# 1. Pin pdfjs-dist to v4 for client-side PDF extraction

Date: 2026-08-19

## Status

Accepted

## Context

The CV upload flow (on `/resume` and `/bio`) extracts text from PDF files entirely in the browser before sending it to the AI parser. PDF extraction uses `pdfjs-dist`, loaded lazily via a Vite `?worker` module worker so the heavy library only downloads when a PDF is actually uploaded.

During end-to-end testing of real PDFs, extraction failed with `n.toHex is not a function`. Investigation showed:

- `pdfjs-dist` v5.7+/v6 relies on the native `Uint8Array.prototype.toHex` API (ES2025, available from Chrome 129) in its trailer-fingerprint code, which runs whenever a PDF carries a trailer `/ID` (virtually every real PDF).
- The preview browser is Chrome < 129, so the native API is absent.
- The failing code runs inside the worker's separate global scope, so a main-thread polyfill cannot reach it. A `?worker` + `workerPort` setup and the non-minified worker build did not help — the dependency is inherent to the v5/v6 worker bundle.

## Decision

Pin `pdfjs-dist` to the v4 line (currently `^4.10.38` in `package.json`) and continue loading it via a Vite `?worker` module worker. The v4 worker ships its own `toHexUtil` and has no dependency on the native `Uint8Array.prototype.toHex`, so extraction works in browsers that predate Chrome 129.

## Consequences

### 📋 Positive

- PDF extraction works across older browsers without requiring a minimum Chrome version or runtime polyfill hacks.
- No runtime shims to maintain; the fix lives in the pinned dependency version.

### 📋 Negative

- The project is pinned behind pdfjs-dist's current major version, missing newer features and fixes.
- Any future upgrade to pdfjs-dist v5+ must either re-verify the native `toHex` dependency, require a minimum browser version (Chrome 129+), or polyfill the worker scope.
- The worker integration API (`PDFDocumentLoadingTask.destroy()`, `GlobalWorkerOptions.workerPort`) is version-specific and will likely need adjustment on upgrade.
