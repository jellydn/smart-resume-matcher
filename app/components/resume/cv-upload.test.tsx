// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CvUpload } from "~/components/resume/cv-upload";
import { parseResumeText } from "~/lib/resume-parser";
import type { Resume } from "~/lib/types";

vi.mock("~/hooks/use-ai-settings", () => ({
	useAISettings: () => ({ settings: {}, isLoaded: true }),
}));

vi.mock("~/lib/resume-parser", () => ({
	MAX_CV_TEXT_LENGTH: 30000,
	parseResumeText: vi.fn(),
}));

vi.mock("~/components/resume/experience-form", () => ({
	ExperienceForm: () => null,
}));
vi.mock("~/components/resume/education-form", () => ({
	EducationForm: () => null,
}));
vi.mock("~/components/resume/skills-form", () => ({
	SkillsForm: () => null,
}));
vi.mock("~/components/resume/languages-form", () => ({
	LanguagesForm: () => null,
}));
vi.mock("~/components/resume/certifications-form", () => ({
	CertificationsForm: () => null,
}));
vi.mock("~/components/resume/projects-form", () => ({
	ProjectsForm: () => null,
}));
vi.mock("~/components/resume/open-source-form", () => ({
	OpenSourceForm: () => null,
}));

const mockParseResumeText = vi.mocked(parseResumeText);

const parsedResume: Resume = {
	personalInfo: {
		name: "John Doe",
		email: "john@example.com",
		phone: "",
		location: "Singapore",
		linkedin: "",
		website: "",
		summary: "",
	},
	experience: [
		{
			id: "exp-1",
			title: "Senior Engineer",
			company: "ACX",
			location: "",
			startDate: "2019",
			endDate: "",
			current: true,
			description: "",
			highlights: [],
		},
	],
	education: [],
	skills: [{ id: "skill-1", name: "TypeScript", proficiency: "expert" }],
	languages: [],
	certifications: [],
	projects: [],
	openSource: [],
};

afterEach(cleanup);

beforeEach(() => {
	mockParseResumeText.mockReset();
	mockParseResumeText.mockResolvedValue({
		success: true,
		resume: parsedResume,
	});
});

async function parseResume() {
	fireEvent.change(screen.getByPlaceholderText(/paste the full text/i), {
		target: { value: "resume text" },
	});
	fireEvent.click(screen.getByRole("button", { name: /parse with ai/i }));
	return await screen.findByLabelText(/full name/i);
}

describe("CvUpload edit flow", () => {
	it("uploads the edited draft on confirm", async () => {
		const onUpload = vi.fn();
		render(<CvUpload onUpload={onUpload} />);

		const nameInput = await parseResume();
		expect(nameInput).toHaveValue("John Doe");

		fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
		fireEvent.click(screen.getByRole("button", { name: /use this resume/i }));

		await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
		const uploaded = onUpload.mock.calls[0][0] as Resume;
		expect(uploaded.personalInfo.name).toBe("Jane Doe");
		// Other sections are preserved when one section is edited.
		expect(uploaded.experience[0].company).toBe("ACX");
	});

	it("disables confirm while personal info is invalid", async () => {
		const onUpload = vi.fn();
		render(<CvUpload onUpload={onUpload} />);

		const nameInput = await parseResume();
		const confirm = screen.getByRole("button", { name: /use this resume/i });
		expect(confirm).toBeEnabled();

		fireEvent.change(nameInput, { target: { value: "" } });
		await waitFor(() => expect(confirm).toBeDisabled());

		fireEvent.change(nameInput, { target: { value: "Valid Name" } });
		await waitFor(() => expect(confirm).toBeEnabled());

		fireEvent.click(confirm);
		await waitFor(() => expect(onUpload).toHaveBeenCalledTimes(1));
		expect((onUpload.mock.calls[0][0] as Resume).personalInfo.name).toBe(
			"Valid Name",
		);
	});
});
