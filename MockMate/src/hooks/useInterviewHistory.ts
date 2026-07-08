/**
 * useInterviewHistory hook
 *
 * Fetches user's interview completion history from Sanity.
 * Returns past completions with scores, feedback, and timestamps.
 *
 * @example
 * ```tsx
 * import { useInterviewHistory } from '@/hooks/useInterviewHistory';
 *
 * function HistoryScreen() {
 *   const { data: history, isLoading } = useInterviewHistory();
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *   if (!history?.length) return <Text>No interview history yet</Text>;
 *
 *   return (
 *     <FlatList
 *       data={history}
 *       renderItem={({ item }) => (
 *         <Card>
 *           <Text>{item.interviewTitle}</Text>
 *           <Text>Score: {item.score}%</Text>
 *           <Text>+{item.xpEarned} XP, +{item.gemsEarned} gems</Text>
 *         </Card>
 *       )}
 *     />
 *   );
 * }
 * ```
 *
 * @returns {UseQueryResult<InterviewHistoryEntry[]>} React Query result with history entries
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface InterviewHistoryEntry {
	_id: string;
	userId: string;
	interviewId: string;
	interviewTitle: string;
	mode: "text" | "voice";
	score: number;
	totalDuration: number;
	completedAt: string;
	xpEarned: number;
	gemsEarned: number;
}

interface CreateHistoryEntryData {
	interviewId: string;
	interviewTitle: string;
	mode: "text" | "voice";
	answers: any[];
	score: number;
	metrics: any;
	feedback: any[];
	totalDuration: number;
	xpEarned: number;
	gemsEarned: number;
}

export function useInterviewHistory() {
	const { getAccessToken, user } = useAuth();

	return useQuery({
		queryKey: ["interviewHistory", user?.sub],
		queryFn: async () => {
			const token = await getAccessToken();
			const response = await fetch("/api/interview-history", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch interview history");
			}

			return response.json() as Promise<InterviewHistoryEntry[]>;
		},
		enabled: !!user,
	});
}

/**
 * useCreateHistoryEntry hook
 *
 * Mutation hook for creating new interview history entries.
 * Automatically saves completion data to Sanity and invalidates history cache.
 *
 * @example
 * ```tsx
 * import { useCreateHistoryEntry } from '@/hooks/useInterviewHistory';
 *
 * function ResultsScreen() {
 *   const { mutate: saveHistory } = useCreateHistoryEntry();
 *
 *   useEffect(() => {
 *     saveHistory({
 *       interviewId: interview._id,
 *       interviewTitle: interview.title,
 *       mode: 'text',
 *       answers: userAnswers,
 *       score: 85,
 *       metrics: { avgResponseTime: 45 },
 *       feedback: aiFeedback,
 *       totalDuration: 600,
 *       xpEarned: 150,
 *       gemsEarned: 25,
 *     });
 *   }, []);
 * }
 * ```
 *
 * @returns {UseMutationResult} React Query mutation result
 */
export function useCreateHistoryEntry() {
	const { getAccessToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateHistoryEntryData) => {
			const token = await getAccessToken();
			const response = await fetch("/api/interview-history", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to create history entry");
			}

			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["interviewHistory"] });
		},
	});
}
