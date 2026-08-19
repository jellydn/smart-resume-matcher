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
	JobRequirements,
	Resume,
	ResumeTailoringServiceResult,
	TailoringResult,
} from "~/lib/types";
import { generateId, tailoringResultSchema } from "~/lib/types";

const SYSTEM_PROMPT = `You are a professional resume tailoring expert. Your job is to help job seekers optimize their resume for specific job descriptions while maintaining complete honesty.

CRITICAL RULES:
- NEVER fabricate experience, skills, or accomplishments that don't exist in the resume
- ONLY reword and highlight existing experience to better match job requirements
- Suggest how to better present what the candidate already has
- Be specific about which resume content maps to which job requirements

Return ONLY valid JSON with this structure:
{
  "matchScore": 75,
  "matchedSkills": [
    { "skill": "React", "matchType": "exact", "fromResume": "React", "isRequired": true },
    { "skill": "TypeScript", "matchType": "exact", "fromResume": "TypeScript", "isRequired": true },
    { "skill": "Node.js", "matchType": "related", "fromResume": "Express.js", "isRequired": false }
  ],
  "missingSkills": ["GraphQL", "AWS"],
  "suggestions": [
    {
      "id": "unique-id",
      "sectionType": "experience",
      "itemId": "experience-item-id",
      "field": "highlights.0",
      "originalContent": "Built web applications",
      "suggestedContent": "Built responsive React web applications serving 10,000+ users",
      "reason": "Adds specificity and highlights relevant React experience mentioned in job requirements"
    },
    {
      "id": "unique-id",
      "sectionType": "summary",
      "field": "summary",
      "originalContent": "Full-stack developer with 5 years experience",
      "suggestedContent": "Full-stack developer with 5 years experience specializing in React and TypeScript, with a focus on building scalable web applications",
      "reason": "Emphasizes technologies required in job posting"
    }
  ],
  "strengths": [
    "Strong match on required React and TypeScript skills",
    "Experience level aligns with 3-5 years requirement"
  ],
  "improvementAreas": [
    "Consider highlighting any cloud experience (AWS preferred)",
    "Could emphasize team collaboration and mentoring if applicable"
  ]
}

Guidelines:
- matchScore: 0-100 based on skill overlap, experience relevance, and qualification match
- matchType: "exact" for same skill name, "partial" for similar (React/React Native), "related" for transferable skills
- suggestions: Focus on high-impact changes that improve job alignment
- Only suggest changes where the original content exists - use exact originalContent from the resume
- Keep suggested rewording concise and professional
- Prioritize changes to summary, recent experience highlights, and skills sections`;

function createUserPrompt(
	resume: Resume,
	jobRequirements: JobRequirements,
): string {
	const resumeText = JSON.stringify(resume, null, 2);
	const jobText = JSON.stringify(jobRequirements, null, 2);

	return `Analyze this resume and tailor it for the job requirements.

RESUME:
${resumeText}

JOB REQUIREMENTS:
${jobText}

Provide tailoring suggestions that highlight relevant experience without fabricating anything.`;
}

function parseAIResponse(content: string): TailoringResult {
	let jsonStr = content.trim();

	const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
	if (jsonMatch) {
		jsonStr = jsonMatch[1].trim();
	}

	const startIndex = jsonStr.indexOf("{");
	const endIndex = jsonStr.lastIndexOf("}");
	if (startIndex !== -1 && endIndex !== -1) {
		jsonStr = jsonStr.substring(startIndex, endIndex + 1);
	}

	const parsed = JSON.parse(jsonStr);

	// Ensure suggestions have unique IDs
	if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
		parsed.suggestions = parsed.suggestions.map(
			(s: Record<string, unknown>) => ({
				...s,
				id: s.id || generateId(),
				status: s.status || "pending",
			}),
		);
	}

	// Ensure matchedSkills have correct structure
	if (parsed.matchedSkills && Array.isArray(parsed.matchedSkills)) {
		parsed.matchedSkills = parsed.matchedSkills.map(
			(m: Record<string, unknown>) => ({
				...m,
				isRequired: m.isRequired ?? true,
			}),
		);
	}

	const validated = tailoringResultSchema.safeParse(parsed);

	if (!validated.success) {
		console.warn("Validation warnings:", validated.error.issues);
		return tailoringResultSchema.parse({
			matchScore: parsed.matchScore ?? 0,
			matchedSkills: parsed.matchedSkills || [],
			missingSkills: parsed.missingSkills || [],
			suggestions: parsed.suggestions || [],
			strengths: parsed.strengths || [],
			improvementAreas: parsed.improvementAreas || [],
		});
	}

	return validated.data;
}

export async function tailorResume(
	resume: Resume,
	jobRequirements: JobRequirements,
	settings: AISettings,
): Promise<ResumeTailoringServiceResult> {
	// Validate inputs
	if (!resume.personalInfo.name) {
		return { success: false, error: "Resume is missing personal information" };
	}

	if (
		!jobRequirements.requiredSkills?.length &&
		!jobRequirements.responsibilities?.length
	) {
		return {
			success: false,
			error:
				"Job requirements are empty. Please analyze a job description first.",
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

	const userPrompt = createUserPrompt(resume, jobRequirements);

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
		return { success: true, result };
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to tailor resume";
		return { success: false, error: message };
	}
}
