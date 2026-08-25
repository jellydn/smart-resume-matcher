# Architecture Decision Records

This directory records significant architectural decisions for this project. Each ADR captures the context, the decision, and its consequences so future maintainers understand *why* a choice was made.

| ADR | Title | Status |
| --- | --- | --- |
| [0001](0001-pin-pdfjs-dist-v4.md) | Pin pdfjs-dist to v4 for client-side PDF extraction | Accepted |
| [0002](0002-vitest-coverage-enforcement-strategy.md) | Vitest coverage enforcement strategy | Accepted |
| [0003](0003-cv-import-pipeline.md) | CV import pipeline: client-side extraction, AI parsing, editable preview | Accepted |
| [0004](0004-dokku-deploy-pipeline.md) | Dokku deploy pipeline: deploy-branch alignment, force-push, and pnpm-11 boot fix | Accepted |

## Creating a new ADR

Copy an existing ADR as a starting point and follow the same sections: Title, Date, Status, Context, Decision, Consequences. Number sequentially and add a row to the table above.
