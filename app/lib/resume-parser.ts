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
	Certification,
	Education,
	Experience,
	Language,
	LanguageProficiency,
	OpenSource,
	OpenSourceRole,
	PersonalInfo,
	Project,
	Resume,
	Skill,
	SkillProficiency,
} from "~/lib/types";
import { generateId, resumeSchema } from "~/lib/types";

export const MAX_CV_TEXT_LENGTH = 30000;

export interface ResumeParserResult {
	success: boolean;
	resume?: Resume;
	error?: string;
}

const SYSTEM_PROMPT = `You are an expert resume parser. Convert CV text into structured JSON matching this exact shape:

{
  "personalInfo": { "name": "...", "email": "...", "phone": "...", "location": "...", "linkedin": "...", "website": "...", "summary": "..." },
  "experience": [ { "title": "...", "company": "...", "location": "...", "startDate": "2021-03", "endDate": "", "current": true, "description": "...", "highlights": ["..."] } ],
  "education": [ { "degree": "...", "institution": "...", "location": "...", "graduationDate": "...", "gpa": "" } ],
  "skills": [ { "name": "TypeScript", "proficiency": "expert" } ],
  "languages": [ { "name": "English", "proficiency": "professional" } ],
  "certifications": [ { "name": "...", "issuer": "...", "date": "", "url": "" } ],
  "projects": [ { "name": "...", "description": "...", "url": "", "technologies": [], "highlights": [] } ],
  "openSource": [ { "project": "...", "role": "contributor", "url": "", "description": "", "contributions": [] } ]
}

CRITICAL RULES:
- Extract ONLY what is in the CV — never invent experience, skills, titles, or accomplishments
- personalInfo.name is required; if the CV has no name, use "Unknown"
- personalInfo.email: use the email from the CV; if none is present, use "email@example.com"
- Use "Not specified" for a required field the CV does not contain (experience title, company, or startDate)
- Dates as "YYYY-MM" or "YYYY"; mark a current role with "current": true and an empty endDate
- skill proficiency must be one of: beginner, intermediate, advanced, expert
- language proficiency must be one of: basic, conversational, professional, native
- openSource role must be one of: contributor, maintainer, creator
- Use empty strings for missing optional fields and empty arrays for missing list fields
- Return ONLY the JSON object — no markdown fences, no commentary`;

function createUserPrompt(cvText: string): string {
	return `Convert this CV text into structured resume JSON:\n\n${cvText}`;
}

function extractJsonObject(content: string): string | null {
	const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
	const candidate = fenced ? fenced[1] : content;

	const startIndex = candidate.indexOf("{");
	const endIndex = candidate.lastIndexOf("}");
	if (startIndex === -1 || endIndex === -1) return null;

	return candidate.substring(startIndex, endIndex + 1);
}

function asRecord(value: unknown): Record<string, unknown> {
	return typeof value === "object" && value !== null
		? (value as Record<string, unknown>)
		: {};
}

function asArray(value: unknown): unknown[] {
	return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown): boolean {
	return typeof value === "boolean" ? value : false;
}
function asStringArray(value: unknown): string[] {
	return asArray(value).filter(
		(item): item is string => typeof item === "string",
	);
}

const SKILL_PROFICIENCIES: SkillProficiency[] = [
	"beginner",
	"intermediate",
	"advanced",
	"expert",
];

function asSkillProficiency(value: unknown): SkillProficiency {
	const str = asString(value);
	return SKILL_PROFICIENCIES.includes(str as SkillProficiency)
		? (str as SkillProficiency)
		: "intermediate";
}

const LANGUAGE_PROFICIENCIES: LanguageProficiency[] = [
	"basic",
	"conversational",
	"professional",
	"native",
];

function asLanguageProficiency(value: unknown): LanguageProficiency {
	const str = asString(value);
	return LANGUAGE_PROFICIENCIES.includes(str as LanguageProficiency)
		? (str as LanguageProficiency)
		: "professional";
}

const OPEN_SOURCE_ROLES: OpenSourceRole[] = [
	"contributor",
	"maintainer",
	"creator",
];

function asOpenSourceRole(value: unknown): OpenSourceRole {
	const str = asString(value);
	return OPEN_SOURCE_ROLES.includes(str as OpenSourceRole)
		? (str as OpenSourceRole)
		: "contributor";
}

