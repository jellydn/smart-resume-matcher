import {
	Award,
	Briefcase,
	Check,
	CheckCircle2,
	Code,
	Columns2,
	FileText,
	FolderGit2,
	GitBranch,
	Globe,
	GraduationCap,
	Languages,
	Linkedin,
	Mail,
	MapPin,
	Phone,
	Sparkles,
	Undo2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditableText } from "~/components/resume/editable-text";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { Resume, Suggestion, TailoringResult } from "~/lib/types";
import { cn } from "~/lib/utils";

type ViewMode = "split" | "original" | "tailored";

export interface EditFieldParams {
	sectionType:
		| "personalInfo"
		| "experience"
		| "education"
		| "projects"
		| "openSource";
	field: string;
	value: string;
	itemId?: string;
	highlightIndex?: number;
}

interface ResumeComparisonViewProps {
	resume: Resume;
	tailoringResult: TailoringResult;
	onAcceptSuggestion?: (suggestion: Suggestion) => void;
	onRejectSuggestion?: (suggestion: Suggestion) => void;
	onUndoSuggestion?: (suggestion: Suggestion) => void;
	onEditField?: (params: EditFieldParams) => void;
}

interface SuggestionInlineProps {
	suggestion: Suggestion;
	onAccept?: () => void;
	onReject?: () => void;
	onUndo?: () => void;
}

