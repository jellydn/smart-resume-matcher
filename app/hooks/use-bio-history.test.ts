// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY, useBioHistory } from "~/hooks/use-bio-history";
import type { BioResult } from "~/lib/types";
import { MAX_BIO_HISTORY_ENTRIES } from "~/lib/types";

function makeResult(tag: string): BioResult {
	return {
		funCasual: [`fun-${tag}-1`, `fun-${tag}-2`],
		professional: [`pro-${tag}-1`, `pro-${tag}-2`],
	};
}

beforeEach(() => {
	localStorage.clear();
});

describe("useBioHistory", () => {
	it("starts empty when nothing is stored", () => {
		const { result } = renderHook(() => useBioHistory());
		expect(result.current.isLoaded).toBe(true);
		expect(result.current.history).toEqual([]);
	});

	it("loads valid history from localStorage", () => {
		const entry = {
			id: "id-1",
			createdAt: "2024-01-01T00:00:00.000Z",
			result: makeResult("a"),
			prompt: "hello",
			length: "short",
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify([entry]));

		const { result } = renderHook(() => useBioHistory());
		expect(result.current.isLoaded).toBe(true);
		expect(result.current.history).toEqual([entry]);
	});

	it("falls back to empty when stored data is not valid JSON", () => {
		localStorage.setItem(STORAGE_KEY, "not json{");
		const { result } = renderHook(() => useBioHistory());
		expect(result.current.history).toEqual([]);
	});

	it("falls back to empty when stored data fails schema validation", () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify([{ id: "id-1", createdAt: "bad" }]),
		);
		const { result } = renderHook(() => useBioHistory());
		expect(result.current.history).toEqual([]);
	});

	it("addEntry prepends entries and trims the prompt", () => {
		const { result } = renderHook(() => useBioHistory());

		act(() => {
			result.current.addEntry(makeResult("a"), {
				prompt: "  hello world  ",
				length: "long",
			});
		});

		expect(result.current.history).toHaveLength(1);
		expect(result.current.history[0].prompt).toBe("hello world");
		expect(result.current.history[0].length).toBe("long");
		expect(result.current.history[0].id).toEqual(expect.any(String));
		expect(result.current.history[0].createdAt).toEqual(expect.any(String));
	});

	it("addEntry drops an empty prompt", () => {
		const { result } = renderHook(() => useBioHistory());

		act(() => {
			result.current.addEntry(makeResult("a"), { prompt: "   " });
		});

		expect(result.current.history[0].prompt).toBeUndefined();
	});

	it("dedupes identical results with identical options", () => {
		const { result } = renderHook(() => useBioHistory());

		act(() => {
			result.current.addEntry(makeResult("a"), { prompt: "p" });
		});
		act(() => {
			result.current.addEntry(makeResult("a"), { prompt: "p" });
		});

		expect(result.current.history).toHaveLength(1);
	});

	it("keeps distinct entries when the result differs", () => {
		const { result } = renderHook(() => useBioHistory());

		act(() => {
			result.current.addEntry(makeResult("a"));
		});
		act(() => {
			result.current.addEntry(makeResult("b"));
		});

		expect(result.current.history).toHaveLength(2);
		// Newest first
		expect(result.current.history[0].result.funCasual[0]).toBe("fun-b-1");
	});

	it("caps history at MAX_BIO_HISTORY_ENTRIES", () => {
		const { result } = renderHook(() => useBioHistory());

		act(() => {
			for (let i = 0; i < MAX_BIO_HISTORY_ENTRIES + 3; i++) {
				result.current.addEntry(makeResult(`v${i}`));
			}
		});

		expect(result.current.history).toHaveLength(MAX_BIO_HISTORY_ENTRIES);
		// The oldest entries are dropped, newest remains first.
		expect(result.current.history[0].result.funCasual[0]).toBe(
			`fun-v${MAX_BIO_HISTORY_ENTRIES + 2}-1`,
		);
	});

	it("deleteEntry removes the matching entry", () => {
		const { result } = renderHook(() => useBioHistory());
		let firstId = "";

		act(() => {
			firstId = result.current.addEntry(makeResult("a")).id;
		});
		act(() => {
			result.current.addEntry(makeResult("b"));
		});
		act(() => {
			result.current.deleteEntry(firstId);
		});

		expect(result.current.history).toHaveLength(1);
		expect(result.current.history[0].result.funCasual[0]).toBe("fun-b-1");
	});

	it("clearHistory empties state and clears persisted entries", () => {
		const { result } = renderHook(() => useBioHistory());

		act(() => {
			result.current.addEntry(makeResult("a"));
		});
		expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

		act(() => {
			result.current.clearHistory();
		});

		expect(result.current.history).toEqual([]);
		// The save effect re-persists the now-empty list, so the key holds "[]".
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([]);
	});

	it("persists new entries to localStorage", () => {
		const { result } = renderHook(() => useBioHistory());

		act(() => {
			result.current.addEntry(makeResult("a"), { prompt: "p" });
		});

		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
		expect(stored).toHaveLength(1);
		expect(stored[0].result).toEqual(makeResult("a"));
		expect(stored[0].prompt).toBe("p");
	});
});
