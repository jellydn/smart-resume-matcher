import { useState, useEffect, useCallback, useRef } from "react";
import type { Resume } from "~/lib/types";
import { resumeSchema, emptyResume } from "~/lib/types";
import { useSession } from "~/hooks/use-session";

const STORAGE_KEY = "resume-matcher-resume-data";
const STORAGE_UPDATED_AT_KEY = "resume-matcher-resume-updated-at";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface UseResumeStorageReturn {
  resume: Resume;
  setResume: (resume: Resume) => void;
  updateResumeField: <K extends keyof Resume>(
    key: K,
    value: Resume[K]
  ) => void;
  clearResume: () => void;
  isLoaded: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
}

export function useResumeStorage(): UseResumeStorageReturn {
  const { user, isAuthenticated, isLoading: authLoading } = useSession();
  const [resume, setResumeState] = useState<Resume>(emptyResume);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const isInitialLoad = useRef(true);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveToLocalStorage = useCallback((data: Resume) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_UPDATED_AT_KEY, new Date().toISOString());
    } catch (error) {
      console.error("Error saving resume to localStorage:", error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((): { resume: Resume | null; updatedAt: Date | null } => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const updatedAtStr = localStorage.getItem(STORAGE_UPDATED_AT_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        const result = resumeSchema.safeParse(parsed);
        if (result.success) {
          return {
            resume: result.data,
            updatedAt: updatedAtStr ? new Date(updatedAtStr) : null,
          };
        }
      }
    } catch (error) {
      console.error("Error loading resume from localStorage:", error);
    }
    return { resume: null, updatedAt: null };
  }, []);

  const saveToCloud = useCallback(async (data: Resume) => {
    if (!isAuthenticated) return;

    setSyncStatus("syncing");
    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: data }),
      });

      if (!response.ok) {
        throw new Error("Failed to save to cloud");
      }

      const result = await response.json();
      if (result.success && result.updatedAt) {
        setLastSyncedAt(new Date(result.updatedAt));
        localStorage.setItem(STORAGE_UPDATED_AT_KEY, result.updatedAt);
      }
      setSyncStatus("synced");

      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (error) {
      console.error("Error saving resume to cloud:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  }, [isAuthenticated]);

  const loadFromCloud = useCallback(async (): Promise<{ resume: Resume | null; updatedAt: Date | null }> => {
    try {
      const response = await fetch("/api/resume");
      if (!response.ok) {
        if (response.status === 401) {
          return { resume: null, updatedAt: null };
        }
        throw new Error("Failed to load from cloud");
      }

      const result = await response.json();
      if (result.resume) {
        const validationResult = resumeSchema.safeParse(result.resume);
        if (validationResult.success) {
          return {
            resume: validationResult.data,
            updatedAt: result.updatedAt ? new Date(result.updatedAt) : null,
          };
        }
      }
    } catch (error) {
      console.error("Error loading resume from cloud:", error);
    }
    return { resume: null, updatedAt: null };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const initializeData = async () => {
      const localData = loadFromLocalStorage();

      if (isAuthenticated) {
        const cloudData = await loadFromCloud();

        if (cloudData.resume) {
          const localTime = localData.updatedAt?.getTime() ?? 0;
          const cloudTime = cloudData.updatedAt?.getTime() ?? 0;

          if (cloudTime >= localTime) {
            setResumeState(cloudData.resume);
            saveToLocalStorage(cloudData.resume);
            setLastSyncedAt(cloudData.updatedAt);
          } else {
            setResumeState(localData.resume ?? emptyResume);
            saveToCloud(localData.resume ?? emptyResume);
          }
        } else if (localData.resume) {
          setResumeState(localData.resume);
          saveToCloud(localData.resume);
        }
      } else if (localData.resume) {
        setResumeState(localData.resume);
      }

      setIsLoaded(true);
      isInitialLoad.current = false;
    };

    initializeData();
  }, [authLoading, isAuthenticated, loadFromLocalStorage, loadFromCloud, saveToLocalStorage, saveToCloud]);

  useEffect(() => {
    if (isInitialLoad.current || !isLoaded) return;

    saveToLocalStorage(resume);

    if (isAuthenticated) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        saveToCloud(resume);
      }, 1000);
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [resume, isLoaded, isAuthenticated, saveToLocalStorage, saveToCloud]);

  const setResume = useCallback((newResume: Resume) => {
    setResumeState(newResume);
  }, []);

  const updateResumeField = useCallback(
    <K extends keyof Resume>(key: K, value: Resume[K]) => {
      setResumeState((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const clearResume = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_UPDATED_AT_KEY);
      setResumeState(emptyResume);
      if (isAuthenticated) {
        saveToCloud(emptyResume);
      }
    } catch (error) {
      console.error("Error clearing resume from localStorage:", error);
    }
  }, [isAuthenticated, saveToCloud]);

  return {
    resume,
    setResume,
    updateResumeField,
    clearResume,
    isLoaded,
    syncStatus,
    lastSyncedAt,
  };
}
