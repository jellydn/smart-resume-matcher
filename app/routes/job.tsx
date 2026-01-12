import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Briefcase,
	FileDown,
	Loader2,
	Sparkles,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Link } from "react-router";
import { JobHistoryPanel } from "~/components/job/job-history-panel";
import { JobRequirementsDisplay } from "~/components/job/job-requirements-display";
import {
	type EditFieldParams,
	ResumeComparisonView,
} from "~/components/resume/resume-comparison-view";
import { TailoredResumePreview } from "~/components/resume/tailored-resume-preview";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { useAISettings } from "~/hooks/use-ai-settings";
import { useJobHistory } from "~/hooks/use-job-history";
import { useResumeStorage } from "~/hooks/use-resume-storage";
import {
	applySuggestionToResume,
	revertSuggestionFromResume,
} from "~/lib/apply-suggestion";
import { exportResumeAsDocx } from "~/lib/export-docx";
import { exportResumeAsPdf } from "~/lib/export-pdf";
import { parseJobDescription } from "~/lib/job-parser";
import { tailorResume } from "~/lib/resume-tailor";
import type {
	JobDescription,
	JobRequirements,
	Suggestion,
	TailoringResult,
} from "~/lib/types";
import { emptyJobDescription } from "~/lib/types";
import type { Route } from "./+types/job";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Job Description - Resume Matcher" },
		{
			name: "description",
			content: "Paste a job description to analyze and tailor your resume",
		},
	];
}

const MAX_DESCRIPTION_LENGTH = 10000;

