import {
	AlertCircle,
	ArrowLeft,
	Check,
	Copy,
	Loader2,
	Sparkles,
	UserRound,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { BioHistoryPanel } from "~/components/bio/bio-history-panel";
import { CvUpload } from "~/components/resume/cv-upload";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { useAISettings } from "~/hooks/use-ai-settings";
import { useBioHistory } from "~/hooks/use-bio-history";
import { useResumeStorage } from "~/hooks/use-resume-storage";
import { generateBios } from "~/lib/bio-generator";
import type {
	BioHistoryEntry,
	BioLength,
	BioResult,
	Resume,
} from "~/lib/types";
import { bioLengthLabels } from "~/lib/types";
import type { Route } from "./+types/bio";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Bio Generator - Resume Matcher" },
		{
			name: "description",
			content:
				"Turn your profile into ready-to-use bio options for LinkedIn, GitHub, and more",
		},
	];
}

type BioTone = "funCasual" | "professional";
const toneLabels: Record<BioTone, string> = {
	funCasual: "Fun & Casual",
	professional: "Professional",
};

const MAX_PROMPT_LENGTH = 500;

async function copyToClipboard(text: string): Promise<boolean> {
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
			return true;
		}
	} catch {
		// Fall through to legacy copy
	}

	try {
		const textarea = document.createElement("textarea");
		textarea.value = text;
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		const ok = document.execCommand("copy");
		document.body.removeChild(textarea);
		return ok;
	} catch {
		return false;
	}
}