export function normalizeParsedResume(parsed: unknown): Resume {
	const data = asRecord(parsed);
	const personal = asRecord(data.personalInfo);

	const personalInfo: PersonalInfo = {
		name: asString(personal.name) || "Unknown",
		email: asString(personal.email) || "email@example.com",
		phone: asString(personal.phone),
		location: asString(personal.location),
		linkedin: asString(personal.linkedin),
		website: asString(personal.website),
		summary: asString(personal.summary),
	};

	const experience: Experience[] = asArray(data.experience).map((item) => {
		const entry = asRecord(item);
		return {
			id: generateId(),
			title: asString(entry.title) || "Not specified",
			company: asString(entry.company) || "Not specified",
			location: asString(entry.location),
			startDate: asString(entry.startDate) || "Not specified",
			endDate: asString(entry.endDate),
			current: asBoolean(entry.current),
			description: asString(entry.description),
			highlights: asStringArray(entry.highlights),
		};
	});

	const education: Education[] = asArray(data.education).map((item) => {
		const entry = asRecord(item);
		return {
			id: generateId(),
			degree: asString(entry.degree) || "Not specified",
			institution: asString(entry.institution) || "Not specified",
			location: asString(entry.location),
			graduationDate: asString(entry.graduationDate),
			gpa: asString(entry.gpa),
		};
	});

	const skills: Skill[] = asArray(data.skills).map((item) => {
		const entry = asRecord(item);
		return {
			id: generateId(),
			name: asString(entry.name) || "Not specified",
			proficiency: asSkillProficiency(entry.proficiency),
		};
	});

	const languages: Language[] = asArray(data.languages).map((item) => {
		const entry = asRecord(item);
		return {
			id: generateId(),
			name: asString(entry.name) || "Not specified",
			proficiency: asLanguageProficiency(entry.proficiency),
		};
	});

	const certifications: Certification[] = asArray(data.certifications).map(
		(item) => {
			const entry = asRecord(item);
			return {
				id: generateId(),
				name: asString(entry.name) || "Not specified",
				issuer: asString(entry.issuer) || "Not specified",
				date: asString(entry.date),
				url: asString(entry.url),
			};
		},
	);

	const projects: Project[] = asArray(data.projects).map((item) => {
		const entry = asRecord(item);
		return {
			id: generateId(),
			name: asString(entry.name) || "Not specified",
			description: asString(entry.description),
			url: asString(entry.url),
			technologies: asStringArray(entry.technologies),
			highlights: asStringArray(entry.highlights),
		};
	});

	const openSource: OpenSource[] = asArray(data.openSource).map((item) => {
		const entry = asRecord(item);
		return {
			id: generateId(),
			project: asString(entry.project) || "Not specified",
			role: asOpenSourceRole(entry.role),
			url: asString(entry.url),
			description: asString(entry.description),
			contributions: asStringArray(entry.contributions),
		};
	});

	return {
		personalInfo,
		experience,
		education,
		skills,
		languages,
		certifications,
		projects,
		openSource,
	};
}

export function parseResumeResponse(content: string): Resume | null {
	const jsonStr = extractJsonObject(content);
	if (!jsonStr) return null;

	let parsed: unknown;
	try {
		parsed = JSON.parse(jsonStr);
	} catch {
		return null;
	}

	const normalized = normalizeParsedResume(parsed);
	const validated = resumeSchema.safeParse(normalized);
	if (!validated.success) {
		console.warn("Resume normalization warnings:", validated.error.issues);
		return null;
	}

	return validated.data;
}

export async function parseResumeText(
	cvText: string,
	settings: AISettings,
): Promise<ResumeParserResult> {
	const trimmed = cvText.trim();
	if (!trimmed) {
		return { success: false, error: "Resume text is empty" };
	}
	if (trimmed.length > MAX_CV_TEXT_LENGTH) {
		return {
			success: false,
			error: `Resume text is too long. Please keep it under ${MAX_CV_TEXT_LENGTH.toLocaleString()} characters.`,
		};
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

	const userPrompt = createUserPrompt(trimmed);

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

		const resume = parseResumeResponse(responseContent);
		if (!resume) {
			return {
				success: false,
				error: "Could not parse the AI response. Please try again.",
			};
		}

		return { success: true, resume };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to parse resume";
		return { success: false, error: message };
	}
}