export default function JobPage() {
	const [jobDescription, setJobDescription] =
		useState<JobDescription>(emptyJobDescription);
	const [urlError, setUrlError] = useState<string>("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isTailoring, setIsTailoring] = useState(false);
	const [isExportingPdf, setIsExportingPdf] = useState(false);
	const [isExportingDocx, setIsExportingDocx] = useState(false);
	const [analysisError, setAnalysisError] = useState<string>("");
	const [tailoringError, setTailoringError] = useState<string>("");
	const [requirements, setRequirements] = useState<JobRequirements | null>(
		null,
	);
	const [tailoringResult, setTailoringResult] =
		useState<TailoringResult | null>(null);

	const { settings, isLoaded: isSettingsLoaded } = useAISettings();
	const { resume, isLoaded: isResumeLoaded, setResume } = useResumeStorage();
	const {
		history,
		addEntry,
		deleteEntry,
		isLoaded: isHistoryLoaded,
	} = useJobHistory();

	const hasResume = isResumeLoaded && resume.personalInfo.name.length > 0;

	const handleDescriptionChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			const value = e.target.value;
			if (value.length <= MAX_DESCRIPTION_LENGTH) {
				setJobDescription((prev) => ({ ...prev, description: value }));
				setRequirements(null);
				setTailoringResult(null);
				setAnalysisError("");
				setTailoringError("");
			}
		},
		[],
	);

	const handleUrlChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setJobDescription((prev) => ({ ...prev, linkedinUrl: value }));

			if (value && value.length > 0) {
				try {
					new URL(value);
					if (!value.includes("linkedin.com")) {
						setUrlError("URL should be a LinkedIn job posting");
					} else {
						setUrlError("");
					}
				} catch {
					setUrlError("Invalid URL format");
				}
			} else {
				setUrlError("");
			}
		},
		[],
	);

	const handleClear = useCallback(() => {
		setJobDescription(emptyJobDescription);
		setUrlError("");
		setRequirements(null);
		setTailoringResult(null);
		setAnalysisError("");
		setTailoringError("");
	}, []);

	const handleAnalyze = useCallback(async () => {
		if (!isSettingsLoaded) return;

		setIsAnalyzing(true);
		setAnalysisError("");
		setRequirements(null);
		setTailoringResult(null);
		setTailoringError("");

		const result = await parseJobDescription(
			jobDescription.description,
			settings,
		);

		if (result.success && result.requirements) {
			setRequirements(result.requirements);
			addEntry(jobDescription, result.requirements);
		} else {
			setAnalysisError(result.error || "Failed to analyze job description");
		}

		setIsAnalyzing(false);
	}, [jobDescription, settings, isSettingsLoaded, addEntry]);

	const handleSelectFromHistory = useCallback(
		(
			selectedJobDescription: JobDescription,
			selectedRequirements?: JobRequirements,
		) => {
			setJobDescription(selectedJobDescription);
			setRequirements(selectedRequirements || null);
			setTailoringResult(null);
			setTailoringError("");
			setAnalysisError("");
			setUrlError("");
		},
		[],
	);

	const handleDeleteFromHistory = useCallback(
		(id: string) => {
			deleteEntry(id);
		},
		[deleteEntry],
	);

	const handleTailorResume = useCallback(async () => {
		if (!isSettingsLoaded || !requirements || !hasResume) return;

		setIsTailoring(true);
		setTailoringError("");
		setTailoringResult(null);

		const result = await tailorResume(resume, requirements, settings);

		if (result.success && result.result) {
			setTailoringResult(result.result);
		} else {
			setTailoringError(result.error || "Failed to tailor resume");
		}

		setIsTailoring(false);
	}, [resume, requirements, settings, isSettingsLoaded, hasResume]);

	const handleAcceptSuggestion = useCallback(
		(suggestion: Suggestion) => {
			if (!tailoringResult) return;

			const updatedResume = applySuggestionToResume(resume, suggestion);
			setResume(updatedResume);

			const updatedSuggestions = tailoringResult.suggestions.map((s) =>
				s.id === suggestion.id ? { ...s, status: "accepted" as const } : s,
			);
			setTailoringResult({
				...tailoringResult,
				suggestions: updatedSuggestions,
			});
		},
		[resume, tailoringResult, setResume],
	);

	const handleRejectSuggestion = useCallback(
		(suggestion: Suggestion) => {
			if (!tailoringResult) return;

			const updatedSuggestions = tailoringResult.suggestions.map((s) =>
				s.id === suggestion.id ? { ...s, status: "rejected" as const } : s,
			);
			setTailoringResult({
				...tailoringResult,
				suggestions: updatedSuggestions,
			});
		},
		[tailoringResult],
	);

	const handleUndoSuggestion = useCallback(
		(suggestion: Suggestion) => {
			if (!tailoringResult) return;

			if (suggestion.status === "accepted") {
				const revertedResume = revertSuggestionFromResume(resume, suggestion);
				setResume(revertedResume);
			}

			const updatedSuggestions = tailoringResult.suggestions.map((s) =>
				s.id === suggestion.id ? { ...s, status: "pending" as const } : s,
			);
			setTailoringResult({
				...tailoringResult,
				suggestions: updatedSuggestions,
			});
		},
		[resume, tailoringResult, setResume],
	);

	const handleEditField = useCallback(
		(params: EditFieldParams) => {
			const { sectionType, field, value, itemId, highlightIndex } = params;

			const updatedResume = { ...resume };

			if (sectionType === "personalInfo") {
				updatedResume.personalInfo = {
					...updatedResume.personalInfo,
					[field]: value,
				};
			} else if (sectionType === "experience" && itemId) {
				updatedResume.experience = updatedResume.experience.map((exp) => {
					if (exp.id !== itemId) return exp;
					if (field === "highlights" && highlightIndex !== undefined) {
						const newHighlights = [...exp.highlights];
						newHighlights[highlightIndex] = value;
						return { ...exp, highlights: newHighlights };
					}
					return { ...exp, [field]: value };
				});
			} else if (sectionType === "education" && itemId) {
				updatedResume.education = updatedResume.education.map((edu) =>
					edu.id === itemId ? { ...edu, [field]: value } : edu,
				);
			} else if (sectionType === "projects" && itemId) {
				updatedResume.projects = updatedResume.projects.map((proj) =>
					proj.id === itemId ? { ...proj, [field]: value } : proj,
				);
			} else if (sectionType === "openSource" && itemId) {
				updatedResume.openSource = updatedResume.openSource.map((os) =>
					os.id === itemId ? { ...os, [field]: value } : os,
				);
			}

			setResume(updatedResume);
		},
		[resume, setResume],
	);

	const handleExportPdf = useCallback(async () => {
		setIsExportingPdf(true);
		try {
			await exportResumeAsPdf(
				resume,
				requirements?.title,
				requirements?.company,
			);
		} finally {
			setIsExportingPdf(false);
		}
	}, [resume, requirements]);

	const handleExportDocx = useCallback(async () => {
		setIsExportingDocx(true);
		try {
			await exportResumeAsDocx(
				resume,
				requirements?.title,
				requirements?.company,
			);
		} finally {
			setIsExportingDocx(false);
		}
	}, [resume, requirements]);

	const characterCount = jobDescription.description.length;
	const hasContent = jobDescription.description.trim().length > 0;

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/resume">
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back to Resume
					</Link>
				</Button>
			</div>

			<div className="max-w-3xl mx-auto space-y-6">
				<div className="mb-8 text-center">
					<div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
						<Briefcase className="h-8 w-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold">Job Description</h1>
					<p className="text-muted-foreground mt-2">
						Paste the job description you want to tailor your resume for. The AI
						will analyze the requirements and help you highlight relevant
						experience.
					</p>
				</div>

				{isHistoryLoaded && history.length > 0 && (
					<JobHistoryPanel
						history={history}
						onSelectEntry={handleSelectFromHistory}
						onDeleteEntry={handleDeleteFromHistory}
					/>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Enter Job Details</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="linkedin-url">
								LinkedIn Job URL{" "}
								<span className="text-muted-foreground">(optional)</span>
							</Label>
							<Input
								id="linkedin-url"
								type="url"
								placeholder="https://www.linkedin.com/jobs/view/..."
								value={jobDescription.linkedinUrl}
								onChange={handleUrlChange}
								className={urlError ? "border-destructive" : ""}
								disabled={isAnalyzing || isTailoring}
							/>
							{urlError && (
								<p className="text-sm text-destructive">{urlError}</p>
							)}
							<p className="text-xs text-muted-foreground">
								Paste the LinkedIn job posting URL for reference
							</p>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="job-description">
									Job Description <span className="text-destructive">*</span>
								</Label>
								<span
									className={`text-xs ${
										characterCount > MAX_DESCRIPTION_LENGTH * 0.9
											? "text-destructive"
											: "text-muted-foreground"
									}`}
								>
									{characterCount.toLocaleString()} /{" "}
									{MAX_DESCRIPTION_LENGTH.toLocaleString()}
								</span>
							</div>
							<Textarea
								id="job-description"
								placeholder="Paste the full job description here..."
								value={jobDescription.description}
								onChange={handleDescriptionChange}
								className="min-h-[300px] resize-y"
								disabled={isAnalyzing || isTailoring}
							/>
							<p className="text-xs text-muted-foreground">
								Include the complete job posting with requirements,
								responsibilities, and qualifications
							</p>
						</div>

						<div className="flex justify-between pt-4">
							<Button
								variant="outline"
								onClick={handleClear}
								disabled={
									(!hasContent && !jobDescription.linkedinUrl) ||
									isAnalyzing ||
									isTailoring
								}
							>
								<X className="h-4 w-4 mr-1" />
								Clear
							</Button>

							<Button
								disabled={!hasContent || isAnalyzing || isTailoring}
								onClick={handleAnalyze}
							>
								{isAnalyzing ? (
									<>
										<Loader2 className="h-4 w-4 mr-1 animate-spin" />
										Analyzing...
									</>
								) : (
									<>
										Analyze Job
										<ArrowRight className="h-4 w-4 ml-1" />
									</>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>

				{analysisError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Analysis Failed</AlertTitle>
						<AlertDescription>{analysisError}</AlertDescription>
					</Alert>
				)}

				{requirements && (
					<>
						<JobRequirementsDisplay requirements={requirements} />

						{!hasResume && (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Resume Required</AlertTitle>
								<AlertDescription>
									Please{" "}
									<Link to="/resume" className="underline text-primary">
										create or upload your resume
									</Link>{" "}
									first to tailor it for this job.
								</AlertDescription>
							</Alert>
						)}

						{hasResume && !tailoringResult && (
							<Card>
								<CardContent className="pt-6">
									<div className="flex flex-col items-center gap-4">
										<p className="text-muted-foreground text-center">
											Ready to tailor your resume to match this job's
											requirements?
										</p>
										<Button
											size="lg"
											onClick={handleTailorResume}
											disabled={isTailoring}
										>
											{isTailoring ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Tailoring Resume...
												</>
											) : (
												<>
													<Sparkles className="h-4 w-4 mr-2" />
													Tailor My Resume
												</>
											)}
										</Button>
									</div>
								</CardContent>
							</Card>
						)}
					</>
				)}

				{tailoringError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Tailoring Failed</AlertTitle>
						<AlertDescription>{tailoringError}</AlertDescription>
					</Alert>
				)}

				{tailoringResult && (
					<>
						<Card>
							<CardContent className="pt-6">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-semibold">
											Export Your Tailored Resume
										</h3>
										<p className="text-sm text-muted-foreground">
											Download your resume with all accepted suggestions applied
										</p>
									</div>
									<div className="flex gap-2">
										<Button
											onClick={handleExportPdf}
											disabled={isExportingPdf || isExportingDocx}
										>
											{isExportingPdf ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Generating...
												</>
											) : (
												<>
													<FileDown className="h-4 w-4 mr-2" />
													Download PDF
												</>
											)}
										</Button>
										<Button
											variant="outline"
											onClick={handleExportDocx}
											disabled={isExportingPdf || isExportingDocx}
										>
											{isExportingDocx ? (
												<>
													<Loader2 className="h-4 w-4 mr-2 animate-spin" />
													Generating...
												</>
											) : (
												<>
													<FileDown className="h-4 w-4 mr-2" />
													Download DOCX
												</>
											)}
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
						<TailoredResumePreview
							resume={resume}
							tailoringResult={tailoringResult}
							onAcceptSuggestion={handleAcceptSuggestion}
							onRejectSuggestion={handleRejectSuggestion}
							onUndoSuggestion={handleUndoSuggestion}
						/>
						<ResumeComparisonView
							resume={resume}
							tailoringResult={tailoringResult}
							onAcceptSuggestion={handleAcceptSuggestion}
							onRejectSuggestion={handleRejectSuggestion}
							onUndoSuggestion={handleUndoSuggestion}
							onEditField={handleEditField}
						/>
					</>
				)}
			</div>
		</div>
	);
}
