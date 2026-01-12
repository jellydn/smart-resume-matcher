import { z } from "zod";

// Personal Info Schema
export const personalInfoSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email format"),
	phone: z.string().optional(),
	location: z.string().optional(),
	linkedin: z.string().url().optional().or(z.literal("")),
	website: z.string().url().optional().or(z.literal("")),
	summary: z.string().optional(),
});

export type PersonalInfo = z.infer<typeof personalInfoSchema>;

// Experience Schema
export const experienceSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Title is required"),
	company: z.string().min(1, "Company is required"),
	location: z.string().optional(),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().optional(),
	current: z.boolean().default(false),
	description: z.string().optional(),
	highlights: z.array(z.string()).default([]),
});

export type Experience = z.infer<typeof experienceSchema>;

// Education Schema
export const educationSchema = z.object({
	id: z.string(),
	degree: z.string().min(1, "Degree is required"),
	institution: z.string().min(1, "Institution is required"),
	location: z.string().optional(),
	graduationDate: z.string().optional(),
	gpa: z.string().optional(),
});

export type Education = z.infer<typeof educationSchema>;

// Skill Schema
export const skillProficiencySchema = z.enum([
	"beginner",
	"intermediate",
	"advanced",
	"expert",
]);

export type SkillProficiency = z.infer<typeof skillProficiencySchema>;

export const skillSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Skill name is required"),
	proficiency: skillProficiencySchema.default("intermediate"),
});

export type Skill = z.infer<typeof skillSchema>;

// Language Schema
export const languageProficiencySchema = z.enum([
	"basic",
	"conversational",
	"professional",
	"native",
]);

export type LanguageProficiency = z.infer<typeof languageProficiencySchema>;

export const languageSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Language name is required"),
	proficiency: languageProficiencySchema.default("professional"),
});

export type Language = z.infer<typeof languageSchema>;

// Certification Schema
export const certificationSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Certification name is required"),
	issuer: z.string().min(1, "Issuer is required"),
	date: z.string().optional(),
	url: z.string().url().optional().or(z.literal("")),
});

export type Certification = z.infer<typeof certificationSchema>;

// Project Schema
export const projectSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Project name is required"),
	description: z.string().optional(),
	url: z.string().url().optional().or(z.literal("")),
	technologies: z.array(z.string()).default([]),
	highlights: z.array(z.string()).default([]),
});

export type Project = z.infer<typeof projectSchema>;

// Open Source Contribution Schema
export const openSourceRoleSchema = z.enum([
	"contributor",
	"maintainer",
	"creator",
]);

export type OpenSourceRole = z.infer<typeof openSourceRoleSchema>;

export const openSourceSchema = z.object({
	id: z.string(),
	project: z.string().min(1, "Project name is required"),
	role: openSourceRoleSchema.default("contributor"),
	url: z.string().url().optional().or(z.literal("")),
	description: z.string().optional(),
	contributions: z.array(z.string()).default([]),
});

export type OpenSource = z.infer<typeof openSourceSchema>;

// Complete Resume Schema
export const resumeSchema = z.object({
	personalInfo: personalInfoSchema,
	experience: z.array(experienceSchema).default([]),
	education: z.array(educationSchema).default([]),
	skills: z.array(skillSchema).default([]),
	languages: z.array(languageSchema).default([]),
	certifications: z.array(certificationSchema).default([]),
	projects: z.array(projectSchema).default([]),
	openSource: z.array(openSourceSchema).default([]),
});

export type Resume = z.infer<typeof resumeSchema>;

// Default empty resume for initialization
export const emptyResume: Resume = {
	personalInfo: {
		name: "",
		email: "",
		phone: "",
		location: "",
		linkedin: "",
		website: "",
		summary: "",
	},
	experience: [],
	education: [],
	skills: [],
	languages: [],
	certifications: [],
	projects: [],
	openSource: [],
};

// Helper function to generate unique IDs
export function generateId(): string {
	return crypto.randomUUID();
}

// Job Description Schema
export const jobDescriptionSchema = z.object({
	description: z.string().min(1, "Job description is required"),
	linkedinUrl: z.string().url().optional().or(z.literal("")),
});

export type JobDescription = z.infer<typeof jobDescriptionSchema>;

// Default empty job description
export const emptyJobDescription: JobDescription = {
	description: "",
	linkedinUrl: "",
};

// AI Provider Schema
export const aiProviderSchema = z.enum([
	"openrouter",
	"openai",
	"anthropic",
	"ollama",
	"browser",
]);

