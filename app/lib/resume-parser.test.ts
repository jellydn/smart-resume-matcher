import { describe, expect, it } from "vitest";
import {
	normalizeParsedResume,
	parseResumeResponse,
} from "~/lib/resume-parser";

const validPayload = {
	personalInfo: {
		name: "Dung Huynh Duc",
		email: "dung@example.com",
		phone: "+65 1234 5678",
		location: "Singapore",
		linkedin: "https://linkedin.com/in/dung",
		website: "",
		summary: "Senior full-stack engineer",
	},
	experience: [
		{
			title: "Senior Full Stack Engineer",
			company: "ACX",
			location: "Singapore",
			startDate: "2022-01",
			endDate: "",
			current: true,
			description: "Blockchain carbon exchange",
			highlights: ["Built carbon exchange solutions"],
		},
	],
	education: [],
	skills: [{ name: "TypeScript", proficiency: "expert" }],
	languages: [{ name: "English", proficiency: "native" }],
	certifications: [],
	projects: [],
	openSource: [],
};

describe("normalizeParsedResume", () => {
	it("normalizes a valid payload into a Resume with generated ids", () => {
		const resume = normalizeParsedResume(validPayload);

		expect(resume.personalInfo.name).toBe("Dung Huynh Duc");
		expect(resume.personalInfo.email).toBe("dung@example.com");
		expect(resume.experience).toHaveLength(1);
		expect(resume.experience[0].id).toBeTruthy();
		expect(resume.experience[0].current).toBe(true);
		expect(resume.experience[0].highlights).toEqual([
			"Built carbon exchange solutions",
		]);
		expect(resume.skills[0].proficiency).toBe("expert");
		expect(resume.education).toEqual([]);
	});

	it("fills placeholder values for missing required fields", () => {
		const resume = normalizeParsedResume({
			experience: [
				{
					company: "ACX",
				},
			],
		});

		expect(resume.personalInfo.name).toBe("Unknown");
		expect(resume.personalInfo.email).toBe("email@example.com");
		expect(resume.experience[0].title).toBe("Not specified");
		expect(resume.experience[0].startDate).toBe("Not specified");
		expect(resume.experience[0].current).toBe(false);
	});

	it("applies default proficiencies and roles", () => {
		const resume = normalizeParsedResume({
			skills: [{ name: "React" }],
			languages: [{ name: "English" }],
			openSource: [{ project: "Codebuff" }],
		});

		expect(resume.skills[0].proficiency).toBe("intermediate");
		expect(resume.languages[0].proficiency).toBe("professional");
		expect(resume.openSource[0].role).toBe("contributor");
		expect(resume.openSource[0].contributions).toEqual([]);
	});

	it("ignores non-object and non-array input", () => {
		const resume = normalizeParsedResume(null);
		expect(resume.personalInfo.name).toBe("Unknown");
		expect(resume.experience).toEqual([]);
		expect(resume.skills).toEqual([]);
	});
});

describe("parseResumeResponse", () => {
	it("parses a plain JSON response", () => {
		const resume = parseResumeResponse(JSON.stringify(validPayload));

		expect(resume).not.toBeNull();
		expect(resume?.personalInfo.name).toBe("Dung Huynh Duc");
		expect(resume?.skills[0].name).toBe("TypeScript");
	});

	it("parses JSON wrapped in a ```json code fence", () => {
		const fenced = `\`\`\`json\n${JSON.stringify(validPayload, null, 2)}\n\`\`\``;
		expect(parseResumeResponse(fenced)?.personalInfo.email).toBe(
			"dung@example.com",
		);
	});

	it("returns null for malformed JSON", () => {
		expect(parseResumeResponse('{"personalInfo": [unclosed')).toBeNull();
	});

	it("returns null for content without JSON", () => {
		expect(
			parseResumeResponse("Here is some plain text without JSON."),
		).toBeNull();
	});
});
