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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useAISettings } from "~/hooks/use-ai-settings";
import { useResumeStorage } from "~/hooks/use-resume-storage";
import { generateBios } from "~/lib/bio-generator";
import type { BioResult } from "~/lib/types";
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
	const { resume, isLoaded: isResumeLoaded } = useResumeStorage();
	const { settings, isLoaded: isSettingsLoaded } = useAISettings();

	const [isGenerating, setIsGenerating] = useState(false);
	const [generationError, setGenerationError] = useState("");
	const [result, setResult] = useState<BioResult | null>(null);
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
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

		const response = await generateBios(resume, settings);

		if (response.success && response.result) {
			setResult(response.result);
		} else {
			setGenerationError(response.error || "Failed to generate bios");
		}

		setIsGenerating(false);
	}, [resume, settings, isSettingsLoaded, hasProfile]);

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

				{isResumeLoaded && !hasProfile && (
					<Alert>
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Profile Required</AlertTitle>
						<AlertDescription>
							Please{" "}
							<Link to="/resume" className="underline text-primary">
								create or upload your resume
							</Link>{" "}
							first so we can turn it into bio options.
						</AlertDescription>
					</Alert>
				)}

				<Card>
					<CardHeader>
						<CardTitle>Your Profile</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{!isResumeLoaded ? (
							<p className="text-sm text-muted-foreground">
								Loading your profile...
							</p>
						) : hasProfile ? (
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
						) : (
							<p className="text-sm text-muted-foreground">
								No profile data found. Create or upload your resume to get
								started.
							</p>
						)}

						<Button
							size="lg"
							onClick={handleGenerate}
							disabled={!hasProfile || isGenerating || !isSettingsLoaded}
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

				{generationError && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Generation Failed</AlertTitle>
						<AlertDescription>{generationError}</AlertDescription>
					</Alert>
				)}

				{result && (
					<Tabs defaultValue="funCasual">
						<TabsList className="grid w-full grid-cols-2">
							{(["funCasual", "professional"] as BioTone[]).map((tone) => (
								<TabsTrigger key={tone} value={tone}>
									{toneLabels[tone]}
								</TabsTrigger>
							))}
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
							<Sparkles className="h-4 w-4 mr-2" />
							Regenerate
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