export type AIProvider = z.infer<typeof aiProviderSchema>;

export const aiProviderLabels: Record<AIProvider, string> = {
	openrouter: "OpenRouter",
	openai: "OpenAI",
	anthropic: "Anthropic",
	ollama: "Ollama (Local)",
	browser: "Browser AI",
};

export const aiSettingsSchema = z.object({
	provider: aiProviderSchema.default("openrouter"),
	apiKeys: z.object({
		openrouter: z.string().default(""),
		openai: z.string().default(""),
		anthropic: z.string().default(""),
		ollama: z.string().default(""),
	}),
	ollamaBaseUrl: z.string().url().optional().or(z.literal("")),
});

export type AISettings = z.infer<typeof aiSettingsSchema>;

export const defaultAISettings: AISettings = {
	provider: "openrouter",
	apiKeys: {
		openrouter: "",
		openai: "",
		anthropic: "",
		ollama: "",
	},
	ollamaBaseUrl: "",
};

// Job Requirements Schema (parsed from job description)
export const jobRequirementsSchema = z.object({
	title: z.string().optional(),
	company: z.string().optional(),
	requiredSkills: z.array(z.string()).default([]),
	preferredSkills: z.array(z.string()).default([]),
	qualifications: z.array(z.string()).default([]),
	experienceYears: z
		.object({
			min: z.number().optional(),
			max: z.number().optional(),
		})
		.optional(),
	responsibilities: z.array(z.string()).default([]),
	benefits: z.array(z.string()).default([]),
	keywords: z.array(z.string()).default([]),
});

export type JobRequirements = z.infer<typeof jobRequirementsSchema>;

export const emptyJobRequirements: JobRequirements = {
	title: undefined,
	company: undefined,
	requiredSkills: [],
	preferredSkills: [],
	qualifications: [],
	experienceYears: undefined,
	responsibilities: [],
	benefits: [],
	keywords: [],
};

// Job Parser Result
export interface JobParserResult {
	success: boolean;
	requirements?: JobRequirements;
	error?: string;
}

// Resume Tailoring Types

// A suggestion for improving a piece of resume content
export const suggestionSchema = z.object({
	id: z.string(),
	sectionType: z.enum([
		"summary",
		"experience",
		"education",
		"skills",
		"projects",
		"openSource",
	]),
	itemId: z.string().optional(), // For array items (experience, education, etc.)
	field: z.string(), // Which field to update (e.g., "description", "highlights.0")
	originalContent: z.string(),
	suggestedContent: z.string(),
	reason: z.string(), // Why this change helps match the job
	status: z.enum(["pending", "accepted", "rejected"]).default("pending"),
});

export type Suggestion = z.infer<typeof suggestionSchema>;

// Skill match information
export const skillMatchSchema = z.object({
	skill: z.string(),
	matchType: z.enum(["exact", "partial", "related"]),
	fromResume: z.string().optional(), // Original skill in resume that matches
	isRequired: z.boolean(),
});

export type SkillMatch = z.infer<typeof skillMatchSchema>;

// Complete tailoring result
export const tailoringResultSchema = z.object({
	matchScore: z.number().min(0).max(100),
	matchedSkills: z.array(skillMatchSchema).default([]),
	missingSkills: z.array(z.string()).default([]),
	suggestions: z.array(suggestionSchema).default([]),
	strengths: z.array(z.string()).default([]),
	improvementAreas: z.array(z.string()).default([]),
});

export type TailoringResult = z.infer<typeof tailoringResultSchema>;

export const emptyTailoringResult: TailoringResult = {
	matchScore: 0,
	matchedSkills: [],
	missingSkills: [],
	suggestions: [],
	strengths: [],
	improvementAreas: [],
};

// Resume Tailoring Service Result
export interface ResumeTailoringServiceResult {
	success: boolean;
	result?: TailoringResult;
	error?: string;
}

// Job History Entry Schema
export const jobHistoryEntrySchema = z.object({
	id: z.string(),
	createdAt: z.string(),
	jobDescription: jobDescriptionSchema,
	requirements: jobRequirementsSchema.optional(),
});

export type JobHistoryEntry = z.infer<typeof jobHistoryEntrySchema>;

// Job History Schema (array of entries)
export const jobHistorySchema = z.array(jobHistoryEntrySchema);

export type JobHistory = z.infer<typeof jobHistorySchema>;

export const MAX_JOB_HISTORY_ENTRIES = 10;
