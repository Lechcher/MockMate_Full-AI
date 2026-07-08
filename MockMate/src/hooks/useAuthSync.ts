/**
 * useAuthSync hook
 *
 * Synchronizes Auth0 user with Sanity backend on login.
 * Auto-creates user profile in Sanity on first login and hydrates
 * gamification state on subsequent logins.
 *
 * @example
 * ```tsx
 * import { useAuthSync } from '@/hooks/useAuthSync';
 *
 * function RootLayout() {
 *   const { isReady, isInitializing } = useAuthSync();
 *
 *   if (isInitializing) {
 *     return <Text>Setting up your profile...</Text>;
 *   }
 *
 *   if (!isReady) {
 *     return <Text>Loading...</Text>;
 *   }
 *
 *   return <AppContent />;
 * }
 * ```
 *
 * @returns {Object} Sync status
 * @returns {boolean} isReady - Whether user profile and state are fully loaded
 * @returns {boolean} isInitializing - Whether creating new user profile
 */

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useGamificationState } from "./useGamificationState";
import { useUserProfile } from "./useUserProfile";

export function useAuthSync() {
	const { user } = useAuth();
	const {
		data: profile,
		isLoading: profileLoading,
		error: profileError,
	} = useUserProfile();
	const { isLoading: gamificationLoading } = useGamificationState();
	const [isInitializing, setIsInitializing] = useState(false);

	useEffect(() => {
		const initializeProfile = async () => {
			if (!user || profileLoading || isInitializing) return;

			// If profile doesn't exist (404 error), create it
			if (profileError && !profile) {
				setIsInitializing(true);
				try {
					const { getAccessToken } = useAuth();
					const token = await getAccessToken();

					await fetch("/api/user-profile", {
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							userId: user.sub,
							email: user.email,
							name: user.name,
							picture: user.picture,
						}),
					});
				} catch (error) {
					console.error("Failed to create user profile:", error);
				} finally {
					setIsInitializing(false);
				}
			}
		};

		initializeProfile();
	}, [user, profile, profileLoading, profileError, isInitializing]);

	return {
		isReady:
			!!user &&
			!!profile &&
			!profileLoading &&
			!gamificationLoading &&
			!isInitializing,
		isInitializing,
	};
}
