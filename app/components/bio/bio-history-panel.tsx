import { Eye, History, Trash2 } from "lucide-react";
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
import type { BioHistoryEntry } from "~/lib/types";
import { bioLengthLabels } from "~/lib/types";

interface BioHistoryPanelProps {
	history: BioHistoryEntry[];
	onSelectEntry: (entry: BioHistoryEntry) => void;
	onDeleteEntry: (id: string) => void;
}

export function BioHistoryPanel({
	history,
	onSelectEntry,
	onDeleteEntry,
}: BioHistoryPanelProps) {
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

	const formatPrompt = (entry: BioHistoryEntry) => {
		if (!entry.prompt) return null;
		const truncated =
			entry.prompt.length > 40
				? `${entry.prompt.slice(0, 40)}...`
				: entry.prompt;
		return (
			<span className="text-muted-foreground font-normal">
				{" "}
				· "{truncated}"
			</span>
		);
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-base flex items-center gap-2">
					<History className="h-4 w-4" />
					Saved Bios ({history.length})
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2">
					{history.map((entry) => (
						<div
							key={entry.id}
							className="flex items-start justify-between gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
						>
							<div className="flex-1 min-w-0">
								<p className="text-xs text-muted-foreground">
									{formatDate(entry.createdAt)}
								</p>
								<p className="text-sm font-medium truncate mt-0.5">
									{bioLengthLabels[entry.length ?? "medium"]}
									{formatPrompt(entry)}
								</p>
							</div>
							<div className="flex items-center gap-1 flex-shrink-0">
								<Button
									variant="outline"
									size="sm"
									onClick={() => onSelectEntry(entry)}
								>
									<Eye className="h-4 w-4 mr-1" />
									View
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
											<AlertDialogTitle>Delete Saved Bio?</AlertDialogTitle>
											<AlertDialogDescription>
												This will remove the bios generated on{" "}
												{formatDate(entry.createdAt)} from your history. This
												action cannot be undone.
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
					))}
				</div>
			</CardContent>
		</Card>
	);
}
