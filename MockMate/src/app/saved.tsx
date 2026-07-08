/**
 * Saved Interviews screen
 *
 * Saved list contains interview IDs only. Join server-side via the public
 * Sanity CDN client (`useInterviews`) to hydrate the cards.
 */

import { router, Stack } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Icon } from "../components/atoms/Icon";
import { Text } from "../components/atoms/Text";
import { InterviewCard } from "../components/molecules/InterviewCard";
import { useInterviews } from "../hooks/useInterviews";
import { useSavedInterviews } from "../hooks/useSavedInterviews";

export default function SavedScreen() {
	const { data: saved, isLoading: savedLoading } = useSavedInterviews();
	const { data: interviews, isLoading: interviewsLoading } = useInterviews();
	const { toggleFavorite, isFavorite } = useSavedInterviews();

	const savedInterviews = useMemo(() => {
		if (!saved || !interviews) return [];
		const idSet = new Set(saved.map((s) => s.interviewId));
		return interviews.filter((i) => idSet.has(i._id));
	}, [saved, interviews]);

	const handleInterviewPress = (interviewId: string) => {
		router.push({
			pathname: "/interview/[id]",
			params: { id: interviewId },
		});
	};

	const isLoading = savedLoading || interviewsLoading;

	return (
		<View className="flex-1 bg-gray-50">
			<Stack.Screen
				options={{
					title: "Saved Interviews",
					headerBackTitle: "Back",
				}}
			/>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text variant="body" className="text-gray-600">
						Loading...
					</Text>
				</View>
			) : savedInterviews.length > 0 ? (
				<FlatList
					data={savedInterviews}
					keyExtractor={(item) => item._id}
					contentContainerClassName="p-4"
					renderItem={({ item }) => (
						<InterviewCard
							interview={item}
							isFavorite={isFavorite(item._id)}
							onPress={() => handleInterviewPress(item._id)}
							onFavoriteToggle={() => toggleFavorite(item._id)}
						/>
					)}
				/>
			) : (
				<View className="flex-1 items-center justify-center px-6">
					<View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
						<Icon name="Bookmark" size={40} className="text-gray-400" />
					</View>
					<Text variant="heading" className="text-xl mb-2 text-center">
						No Saved Interviews
					</Text>
					<Text variant="body" className="text-gray-600 text-center mb-6">
						Tap the bookmark icon on any interview to save it for later.
					</Text>
					<Pressable
						className="px-6 py-3 bg-blue-500 rounded-lg active:bg-blue-600"
						onPress={() => router.push("/(tabs)")}
					>
						<Text variant="body" className="text-white font-semibold">
							Browse Interviews
						</Text>
					</Pressable>
				</View>
			)}
		</View>
	);
}
