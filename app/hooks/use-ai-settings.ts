import { useState, useEffect, useCallback, useRef } from "react";
import type { AISettings, AIProvider } from "~/lib/types";
import { aiSettingsSchema, defaultAISettings } from "~/lib/types";

const STORAGE_KEY = "resume-matcher-ai-settings";

interface UseAISettingsReturn {
  settings: AISettings;
  setProvider: (provider: AIProvider) => void;
  setApiKey: (provider: Exclude<AIProvider, "browser">, key: string) => void;
  setOllamaBaseUrl: (url: string) => void;
  isLoaded: boolean;
  hasApiKey: (provider: AIProvider) => boolean;
}

export function useAISettings(): UseAISettingsReturn {
  const [settings, setSettingsState] = useState<AISettings>(defaultAISettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const result = aiSettingsSchema.safeParse(parsed);
        if (result.success) {
          setSettingsState(result.data);
        } else {
          console.warn("Invalid AI settings in localStorage, using defaults");
        }
      }
    } catch (error) {
      console.error("Error loading AI settings from localStorage:", error);
    }
    setIsLoaded(true);
    isInitialLoad.current = false;
  }, []);

  useEffect(() => {
    if (isInitialLoad.current || !isLoaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving AI settings to localStorage:", error);
    }
  }, [settings, isLoaded]);

  const setProvider = useCallback((provider: AIProvider) => {
    setSettingsState((prev) => ({
      ...prev,
      provider,
    }));
  }, []);

  const setApiKey = useCallback(
    (provider: Exclude<AIProvider, "browser">, key: string) => {
      setSettingsState((prev) => ({
        ...prev,
        apiKeys: {
          ...prev.apiKeys,
          [provider]: key,
        },
      }));
    },
    []
  );

  const setOllamaBaseUrl = useCallback((url: string) => {
    setSettingsState((prev) => ({
      ...prev,
      ollamaBaseUrl: url,
    }));
  }, []);

  const hasApiKey = useCallback(
    (provider: AIProvider): boolean => {
      if (provider === "browser") return true;
      return settings.apiKeys[provider].length > 0;
    },
    [settings.apiKeys]
  );

  return {
    settings,
    setProvider,
    setApiKey,
    setOllamaBaseUrl,
    isLoaded,
    hasApiKey,
  };
}