export default function BioPage() {
	const { resume, setResume, isLoaded: isResumeLoaded } = useResumeStorage();
	const { settings, isLoaded: isSettingsLoaded } = useAISettings();
	const {
		history,
		addEntry,
		deleteEntry,
		isLoaded: isHistoryLoaded,
	} = useBioHistory();
	const resultsRef = useRef<HTMLDivElement>(null);

	const [isGenerating, setIsGenerating] = useState(false);
	const [generationError, setGenerationError] = useState("");
	const [result, setResult] = useState<BioResult | null>(null);
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const [customPrompt, setCustomPrompt] = useState("");
	const [length, setLength] = useState<BioLength>("medium");
	const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (copiedTimeoutRef.current) {
				clearTimeout(copiedTimeoutRef.current);
			}
		};
	}, []);

	const hasProfile = isResumeLoaded && resume.personalInfo.name.length > 0;

	const handleGenerate = useCallback(async () => {
		if (!isSettingsLoaded || !hasProfile) return;

		setIsGenerating(true);
		setGenerationError("");
		setResult(null);

		const response = await generateBios(resume, settings, {
			length,
			prompt: customPrompt,
		});

		if (response.success && response.result) {
			setResult(response.result);
			addEntry(response.result, { length, prompt: customPrompt });
		} else {
			setGenerationError(response.error || "Failed to generate bios");
		}

		setIsGenerating(false);
	}, [
		resume,
		settings,
		isSettingsLoaded,
		hasProfile,
		length,
		customPrompt,
		addEntry,
	]);

	const handleSelectHistoryEntry = useCallback((entry: BioHistoryEntry) => {
		setResult(entry.result);
		setGenerationError("");
		resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, []);

	const handleImportResume = useCallback(
		(importedResume: Resume) => {
			setResume(importedResume);
			setResult(null);
			setGenerationError("");
		},
		[setResume],
	);

	const handleCopy = useCallback(
		async (tone: BioTone, index: number) => {
			if (!result) return;
			const text = result[tone][index];
			if (!text) return;

			const copied = await copyToClipboard(text);
			if (copied) {
				if (copiedTimeoutRef.current) {
					clearTimeout(copiedTimeoutRef.current);
				}
				setCopiedKey(`${tone}-${index}`);
				copiedTimeoutRef.current = setTimeout(() => {
					setCopiedKey(null);
				}, 2000);
			}
		},
		[result],
	);

	const summaryParts = [
		resume.personalInfo.location,
		resume.experience.length > 0 &&
			`${resume.experience.length} experience entr${
				resume.experience.length === 1 ? "y" : "ies"
			}`,
		resume.skills.length > 0 &&
			`${resume.skills.length} skill${resume.skills.length === 1 ? "" : "s"}`,
		resume.openSource.length > 0 &&
			`${resume.openSource.length} open source project${
				resume.openSource.length === 1 ? "" : "s"
			}`,
	].filter(
		(part): part is string => typeof part === "string" && part.length > 0,
	);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-6 flex items-center justify-between">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/">
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back to Home
					</Link>
				</Button>
			</div>

			<div className="max-w-3xl mx-auto space-y-6">
				<div className="mb-8 text-center">
					<div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 mb-4">
						<UserRound className="h-8 w-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold">Bio Generator</h1>
					<p className="text-muted-foreground mt-2">
						Turn your profile into a few ready-to-use bio options for LinkedIn,
						GitHub, and more — in fun & casual or professional tones.
					</p>
				</div>

				{isHistoryLoaded && history.length > 0 && (
					<BioHistoryPanel
						history={history}
						onSelectEntry={handleSelectHistoryEntry}
						onDeleteEntry={deleteEntry}
					/>
				)}

				{!isResumeLoaded ? (
					<p className="text-center text-sm text-muted-foreground">
						Loading your profile...
					</p>
				) : !hasProfile ? (
					<div className="space-y-6">
						<CvUpload onUpload={handleImportResume} />
						<p className="text-center text-sm text-muted-foreground">
							Prefer to fill in the details yourself?{" "}
							<Link to="/resume" className="underline text-primary">
								Use the resume form
							</Link>
						</p>
					</div>
				) : (
					<>
						<Card>
							<CardHeader>
								<CardTitle>Your Profile</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
										<UserRound className="h-5 w-5 text-primary" />
									</div>
									<div className="min-w-0">
										<p className="font-medium truncate">
											{resume.personalInfo.name}
										</p>
										<p className="text-sm text-muted-foreground truncate">
											{summaryParts.length > 0
												? summaryParts.join(" • ")
												: "No details yet"}
										</p>
									</div>
								</div>

								<Button
									size="lg"
									onClick={handleGenerate}
									disabled={isGenerating || !isSettingsLoaded}
									className="w-full sm:w-auto"
								>
									{isGenerating ? (
										<>
											<Loader2 className="h-4 w-4 mr-2 animate-spin" />
											Generating Bios...
										</>
									) : (
										<>
											<Sparkles className="h-4 w-4 mr-2" />
											Generate My Bios
										</>
									)}
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Customize Your Bios</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<Label htmlFor="bio-prompt">
											Extra guidance{" "}
											<span className="text-muted-foreground">(optional)</span>
										</Label>
										<span
											className={`text-xs ${
												customPrompt.length > MAX_PROMPT_LENGTH * 0.9
													? "text-destructive"
													: "text-muted-foreground"
											}`}
										>
											{customPrompt.length} / {MAX_PROMPT_LENGTH}
										</span>
									</div>
									<Textarea
										id="bio-prompt"
										placeholder="e.g., mention my open-source work, or highlight my interest in AI"
										value={customPrompt}
										onChange={(e) => {
											if (e.target.value.length <= MAX_PROMPT_LENGTH) {
												setCustomPrompt(e.target.value);
											}
										}}
										className="min-h-[80px] resize-y"
										disabled={isGenerating}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="bio-length">Length</Label>
									<Select
										value={length}
										onValueChange={(value) => setLength(value as BioLength)}
										disabled={isGenerating}
									>
										<SelectTrigger
											id="bio-length"
											className="w-full sm:w-[260px]"
										>
											<SelectValue placeholder="Select a length" />
										</SelectTrigger>
										<SelectContent>
											{(Object.keys(bioLengthLabels) as BioLength[]).map(
												(bioLength) => (
													<SelectItem key={bioLength} value={bioLength}>
														{bioLengthLabels[bioLength]}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									<p className="text-sm text-muted-foreground">
										How detailed each bio should be.
									</p>
								</div>
							</CardContent>
						</Card>

						{generationError && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Generation Failed</AlertTitle>
								<AlertDescription>{generationError}</AlertDescription>
							</Alert>
						)}

						<div ref={resultsRef} className="space-y-6 scroll-mt-24">
							{result && (
								<Tabs defaultValue="funCasual">
									<TabsList className="grid w-full grid-cols-2">
										{(["funCasual", "professional"] as BioTone[]).map(
											(tone) => (
												<TabsTrigger key={tone} value={tone}>
													{toneLabels[tone]}
												</TabsTrigger>
											),
										)}
									</TabsList>
									{(["funCasual", "professional"] as BioTone[]).map((tone) => (
										<TabsContent key={tone} value={tone} className="mt-6">
											<div className="space-y-4">
												{result[tone].map((bio, index) => {
													const key = `${tone}-${index}`;
													const isCopied = copiedKey === key;
													return (
														<Card key={key}>
															<CardHeader>
																<CardTitle className="text-sm text-muted-foreground">
																	Option {index + 1}
																</CardTitle>
																<CardAction>
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => handleCopy(tone, index)}
																	>
																		{isCopied ? (
																			<>
																				<Check className="h-4 w-4 mr-1" />
																				Copied!
																			</>
																		) : (
																			<>
																				<Copy className="h-4 w-4 mr-1" />
																				Copy
																			</>
																		)}
																	</Button>
																</CardAction>
															</CardHeader>
															<CardContent>
																<p className="text-sm leading-relaxed text-muted-foreground">
																	{bio}
																</p>
															</CardContent>
														</Card>
													);
												})}
											</div>
										</TabsContent>
									))}
								</Tabs>
							)}

							{result && (
								<div className="flex justify-center">
									<Button
										variant="outline"
										onClick={handleGenerate}
										disabled={isGenerating}
									>
										{" "}
										<Sparkles className="h-4 w-4 mr-2" />
										Regenerate
									</Button>
								</div>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
