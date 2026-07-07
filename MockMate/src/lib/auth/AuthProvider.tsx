/**
 * AuthProvider — Appwrite-backed auth context.
 *
 * Uses `useAppwrite(getCurrentUser)` to hydrate session on mount.
 * Dev bypass: renders children with no auth context when
 * EXPO_PUBLIC_DEV_AUTH_BYPASS="true".
 */

import { createContext, type ReactNode, useContext, useMemo } from "react";
import type { AppwriteUser } from "../../core/appwrite";
import { getCurrentUser } from "../../core/appwrite";
import { useAppwrite } from "../../hooks/useAppwrite";

interface AuthContextValue {
	user: AppwriteUser | null;
	isLoading: boolean;
	refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	isLoading: true,
	refetch: async () => {},
});

export function useAuthContext(): AuthContextValue {
	return useContext(AuthContext);
}

function AppwriteAuthProvider({ children }: { children: ReactNode }) {
	const {
		data: user,
		loading,
		refetch: rawRefetch,
	} = useAppwrite({ fn: getCurrentUser });

	const refetch = useMemo(() => () => rawRefetch({}), [rawRefetch]);

	return (
		<AuthContext.Provider value={{ user, isLoading: loading, refetch }}>
			{children}
		</AuthContext.Provider>
	);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const bypass = process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS === "true";

	if (bypass) {
		return <>{children}</>;
	}

	return <AppwriteAuthProvider>{children}</AppwriteAuthProvider>;
}
