/**
 * Interview results screen
 *
 * Mocked AI feedback in MVP. On mount:
 *   - addXP/addGems/incrementStreak in Zustand
 *   - POSTs to /api/interview-history (server-side Sanity)
 *   - POSTs to /api/gamification/award to persist rewards
 */

import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Button } from "../../components/atoms/Button";
import { Icon } from "../../components/atoms/Icon";
import { Text } from "../../components/atoms/Text";
import { useAuth } from "../../hooks/useAuth";
import { useGamificationStore } from "../../stores/gamificationStore";

const MOCK_FEEDBACK = {
	overallScore: 85,
	rating: "Excellent",
	xpEarned: 150,
	gemsEarned: 25,
	strengths: [
		"Clear and concise communication",
		"Strong examples from past experience",
		"Confident delivery and tone",
	],
	improvements: [
		"Provide more specific metrics in answers",
		"Elaborate more on technical skills",
	],
	questionFeedback: [
		{
			question: "Tell me about yourself and your background.",
			score: 90,
			feedback:
				"Great introduction with clear career progression. Consider adding more specific achievements.",
		},
		{
			question: "What are your greatest strengths?",
			score: 85,
			feedback:
				"Good self-awareness. Examples were relevant but could be more detailed.",
		},
		{
			question: "Describe a challenging situation.",
			score: 80,
			feedback:
				"Good structure using STAR method. Impact could be quantified better.",
		},
	],
};

