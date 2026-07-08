/**
 * Interview mode selection screen
 */

import { Audio } from "expo-av";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Platform, Pressable, View } from "react-native";
import { Card } from "../../components/atoms/Card";
import { Icon } from "../../components/atoms/Icon";
import { Text } from "../../components/atoms/Text";

interface ModeCardProps {
	icon: string;
	title: string;
	description: string;
	features: string[];
	onPress: () => void;
}

function ModeCard({
	icon,
	title,
	description,
	features,
	onPress,
}: ModeCardProps) {
	return (
		<Pressable onPress={onPress}>
			<Card className="mb-4">
				<View className="items-center py-4">
					<View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
						<Icon name={icon} size={40} className="text-blue-600" />
					</View>

					<Text variant="heading" className="text-xl mb-2">
						{title}
					</Text>

					<Text variant="body" className="text-gray-600 text-center mb-4">
						{description}
					</Text>

					<View className="w-full">
						{features.map((feature, index) => (
							<View key={index} className="flex-row items-center mb-2">
								<Icon name="Check" size={16} className="text-green-500 mr-2" />
								<Text variant="body" className="text-gray-700 flex-1">
									{feature}
								</Text>
							</View>
						))}
					</View>
				</View>
			</Card>
		</Pressable>
	);
}

export default function InterviewModeScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const [isCheckingPermission, setIsCheckingPermission] = useState(false);

	const handleTextMode = () => {
		router.push({
			pathname: "/interview/text",
			params: { id },
		});
	};

	const handleVoiceMode = async () => {
		setIsCheckingPermission(true);

		try {
			// Request microphone permission
			const { status } = await Audio.requestPermissionsAsync();

			if (status === "granted") {
				// Permission granted, navigate to voice interview
				router.push({
					pathname: "/interview/voice",
					params: { id },
				});
			} else {
				// Permission denied
				Alert.alert(
					"Microphone Permission Required",
					"Voice mode requires microphone access to record your answers. Please enable microphone permission in your device settings.",
					[
						{ text: "Cancel", style: "cancel" },
						{
							text: "Open Settings",
							onPress: () => {
								// On iOS, this will open the app's settings
								// On Android, this will open the app info page
								if (Platform.OS === "ios") {
									Linking.openURL("app-settings:");
								} else {
									Linking.openSettings();
								}
							},
						},
					],
				);
			}
		} catch (error) {
			console.error("Error requesting microphone permission:", error);
			Alert.alert(
				"Error",
				"Failed to check microphone permission. Please try again.",
				[{ text: "OK" }],
			);
		} finally {
			setIsCheckingPermission(false);
		}
	};

	return (
		<>
			<Stack.Screen
				options={{
					title: "Choose Interview Mode",
				}}
			/>
			<View className="flex-1 bg-gray-50 px-4 pt-6">
				<Text variant="heading" className="text-2xl mb-2">
					How would you like to practice?
				</Text>
				<Text variant="body" className="text-gray-600 mb-6">
					Select your preferred interview mode
				</Text>

				<ModeCard
					icon="Type"
					title="Text Mode"
					description="Type your answers at your own pace"
					features={[
						"Perfect for thoughtful, detailed responses",
						"Edit and refine before submitting",
						"Great for improving writing skills",
						"No time pressure",
					]}
					onPress={handleTextMode}
				/>

				<ModeCard
					icon="Mic"
					title="Voice Mode"
					description="Speak your answers naturally"
					features={[
						"Simulate real interview conditions",
						"Practice verbal communication",
						"AI-powered speech recognition",
						"Build confidence speaking",
					]}
					onPress={handleVoiceMode}
				/>

				{isCheckingPermission && (
					<View className="absolute inset-0 bg-black/20 items-center justify-center">
						<View className="bg-white rounded-2xl p-6">
							<Text variant="body" className="text-gray-700">
								Checking microphone permission...
							</Text>
						</View>
					</View>
				)}
			</View>
		</>
	);
}