function SuggestionInline({
	suggestion,
	onAccept,
	onReject,
	onUndo,
}: SuggestionInlineProps) {
	const isPending = suggestion.status === "pending";
	const isAccepted = suggestion.status === "accepted";
	const isRejected = suggestion.status === "rejected";

	if (isRejected) {
		return null;
	}

	return (
		<div className="mt-2 space-y-2">
			{!isAccepted && (
				<div className="flex items-start gap-2 p-2 rounded-md bg-muted/50 border-l-2 border-muted-foreground/30">
					<span className="text-xs text-muted-foreground line-through">
						{suggestion.originalContent}
					</span>
				</div>
			)}
			<div
				className={cn(
					"flex items-start gap-2 p-2 rounded-md border-l-2",
					isAccepted
						? "bg-green-500/10 border-green-500"
						: "bg-primary/10 border-primary",
				)}
			>
				{isAccepted ? (
					<CheckCircle2 className="h-3 w-3 text-green-600 shrink-0 mt-0.5" />
				) : (
					<Sparkles className="h-3 w-3 text-primary shrink-0 mt-0.5" />
				)}
				<div className="flex-1 space-y-1">
					<span
						className={cn(
							"text-xs font-medium",
							isAccepted
								? "text-green-700 dark:text-green-300"
								: "text-foreground",
						)}
					>
						{suggestion.suggestedContent}
					</span>
					<p className="text-xs text-muted-foreground italic">
						{suggestion.reason}
					</p>

					{isPending && (onAccept || onReject) && (
						<div className="flex gap-2 pt-1">
							<Button
								size="sm"
								variant="default"
								className="h-6 px-2 text-xs bg-green-600 hover:bg-green-700"
								onClick={onAccept}
							>
								<Check className="h-2.5 w-2.5 mr-1" />
								Accept
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="h-6 px-2 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
								onClick={onReject}
							>
								<X className="h-2.5 w-2.5 mr-1" />
								Reject
							</Button>
						</div>
					)}

					{(isAccepted || isRejected) && onUndo && (
						<div className="flex gap-2 pt-1">
							<Button
								size="sm"
								variant="ghost"
								className="h-6 px-2 text-xs"
								onClick={onUndo}
							>
								<Undo2 className="h-2.5 w-2.5 mr-1" />
								Undo
							</Button>
							{isAccepted && (
								<span className="text-xs text-green-600 flex items-center">
									<CheckCircle2 className="h-2.5 w-2.5 mr-1" />
									Applied
								</span>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

interface ResumePanelProps {
	resume: Resume;
	tailoringResult?: TailoringResult;
	isOriginal?: boolean;
	onAcceptSuggestion?: (suggestion: Suggestion) => void;
	onRejectSuggestion?: (suggestion: Suggestion) => void;
	onUndoSuggestion?: (suggestion: Suggestion) => void;
	onEditField?: (params: EditFieldParams) => void;
}

function ResumePanel({
	resume,
	tailoringResult,
	isOriginal = false,
	onAcceptSuggestion,
	onRejectSuggestion,
	onUndoSuggestion,
	onEditField,
}: ResumePanelProps) {
	const { personalInfo } = resume;
	const canEdit = !isOriginal && !!onEditField;

	const getSuggestionsForSection = (
		sectionType: string,
		itemId?: string,
		field?: string,
	) => {
		if (!tailoringResult) return [];
		return tailoringResult.suggestions.filter(
			(s) =>
				s.sectionType === sectionType &&
				(itemId === undefined || s.itemId === itemId) &&
				(field === undefined || s.field === field) &&
				s.status !== "rejected",
		);
	};

	return (
		<div className="space-y-4">
			<section>
				<h3 className="text-base font-semibold">
					{canEdit ? (
						<EditableText
							value={personalInfo.name}
							onSave={(value) =>
								onEditField?.({
									sectionType: "personalInfo",
									field: "name",
									value,
								})
							}
							placeholder="Your Name"
						/>
					) : (
						personalInfo.name || "No Name"
					)}
				</h3>
				<div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
					{personalInfo.email && (
						<span className="flex items-center gap-1">
							<Mail className="h-3 w-3" />
							{personalInfo.email}
						</span>
					)}
					{personalInfo.phone && (
						<span className="flex items-center gap-1">
							<Phone className="h-3 w-3" />
							{personalInfo.phone}
						</span>
					)}
					{personalInfo.location && (
						<span className="flex items-center gap-1">
							<MapPin className="h-3 w-3" />
							{personalInfo.location}
						</span>
					)}
					{personalInfo.linkedin && (
						<span className="flex items-center gap-1">
							<Linkedin className="h-3 w-3" />
							LinkedIn
						</span>
					)}
					{personalInfo.website && (
						<span className="flex items-center gap-1">
							<Globe className="h-3 w-3" />
							Website
						</span>
					)}
				</div>
				{(personalInfo.summary || canEdit) && (
					<div className="text-xs mt-2 text-muted-foreground">
						{canEdit ? (
							<EditableText
								value={personalInfo.summary || ""}
								onSave={(value) =>
									onEditField?.({
										sectionType: "personalInfo",
										field: "summary",
										value,
									})
								}
								placeholder="Professional summary..."
								multiline
								className="text-xs"
							/>
						) : (
							personalInfo.summary
						)}
					</div>
				)}
				{!isOriginal &&
					getSuggestionsForSection("personalInfo", undefined, "summary").map(
						(suggestion) => (
							<SuggestionInline
								key={suggestion.id}
								suggestion={suggestion}
								onAccept={
									onAcceptSuggestion
										? () => onAcceptSuggestion(suggestion)
										: undefined
								}
								onReject={
									onRejectSuggestion
										? () => onRejectSuggestion(suggestion)
										: undefined
								}
								onUndo={
									onUndoSuggestion
										? () => onUndoSuggestion(suggestion)
										: undefined
								}
							/>
						),
					)}
			</section>

			{resume.experience.length > 0 && (
				<>
					<Separator />
					<section>
						<h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
							<Briefcase className="h-3.5 w-3.5" />
							Experience
						</h4>
						<div className="space-y-3">
							{resume.experience.map((exp) => {
								const expSuggestions = getSuggestionsForSection(
									"experience",
									exp.id,
								);
								return (
									<div key={exp.id}>
										<div>
											<p className="font-medium text-sm">
												{canEdit ? (
													<>
														<EditableText
															value={exp.title}
															onSave={(value) =>
																onEditField?.({
																	sectionType: "experience",
																	field: "title",
																	value,
																	itemId: exp.id,
																})
															}
															placeholder="Job Title"
														/>
														{" at "}
														<EditableText
															value={exp.company}
															onSave={(value) =>
																onEditField?.({
																	sectionType: "experience",
																	field: "company",
																	value,
																	itemId: exp.id,
																})
															}
															placeholder="Company"
														/>
													</>
												) : (
													<>
														{exp.title} at {exp.company}
													</>
												)}
											</p>
											<p className="text-xs text-muted-foreground">
												{exp.startDate} -{" "}
												{exp.current ? "Present" : exp.endDate}
												{exp.location && ` • ${exp.location}`}
											</p>
										</div>
										{(exp.description || canEdit) && (
											<div className="text-xs text-muted-foreground mt-1">
												{canEdit ? (
													<EditableText
														value={exp.description || ""}
														onSave={(value) =>
															onEditField?.({
																sectionType: "experience",
																field: "description",
																value,
																itemId: exp.id,
															})
														}
														placeholder="Job description..."
														multiline
														className="text-xs"
													/>
												) : (
													exp.description
												)}
											</div>
										)}
										{exp.highlights.length > 0 && (
											<ul className="list-disc list-inside space-y-0.5 ml-2 text-xs text-muted-foreground mt-1">
												{exp.highlights.map((highlight, idx) => (
													<li key={idx}>
														{canEdit ? (
															<EditableText
																value={highlight}
																onSave={(value) =>
																	onEditField?.({
																		sectionType: "experience",
																		field: "highlights",
																		value,
																		itemId: exp.id,
																		highlightIndex: idx,
																	})
																}
																placeholder="Achievement..."
																className="text-xs inline"
															/>
														) : (
															highlight
														)}
													</li>
												))}
											</ul>
										)}
										{!isOriginal &&
											expSuggestions.map((suggestion) => (
												<SuggestionInline
													key={suggestion.id}
													suggestion={suggestion}
													onAccept={
														onAcceptSuggestion
															? () => onAcceptSuggestion(suggestion)
															: undefined
													}
													onReject={
														onRejectSuggestion
															? () => onRejectSuggestion(suggestion)
															: undefined
													}
													onUndo={
														onUndoSuggestion
															? () => onUndoSuggestion(suggestion)
															: undefined
													}
												/>
											))}
									</div>
								);
							})}
						</div>
					</section>
				</>
			)}

			{resume.education.length > 0 && (
				<>
					<Separator />
					<section>
						<h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
							<GraduationCap className="h-3.5 w-3.5" />
							Education
						</h4>
						<div className="space-y-2">
							{resume.education.map((edu) => {
								const eduSuggestions = getSuggestionsForSection(
									"education",
									edu.id,
								);
								return (
									<div key={edu.id}>
										<p className="font-medium text-sm">{edu.degree}</p>
										<p className="text-xs text-muted-foreground">
											{edu.institution}
											{edu.graduationDate && ` • ${edu.graduationDate}`}
											{edu.gpa && ` • GPA: ${edu.gpa}`}
										</p>
										{!isOriginal &&
											eduSuggestions.map((suggestion) => (
												<SuggestionInline
													key={suggestion.id}
													suggestion={suggestion}
													onAccept={
														onAcceptSuggestion
															? () => onAcceptSuggestion(suggestion)
															: undefined
													}
													onReject={
														onRejectSuggestion
															? () => onRejectSuggestion(suggestion)
															: undefined
													}
													onUndo={
														onUndoSuggestion
															? () => onUndoSuggestion(suggestion)
															: undefined
													}
												/>
											))}
									</div>
								);
							})}
						</div>
					</section>
				</>
			)}

			{resume.skills.length > 0 && (
				<>
					<Separator />
					<section>
						<h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
							<Code className="h-3.5 w-3.5" />
							Skills
						</h4>
						<div className="flex flex-wrap gap-1">
							{resume.skills.map((skill) => {
								const isMatched = tailoringResult?.matchedSkills.some(
									(m) =>
										m.skill.toLowerCase() === skill.name.toLowerCase() ||
										m.fromResume?.toLowerCase() === skill.name.toLowerCase(),
								);
								return (
									<Badge
										key={skill.id}
										variant={!isOriginal && isMatched ? "default" : "secondary"}
										className={cn(
											"text-xs",
											!isOriginal &&
												isMatched &&
												"bg-green-600 hover:bg-green-700",
										)}
									>
										{skill.name}
										{!isOriginal && isMatched && (
											<CheckCircle2 className="h-2.5 w-2.5 ml-1" />
										)}
									</Badge>
								);
							})}
						</div>
					</section>
				</>
			)}

			{resume.languages.length > 0 && (
				<>
					<Separator />
					<section>
						<h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
							<Languages className="h-3.5 w-3.5" />
							Languages
						</h4>
						<div className="flex flex-wrap gap-1">
							{resume.languages.map((lang) => (
								<Badge key={lang.id} variant="outline" className="text-xs">
									{lang.name} ({lang.proficiency})
								</Badge>
							))}
						</div>
					</section>
				</>
			)}

			{resume.certifications.length > 0 && (
				<>
					<Separator />
					<section>
						<h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
							<Award className="h-3.5 w-3.5" />
							Certifications
						</h4>
						<div className="space-y-1">
							{resume.certifications.map((cert) => (
								<p key={cert.id} className="text-xs">
									{cert.name} - {cert.issuer}
									{cert.date && ` (${cert.date})`}
								</p>
							))}
						</div>
					</section>
				</>
			)}

			{resume.projects.length > 0 && (
				<>
					<Separator />
					<section>
						<h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
							<FolderGit2 className="h-3.5 w-3.5" />
							Projects
						</h4>
						<div className="space-y-2">
							{resume.projects.map((proj) => {
								const projSuggestions = getSuggestionsForSection(
									"projects",
									proj.id,
								);
								return (
									<div key={proj.id}>
										<p className="font-medium text-sm">
											{canEdit ? (
												<EditableText
													value={proj.name}
													onSave={(value) =>
														onEditField?.({
															sectionType: "projects",
															field: "name",
															value,
															itemId: proj.id,
														})
													}
													placeholder="Project Name"
												/>
											) : (
												proj.name
											)}
										</p>
										{(proj.description || canEdit) && (
											<div className="text-xs text-muted-foreground">
												{canEdit ? (
													<EditableText
														value={proj.description || ""}
														onSave={(value) =>
															onEditField?.({
																sectionType: "projects",
																field: "description",
																value,
																itemId: proj.id,
															})
														}
														placeholder="Project description..."
														multiline
														className="text-xs"
													/>
												) : (
													proj.description
												)}
											</div>
										)}
										{proj.technologies.length > 0 && (
											<div className="flex flex-wrap gap-1 mt-1">
												{proj.technologies.map((tech, idx) => (
													<Badge
														key={idx}
														variant="outline"
														className="text-xs"
													>
														{tech}
													</Badge>
												))}
											</div>
										)}
										{!isOriginal &&
											projSuggestions.map((suggestion) => (
												<SuggestionInline
													key={suggestion.id}
													suggestion={suggestion}
													onAccept={
														onAcceptSuggestion
															? () => onAcceptSuggestion(suggestion)
															: undefined
													}
													onReject={
														onRejectSuggestion
															? () => onRejectSuggestion(suggestion)
															: undefined
													}
													onUndo={
														onUndoSuggestion
															? () => onUndoSuggestion(suggestion)
															: undefined
													}
												/>
											))}
									</div>
								);
							})}
						</div>
					</section>
				</>
			)}

			{resume.openSource.length > 0 && (
				<>
					<Separator />
					<section>
						<h4 className="font-medium flex items-center gap-2 mb-2 text-sm">
							<GitBranch className="h-3.5 w-3.5" />
							Open Source
						</h4>
						<div className="space-y-2">
							{resume.openSource.map((os) => {
								const osSuggestions = getSuggestionsForSection(
									"openSource",
									os.id,
								);
								return (
									<div key={os.id}>
										<p className="font-medium text-sm">
											{canEdit ? (
												<>
													<EditableText
														value={os.project}
														onSave={(value) =>
															onEditField?.({
																sectionType: "openSource",
																field: "project",
																value,
																itemId: os.id,
															})
														}
														placeholder="Project Name"
													/>{" "}
													<span className="font-normal text-muted-foreground">
														({os.role})
													</span>
												</>
											) : (
												<>
													{os.project}{" "}
													<span className="font-normal text-muted-foreground">
														({os.role})
													</span>
												</>
											)}
										</p>
										{(os.description || canEdit) && (
											<div className="text-xs text-muted-foreground">
												{canEdit ? (
													<EditableText
														value={os.description || ""}
														onSave={(value) =>
															onEditField?.({
																sectionType: "openSource",
																field: "description",
																value,
																itemId: os.id,
															})
														}
														placeholder="Description..."
														multiline
														className="text-xs"
													/>
												) : (
													os.description
												)}
											</div>
										)}
										{!isOriginal &&
											osSuggestions.map((suggestion) => (
												<SuggestionInline
													key={suggestion.id}
													suggestion={suggestion}
													onAccept={
														onAcceptSuggestion
															? () => onAcceptSuggestion(suggestion)
															: undefined
													}
													onReject={
														onRejectSuggestion
															? () => onRejectSuggestion(suggestion)
															: undefined
													}
													onUndo={
														onUndoSuggestion
															? () => onUndoSuggestion(suggestion)
															: undefined
													}
												/>
											))}
									</div>
								);
							})}
						</div>
					</section>
				</>
			)}
		</div>
	);
}

export function ResumeComparisonView({
	resume,
	tailoringResult,
	onAcceptSuggestion,
	onRejectSuggestion,
	onUndoSuggestion,
	onEditField,
}: ResumeComparisonViewProps) {
	const [viewMode, setViewMode] = useState<ViewMode>("split");
	const leftPanelRef = useRef<HTMLDivElement>(null);
	const rightPanelRef = useRef<HTMLDivElement>(null);
	const isSyncing = useRef(false);

	const handleScroll = useCallback((source: "left" | "right") => {
		if (isSyncing.current) return;

		const sourceRef = source === "left" ? leftPanelRef : rightPanelRef;
		const targetRef = source === "left" ? rightPanelRef : leftPanelRef;

		if (!sourceRef.current || !targetRef.current) return;

		isSyncing.current = true;

		const sourceScrollTop = sourceRef.current.scrollTop;
		const sourceScrollHeight =
			sourceRef.current.scrollHeight - sourceRef.current.clientHeight;
		const scrollPercentage =
			sourceScrollHeight > 0 ? sourceScrollTop / sourceScrollHeight : 0;

		const targetScrollHeight =
			targetRef.current.scrollHeight - targetRef.current.clientHeight;
		targetRef.current.scrollTop = scrollPercentage * targetScrollHeight;

		requestAnimationFrame(() => {
			isSyncing.current = false;
		});
	}, []);

	useEffect(() => {
		const leftPanel = leftPanelRef.current;
		const rightPanel = rightPanelRef.current;

		const handleLeftScroll = () => handleScroll("left");
		const handleRightScroll = () => handleScroll("right");

		if (leftPanel) leftPanel.addEventListener("scroll", handleLeftScroll);
		if (rightPanel) rightPanel.addEventListener("scroll", handleRightScroll);

		return () => {
			if (leftPanel) leftPanel.removeEventListener("scroll", handleLeftScroll);
			if (rightPanel)
				rightPanel.removeEventListener("scroll", handleRightScroll);
		};
	}, [handleScroll]);

	const matchScore = tailoringResult.matchScore;
	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-600 dark:text-green-400";
		if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
		if (score >= 40) return "text-orange-600 dark:text-orange-400";
		return "text-red-600 dark:text-red-400";
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<CardTitle className="text-lg">Resume Comparison</CardTitle>
						<div
							className={cn(
								"flex items-center gap-1 text-sm font-medium",
								getScoreColor(matchScore),
							)}
						>
							<span>{matchScore}% Match</span>
						</div>
					</div>
					<div className="flex items-center gap-1 bg-muted rounded-lg p-1">
						<Button
							variant={viewMode === "split" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-2 text-xs"
							onClick={() => setViewMode("split")}
						>
							<Columns2 className="h-3.5 w-3.5 mr-1" />
							Split
						</Button>
						<Button
							variant={viewMode === "original" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-2 text-xs"
							onClick={() => setViewMode("original")}
						>
							<FileText className="h-3.5 w-3.5 mr-1" />
							Original
						</Button>
						<Button
							variant={viewMode === "tailored" ? "default" : "ghost"}
							size="sm"
							className="h-7 px-2 text-xs"
							onClick={() => setViewMode("tailored")}
						>
							<Sparkles className="h-3.5 w-3.5 mr-1" />
							Tailored
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{viewMode === "split" ? (
					<div className="grid grid-cols-2 gap-4">
						<div className="border rounded-lg">
							<div className="bg-muted/50 px-3 py-2 border-b flex items-center gap-2">
								<FileText className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium text-sm">Original</span>
							</div>
							<div
								ref={leftPanelRef}
								className="p-4 max-h-[600px] overflow-y-auto"
							>
								<ResumePanel resume={resume} isOriginal />
							</div>
						</div>
						<div className="border rounded-lg border-primary/20">
							<div className="bg-primary/5 px-3 py-2 border-b border-primary/20 flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-primary" />
								<span className="font-medium text-sm">Tailored</span>
							</div>
							<div
								ref={rightPanelRef}
								className="p-4 max-h-[600px] overflow-y-auto"
							>
								<ResumePanel
									resume={resume}
									tailoringResult={tailoringResult}
									onAcceptSuggestion={onAcceptSuggestion}
									onRejectSuggestion={onRejectSuggestion}
									onUndoSuggestion={onUndoSuggestion}
									onEditField={onEditField}
								/>
							</div>
						</div>
					</div>
				) : viewMode === "original" ? (
					<div className="border rounded-lg">
						<div className="bg-muted/50 px-3 py-2 border-b flex items-center gap-2">
							<FileText className="h-4 w-4 text-muted-foreground" />
							<span className="font-medium text-sm">Original Resume</span>
						</div>
						<div className="p-4 max-h-[600px] overflow-y-auto">
							<ResumePanel resume={resume} isOriginal />
						</div>
					</div>
				) : (
					<div className="border rounded-lg border-primary/20">
						<div className="bg-primary/5 px-3 py-2 border-b border-primary/20 flex items-center gap-2">
							<Sparkles className="h-4 w-4 text-primary" />
							<span className="font-medium text-sm">Tailored Resume</span>
						</div>
						<div className="p-4 max-h-[600px] overflow-y-auto">
							<ResumePanel
								resume={resume}
								tailoringResult={tailoringResult}
								onAcceptSuggestion={onAcceptSuggestion}
								onRejectSuggestion={onRejectSuggestion}
								onUndoSuggestion={onUndoSuggestion}
								onEditField={onEditField}
							/>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
