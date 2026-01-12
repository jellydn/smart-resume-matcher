import { Cloud, CloudOff, Check, Loader2, AlertCircle } from "lucide-react";
import type { SyncStatus } from "~/hooks/use-resume-storage";
import { cn } from "~/lib/utils";

interface SyncIndicatorProps {
  status: SyncStatus;
  isAuthenticated: boolean;
  className?: string;
}

export function SyncIndicator({
  status,
  isAuthenticated,
  className,
}: SyncIndicatorProps) {
  if (!isAuthenticated) {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs text-muted-foreground",
          className
        )}
        title="Sign in to sync your resume across devices"
      >
        <CloudOff className="h-3.5 w-3.5" />
        <span>Local only</span>
      </div>
    );
  }

  const statusConfig = {
    idle: {
      icon: Cloud,
      text: "Saved to cloud",
      className: "text-muted-foreground",
    },
    syncing: {
      icon: Loader2,
      text: "Syncing...",
      className: "text-primary",
    },
    synced: {
      icon: Check,
      text: "Synced",
      className: "text-green-600 dark:text-green-400",
    },
    error: {
      icon: AlertCircle,
      text: "Sync failed",
      className: "text-destructive",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors duration-200",
        config.className,
        className
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          status === "syncing" && "animate-spin"
        )}
      />
      <span>{config.text}</span>
    </div>
  );
}
