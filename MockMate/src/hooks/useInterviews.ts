/**
 * useInterviews hook
 *
 * Fetches all interviews from Sanity CDN with caching via React Query.
 * Returns validated interview data with industry, difficulty, and questions.
 *
 * @example
 * ```tsx
 * import { useInterviews } from '@/hooks/useInterviews';
 *
 * function ExploreScreen() {
 *   const { data: interviews, isLoading } = useInterviews();
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *
 *   return (
 *     <FlatList
 *       data={interviews}
 *       renderItem={({ item }) => <InterviewCard interview={item} />}
 *     />
 *   );
 * }
 * ```
 *
 * @returns {UseQueryResult<Interview[]>} React Query result with interview array
 */

import { useQuery } from "@tanstack/react-query";
import { publicClient } from "../lib/sanity/client";
import { InterviewSchema } from "../schemas/interview";
import type { Interview } from "../types/interview";

const INTERVIEWS_QUERY = `*[_type == "interview"] | order(createdAt desc) {
  _id,
  _type,
  title,
  industry,
  difficulty,
  focusArea,
  description,
  questionCount,
  estimatedDuration,
  rating,
  reviewCount,
  isPremium,
  questions[] {
    _key,
    question,
    expectedDuration,
    focusAreas,
    evaluationCriteria
  },
  createdAt,
  updatedAt
}`;

export function useInterviews() {
	return useQuery({
		queryKey: ["interviews"],
		queryFn: async () => {
			const data = await publicClient.fetch(INTERVIEWS_QUERY);
			// Validate with Zod
			return data.map((item: unknown) =>
				InterviewSchema.parse(item),
			) as Interview[];
		},
	});
}

/**
 * useInterview hook
 *
 * Fetches a single interview by ID from the cached interviews list.
 * More efficient than a separate query since it reuses existing data.
 *
 * @example
 * ```tsx
 * import { useInterview } from '@/hooks/useInterviews';
 *
 * function InterviewDetailScreen({ id }: { id: string }) {
 *   const { data: interview, isLoading } = useInterview(id);
 *
 *   if (isLoading) return <Text>Loading...</Text>;
 *   if (!interview) return <Text>Interview not found</Text>;
 *
 *   return (
 *     <View>
 *       <Text>{interview.title}</Text>
 *       <Text>{interview.industry}</Text>
 *     </View>
 *   );
 * }
 * ```
 *
 * @param {string} id - Interview document ID
 * @returns {UseQueryResult<Interview | undefined>} React Query result with single interview
 */
export function useInterview(id: string) {
	const { data: interviews, ...rest } = useInterviews();

	return {
		data: interviews?.find((interview) => interview._id === id),
		...rest,
	};
}
