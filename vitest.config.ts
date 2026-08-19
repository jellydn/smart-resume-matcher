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
			// Coverage is measured only for modules that have unit tests. Add a
			// path here whenever a new module gains a test file so its coverage
			// is enforced by CI too.
			include: [
				"app/lib/bio-generator.ts",
				"app/lib/resume-parser.ts",
				"app/components/resume/cv-upload.tsx",
			],
			thresholds: {
				statements: 50,
				lines: 50,
				functions: 50,
				branches: 45,
			},
		},
	},
});
