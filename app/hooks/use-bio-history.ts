import { useCallback, useEffect, useRef, useState } from "react";
import type {
	BioHistory,
	BioHistoryEntry,
	BioLength,
	BioResult,
} from "~/lib/types";
import {
	bioHistorySchema,
	generateId,
	MAX_BIO_HISTORY_ENTRIES,
} from "~/lib/types";

const STORAGE_KEY = "resume-matcher-bio-history";

interface UseBioHistoryReturn {
	history: BioHistory;
	addEntry: (
		result: BioResult,
		options?: { prompt?: string; length?: BioLength },
	) => BioHistoryEntry;
	deleteEntry: (id: string) => void;
	clearHistory: () => void;
	isLoaded: boolean;
}

function entriesAreEqual(a: BioHistoryEntry, b: BioHistoryEntry): boolean {
	return (
		a.prompt === b.prompt &&
		a.length === b.length &&
		a.result.funCasual.join("\u0000") === b.result.funCasual.join("\u0000") &&
		a.result.professional.join("\u0000") ===
			b.result.professional.join("\u0000")
	);
}

export function useBioHistory(): UseBioHistoryReturn {
	const [history, setHistoryState] = useState<BioHistory>([]);
	const [isLoaded, setIsLoaded] = useState(false);
	const isInitialLoad = useRef(true);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const parsed = JSON.parse(stored);
				const result = bioHistorySchema.safeParse(parsed);
				if (result.success) {
					setHistoryState(result.data);
				} else {
					console.warn(
						"Invalid bio history data in localStorage, using empty array",
					);
				}
			}
		} catch (error) {
			console.error("Error loading bio history from localStorage:", error);
		}
		setIsLoaded(true);
		isInitialLoad.current = false;
	}, []);

	useEffect(() => {
		if (isInitialLoad.current || !isLoaded) return;

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
		} catch (error) {
			console.error("Error saving bio history to localStorage:", error);
		}
	}, [history, isLoaded]);

	const addEntry = useCallback(
		(
			result: BioResult,
			options: { prompt?: string; length?: BioLength } = {},
		): BioHistoryEntry => {
			const newEntry: BioHistoryEntry = {
				id: generateId(),
				createdAt: new Date().toISOString(),
				result,
				prompt: options.prompt?.trim() || undefined,
				length: options.length,
			};

			setHistoryState((prev) => {
				const latest = prev[0];
				if (latest && entriesAreEqual(latest, newEntry)) {
					return prev;
				}
				return [newEntry, ...prev].slice(0, MAX_BIO_HISTORY_ENTRIES);
			});

			return newEntry;
		},
		[],
	);

	const deleteEntry = useCallback((id: string) => {
		setHistoryState((prev) => prev.filter((entry) => entry.id !== id));
	}, []);

	const clearHistory = useCallback(() => {
		try {
			localStorage.removeItem(STORAGE_KEY);
			setHistoryState([]);
		} catch (error) {
			console.error("Error clearing bio history from localStorage:", error);
		}
	}, []);

	return {
		history,
		addEntry,
		deleteEntry,
		clearHistory,
		isLoaded,
	};
}
