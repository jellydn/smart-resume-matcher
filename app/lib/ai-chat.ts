export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export async function callOpenRouter(
	apiKey: string,
	messages: ChatMessage[],
): Promise<string> {
	const response = await fetch(
		"https://openrouter.ai/api/v1/chat/completions",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "anthropic/claude-3.5-haiku",
				messages,
				max_tokens: 4000,
			}),
		},
	);

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.error?.message || `API error: ${response.status}`);
	}

	const data = await response.json();
	return data.choices?.[0]?.message?.content || "";
}

export async function callOpenAI(
	apiKey: string,
	messages: ChatMessage[],
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
			max_tokens: 4000,
		}),
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw new Error(error.error?.message || `API error: ${response.status}`);
	}

	const data = await response.json();
	return data.choices?.[0]?.message?.content || "";
}

export async function callAnthropic(
	apiKey: string,
	systemPrompt: string,
	userMessage: string,
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
			max_tokens: 4000,
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

export async function callOllama(
	baseUrl: string,
	messages: ChatMessage[],
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

export async function callBrowserAI(
	systemPrompt: string,
	userMessage: string,
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
