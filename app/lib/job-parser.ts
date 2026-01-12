import type { AISettings, JobRequirements, JobParserResult } from "~/lib/types";
import { jobRequirementsSchema } from "~/lib/types";

const SYSTEM_PROMPT = `You are a job description analyzer. Extract key requirements from job postings and return them in a structured JSON format.

Return ONLY valid JSON with the following structure:
{
  "title": "Job title if mentioned",
  "company": "Company name if mentioned",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["nice-to-have skill1"],
  "qualifications": ["Bachelor's degree", "5+ years experience"],
  "experienceYears": { "min": 3, "max": 5 },
  "responsibilities": ["responsibility1", "responsibility2"],
  "benefits": ["benefit1", "benefit2"],
  "keywords": ["important", "keywords", "for", "matching"]
}

Guidelines:
- Extract only information explicitly stated in the job description
- For experienceYears, extract numeric values if mentioned (e.g., "3-5 years" -> min: 3, max: 5)
- Keywords should include important terms for resume matching (technologies, methodologies, domain terms)
- If a field has no data, use an empty array or omit the field
- Return ONLY the JSON object, no additional text or markdown`;

function createUserPrompt(jobDescription: string): string {
  return `Analyze this job description and extract the requirements:\n\n${jobDescription}`;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOpenRouter(
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-haiku",
      messages,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callOpenAI(
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
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
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function callOllama(
  baseUrl: string,
  messages: ChatMessage[]
): Promise<string> {
  const url = baseUrl || "http://localhost:11434";

  const response = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || "";
}

async function callBrowserAI(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  // @ts-expect-error - Browser AI is experimental
  if (typeof window === "undefined" || !window.ai) {
    throw new Error("Browser AI not available");
  }

  // @ts-expect-error - Browser AI is experimental
  const session = await window.ai.languageModel.create({
    systemPrompt,
  });

  const response = await session.prompt(userMessage);
  session.destroy();

  return response;
}

function parseAIResponse(content: string): JobRequirements {
  let jsonStr = content.trim();
  
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  
  const startIndex = jsonStr.indexOf("{");
  const endIndex = jsonStr.lastIndexOf("}");
  if (startIndex !== -1 && endIndex !== -1) {
    jsonStr = jsonStr.substring(startIndex, endIndex + 1);
  }

  const parsed = JSON.parse(jsonStr);
  const validated = jobRequirementsSchema.safeParse(parsed);
  
  if (!validated.success) {
    console.warn("Validation warnings:", validated.error.issues);
    return jobRequirementsSchema.parse({
      ...parsed,
      requiredSkills: parsed.requiredSkills || [],
      preferredSkills: parsed.preferredSkills || [],
      qualifications: parsed.qualifications || [],
      responsibilities: parsed.responsibilities || [],
      benefits: parsed.benefits || [],
      keywords: parsed.keywords || [],
    });
  }

  return validated.data;
}

export async function parseJobDescription(
  jobDescription: string,
  settings: AISettings
): Promise<JobParserResult> {
  if (!jobDescription.trim()) {
    return { success: false, error: "Job description is empty" };
  }

  const { provider, apiKeys, ollamaBaseUrl } = settings;

  if (provider !== "browser" && provider !== "ollama") {
    const apiKey = apiKeys[provider];
    if (!apiKey) {
      return { success: false, error: `API key not configured for ${provider}` };
    }
  }

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: createUserPrompt(jobDescription) },
  ];

  try {
    let responseContent: string;

    switch (provider) {
      case "openrouter":
        responseContent = await callOpenRouter(apiKeys.openrouter, messages);
        break;
      case "openai":
        responseContent = await callOpenAI(apiKeys.openai, messages);
        break;
      case "anthropic":
        responseContent = await callAnthropic(
          apiKeys.anthropic,
          SYSTEM_PROMPT,
          createUserPrompt(jobDescription)
        );
        break;
      case "ollama":
        responseContent = await callOllama(ollamaBaseUrl || "", messages);
        break;
      case "browser":
        responseContent = await callBrowserAI(
          SYSTEM_PROMPT,
          createUserPrompt(jobDescription)
        );
        break;
      default:
        return { success: false, error: "Unknown AI provider" };
    }

    if (!responseContent) {
      return { success: false, error: "Empty response from AI" };
    }

    const requirements = parseAIResponse(responseContent);
    return { success: true, requirements };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse job description";
    return { success: false, error: message };
  }
}
