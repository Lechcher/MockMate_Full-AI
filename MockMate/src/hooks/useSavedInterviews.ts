/**
 * useSavedInterviews hook
 * 
 * Fetches user's saved/favorite interviews from API.
 * Returns list of saved interview references with timestamps.
 * 
 * @example
 * ```tsx
 * import { useSavedInterviews } from '@/hooks/useSavedInterviews';
 * 
 * function SavedScreen() {
 *   const { data: saved, isLoading } = useSavedInterviews();
 * 
 *   if (isLoading) return <Text>Loading...</Text>;
 *   if (!saved?.length) return <Text>No saved interviews</Text>;
 * 
 *   return (
 *     <FlatList
 *       data={saved}
 *       renderItem={({ item }) => <InterviewCard interviewId={item.interviewId} />}
 *     />
 *   );
 * }
 * ```
 * 
 * @returns {UseQueryResult<SavedInterview[]>} React Query result with saved interviews
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { Interview } from '../types/interview';

interface SavedInterview {
  _id: string;
  userId: string;
  interviewId: string;
  savedAt: string;
}

export function useSavedInterviews() {
  const { getAccessToken, user } = useAuth();

  return useQuery({
    queryKey: ['savedInterviews', user?.sub],
    queryFn: async () => {
      const token = await getAccessToken();
      const response = await fetch('/api/saved-interviews', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saved interviews');
      }

      return response.json() as Promise<SavedInterview[]>;
    },
    enabled: !!user,
  });
}

/**
 * useToggleSavedInterview hook
 * 
 * Mutation hook for adding/removing interviews from favorites.
 * Automatically invalidates saved interviews cache on success.
 * 
 * @example
 * ```tsx
 * import { useToggleSavedInterview } from '@/hooks/useSavedInterviews';
 * 
 * function InterviewCard({ interview, isSaved }: Props) {
 *   const { mutate: toggleSaved } = useToggleSavedInterview();
 * 
 *   const handleToggle = () => {
 *     toggleSaved({ interviewId: interview._id, isSaved });
 *   };
 * 
 *   return (
 *     <Button onPress={handleToggle}>
 *       {isSaved ? 'Remove from Saved' : 'Save Interview'}
 *     </Button>
 *   );
 * }
 * ```
 * 
 * @returns {UseMutationResult} React Query mutation result
 */
export function useToggleSavedInterview() {
  const { getAccessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ interviewId, isSaved }: { interviewId: string; isSaved: boolean }) => {
      const token = await getAccessToken();

      if (isSaved) {
        // Remove from saved
        const response = await fetch(`/api/saved-interviews?interviewId=${interviewId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to remove saved interview');
        }

        return response.json();
      } else {
        // Add to saved
        const response = await fetch('/api/saved-interviews', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ interviewId }),
        });

        if (!response.ok) {
          throw new Error('Failed to save interview');
        }

        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedInterviews'] });
    },
  });
}
