// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResumeStorage } from "~/hooks/use-resume-storage";
import type { Resume } from "~/lib/types";
import { emptyResume } from "~/lib/types";

const { sessionMock, fetchMock } = vi.hoisted(() => ({
	sessionMock: vi.fn(),
	fetchMock: vi.fn(),
}));

vi.mock("~/hooks/use-session", () => ({
	useSession: () => sessionMock(),
}));

const STORAGE_KEY = "resume-matcher-resume-data";
const STORAGE_UPDATED_AT_KEY = "resume-matcher-resume-updated-at";

function makeResume(name: string): Resume {
	return {
		personalInfo: {
			name,
			email: `${name.toLowerCase()}@example.com`,
			phone: "",
			location: "Singapore",
			linkedin: "",
			website: "",
			summary: "",
		},
		experience: [],
		education: [],
		skills: [],
		languages: [],
		certifications: [],
		projects: [],
		openSource: [],
	};
}

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

beforeEach(() => {
	localStorage.clear();
	sessionMock.mockReset();
	fetchMock.mockReset();
	// Default: anonymous session. Tests override per case.
	sessionMock.mockReturnValue({ isAuthenticated: false, isLoading: false });
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("useResumeStorage (anonymous)", () => {
	it("starts empty when nothing is stored", async () => {
		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		expect(result.current.isLoaded).toBe(true);
		expect(result.current.resume).toEqual(emptyResume);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("loads a valid resume from localStorage", async () => {
		const stored = makeResume("Dung");
		localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		expect(result.current.resume.personalInfo.name).toBe("Dung");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("falls back to empty when stored data is invalid", async () => {
		localStorage.setItem(STORAGE_KEY, "not-json{");
		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		expect(result.current.resume).toEqual(emptyResume);
	});

	it("persists setResume to localStorage", async () => {
		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		act(() => {
			result.current.setResume(makeResume("Dung"));
		});

		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
		expect(stored.personalInfo.name).toBe("Dung");
	});

	it("updateResumeField patches the field and persists", async () => {
		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		act(() => {
			result.current.updateResumeField("personalInfo", {
				...emptyResume.personalInfo,
				name: "Jane",
				email: "jane@example.com",
			});
		});

		expect(result.current.resume.personalInfo.name).toBe("Jane");
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
		expect(stored.personalInfo.name).toBe("Jane");
	});

	it("clearResume empties state and removes storage keys", async () => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(makeResume("Dung")));
		localStorage.setItem(STORAGE_UPDATED_AT_KEY, new Date().toISOString());

		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});
		expect(result.current.resume.personalInfo.name).toBe("Dung");

		act(() => {
			result.current.clearResume();
		});

		expect(result.current.resume).toEqual(emptyResume);
		// The save effect re-persists the now-empty resume (same pattern as
		// use-bio-history's clearHistory), so the key holds the empty resume.
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual(
			emptyResume,
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

describe("useResumeStorage (authenticated)", () => {
	beforeEach(() => {
		sessionMock.mockReturnValue({ isAuthenticated: true, isLoading: false });
	});

	it("loads the cloud resume when cloud is newer than local", async () => {
		const cloudResume = makeResume("Cloud");
		const localResume = makeResume("Local");
		localStorage.setItem(STORAGE_KEY, JSON.stringify(localResume));
		localStorage.setItem(STORAGE_UPDATED_AT_KEY, "2026-01-01T00:00:00.000Z");

		fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
			// loadFromCloud calls fetch("/api/resume") with no init, so a missing
			// method means GET.
			const method = init?.method ?? "GET";
			if (url === "/api/resume" && method === "GET") {
				return jsonResponse({
					resume: cloudResume,
					updatedAt: "2026-01-02T00:00:00.000Z",
				});
			}
			return jsonResponse({
				success: true,
				updatedAt: "2026-01-02T00:00:00.000Z",
			});
		});

		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		// Cloud is newer, so it wins over local.
		expect(result.current.resume.personalInfo.name).toBe("Cloud");
		expect(result.current.lastSyncedAt?.toISOString()).toBe(
			"2026-01-02T00:00:00.000Z",
		);
	});

	it("keeps the local resume when local is newer and pushes it to cloud", async () => {
		const localResume = makeResume("Local");
		localStorage.setItem(STORAGE_KEY, JSON.stringify(localResume));
		localStorage.setItem(STORAGE_UPDATED_AT_KEY, "2026-01-03T00:00:00.000Z");

		fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
			const method = init?.method ?? "GET";
			if (url === "/api/resume" && method === "GET") {
				return jsonResponse({
					resume: makeResume("Cloud"),
					updatedAt: "2026-01-01T00:00:00.000Z",
				});
			}
			return jsonResponse({
				success: true,
				updatedAt: "2026-01-03T00:00:00.000Z",
			});
		});

		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		// Local is newer, so it wins.
		expect(result.current.resume.personalInfo.name).toBe("Local");
		// The local resume is pushed to the cloud.
		const postCall = fetchMock.mock.calls.find(
			([url, init]) => url === "/api/resume" && init?.method === "POST",
		);
		expect(postCall).toBeTruthy();
		const [, postInit] = postCall as [string, RequestInit];
		expect(JSON.parse(postInit.body as string).resume.personalInfo.name).toBe(
			"Local",
		);
	});

	it("falls back to local when the cloud returns 401", async () => {
		const localResume = makeResume("Local");
		localStorage.setItem(STORAGE_KEY, JSON.stringify(localResume));

		fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
			const method = init?.method ?? "GET";
			if (url === "/api/resume" && method === "GET") {
				return jsonResponse({ message: "Unauthorized" }, 401);
			}
			return jsonResponse({
				success: true,
				updatedAt: "2026-01-01T00:00:00.000Z",
			});
		});

		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		// A 401 is treated as anonymous: the local resume is used.
		expect(result.current.resume.personalInfo.name).toBe("Local");
	});

	it("saves to the cloud after the debounce on resume changes", async () => {
		vi.useFakeTimers();
		fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
			const method = init?.method ?? "GET";
			if (url === "/api/resume" && method === "GET") {
				return jsonResponse({ resume: null });
			}
			return jsonResponse({
				success: true,
				updatedAt: "2026-01-04T00:00:00.000Z",
			});
		});

		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});
		expect(result.current.isLoaded).toBe(true);

		act(() => {
			result.current.setResume(makeResume("Dung"));
		});
		// Not yet synced — the 1s debounce hasn't elapsed.
		expect(
			fetchMock.mock.calls.filter((c) => c[1]?.method === "POST").length,
		).toBe(0);

		await act(async () => {
			vi.advanceTimersByTime(1000);
		});

		const postCall = fetchMock.mock.calls.find(
			(c) => c[0] === "/api/resume" && c[1]?.method === "POST",
		);
		expect(postCall).toBeTruthy();
		const [, postInit] = postCall as [string, RequestInit];
		expect(JSON.parse(postInit.body as string).resume.personalInfo.name).toBe(
			"Dung",
		);
		expect(result.current.syncStatus).toBe("synced");
	});

	it("marks syncStatus error when the cloud save fails", async () => {
		vi.useFakeTimers();
		fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
			const method = init?.method ?? "GET";
			if (url === "/api/resume" && method === "GET") {
				return jsonResponse({ resume: null });
			}
			return jsonResponse({ message: "boom" }, 500);
		});

		const { result } = renderHook(() => useResumeStorage());
		await act(async () => {});

		act(() => {
			result.current.setResume(makeResume("Dung"));
		});
		await act(async () => {
			vi.advanceTimersByTime(1000);
		});

		expect(result.current.syncStatus).toBe("error");
	});
});
