import type { AIProvider, AISettings } from "~/lib/types";

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  modelInfo?: string;
}

async function testOpenRouter(apiKey: string): Promise<ConnectionTestResult> {
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: "Invalid API key" };
      }
      return { success: false, message: `API error: ${response.status}` };
    }

    const data = await response.json();
    const modelCount = data.data?.length || 0;
    return {
      success: true,
      message: "Connected successfully",
      modelInfo: `${modelCount} models available`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testOpenAI(apiKey: string): Promise<ConnectionTestResult> {
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: "Invalid API key" };
      }
      return { success: false, message: `API error: ${response.status}` };
    }

    const data = await response.json();
    const modelCount = data.data?.length || 0;
    return {
      success: true,
      message: "Connected successfully",
      modelInfo: `${modelCount} models available`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testAnthropic(apiKey: string): Promise<ConnectionTestResult> {
  if (!apiKey) {
    return { success: false, message: "API key is required" };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "Hi" }],
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, message: "Invalid API key" };
      }
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      return { success: false, message: errorMessage };
    }

    return {
      success: true,
      message: "Connected successfully",
      modelInfo: "Claude models available",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testOllama(baseUrl: string): Promise<ConnectionTestResult> {
  const url = baseUrl || "http://localhost:11434";

  try {
    const response = await fetch(`${url}/api/tags`, {
      method: "GET",
    });

    if (!response.ok) {
      return { success: false, message: `Ollama not responding: ${response.status}` };
    }

    const data = await response.json();
    const modelCount = data.models?.length || 0;
    return {
      success: true,
      message: "Connected successfully",
      modelInfo: modelCount > 0 ? `${modelCount} models available` : "No models installed",
    };
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Cannot connect to Ollama. Is it running?",
      };
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    };
  }
}

async function testBrowserAI(): Promise<ConnectionTestResult> {
  try {
    // @ts-expect-error - Browser AI is experimental
    if (typeof window !== "undefined" && window.ai) {
      return {
        success: true,
        message: "Browser AI available",
        modelInfo: "Chrome built-in AI",
      };
    }
    return {
      success: false,
      message: "Browser AI not available. Requires Chrome 127+ with AI flags enabled.",
    };
  } catch {
    return {
      success: false,
      message: "Browser AI not supported in this browser",
    };
  }
}

export async function testAIConnection(
  settings: AISettings
): Promise<ConnectionTestResult> {
  const { provider, apiKeys, ollamaBaseUrl } = settings;

  switch (provider) {
    case "openrouter":
      return testOpenRouter(apiKeys.openrouter);
    case "openai":
      return testOpenAI(apiKeys.openai);
    case "anthropic":
      return testAnthropic(apiKeys.anthropic);
    case "ollama":
      return testOllama(ollamaBaseUrl || "");
    case "browser":
      return testBrowserAI();
    default:
      return { success: false, message: "Unknown provider" };
  }
}
