import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	resolve: {
		alias: {
			"~": fileURLToPath(new URL("./app", import.meta.url)),
		},
	},
	test: {
		environment: "node",
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary"],
			// Coverage is measured only for modules that have unit tests, so the
			// thresholds below reflect *tested* code rather than the whole app.
			//
			// Adding a tested module:
			//   1. Add its path (relative to the project root) to `include`.
			//   2. Run `pnpm test:coverage` and read the "All files" row.
			//   3. Raise the matching threshold to that value, rounded down to
			//      the nearest 5, so CI tracks the growth instead of drifting.
			//
			// The round-down keeps a few points of headroom so minor V8/Node
			// version variance doesn't cause false CI failures.
			include: [
				"app/lib/bio-generator.ts",
				"app/lib/resume-parser.ts",
				"app/lib/cv-extract.ts",
				"app/components/resume/cv-upload.tsx",
				"app/hooks/use-bio-history.ts",
			],
			thresholds: {
				statements: 70,
				lines: 70,
				functions: 65,
				branches: 65,
			},
		},
	},
});
