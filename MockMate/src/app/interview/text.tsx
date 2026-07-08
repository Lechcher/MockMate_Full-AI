import { router, Stack, useLocalSearchParams } from "expo-router";
import { MessageSquare, Send, SkipForward } from "lucide-react-native";
import { useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	Text,
	TextInput,
	View,
} from "react-native";

// Mock interview questions - will be fetched from API in production
const MOCK_QUESTIONS = [
	"Tell me about yourself and your background.",
	"What are your greatest strengths and how do they apply to this role?",
	"Describe a challenging situation you faced and how you overcame it.",
	"Where do you see yourself in five years?",
	"Why are you interested in this position?",
];

export default function TextInterviewScreen() {
	const params = useLocalSearchParams();
	const interviewId = params.id as string;
	const interviewTitle = params.title as string;

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answer, setAnswer] = useState("");
	const [answers, setAnswers] = useState<string[]>([]);

	const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
	const totalQuestions = MOCK_QUESTIONS.length;
	const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
	const minCharCount = 50;
	const isAnswerValid = answer.trim().length >= minCharCount;

	const handleSubmit = () => {
		if (!isAnswerValid) {
			Alert.alert(
				"Answer Too Short",
				`Please provide at least ${minCharCount} characters for a meaningful answer.`,
			);
			return;
		}

		const updatedAnswers = [...answers, answer];
		setAnswers(updatedAnswers);

		if (isLastQuestion) {
			// Navigate to results screen
			router.push({
				pathname: "/interview/results",
				params: {
					id: interviewId,
					title: interviewTitle,
					answers: JSON.stringify(updatedAnswers),
				},
			});
		} else {
			// Move to next question
			setCurrentQuestionIndex(currentQuestionIndex + 1);
			setAnswer("");
		}
	};

	const handleSkip = () => {
		const updatedAnswers = [...answers, ""];
		setAnswers(updatedAnswers);

		if (isLastQuestion) {
			router.push({
				pathname: "/interview/results",
				params: {
					id: interviewId,
					title: interviewTitle,
					answers: JSON.stringify(updatedAnswers),
				},
			});
		} else {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
			setAnswer("");
		}
	};

	return (
		<View className="flex-1 bg-gray-50">
			<Stack.Screen
				options={{
					title: interviewTitle || "Interview",
					headerBackTitle: "Back",
				}}
			/>

			<ScrollView className="flex-1">
				{/* Progress Header */}
				<View className="bg-white border-b border-gray-200 px-4 py-4">
					<View className="flex-row items-center justify-between mb-2">
						<View className="flex-row items-center gap-2">
							<MessageSquare size={20} color="#3b82f6" />
							<Text className="text-base font-semibold text-gray-900">
								Text Interview
							</Text>
						</View>
						<Text className="text-sm font-medium text-gray-600">
							Question {currentQuestionIndex + 1} of {totalQuestions}
						</Text>
					</View>

					{/* Progress Bar */}
					<View className="h-2 bg-gray-200 rounded-full overflow-hidden">
						<View
							className="h-full bg-blue-500"
							style={{
								width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
							}}
						/>
					</View>
				</View>

				{/* Question Display */}
				<View className="p-6 bg-white mx-4 mt-4 rounded-xl border border-gray-200 shadow-sm">
					<Text className="text-lg font-semibold text-gray-900 mb-2">
						Question {currentQuestionIndex + 1}
					</Text>
					<Text className="text-base leading-6 text-gray-700">
						{currentQuestion}
					</Text>
				</View>

				{/* Answer Input */}
				<View className="p-4">
					<Text className="text-sm font-medium text-gray-700 mb-2">
						Your Answer
					</Text>
					<TextInput
						className="bg-white border border-gray-300 rounded-lg p-4 text-base text-gray-900 min-h-[200px]"
						multiline
						textAlignVertical="top"
						placeholder="Type your answer here..."
						placeholderTextColor="#9ca3af"
						value={answer}
						onChangeText={setAnswer}
					/>

					{/* Character Count */}
					<Text
						className={`text-sm mt-2 ${
							isAnswerValid ? "text-green-600" : "text-gray-500"
						}`}
					>
						{answer.length} / {minCharCount} characters minimum
					</Text>
				</View>

				{/* Action Buttons */}
				<View className="px-4 pb-6 gap-3">
					<Pressable
						className={`py-4 rounded-lg items-center ${
							isAnswerValid ? "bg-blue-500 active:bg-blue-600" : "bg-gray-300"
						}`}
						onPress={handleSubmit}
						disabled={!isAnswerValid}
					>
						<View className="flex-row items-center gap-2">
							<Send size={20} color="white" />
							<Text className="text-white font-semibold text-base">
								{isLastQuestion ? "Finish Interview" : "Submit & Next"}
							</Text>
						</View>
					</Pressable>

					<Pressable
						className="py-4 rounded-lg items-center bg-white border border-gray-300 active:bg-gray-50"
						onPress={handleSkip}
					>
						<View className="flex-row items-center gap-2">
							<SkipForward size={20} color="#6b7280" />
							<Text className="text-gray-700 font-medium text-base">
								Skip Question
							</Text>
						</View>
					</Pressable>
				</View>
			</ScrollView>
		</View>
	);
}
