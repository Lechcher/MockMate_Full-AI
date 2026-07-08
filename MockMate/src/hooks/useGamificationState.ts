/**
 * useGamificationState hook
 *
 * Fetches user's gamification state (XP, level, gems, streak, quests) from server
 * and automatically syncs it to the Zustand store for app-wide access.
 *
 * @example
 * ```tsx
 * import { useGamificationState } from '@/hooks/useGamificationState';
 *
 * function ProfileScreen() {
 *   const { data: state, isLoading } = useGamificationState();
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *
 *   return (
 *     <View>
 *       <Text>Level {state.level}</Text>
 *       <Text>XP: {state.xp}</Text>
 *       <Text>Gems: {state.gems}</Text>
 *       <Text>Streak: {state.streak} days</Text>
 *     </View>
 *   );
 * }
 * ```
 *
 * @returns {UseQueryResult<GamificationState>} React Query result with gamification state
 */

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useGamificationStore } from "../stores/gamificationStore";
import type { GamificationState } from "../types/user";
import { useAuth } from "./useAuth";

export function useGamificationState() {
	const { getAccessToken, user } = useAuth();
	const setGamification = useGamificationStore(
		(state) => state.setGamification,
	);

	const query = useQuery({
		queryKey: ["gamificationState", user?.sub],
		queryFn: async () => {
			const token = await getAccessToken();
			const response = await fetch("/api/gamification/state", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch gamification state");
			}

			return response.json() as Promise<GamificationState>;
		},
		enabled: !!user,
	});

	// Hydrate Zustand store when data is fetched
	useEffect(() => {
		if (query.data) {
			setGamification(query.data);
		}
	}, [query.data, setGamification]);

	return query;
}
