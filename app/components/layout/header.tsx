import { FileText, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { AISettingsDialog } from "~/components/ai-settings-dialog";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useAISettings } from "~/hooks/use-ai-settings";
import { useSession } from "~/hooks/use-session";
import { signOut } from "~/lib/auth-client";

export function Header() {
	const {
		settings,
		setProvider,
		setApiKey,
		setOllamaBaseUrl,
		isLoaded: aiSettingsLoaded,
	} = useAISettings();

	const { user, isLoading: authLoading, isAuthenticated } = useSession();
	const navigate = useNavigate();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		setIsSigningOut(true);
		try {
			await signOut();
			navigate("/");
		} catch (error) {
			console.error("Sign out failed:", error);
		} finally {
			setIsSigningOut(false);
		}
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<Link to="/" className="flex items-center space-x-2">
					<FileText className="h-6 w-6" />
					<span className="font-bold">Resume Matcher</span>
				</Link>
				<div className="flex flex-1 items-center justify-end space-x-2">
					{aiSettingsLoaded && (
						<AISettingsDialog
							settings={settings}
							onProviderChange={setProvider}
							onApiKeyChange={setApiKey}
							onOllamaBaseUrlChange={setOllamaBaseUrl}
						/>
					)}
					<ThemeToggle />

					{!authLoading &&
						(isAuthenticated && user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="sm" className="gap-2">
										<User className="h-4 w-4" />
										<span className="max-w-[120px] truncate">
											{user.name || user.email}
										</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end" className="w-56">
									<DropdownMenuLabel>
										<div className="flex flex-col space-y-1">
											{user.name && (
												<p className="text-sm font-medium leading-none">
													{user.name}
												</p>
											)}
											<p className="text-xs leading-none text-muted-foreground">
												{user.email}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleSignOut}
										disabled={isSigningOut}
										className="cursor-pointer"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<div className="flex items-center space-x-2">
								<Button variant="ghost" size="sm" asChild>
									<Link to="/login">Login</Link>
								</Button>
								<Button size="sm" asChild>
									<Link to="/signup">Sign Up</Link>
								</Button>
							</div>
						))}
				</div>
			</div>
		</header>
	);
}
