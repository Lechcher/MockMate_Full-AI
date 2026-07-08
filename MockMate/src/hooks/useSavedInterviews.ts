/**
 * useSavedInterviews hook
 *
 * Fetches user's saved/favorite interviews from API.
 * Returns the cached list plus `isFavorite(id)` and `toggleFavorite(id)`
 * convenience helpers so screens don't need a second mutation hook.
 *
 * Toggling uses an optimistic cache update, then POSTs/DELETEs and
 * invalidates the saved-interviews query on settle.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface SavedInterview {
	_id: string;
	userId: string;
	interviewId: string;
	savedAt: string;
}

export function useSavedInterviews() {
	const { getAccessToken, user } = useAuth();
	const queryClient = useQueryClient();

	const query = useQuery({
		queryKey: ["savedInterviews", user?.sub],
		queryFn: async () => {
			const token = await getAccessToken();
			const response = await fetch("/api/saved-interviews", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch saved interviews");
			}

			return response.json() as Promise<SavedInterview[]>;
		},
		enabled: !!user,
	});

	/** True if the given interview ID is in the user's saved list. */
	const isFavorite = (interviewId: string) =>
		!!query.data?.some((s) => s.interviewId === interviewId);

	/** Toggle a saved favorite. Optimistic with rollback on error. */
	const toggleFavorite = (interviewId: string) => {
		const wasSaved = isFavorite(interviewId);
		void queryClient.cancelQueries({ queryKey: ["savedInterviews"] });

		queryClient.setQueryData<SavedInterview[]>(
			["savedInterviews", user?.sub],
			(old) => {
				if (!old) return old;
				return wasSaved
					? old.filter((s) => s.interviewId !== interviewId)
					: [
							...old,
							{
								_id: `local-${interviewId}`,
								userId: user?.sub || "",
								interviewId,
								savedAt: new Date().toISOString(),
							},
						];
			},
		);

		void (async () => {
			try {
				const token = await getAccessToken();
				const res = wasSaved
					? await fetch(`/api/saved-interviews?interviewId=${interviewId}`, {
							method: "DELETE",
							headers: { Authorization: `Bearer ${token}` },
						})
					: await fetch("/api/saved-interviews", {
							method: "POST",
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ interviewId }),
						});
				if (!res.ok) throw new Error("Toggle request failed");
				queryClient.invalidateQueries({ queryKey: ["savedInterviews"] });
			} catch {
				// Roll back optimistic update
				queryClient.invalidateQueries({ queryKey: ["savedInterviews"] });
			}
		})();
	};

	return { ...query, toggleFavorite, isFavorite };
}

/**
 * useToggleSavedInterview - standalone mutation hook
 * Keeps the old API for callers that prefer explicit mutations.
 */
export function useToggleSavedInterview() {
	const { getAccessToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			interviewId,
			isSaved,
		}: {
			interviewId: string;
			isSaved: boolean;
		}) => {
			const token = await getAccessToken();

			if (isSaved) {
				const response = await fetch(
					`/api/saved-interviews?interviewId=${interviewId}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				if (!response.ok) {
					throw new Error("Failed to remove saved interview");
				}

				return response.json();
			}
			const response = await fetch("/api/saved-interviews", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ interviewId }),
			});

			if (!response.ok) {
				throw new Error("Failed to save interview");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["savedInterviews"] });
		},
	});
}
