import { describe, expect, it } from "vitest";
import { createUserPrompt, parseAIResponse } from "~/lib/bio-generator";
import { emptyResume } from "~/lib/types";

const validResult = {
	funCasual: ["First fun bio", "Second fun bio"],
	professional: ["First pro bio", "Second pro bio"],
};

describe("parseAIResponse", () => {
	describe("JSON responses", () => {
		it("parses a plain JSON object", () => {
			expect(parseAIResponse(JSON.stringify(validResult))).toEqual(validResult);
		});

		it("parses JSON wrapped in a ```json code fence", () => {
			const fenced = `\`\`\`json\n${JSON.stringify(validResult, null, 2)}\n\`\`\``;
			expect(parseAIResponse(fenced)).toEqual(validResult);
		});

		it("parses JSON embedded in surrounding prose", () => {
			const withProse = `Here are your bios:\n${JSON.stringify(validResult)}\nLet me know if you want changes.`;
			expect(parseAIResponse(withProse)).toEqual(validResult);
		});

		it("returns null for JSON with a missing tone", () => {
			expect(
				parseAIResponse(JSON.stringify({ funCasual: ["a", "b"] })),
			).toBeNull();
		});

		it("returns null for JSON with the wrong option count", () => {
			expect(
				parseAIResponse(
					JSON.stringify({
						funCasual: ["a", "b", "c"],
						professional: ["d", "e"],
					}),
				),
			).toBeNull();
		});

		it("returns null for malformed JSON", () => {
			expect(parseAIResponse('{"funCasual": [unclosed')).toBeNull();
		});
	});

	describe("text responses with headings", () => {
		it("parses 'Fun & Casual version' and 'Professional version' sections", () => {
			const text = `Fun & Casual version:
Option 1: I'm a fun engineer.
Option 2: I've built software.

Professional version:
Option 1: Dung is a Senior Engineer.
Option 2: Dung is an AI enthusiast.`;
			expect(parseAIResponse(text)).toEqual({
				funCasual: ["I'm a fun engineer.", "I've built software."],
				professional: [
					"Dung is a Senior Engineer.",
					"Dung is an AI enthusiast.",
				],
			});
		});

		it("matches headings case-insensitively and without trailing colons", () => {
			const text = `FUN & CASUAL VERSION
Option 1: A
Option 2: B
PROFESSIONAL VERSION
Option 1: C
Option 2: D`;
			expect(parseAIResponse(text)).toEqual({
				funCasual: ["A", "B"],
				professional: ["C", "D"],
			});
		});

		it("parses 'Fun Casual version' headings without the ampersand", () => {
			const text = `Fun Casual version:
Option 1: A
Option 2: B
Professional version:
Option 1: C
Option 2: D`;
			expect(parseAIResponse(text)).toEqual({
				funCasual: ["A", "B"],
				professional: ["C", "D"],
			});
		});

		it("collapses multiline option bodies into single lines", () => {
			const text = `Fun & Casual version:
Option 1: First line
second line
Option 2: Another bio
Professional version:
Option 1: Pro one
Option 2: Pro two`;
			expect(parseAIResponse(text)?.funCasual[0]).toBe(
				"First line second line",
			);
		});

		it("returns null when a section has fewer than two options", () => {
			const text = `Fun & Casual version:
Option 1: Only one
Professional version:
Option 1: C
Option 2: D`;
			expect(parseAIResponse(text)).toBeNull();
		});
	});

	describe("text responses without headings", () => {
		it("assigns the first two options to funCasual and the rest to professional", () => {
			const text = `Option 1: Fun one
Option 2: Fun two
Option 1: Pro one
Option 2: Pro two`;
			expect(parseAIResponse(text)).toEqual({
				funCasual: ["Fun one", "Fun two"],
				professional: ["Pro one", "Pro two"],
			});
		});

		it("returns null when fewer than four options are present", () => {
			expect(
				parseAIResponse("Option 1: Only one\nOption 2: Only two"),
			).toBeNull();
		});
	});

	describe("malformed responses", () => {
		it("returns null for empty content", () => {
			expect(parseAIResponse("")).toBeNull();
		});

		it("returns null for content with no option labels", () => {
			expect(
				parseAIResponse("Here are some random notes without any options."),
			).toBeNull();
		});
	});

	describe("createUserPrompt", () => {
		const resume = {
			...emptyResume,
			personalInfo: { ...emptyResume.personalInfo, name: "Dung" },
		};

		it("defaults to medium length guidance", () => {
			const prompt = createUserPrompt(resume);
			expect(prompt).toContain("Keep each bio to 2-3 sentences.");
			expect(prompt).not.toContain("Additional instructions");
		});

		it("applies the requested length guidance", () => {
			expect(createUserPrompt(resume, { length: "short" })).toContain(
				"Keep each bio to 1-2 sentences.",
			);
			expect(createUserPrompt(resume, { length: "long" })).toContain(
				"Keep each bio to 3-5 sentences.",
			);
		});

		it("includes the custom prompt when provided", () => {
			const prompt = createUserPrompt(resume, {
				prompt: "  mention my open-source work  ",
			});
			expect(prompt).toContain(
				'Additional instructions from the user: "mention my open-source work".',
			);
		});

		it("ignores an empty or whitespace-only custom prompt", () => {
			const prompt = createUserPrompt(resume, { prompt: "   " });
			expect(prompt).not.toContain("Additional instructions");
		});

		it("includes the resume data in the prompt", () => {
			expect(createUserPrompt(resume)).toContain('"name": "Dung"');
		});
	});
});
