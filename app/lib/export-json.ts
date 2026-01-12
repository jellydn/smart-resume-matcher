import type { Resume } from "~/lib/types";

export function exportResumeAsJson(resume: Resume): void {
	const jsonString = JSON.stringify(resume, null, 2);
	const blob = new Blob([jsonString], { type: "application/json" });
	const url = URL.createObjectURL(blob);

	const sanitizedName = resume.personalInfo.name
		? resume.personalInfo.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "")
		: "resume";

	const filename = `${sanitizedName}-resume.json`;

	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
