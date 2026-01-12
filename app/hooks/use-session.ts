import { authClient } from "~/lib/auth-client";

export function useSession() {
	const {
		data: sessionData,
		isPending,
		error,
		refetch,
	} = authClient.useSession();

	return {
		user: sessionData?.user ?? null,
		session: sessionData?.session ?? null,
		isLoading: isPending,
		isAuthenticated: !!sessionData?.user,
		error,
		refetch,
	};
}

export type SessionUser = NonNullable<ReturnType<typeof useSession>["user"]>;
export type Session = NonNullable<ReturnType<typeof useSession>["session"]>;