export default function ResultsScreen() {
	const params = useLocalSearchParams();
	const interviewId = (params.id as string) ?? "";
	const interviewTitle = (params.title as string) ?? "Interview";
	const answersJson = (params.answers as string) ?? "[]";
	const mode = (params.mode as string) ?? "text";

	const [showDetailedFeedback, setShowDetailedFeedback] = useState(false);

	const { addXP, addGems, incrementStreak } = useGamificationStore();
	const { getAccessToken } = useAuth();

	// Award XP, gems, streak, and persist completion on mount
	useEffect(() => {
		let cancelled = false;

		const persist = async () => {
			let answers: string[] = [];
			try {
				answers = JSON.parse(answersJson);
			} catch {
				answers = [];
			}

			// Optimistic local store updates
			addXP(MOCK_FEEDBACK.xpEarned);
			addGems(MOCK_FEEDBACK.gemsEarned);
			incrementStreak();

			try {
				const token = await getAccessToken();

				// Save completion to /api/interview-history
				await fetch("/api/interview-history", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						interviewId,
						interviewTitle,
						mode,
						answers,
						score: MOCK_FEEDBACK.overallScore,
						feedback: MOCK_FEEDBACK,
						totalDuration: 0,
						xpEarned: MOCK_FEEDBACK.xpEarned,
						gemsEarned: MOCK_FEEDBACK.gemsEarned,
					}),
				});

				// Persist rewards to /api/gamification/award
				await fetch("/api/gamification/award", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						xpDelta: MOCK_FEEDBACK.xpEarned,
						gemsDelta: MOCK_FEEDBACK.gemsEarned,
						incrementStreak: true,
					}),
				});
			} catch (err) {
				console.warn("Background reward persist failed:", err);
			}

			if (cancelled) return;
		};

		void persist();
		return () => {
			cancelled = true;
		};
	}, [
		interviewId,
		interviewTitle,
		answersJson,
		mode,
		addXP,
		addGems,
		incrementStreak,
		getAccessToken,
	]);

	const getRatingColor = (rating: string) => {
		switch (rating) {
			case "Excellent":
				return "text-green-600";
			case "Good":
				return "text-blue-600";
			case "Fair":
				return "text-yellow-600";
			default:
				return "text-gray-600";
		}
	};

	const handlePracticeAgain = useCallback(() => {
		router.replace({
			pathname: "/interview/mode",
			params: { id: interviewId, title: interviewTitle },
		});
	}, [interviewId, interviewTitle]);

	const handleBackToHome = useCallback(() => {
		router.replace("/(tabs)");
	}, []);

	return (
		<View className="flex-1 bg-gray-50">
			<Stack.Screen
				options={{
					title: "Interview Results",
					headerBackTitle: "Back",
					headerLeft: () => null,
				}}
			/>

			<ScrollView className="flex-1">
				{/* Success Header */}
				<View className="bg-gradient-to-b from-green-50 to-white px-6 py-8 items-center border-b border-gray-200">
					<View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
						<Icon name="Trophy" size={40} className="text-green-600" />
					</View>
					<Text variant="heading" className="text-2xl mb-2">
						Interview Complete!
					</Text>
					<Text variant="body" className="text-gray-600 text-center">
						{interviewTitle}
					</Text>
				</View>

				{/* Score Card */}
				<View className="mx-4 mt-4 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
					<View className="items-center mb-6">
						<Text variant="heading" className="text-6xl mb-2">
							{MOCK_FEEDBACK.overallScore}
						</Text>
						<Text
							variant="subheading"
							className={`${getRatingColor(MOCK_FEEDBACK.rating)} font-semibold`}
						>
							{MOCK_FEEDBACK.rating}
						</Text>
					</View>

					{/* Rewards */}
					<View className="flex-row justify-around pt-4 border-t border-gray-200">
						<View className="items-center">
							<View className="flex-row items-center gap-2 mb-1">
								<Icon name="Sparkles" size={20} className="text-blue-500" />
								<Text variant="heading" className="text-2xl text-blue-600">
									+{MOCK_FEEDBACK.xpEarned}
								</Text>
							</View>
							<Text variant="caption" className="text-gray-600">
								XP Earned
							</Text>
						</View>

						<View className="items-center">
							<View className="flex-row items-center gap-2 mb-1">
								<Icon name="Gem" size={20} className="text-amber-500" />
								<Text variant="heading" className="text-2xl text-amber-600">
									+{MOCK_FEEDBACK.gemsEarned}
								</Text>
							</View>
							<Text variant="caption" className="text-gray-600">
								Gems Earned
							</Text>
						</View>
					</View>
				</View>

				{/* Strengths */}
				<View className="mx-4 mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
					<View className="flex-row items-center gap-2 mb-3">
						<Icon name="TrendingUp" size={20} className="text-green-600" />
						<Text variant="subheading" className="text-lg">
							Your Strengths
						</Text>
					</View>
					{MOCK_FEEDBACK.strengths.map((strength) => (
						<View key={strength} className="flex-row items-start gap-2 mb-2">
							<Text className="text-green-600 mt-1">✓</Text>
							<Text variant="body" className="flex-1 text-gray-700">
								{strength}
							</Text>
						</View>
					))}
				</View>

				{/* Improvements */}
				<View className="mx-4 mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
					<View className="flex-row items-center gap-2 mb-3">
						<Icon name="AlertCircle" size={20} className="text-amber-500" />
						<Text variant="subheading" className="text-lg">
							Areas for Improvement
						</Text>
					</View>
					{MOCK_FEEDBACK.improvements.map((improvement) => (
						<View key={improvement} className="flex-row items-start gap-2 mb-2">
							<Text className="text-amber-600 mt-1">•</Text>
							<Text variant="body" className="flex-1 text-gray-700">
								{improvement}
							</Text>
						</View>
					))}
				</View>

				{/* Detailed Feedback Toggle */}
				<View className="mx-4 mt-4">
					<Pressable
						className="py-3 bg-blue-50 rounded-lg items-center active:bg-blue-100"
						onPress={() => setShowDetailedFeedback((s) => !s)}
					>
						<Text variant="body" className="text-blue-600 font-medium">
							{showDetailedFeedback ? "Hide" : "View"} Detailed Feedback
						</Text>
					</Pressable>
				</View>

				{showDetailedFeedback && (
					<View className="mx-4 mt-4 mb-4">
						{MOCK_FEEDBACK.questionFeedback.map((item, i) => (
							<View
								key={`${item.question}-${i}`}
								className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm mb-3"
							>
								<View className="flex-row items-center justify-between mb-2">
									<Text variant="body" className="font-semibold text-gray-900">
										Question {i + 1}
									</Text>
									<View className="px-3 py-1 bg-blue-100 rounded-full">
										<Text variant="caption" className="font-bold text-blue-600">
											{item.score}
										</Text>
									</View>
								</View>
								<Text variant="body" className="text-gray-700 mb-2">
									{item.question}
								</Text>
								<Text variant="caption" className="text-gray-600 italic">
									{item.feedback}
								</Text>
							</View>
						))}
					</View>
				)}

				{/* Action Buttons */}
				<View className="px-4 py-6 gap-3">
					<Button
						onPress={handlePracticeAgain}
						variant="primary"
						className="w-full"
					>
						<View className="flex-row items-center justify-center gap-2">
							<Icon name="RotateCcw" size={20} className="text-white" />
							<Text variant="body" className="text-white font-semibold">
								Practice Again
							</Text>
						</View>
					</Button>

					<Button
						onPress={handleBackToHome}
						variant="outline"
						className="w-full"
					>
						<View className="flex-row items-center justify-center gap-2">
							<Icon name="Home" size={20} className="text-gray-700" />
							<Text variant="body" className="text-gray-700 font-medium">
								Back to Home
							</Text>
						</View>
					</Button>
				</View>
			</ScrollView>
		</View>
	);
}
