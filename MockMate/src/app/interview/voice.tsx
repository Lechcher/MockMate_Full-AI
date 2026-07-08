import { router, Stack, useLocalSearchParams } from "expo-router";
import {
	Mic,
	RotateCcw,
	Send,
	SkipForward,
	Volume2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useSTT } from "../../hooks/useSTT";
import { useTTS } from "../../hooks/useTTS";

// Mock interview questions - will be fetched from API in production
const MOCK_QUESTIONS = [
	"Tell me about yourself and your background.",
	"What are your greatest strengths and how do they apply to this role?",
	"Describe a challenging situation you faced and how you overcame it.",
	"Where do you see yourself in five years?",
	"Why are you interested in this position?",
];

export default function VoiceInterviewScreen() {
	const params = useLocalSearchParams();
	const interviewId = params.id as string;
	const interviewTitle = params.title as string;

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [transcribedText, setTranscribedText] = useState("");
	const [answers, setAnswers] = useState<string[]>([]);
	const [recordingTime, setRecordingTime] = useState(0);

	const { generateAndPlay, stop: stopTTS, isGenerating } = useTTS();
	const { startRecording, stopRecording, transcribeAudio, isRecording } =
		useSTT();

	const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
	const totalQuestions = MOCK_QUESTIONS.length;
	const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

	// Auto-play question on mount and question change
	useEffect(() => {
		handlePlayQuestion();
	}, [handlePlayQuestion]);

	// Recording timer
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | undefined;
		if (isRecording) {
			interval = setInterval(() => {
				setRecordingTime((prev) => prev + 1);
			}, 1000);
		} else {
			setRecordingTime(0);
		}
		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isRecording]);

	const handlePlayQuestion = async () => {
		try {
			await generateAndPlay(currentQuestion);
		} catch (_error) {
			Alert.alert("Error", "Failed to play question audio");
		}
	};

	const handleStartRecording = async () => {
		setTranscribedText("");
		await startRecording();
	};

	const handleStopRecording = async () => {
		const audioUri = await stopRecording();
		if (audioUri) {
			try {
				const result = await transcribeAudio(audioUri);
				// Accept either the typed object or a raw transcript string
				const text =
					typeof result === "string"
						? result
						: ((result as { text?: string })?.text ?? "");
				setTranscribedText(text);
			} catch (_error) {
				Alert.alert("Error", "Failed to transcribe audio");
			}
		}
	};

	const handleReRecord = () => {
		setTranscribedText("");
	};

	const handleSubmit = () => {
		if (!transcribedText.trim()) {
			Alert.alert("No Answer", "Please record your answer before submitting.");
			return;
		}

		const updatedAnswers = [...answers, transcribedText];
		setAnswers(updatedAnswers);

		if (isLastQuestion) {
			stopTTS();
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
			setTranscribedText("");
		}
	};

	const handleSkip = () => {
		const updatedAnswers = [...answers, ""];
		setAnswers(updatedAnswers);

		if (isLastQuestion) {
			stopTTS();
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
			setTranscribedText("");
		}
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
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
							<Volume2 size={20} color="#3b82f6" />
							<Text className="text-base font-semibold text-gray-900">
								Voice Interview
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
					<Text className="text-base leading-6 text-gray-700 mb-4">
						{currentQuestion}
					</Text>

					{/* Listen Again Button */}
					<Pressable
						className="flex-row items-center justify-center gap-2 py-3 bg-blue-50 rounded-lg active:bg-blue-100"
						onPress={handlePlayQuestion}
						disabled={isGenerating}
					>
						<Volume2 size={20} color="#3b82f6" />
						<Text className="text-blue-600 font-medium">
							{isGenerating ? "Playing..." : "Listen Again"}
						</Text>
					</Pressable>
				</View>

				{/* Recording Section */}
				<View className="p-4">
					<Text className="text-sm font-medium text-gray-700 mb-3">
						Your Answer
					</Text>

					{/* Recording Button */}
					{!transcribedText && (
						<View className="items-center py-8">
							<Pressable
								className={`w-24 h-24 rounded-full items-center justify-center ${
									isRecording
										? "bg-red-500 active:bg-red-600"
										: "bg-blue-500 active:bg-blue-600"
								}`}
								onPress={
									isRecording ? handleStopRecording : handleStartRecording
								}
							>
								<Mic size={40} color="white" />
							</Pressable>

							{/* Recording Timer */}
							{isRecording && (
								<View className="mt-4 items-center">
									<Text className="text-2xl font-bold text-red-500">
										{formatTime(recordingTime)}
									</Text>
									<Text className="text-sm text-gray-600 mt-1">
										Recording...
									</Text>

									{/* Waveform Animation */}
									<View className="flex-row items-center gap-1 mt-4">
										{[1, 2, 3, 4, 5].map((i) => (
											<View
												key={i}
												className="w-1 bg-red-500 rounded-full"
												style={{
													height: 20 + Math.random() * 20,
												}}
											/>
										))}
									</View>
								</View>
							)}

							{!isRecording && (
								<Text className="text-gray-600 mt-4 text-center">
									Tap to record your answer
								</Text>
							)}
						</View>
					)}

					{/* Transcribed Text Display */}
					{transcribedText && (
						<View className="bg-white border border-gray-300 rounded-lg p-4">
							<Text className="text-base text-gray-900 leading-6">
								{transcribedText}
							</Text>
						</View>
					)}
				</View>

				{/* Action Buttons */}
				<View className="px-4 pb-6 gap-3">
					{transcribedText ? (
						<>
							<Pressable
								className="py-4 rounded-lg items-center bg-blue-500 active:bg-blue-600"
								onPress={handleSubmit}
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
								onPress={handleReRecord}
							>
								<View className="flex-row items-center gap-2">
									<RotateCcw size={20} color="#6b7280" />
									<Text className="text-gray-700 font-medium text-base">
										Re-record Answer
									</Text>
								</View>
							</Pressable>
						</>
					) : (
						<Pressable
							className="py-4 rounded-lg items-center bg-white border border-gray-300 active:bg-gray-50"
							onPress={handleSkip}
							disabled={isRecording}
						>
							<View className="flex-row items-center gap-2">
								<SkipForward size={20} color="#6b7280" />
								<Text className="text-gray-700 font-medium text-base">
									Skip Question
								</Text>
							</View>
						</Pressable>
					)}
				</View>
			</ScrollView>
		</View>
	);
}
