/**
 * Explore tab screen
 */

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, TextInput, View } from "react-native";
import { Icon } from "../../components/atoms/Icon";
import { SkeletonInterviewCard } from "../../components/atoms/Skeleton";
import { Text } from "../../components/atoms/Text";
import { InterviewCard } from "../../components/molecules/InterviewCard";
import { useInterviews } from "../../hooks/useInterviews";
import { useSavedInterviews } from "../../hooks/useSavedInterviews";
import type { Difficulty, Industry } from "../../types/interview";

const INDUSTRIES: Industry[] = [
	"IT",
	"Sales",
	"Finance",
	"Design",
	"Manager",
	"Marketing",
	"Healthcare",
	"Education",
];

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function ExploreScreen() {
	const router = useRouter();
	const { data: interviews, isLoading } = useInterviews();
	const { toggleFavorite, isFavorite } = useSavedInterviews();

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(
		null,
	);
	const [selectedDifficulty, setSelectedDifficulty] =
		useState<Difficulty | null>(null);

	// Combined filter logic
	const filteredInterviews = useMemo(() => {
		if (!interviews) return [];

		return interviews.filter((interview) => {
			// Search filter (title, industry, focus area)
			const matchesSearch =
				searchQuery.trim() === "" ||
				interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				interview.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
				interview.focusArea.toLowerCase().includes(searchQuery.toLowerCase());

			// Industry filter
			const matchesIndustry =
				!selectedIndustry || interview.industry === selectedIndustry;

			// Difficulty filter
			const matchesDifficulty =
				!selectedDifficulty || interview.difficulty === selectedDifficulty;

			return matchesSearch && matchesIndustry && matchesDifficulty;
		});
	}, [interviews, searchQuery, selectedIndustry, selectedDifficulty]);

	const handleInterviewPress = (interviewId: string) => {
		router.push(`/interview/${interviewId}`);
	};

	const handleFavoriteToggle = (interviewId: string) => {
		toggleFavorite(interviewId);
	};

	const handleIndustryToggle = (industry: Industry) => {
		setSelectedIndustry(selectedIndustry === industry ? null : industry);
	};

	const handleDifficultyToggle = (difficulty: Difficulty) => {
		setSelectedDifficulty(
			selectedDifficulty === difficulty ? null : difficulty,
		);
	};

	const clearAllFilters = () => {
		setSearchQuery("");
		setSelectedIndustry(null);
		setSelectedDifficulty(null);
	};

	const hasActiveFilters =
		searchQuery.trim() !== "" ||
		selectedIndustry !== null ||
		selectedDifficulty !== null;

	return (
		<View className="flex-1 bg-gray-50">
			{/* Header */}
			<View className="bg-white border-b border-gray-200 px-4 pt-4 pb-3">
				<Text variant="heading" className="text-2xl mb-4">
					Explore Interviews
				</Text>

				{/* Search Input */}
				<View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-3">
					<Icon name="Search" size={20} className="text-gray-500 mr-2" />
					<TextInput
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholder="Search interviews..."
						placeholderTextColor="#9CA3AF"
						className="flex-1 text-base text-gray-900"
						returnKeyType="search"
					/>
					{searchQuery.trim() !== "" && (
						<Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
							<Icon name="X" size={18} className="text-gray-500" />
						</Pressable>
					)}
				</View>

				{/* Industry Filter Chips */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="mb-2"
				>
					{INDUSTRIES.map((industry) => (
						<Pressable
							key={industry}
							onPress={() => handleIndustryToggle(industry)}
							className="mr-2"
						>
							<View
								className={`px-4 py-2 rounded-full border ${
									selectedIndustry === industry
										? "bg-blue-600 border-blue-600"
										: "bg-white border-gray-300"
								}`}
							>
								<Text
									variant="body"
									className={`${
										selectedIndustry === industry
											? "text-white"
											: "text-gray-700"
									} font-medium`}
								>
									{industry}
								</Text>
							</View>
						</Pressable>
					))}
				</ScrollView>

				{/* Difficulty Filter Chips */}
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center gap-2">
						{DIFFICULTIES.map((difficulty) => (
							<Pressable
								key={difficulty}
								onPress={() => handleDifficultyToggle(difficulty)}
							>
								<View
									className={`px-3 py-1.5 rounded-full border ${
										selectedDifficulty === difficulty
											? "bg-purple-600 border-purple-600"
											: "bg-white border-gray-300"
									}`}
								>
									<Text
										variant="caption"
										className={`${
											selectedDifficulty === difficulty
												? "text-white"
												: "text-gray-700"
										} font-medium capitalize`}
									>
										{difficulty}
									</Text>
								</View>
							</Pressable>
						))}
					</View>

					{hasActiveFilters && (
						<Pressable onPress={clearAllFilters}>
							<Text variant="body" className="text-blue-600 font-medium">
								Clear All
							</Text>
						</Pressable>
					)}
				</View>
			</View>

			{/* Results */}
			{isLoading ? (
				<FlatList
					data={[1, 2, 3, 4, 5]}
					contentContainerStyle={{ padding: 16 }}
					showsVerticalScrollIndicator={false}
					renderItem={() => <SkeletonInterviewCard />}
					keyExtractor={(item) => `skeleton-${item}`}
				/>
			) : filteredInterviews.length === 0 ? (
				<View className="flex-1 items-center justify-center px-6">
					<Icon name="Search" size={64} className="text-gray-300 mb-4" />
					<Text variant="heading" className="text-xl mb-2 text-center">
						No interviews found
					</Text>
					<Text variant="body" className="text-gray-500 text-center mb-4">
						{hasActiveFilters
							? "Try adjusting your filters or search query"
							: "No interviews available yet"}
					</Text>
					{hasActiveFilters && (
						<Pressable onPress={clearAllFilters}>
							<Text variant="body" className="text-blue-600 font-medium">
								Clear All Filters
							</Text>
						</Pressable>
					)}
				</View>
			) : (
				<FlatList
					data={filteredInterviews}
					numColumns={1}
					contentContainerStyle={{ padding: 16 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<InterviewCard
							interview={item}
							isFavorite={isFavorite(item._id)}
							onPress={() => handleInterviewPress(item._id)}
							onFavoriteToggle={() => handleFavoriteToggle(item._id)}
						/>
					)}
					keyExtractor={(item) => item._id}
					ListHeaderComponent={
						<View className="mb-2">
							<Text variant="body" className="text-gray-600">
								{filteredInterviews.length} interview
								{filteredInterviews.length !== 1 ? "s" : ""} found
							</Text>
						</View>
					}
				/>
			)}
		</View>
	);
}
