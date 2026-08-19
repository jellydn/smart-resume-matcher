import {
	AlertCircle,
	CheckCircle2,
	FileText,
	Loader2,
	Sparkles,
	Upload,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { CertificationsForm } from "~/components/resume/certifications-form";
import { EducationForm } from "~/components/resume/education-form";
import { ExperienceForm } from "~/components/resume/experience-form";
import { LanguagesForm } from "~/components/resume/languages-form";
import { OpenSourceForm } from "~/components/resume/open-source-form";
import { PersonalInfoForm } from "~/components/resume/personal-info-form";
import { ProjectsForm } from "~/components/resume/projects-form";
import { SkillsForm } from "~/components/resume/skills-form";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";
import { useAISettings } from "~/hooks/use-ai-settings";
import { extractTextFromCvFile, getCvFileFormat } from "~/lib/cv-extract";
import { MAX_CV_TEXT_LENGTH, parseResumeText } from "~/lib/resume-parser";
import type {
	Certification,
	Education,
	Experience,
	Language,
	OpenSource,
	PersonalInfo,
	Project,
	Resume,
	Skill,
} from "~/lib/types";
import { cn } from "~/lib/utils";
import { ResumePreview } from "./resume-preview";

interface CvUploadProps {
	onUpload: (resume: Resume) => void;
	className?: string;
}

export function CvUpload({ onUpload, className }: CvUploadProps) {
	const { settings, isLoaded: isSettingsLoaded } = useAISettings();

	const [isDragging, setIsDragging] = useState(false);
	const [isExtracting, setIsExtracting] = useState(false);
	const [isParsing, setIsParsing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [cvText, setCvText] = useState("");
	const [parsedResume, setParsedResume] = useState<Resume | null>(null);
	const [draftResume, setDraftResume] = useState<Resume | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isPersonalInfoValid, setIsPersonalInfoValid] = useState(true);

	const handleFile = useCallback(async (file: File) => {
		setError(null);
		setParsedResume(null);
		setDraftResume(null);
		setIsEditing(false);

		if (!getCvFileFormat(file.name)) {
			setError(
				"Unsupported file type. Please upload a .pdf, .docx, .txt, or .md file.",
			);
			return;
		}

		setIsExtracting(true);
		try {
			const text = await extractTextFromCvFile(file);
			if (!text.trim()) {
				setError(
					"No text could be extracted from this file. It may be a scanned image — try pasting the text instead.",
				);
				return;
			}
			setCvText(text.slice(0, MAX_CV_TEXT_LENGTH));
			setFileName(file.name);
		} catch (extractError) {
			setError(
				extractError instanceof Error
					? extractError.message
					: "Failed to read the file. Please try again.",
			);
		} finally {
			setIsExtracting(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			const file = e.dataTransfer.files[0];
			if (file) handleFile(file);
		},
		[handleFile],
	);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleFileInput = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) handleFile(file);
			e.target.value = "";
		},
		[handleFile],
	);

	const handleParse = useCallback(async () => {
		if (!isSettingsLoaded) return;

		setIsParsing(true);
		setError(null);
		setParsedResume(null);

		const result = await parseResumeText(cvText, settings);

		if (result.success && result.resume) {
			setParsedResume(result.resume);
			setDraftResume(result.resume);
			setIsEditing(true);
			setIsPersonalInfoValid(true);
		} else {
			setError(result.error || "Failed to parse resume");
		}

		setIsParsing(false);
	}, [cvText, settings, isSettingsLoaded]);

	const handleConfirm = useCallback(() => {
		if (draftResume) {
			onUpload(draftResume);
		}
	}, [draftResume, onUpload]);

	const handleReset = useCallback(() => {
		setParsedResume(null);
		setDraftResume(null);
		setIsEditing(false);
		setIsPersonalInfoValid(true);
		setError(null);
	}, []);

	const updateDraft = useCallback(
		<K extends keyof Resume>(key: K, value: Resume[K]) => {
			setDraftResume((prev) => (prev ? { ...prev, [key]: value } : prev));
		},
		[],
	);

	const handlePersonalInfoChange = useCallback(
		(data: PersonalInfo, isValid: boolean) => {
			updateDraft("personalInfo", data);
			setIsPersonalInfoValid(isValid);
		},
		[updateDraft],
	);

	const handleExperienceChange = useCallback(
		(data: Experience[]) => updateDraft("experience", data),
		[updateDraft],
	);

	const handleEducationChange = useCallback(
		(data: Education[]) => updateDraft("education", data),
		[updateDraft],
	);

	const handleSkillsChange = useCallback(
		(data: Skill[]) => updateDraft("skills", data),
		[updateDraft],
	);

	const handleLanguagesChange = useCallback(
		(data: Language[]) => updateDraft("languages", data),
		[updateDraft],
	);

	const handleCertificationsChange = useCallback(
		(data: Certification[]) => updateDraft("certifications", data),
		[updateDraft],
	);

	const handleProjectsChange = useCallback(
		(data: Project[]) => updateDraft("projects", data),
		[updateDraft],
	);

	const handleOpenSourceChange = useCallback(
		(data: OpenSource[]) => updateDraft("openSource", data),
		[updateDraft],
	);

	const hasText = cvText.trim().length > 0;
	const characterCount = cvText.length;

	if (parsedResume && draftResume) {
		return (
			<Card className={className}>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<CheckCircle2 className="h-5 w-5 text-green-600" />
							<CardTitle>Resume Parsed Successfully</CardTitle>
						</div>
						<Button variant="ghost" size="icon-sm" onClick={handleReset}>
							<X className="h-4 w-4" />
						</Button>
					</div>
					<CardDescription>
						Review and edit your resume data below, then confirm to continue.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{isEditing ? (
						<div className="max-h-[32rem] overflow-y-auto space-y-6 pr-2">
							<PersonalInfoForm
								initialData={draftResume.personalInfo}
								onChange={handlePersonalInfoChange}
							/>
							<Separator />
							<ExperienceForm
								initialData={draftResume.experience}
								onChange={handleExperienceChange}
							/>
							<Separator />
							<EducationForm
								initialData={draftResume.education}
								onChange={handleEducationChange}
							/>
							<Separator />
							<SkillsForm
								initialData={draftResume.skills}
								onChange={handleSkillsChange}
							/>
							<Separator />
							<LanguagesForm
								initialData={draftResume.languages}
								onChange={handleLanguagesChange}
							/>
							<Separator />
							<CertificationsForm
								initialData={draftResume.certifications}
								onChange={handleCertificationsChange}
							/>
							<Separator />
							<ProjectsForm
								initialData={draftResume.projects}
								onChange={handleProjectsChange}
							/>
							<Separator />
							<OpenSourceForm
								initialData={draftResume.openSource}
								onChange={handleOpenSourceChange}
							/>
						</div>
					) : (
						<ResumePreview resume={draftResume} />
					)}

					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={handleReset}>
							Parse Another Resume
						</Button>
						<Button
							variant="outline"
							onClick={() => setIsEditing((prev) => !prev)}
						>
							{isEditing ? "Preview" : "Edit Fields"}
						</Button>
						<Button onClick={handleConfirm} disabled={!isPersonalInfoValid}>
							Use This Resume
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Upload CV or Paste Resume</CardTitle>
				<CardDescription>
					Upload a PDF, DOCX, or text file — or paste your resume below — and
					the AI will turn it into a structured profile.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					className={cn(
						"border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
						isDragging
							? "border-primary bg-primary/5"
							: "border-muted-foreground/25 hover:border-primary/50",
					)}
				>
					<input
						type="file"
						accept=".pdf,.docx,.txt,.md"
						onChange={handleFileInput}
						className="hidden"
						id="cv-upload"
					/>
					<label
						htmlFor="cv-upload"
						className="cursor-pointer flex flex-col items-center gap-4"
					>
						<div className="rounded-full bg-primary/10 p-4">
							{isExtracting ? (
								<Loader2 className="h-8 w-8 text-primary animate-spin" />
							) : isDragging ? (
								<Upload className="h-8 w-8 text-primary" />
							) : (
								<FileText className="h-8 w-8 text-primary" />
							)}
						</div>
						<div className="space-y-1">
							<p className="font-medium">
								{isExtracting
									? "Extracting text..."
									: isDragging
										? "Drop your CV here"
										: "Drag and drop your CV"}
							</p>
							<p className="text-sm text-muted-foreground">
								or click to browse
							</p>
						</div>
						<p className="text-xs text-muted-foreground">
							PDF, DOCX, TXT, or MD — up to 5 MB
						</p>
					</label>
				</div>

				<div className="flex items-center gap-3">
					<div className="h-px flex-1 bg-border" />
					<span className="text-xs text-muted-foreground">or paste below</span>
					<div className="h-px flex-1 bg-border" />
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium">Resume Text</span>
						<span
							className={cn(
								"text-xs",
								characterCount > MAX_CV_TEXT_LENGTH * 0.9
									? "text-destructive"
									: "text-muted-foreground",
							)}
						>
							{characterCount.toLocaleString()} /{" "}
							{MAX_CV_TEXT_LENGTH.toLocaleString()}
						</span>
					</div>
					<Textarea
						value={cvText}
						onChange={(e) => {
							if (e.target.value.length <= MAX_CV_TEXT_LENGTH) {
								setCvText(e.target.value);
							}
						}}
						placeholder="Paste the full text of your resume here..."
						className="min-h-[240px] resize-y"
						disabled={isParsing}
					/>
					{fileName && (
						<p className="text-xs text-muted-foreground">
							Extracted from {fileName} — you can edit the text before parsing.
						</p>
					)}
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Import Failed</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}

				<div className="flex justify-end">
					<Button
						onClick={handleParse}
						disabled={!hasText || isParsing || !isSettingsLoaded}
					>
						{isParsing ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Parsing Resume...
							</>
						) : (
							<>
								<Sparkles className="h-4 w-4 mr-2" />
								Parse with AI
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
