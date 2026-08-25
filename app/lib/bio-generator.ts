import {
	type ChatMessage,
	callAnthropic,
	callBrowserAI,
	callOllama,
	callOpenAI,
	callOpenRouter,
} from "~/lib/ai-chat";
import type {
	AISettings,
	BioGenerationResult,
	BioLength,
	BioResult,
	Resume,
} from "~/lib/types";
import { bioResultSchema } from "~/lib/types";

export interface BioGenerationOptions {
	length?: BioLength;
	prompt?: string;
}

const LENGTH_GUIDANCE: Record<BioLength, string> = {
	short: "Keep each bio to 1-2 sentences.",
	medium: "Keep each bio to 2-3 sentences.",
	long: "Keep each bio to 3-5 sentences.",
};

const SYSTEM_PROMPT = `You are an expert personal branding writer. Your job is to turn a person's profile data into ready-to-use bio options for platforms like LinkedIn, GitHub, personal websites, and conference speaker pages.

CRITICAL RULES:
- NEVER fabricate experience, skills, titles, companies, or accomplishments that don't exist in the profile data
- Only reword, organize, and present what is already in the profile
- Keep every bio concise, natural, and ready to paste — no placeholders, no explanations, no markdown
- Fun & Casual bios: written in FIRST PERSON ("I'm..."), warm, approachable, slightly playful but still professional
- Professional bios: written in THIRD PERSON using the person's full name, polished, credential-focused, suitable for LinkedIn
- Make the two fun & casual bios differ in angle (e.g., one journey-focused, one curiosity-focused)
- Make the two professional bios differ in angle (e.g., one role-focused, one broader expertise-focused)

Return ONLY valid JSON with this exact structure (no markdown fences, no commentary):
{
  "funCasual": [
    "First fun & casual bio option",
    "Second fun & casual bio option"
  ],
  "professional": [
    "First professional bio option",
    "Second professional bio option"
  ]
}`;
export function createUserPrompt(
	resume: Resume,
	options: BioGenerationOptions = {},
): string {
	const profileText = JSON.stringify(resume, null, 2);
	const lines = [
		"Generate four ready-to-use profile bios from this profile data.",
		"",
		"PROFILE DATA:",
		profileText,
		"",
		"Write 2 fun & casual bios (first person) and 2 professional bios (third person). Use only the information above — never invent anything.",
	];

	lines.push(LENGTH_GUIDANCE[options.length ?? "medium"]);

	const customPrompt = options.prompt?.trim();
	if (customPrompt) {
		lines.push(
			`Additional instructions from the user: "${customPrompt}". Apply them to all four bios whenever they do not conflict with the rules above.`,
		);
	}

	return lines.join("\n");
}

function extractJsonObject(content: string): string | null {
	const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
	const candidate = fenced ? fenced[1] : content;

	const startIndex = candidate.indexOf("{");
	const endIndex = candidate.lastIndexOf("}");
	if (startIndex === -1 || endIndex === -1) return null;

	return candidate.substring(startIndex, endIndex + 1);
}

function parseOptionsText(content: string): BioResult | null {
	const funCasual: string[] = [];
	const professional: string[] = [];

	// Split on tone headings, e.g. "Fun & Casual version:" / "Professional version:".
	// A heading must sit on its own line (line start, a "version"/":" suffix, and
	// nothing else on the line) so a bio body that merely contains the word
	// "professional" (e.g. "I'm a professional engineer") is not misread as a
	// heading switch.
	const parts = content.split(
		/(?:^|\n)\s*(fun\s*&?\s*casual|professional)\s*(?::|version\s*:?)\s*(?=\n|$)/i,
	);
	let current: "funCasual" | "professional" | null = null;

	for (const part of parts) {
		const trimmed = part.trim();
		const lower = trimmed.toLowerCase();

		if (
			lower === "fun & casual" ||
			lower === "fun casual" ||
			lower === "casual"
		) {
			current = "funCasual";
			continue;
		}
		if (lower === "professional") {
			current = "professional";
			continue;
		}
		if (!current || !trimmed) continue;

		// Options may be separated by a newline ("Option 1:\n...") or flow
		// inline on the same line ("...loop. Option 2: ..."), so split on any
		// whitespace-preceded "option N:" rather than requiring a newline.
		const options = [
			...trimmed.matchAll(
				/option\s*\d+\s*:?\s*([\s\S]*?)(?=\s+option\s*\d+\s*:|\s*$)/gi,
			),
		]
			.map((match) => match[1].trim().replace(/\s+/g, " "))
			.filter(Boolean);

		(current === "funCasual" ? funCasual : professional).push(...options);
		current = null;
	}

	const result: BioResult = { funCasual: [], professional: [] };

	if (funCasual.length === 0 && professional.length === 0) {
		// No headings found — collect options in document order and split
		// them (fun & casual first, per the prompt)
		const allOptions = [
			...content.matchAll(
				/option\s*\d+\s*:?\s*([\s\S]*?)(?=\s+option\s*\d+\s*:|\s*$)/gi,
			),
		]
			.map((match) => match[1].trim().replace(/\s+/g, " "))
			.filter(Boolean);

		result.funCasual = allOptions.slice(0, 2);
		result.professional = allOptions.slice(2, 4);
	} else {
		result.funCasual = funCasual.slice(0, 2);
		result.professional = professional.slice(0, 2);
	}

	if (result.funCasual.length < 2 || result.professional.length < 2) {
		return null;
	}

	return result;
}

export function parseAIResponse(content: string): BioResult | null {
	const jsonStr = extractJsonObject(content);
	if (jsonStr) {
		try {
			const parsed = JSON.parse(jsonStr);
			const validated = bioResultSchema.safeParse(parsed);
			if (validated.success) return validated.data;
		} catch {
			// Fall through to text parsing
		}
	}

	return parseOptionsText(content);
}
export async function generateBios(
	resume: Resume,
	settings: AISettings,
	options: BioGenerationOptions = {},
): Promise<BioGenerationResult> {
	if (!resume.personalInfo.name) {
		return { success: false, error: "Profile is missing personal information" };
	}

	const { provider, apiKeys, ollamaBaseUrl } = settings;

	if (provider !== "browser" && provider !== "ollama") {
		const apiKey = apiKeys[provider];
		if (!apiKey) {
			return {
				success: false,
				error: `API key not configured for ${provider}`,
			};
		}
	}
	const userPrompt = createUserPrompt(resume, options);

	const messages: ChatMessage[] = [
		{ role: "system", content: SYSTEM_PROMPT },
		{ role: "user", content: userPrompt },
	];

	try {
		let responseContent: string;

		switch (provider) {
			case "openrouter":
				responseContent = await callOpenRouter(apiKeys.openrouter, messages);
				break;
			case "openai":
				responseContent = await callOpenAI(apiKeys.openai, messages);
				break;
			case "anthropic":
				responseContent = await callAnthropic(
					apiKeys.anthropic,
					SYSTEM_PROMPT,
					userPrompt,
				);
				break;
			case "ollama":
				responseContent = await callOllama(ollamaBaseUrl || "", messages);
				break;
			case "browser":
				responseContent = await callBrowserAI(SYSTEM_PROMPT, userPrompt);
				break;
			default:
				return { success: false, error: "Unknown AI provider" };
		}

		if (!responseContent) {
			return { success: false, error: "Empty response from AI" };
		}

		const result = parseAIResponse(responseContent);
		if (!result) {
			return {
				success: false,
				error: "Could not parse the AI response. Please try again.",
			};
		}

		return { success: true, result };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to generate bios";
		return { success: false, error: message };
	}
}
