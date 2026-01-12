import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "~/hooks/use-network-status";

export function OfflineIndicator() {
	const { isOffline } = useNetworkStatus();

	if (!isOffline) return null;

	return (
		<div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
			<WifiOff className="h-4 w-4" />
			<span>You're offline. AI features require a network connection.</span>
		</div>
	);
}
