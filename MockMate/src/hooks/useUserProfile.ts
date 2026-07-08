/**
 * useUserProfile hook
 *
 * Fetches and manages user profile data from Sanity via JWT-guarded API routes.
 * Automatically syncs with Auth0 user identity and provides real-time updates.
 *
 * @example
 * ```tsx
 * import { useUserProfile } from '@/hooks/useUserProfile';
 *
 * function ProfileScreen() {
 *   const { data: profile, isLoading, error } = useUserProfile();
 *
 *   if (isLoading) return <Text>Loading profile...</Text>;
 *   if (error) return <Text>Error: {error.message}</Text>;
 *
 *   return (
 *     <View>
 *       <Text>XP: {profile.xp}</Text>
 *       <Text>Level: {profile.level}</Text>
 *       <Text>Gems: {profile.gems}</Text>
 *     </View>
 *   );
 * }
 * ```
 *
 * @returns {UseQueryResult<UserProfile>} React Query result with user profile data
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserProfileSchema } from "../schemas/user";
import type { UserProfile } from "../types/user";
import { useAuth } from "./useAuth";

export function useUserProfile() {
	const { getAccessToken, user } = useAuth();

	return useQuery({
		queryKey: ["userProfile", user?.sub],
		queryFn: async () => {
			const token = await getAccessToken();
			const response = await fetch("/api/user-profile", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch user profile");
			}

			const data = await response.json();
			return UserProfileSchema.parse(data) as UserProfile;
		},
		enabled: !!user,
	});
}

/**
 * useUpdateUserProfile hook
 *
 * Mutation hook for updating user profile data in Sanity.
 * Automatically invalidates cached profile data on success.
 *
 * @example
 * ```tsx
 * import { useUpdateUserProfile } from '@/hooks/useUserProfile';
 *
 * function SettingsScreen() {
 *   const { mutate: updateProfile, isPending } = useUpdateUserProfile();
 *
 *   const handleUpdateName = (name: string) => {
 *     updateProfile({ name }, {
 *       onSuccess: () => {
 *         Alert.alert('Success', 'Profile updated!');
 *       },
 *       onError: (error) => {
 *         Alert.alert('Error', error.message);
 *       },
 *     });
 *   };
 *
 *   return (
 *     <Button onPress={() => handleUpdateName('New Name')} disabled={isPending}>
 *       Update Name
 *     </Button>
 *   );
 * }
 * ```
 *
 * @returns {UseMutationResult} React Query mutation result
 */
export function useUpdateUserProfile() {
	const { getAccessToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (updates: Partial<UserProfile>) => {
			const token = await getAccessToken();
			const response = await fetch("/api/user-profile", {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error("Failed to update user profile");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
		},
	});
}
