import {
	Briefcase,
	Building2,
	ChevronDown,
	ChevronUp,
	ExternalLink,
	History,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type {
	JobDescription,
	JobHistoryEntry,
	JobRequirements,
} from "~/lib/types";

interface JobHistoryPanelProps {
	history: JobHistoryEntry[];
	onSelectEntry: (
		jobDescription: JobDescription,
		requirements?: JobRequirements,
	) => void;
	onDeleteEntry: (id: string) => void;
}

export function JobHistoryPanel({
	history,
	onSelectEntry,
	onDeleteEntry,
}: JobHistoryPanelProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	if (history.length === 0) {
		return null;
	}

	const formatDate = (isoString: string) => {
		const date = new Date(isoString);
		return date.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getEntryTitle = (entry: JobHistoryEntry) => {
		if (entry.requirements?.title) {
			return entry.requirements.title;
		}
		const description = entry.jobDescription.description;
		const firstLine = description.split("\n")[0].trim();
		return firstLine.length > 50 ? `${firstLine.slice(0, 50)}...` : firstLine;
	};

	const getEntryCompany = (entry: JobHistoryEntry) => {
		return entry.requirements?.company || null;
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base flex items-center gap-2">
						<History className="h-4 w-4" />
						Recent Jobs ({history.length})
					</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						{isExpanded ? (
							<>
								<ChevronUp className="h-4 w-4 mr-1" />
								Collapse
							</>
						) : (
							<>
								<ChevronDown className="h-4 w-4 mr-1" />
								Expand
							</>
						)}
					</Button>
				</div>
			</CardHeader>
			{isExpanded && (
				<CardContent className="pt-0">
					<div className="space-y-2">
						{history.map((entry) => {
							const title = getEntryTitle(entry);
							const company = getEntryCompany(entry);

							return (
								<div
									key={entry.id}
									className="flex items-start justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
								>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
											<span className="font-medium truncate">{title}</span>
										</div>
										{company && (
											<div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
												<Building2 className="h-3 w-3 flex-shrink-0" />
												<span className="truncate">{company}</span>
											</div>
										)}
										<p className="text-xs text-muted-foreground mt-1">
											{formatDate(entry.createdAt)}
										</p>
										{entry.jobDescription.linkedinUrl && (
											<a
												href={entry.jobDescription.linkedinUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
												onClick={(e) => e.stopPropagation()}
											>
												<ExternalLink className="h-3 w-3" />
												LinkedIn
											</a>
										)}
									</div>
									<div className="flex items-center gap-1 flex-shrink-0">
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												onSelectEntry(entry.jobDescription, entry.requirements)
											}
										>
											Use
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="text-destructive hover:text-destructive"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Job Entry?</AlertDialogTitle>
													<AlertDialogDescription>
														This will remove "{title}" from your job history.
														This action cannot be undone.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => onDeleteEntry(entry.id)}
														className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			)}
		</Card>
	);
}
