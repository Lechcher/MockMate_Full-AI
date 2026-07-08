/**
 * RequireAuth component
 *
 * Redirects to (auth)/welcome if user is not authenticated
 */

import { useRouter, useSegments } from "expo-router";
import { type ReactNode, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

interface RequireAuthProps {
	children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
	const { user, isLoading } = useAuth();
	const router = useRouter();
	const segments = useSegments();

	useEffect(() => {
		if (isLoading) return;

		const inAuthGroup = segments[0] === "(auth)";

		if (!user && !inAuthGroup) {
			// User not authenticated, redirect to welcome
			router.replace("/(auth)/welcome");
		} else if (user && inAuthGroup) {
			// User authenticated but still in auth group, redirect to tabs
			router.replace("/(tabs)");
		}
	}, [
		user,
		isLoading,
		segments, // User authenticated but still in auth group, redirect to tabs
		router.replace,
	]);

	// Show nothing while checking auth
	if (isLoading) {
		return null;
	}

	return <>{children}</>;
}
