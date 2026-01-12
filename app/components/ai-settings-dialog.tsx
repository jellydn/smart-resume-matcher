import { useState } from "react";
import {
  Settings,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { AIProvider, AISettings } from "~/lib/types";
import { aiProviderLabels } from "~/lib/types";
import {
  testAIConnection,
  type ConnectionTestResult,
} from "~/lib/ai-connection";

interface AISettingsDialogProps {
  settings: AISettings;
  onProviderChange: (provider: AIProvider) => void;
  onApiKeyChange: (
    provider: Exclude<AIProvider, "browser">,
    key: string
  ) => void;
  onOllamaBaseUrlChange: (url: string) => void;
}

const providers: AIProvider[] = [
  "openrouter",
  "openai",
  "anthropic",
  "ollama",
  "browser",
];

type TestStatus = "idle" | "testing" | "success" | "error";

export function AISettingsDialog({
  settings,
  onProviderChange,
  onApiKeyChange,
  onOllamaBaseUrlChange,
}: AISettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(
    null
  );

  const toggleShowApiKey = (provider: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const needsApiKey = (provider: AIProvider): boolean => {
    return provider !== "browser";
  };

  const getApiKeyPlaceholder = (provider: AIProvider): string => {
    switch (provider) {
      case "openrouter":
        return "sk-or-...";
      case "openai":
        return "sk-...";
      case "anthropic":
        return "sk-ant-...";
      case "ollama":
        return "Optional - only if Ollama requires auth";
      default:
        return "";
    }
  };

  const getProviderDescription = (provider: AIProvider): string => {
    switch (provider) {
      case "openrouter":
        return "Access multiple AI models through a single API";
      case "openai":
        return "GPT-4 and other OpenAI models";
      case "anthropic":
        return "Claude models from Anthropic";
      case "ollama":
        return "Run AI models locally on your machine";
      case "browser":
        return "Uses Chrome's built-in AI (experimental)";
      default:
        return "";
    }
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    setTestResult(null);

    try {
      const result = await testAIConnection(settings);
      setTestResult(result);
      setTestStatus(result.success ? "success" : "error");
    } catch {
      setTestResult({ success: false, message: "Unexpected error occurred" });
      setTestStatus("error");
    }
  };

  const resetTestStatus = () => {
    setTestStatus("idle");
    setTestResult(null);
  };

  const handleProviderChange = (provider: AIProvider) => {
    resetTestStatus();
    onProviderChange(provider);
  };

  const handleApiKeyChange = (
    provider: Exclude<AIProvider, "browser">,
    key: string
  ) => {
    resetTestStatus();
    onApiKeyChange(provider, key);
  };

  const handleOllamaBaseUrlChange = (url: string) => {
    resetTestStatus();
    onOllamaBaseUrlChange(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="AI Settings">
          <Settings className="h-4 w-4" />
          <span className="sr-only">AI Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Provider Settings</DialogTitle>
          <DialogDescription>
            Configure which AI service to use for resume tailoring.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Security Warning</AlertTitle>
            <AlertDescription>
              API keys are stored in your browser's local storage. While this
              keeps your data on your device, be cautious on shared computers.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select
              value={settings.provider}
              onValueChange={(value) =>
                handleProviderChange(value as AIProvider)
              }
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {aiProviderLabels[provider]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {getProviderDescription(settings.provider)}
            </p>
          </div>

          {needsApiKey(settings.provider) && settings.provider !== "browser" && (
            <div className="space-y-2">
              <Label htmlFor="api-key">
                {aiProviderLabels[settings.provider]} API Key
                {settings.provider !== "ollama" && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="api-key"
                    type={showApiKeys[settings.provider] ? "text" : "password"}
                    placeholder={getApiKeyPlaceholder(settings.provider)}
                    value={settings.apiKeys[settings.provider] || ""}
                    onChange={(e) =>
                      handleApiKeyChange(
                        settings.provider as Exclude<AIProvider, "browser">,
                        e.target.value
                      )
                    }
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => toggleShowApiKey(settings.provider)}
                    aria-label={
                      showApiKeys[settings.provider]
                        ? "Hide API key"
                        : "Show API key"
                    }
                  >
                    {showApiKeys[settings.provider] ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {settings.provider === "ollama" && (
            <div className="space-y-2">
              <Label htmlFor="ollama-url">Ollama Base URL</Label>
              <Input
                id="ollama-url"
                type="url"
                placeholder="http://localhost:11434"
                value={settings.ollamaBaseUrl || ""}
                onChange={(e) => handleOllamaBaseUrlChange(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Leave empty to use the default localhost:11434
              </p>
            </div>
          )}

          {settings.provider === "browser" && (
            <Alert>
              <AlertDescription>
                Browser AI uses Chrome's experimental built-in AI features. This
                requires Chrome 127+ with specific flags enabled. No API key
                required, but capabilities may be limited.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 pt-2">
            <Button
              onClick={handleTestConnection}
              disabled={testStatus === "testing"}
              variant="secondary"
              className="w-full"
            >
              {testStatus === "testing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>

            {testStatus === "success" && testResult && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">
                  Connection Successful
                </AlertTitle>
                <AlertDescription className="text-green-600/80">
                  {testResult.message}
                  {testResult.modelInfo && (
                    <span className="block text-sm mt-1">
                      {testResult.modelInfo}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {testStatus === "error" && testResult && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Connection Failed</AlertTitle>
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
