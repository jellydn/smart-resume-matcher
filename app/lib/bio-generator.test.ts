import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	callAnthropic,
	callBrowserAI,
	callOllama,
	callOpenAI,
	callOpenRouter,
} from "~/lib/ai-chat";
import {
	createUserPrompt,
	generateBios,
	parseAIResponse,
} from "~/lib/bio-generator";
import type { AIProvider, AISettings, BioResult } from "~/lib/types";
import { defaultAISettings, emptyResume } from "~/lib/types";

vi.mock("~/lib/ai-chat", () => ({
	callAnthropic: vi.fn(),
	callBrowserAI: vi.fn(),
	callOllama: vi.fn(),
	callOpenAI: vi.fn(),
	callOpenRouter: vi.fn(),
}));

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

		it("parses JSON wrapped in a plain code fence without a language tag", () => {
			const fenced = `\`\`\`\n${JSON.stringify(validResult)}\n\`\`\``;
			expect(parseAIResponse(fenced)).toEqual(validResult);
		});

		it("strips unknown keys from otherwise-valid JSON", () => {
			expect(
				parseAIResponse(JSON.stringify({ ...validResult, notes: "extra" })),
			).toEqual(validResult);
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

		it("parses options that flow inline on the same line", () => {
			const text = `Fun & Casual version
Option 1: I'm a Singapore-based engineer. Option 2: I've built software across Asia.
Professional version
Option 1: Dung is a Senior Engineer. Option 2: Dung is an AI enthusiast.`;
			expect(parseAIResponse(text)).toEqual({
				funCasual: [
					"I'm a Singapore-based engineer.",
					"I've built software across Asia.",
				],
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

describe("generateBios", () => {
	const bioResult: BioResult = {
		funCasual: ["fun one", "fun two"],
		professional: ["pro one", "pro two"],
	};
	const resume = {
		...emptyResume,
		personalInfo: { ...emptyResume.personalInfo, name: "Dung" },
	};

	const settingsFor = (provider: AIProvider, apiKey?: string): AISettings => ({
		...defaultAISettings,
		provider,
		apiKeys: {
			...defaultAISettings.apiKeys,
			...(apiKey ? { [provider]: apiKey } : {}),
		},
	});

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("fails when the profile has no name", async () => {
		const result = await generateBios(emptyResume, defaultAISettings);
		expect(result).toEqual({
			success: false,
			error: "Profile is missing personal information",
		});
		expect(callOpenRouter).not.toHaveBeenCalled();
	});

	it("fails when the API key is not configured", async () => {
		const result = await generateBios(resume, settingsFor("openrouter"));
		expect(result).toEqual({
			success: false,
			error: "API key not configured for openrouter",
		});
	});

	it("generates via OpenRouter", async () => {
		vi.mocked(callOpenRouter).mockResolvedValue(JSON.stringify(bioResult));
		const result = await generateBios(resume, settingsFor("openrouter", "k"));
		expect(result).toEqual({ success: true, result: bioResult });
		expect(callOpenRouter).toHaveBeenCalledWith("k", expect.any(Array));
	});

	it("generates via OpenAI", async () => {
		vi.mocked(callOpenAI).mockResolvedValue(JSON.stringify(bioResult));
		const result = await generateBios(resume, settingsFor("openai", "k"));
		expect(result).toEqual({ success: true, result: bioResult });
	});

	it("generates via Anthropic", async () => {
		vi.mocked(callAnthropic).mockResolvedValue(JSON.stringify(bioResult));
		const result = await generateBios(resume, settingsFor("anthropic", "k"));
		expect(result).toEqual({ success: true, result: bioResult });
		expect(callAnthropic).toHaveBeenCalledWith(
			"k",
			expect.any(String),
			expect.any(String),
		);
	});

	it("generates via Ollama without an API key", async () => {
		vi.mocked(callOllama).mockResolvedValue(JSON.stringify(bioResult));
		const result = await generateBios(resume, {
			...settingsFor("ollama"),
			ollamaBaseUrl: "http://localhost:11434",
		});
		expect(result).toEqual({ success: true, result: bioResult });
	});

	it("generates via Browser AI without an API key", async () => {
		vi.mocked(callBrowserAI).mockResolvedValue(JSON.stringify(bioResult));
		const result = await generateBios(resume, settingsFor("browser"));
		expect(result).toEqual({ success: true, result: bioResult });
	});

	it("fails on an empty provider response", async () => {
		vi.mocked(callOpenRouter).mockResolvedValue("");
		const result = await generateBios(resume, settingsFor("openrouter", "k"));
		expect(result).toEqual({
			success: false,
			error: "Empty response from AI",
		});
	});

	it("fails when the response cannot be parsed", async () => {
		vi.mocked(callOpenRouter).mockResolvedValue("not a bio response");
		const result = await generateBios(resume, settingsFor("openrouter", "k"));
		expect(result).toEqual({
			success: false,
			error: "Could not parse the AI response. Please try again.",
		});
	});

	it("propagates errors thrown by the provider", async () => {
		vi.mocked(callOpenRouter).mockRejectedValue(new Error("boom"));
		const result = await generateBios(resume, settingsFor("openrouter", "k"));
		expect(result).toEqual({ success: false, error: "boom" });
	});

	it("returns Unknown AI provider for an unrecognized provider", async () => {
		// The provider union is exhaustive, so cast an out-of-enum value to
		// reach the defensive default branch.
		const settings = {
			...defaultAISettings,
			provider: "bogus",
			apiKeys: { ...defaultAISettings.apiKeys, bogus: "k" },
		} as unknown as AISettings;
		const result = await generateBios(resume, settings);
		expect(result).toEqual({ success: false, error: "Unknown AI provider" });
	});
});
