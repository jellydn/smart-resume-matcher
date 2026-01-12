import { AlertCircle, CheckCircle2, FileJson, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { type Resume, resumeSchema } from "~/lib/types";
import { cn } from "~/lib/utils";
import { ResumePreview } from "./resume-preview";

interface JsonUploadProps {
	onUpload: (resume: Resume) => void;
	className?: string;
}

export function JsonUpload({ onUpload, className }: JsonUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [parsedResume, setParsedResume] = useState<Resume | null>(null);

	const validateAndParseJson = useCallback((content: string) => {
		setError(null);

		let jsonData: unknown;
		try {
			jsonData = JSON.parse(content);
		} catch (_e) {
			setError("Invalid JSON format. Please check your file syntax.");
			return;
		}

		const result = resumeSchema.safeParse(jsonData);
		if (!result.success) {
			const issues = result.error.issues;
			const errorMessages = issues
				.slice(0, 3)
				.map((issue) => `• ${issue.path.join(".")}: ${issue.message}`)
				.join("\n");
			const moreErrors =
				issues.length > 3 ? `\n...and ${issues.length - 3} more errors` : "";
			setError(`Schema validation failed:\n${errorMessages}${moreErrors}`);
			return;
		}

		setParsedResume(result.data);
	}, []);

	const handleFile = useCallback(
		(file: File) => {
			if (!file.name.endsWith(".json")) {
				setError("Please upload a .json file");
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				validateAndParseJson(content);
			};
			reader.onerror = () => {
				setError("Failed to read the file. Please try again.");
			};
			reader.readAsText(file);
		},
		[validateAndParseJson],
	);

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

	const handleConfirm = useCallback(() => {
		if (parsedResume) {
			onUpload(parsedResume);
		}
	}, [parsedResume, onUpload]);

	const handleReset = useCallback(() => {
		setParsedResume(null);
		setError(null);
	}, []);

	if (parsedResume) {
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
						Review your resume data below and confirm to continue.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<ResumePreview resume={parsedResume} />
					<div className="flex justify-end gap-2">
						<Button variant="outline" onClick={handleReset}>
							Upload Different File
						</Button>
						<Button onClick={handleConfirm}>Use This Resume</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Upload JSON Resume</CardTitle>
				<CardDescription>
					Upload your resume data as a JSON file. The file must match the
					expected schema.
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
						accept=".json"
						onChange={handleFileInput}
						className="hidden"
						id="json-upload"
					/>
					<label
						htmlFor="json-upload"
						className="cursor-pointer flex flex-col items-center gap-4"
					>
						<div className="rounded-full bg-primary/10 p-4">
							{isDragging ? (
								<Upload className="h-8 w-8 text-primary" />
							) : (
								<FileJson className="h-8 w-8 text-primary" />
							)}
						</div>
						<div className="space-y-1">
							<p className="font-medium">
								{isDragging
									? "Drop your file here"
									: "Drag and drop your JSON file"}
							</p>
							<p className="text-sm text-muted-foreground">
								or click to browse
							</p>
						</div>
						<p className="text-xs text-muted-foreground">
							Only .json files are accepted
						</p>
					</label>
				</div>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Upload Error</AlertTitle>
						<AlertDescription className="whitespace-pre-wrap">
							{error}
						</AlertDescription>
					</Alert>
				)}
			</CardContent>
		</Card>
	);
}
