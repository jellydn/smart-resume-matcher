import { useState, useEffect, useCallback, useRef } from "react";
import type { JobHistoryEntry, JobHistory, JobDescription, JobRequirements } from "~/lib/types";
import { jobHistorySchema, MAX_JOB_HISTORY_ENTRIES, generateId } from "~/lib/types";

const STORAGE_KEY = "resume-matcher-job-history";

interface UseJobHistoryReturn {
  history: JobHistory;
  addEntry: (jobDescription: JobDescription, requirements?: JobRequirements) => JobHistoryEntry;
  deleteEntry: (id: string) => void;
  clearHistory: () => void;
  isLoaded: boolean;
}

export function useJobHistory(): UseJobHistoryReturn {
  const [history, setHistoryState] = useState<JobHistory>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const result = jobHistorySchema.safeParse(parsed);
        if (result.success) {
          setHistoryState(result.data);
        } else {
          console.warn("Invalid job history data in localStorage, using empty array");
        }
      }
    } catch (error) {
      console.error("Error loading job history from localStorage:", error);
    }
    setIsLoaded(true);
    isInitialLoad.current = false;
  }, []);

  useEffect(() => {
    if (isInitialLoad.current || !isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Error saving job history to localStorage:", error);
    }
  }, [history, isLoaded]);

  const addEntry = useCallback(
    (jobDescription: JobDescription, requirements?: JobRequirements): JobHistoryEntry => {
      const newEntry: JobHistoryEntry = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        jobDescription,
        requirements,
      };

      setHistoryState((prev) => {
        const updated = [newEntry, ...prev];
        return updated.slice(0, MAX_JOB_HISTORY_ENTRIES);
      });

      return newEntry;
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    setHistoryState((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistoryState([]);
    } catch (error) {
      console.error("Error clearing job history from localStorage:", error);
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
