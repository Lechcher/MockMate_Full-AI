/**
 * Welcome screen - Google OAuth login (Figma "Welcome & Login" 5:644)
 */

import { useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/atoms/Button";
import { Icon } from "../../components/atoms/Icon";
import { Text } from "../../components/atoms/Text";
import { useAuth } from "../../hooks/useAuth";

const heroIllustration = require("../../../assets/images/Wellcome & Login/wellcome.png");
const avatar1 = require("../../../assets/images/Wellcome & Login/badge-1.png");
const avatar2 = require("../../../assets/images/Wellcome & Login/badge-2.png");
const avatar3 = require("../../../assets/images/Wellcome & Login/badge-3.png");

export default function WelcomeScreen() {
	const { login, isLoading } = useAuth();
	const [error, setError] = useState<string | null>(null);

	const handleGoogleLogin = async () => {
		try {
			setError(null);
			await login();
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			console.error("Login error:", err);

			if (message.includes("cancelled") || message.includes("cancel")) {
				setError("Login cancelled. Please try again.");
			} else if (message.includes("network")) {
				setError("Network error. Please check your connection.");
			} else {
				setError("Login failed. Please try again.");
			}
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-slate-50">
			<ScrollView
				className="flex-1"
				contentContainerClassName="items-center justify-center px-7 py-10 gap-14"
				showsVerticalScrollIndicator={false}
			>
				{/* Trust badge + Hero illustration */}
				<View className="items-center gap-6">
					{/* Trust badge */}
					<View className="flex-row items-center bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm gap-2">
						<View className="flex-row">
							<Image
								source={avatar1}
								className="w-6 h-6 rounded-full border-2 border-white"
							/>
							<Image
								source={avatar2}
								className="w-6 h-6 rounded-full border-2 border-white -ml-2"
							/>
							<Image
								source={avatar3}
								className="w-6 h-6 rounded-full border-2 border-white -ml-2"
							/>
						</View>
						<Text className="text-xs font-semibold text-gray-600">
							Trusted by 10k+ candidates
						</Text>
					</View>

					{/* Hero illustration */}
					<View className="items-center">
						<Image
							source={heroIllustration}
							className="w-[360px] h-[360px] rounded-3xl"
							resizeMode="cover"
						/>
					</View>
				</View>

				{/* Headlines + actions */}
				<View className="items-center w-full gap-9">
					<View className="items-center gap-3 w-full">
						<Text className="text-3xl font-extrabold text-center text-slate-900 leading-tight">
							Master Your{" "}
							<Text className="text-accent-green">Interview Skills</Text>
						</Text>
						<Text className="text-base font-medium text-center text-gray-600">
							Practice with AI and get hired faster. Level up your career today.
						</Text>
					</View>

					{/* Google sign in */}
					<View className="w-full gap-4">
						<Button
							variant="google"
							size="lg"
							onPress={handleGoogleLogin}
							disabled={isLoading}
							loading={isLoading}
							className="w-full rounded-2xl"
						>
							{!isLoading && (
								<View className="flex-row items-center gap-4">
									<Icon name="Sparkles" size={20} color="#2563EB" />
									<Text className="text-slate-900 font-semibold">
										Continue with Google
									</Text>
								</View>
							)}
						</Button>

						{/* Error */}
						{error && (
							<View className="bg-red-50 rounded-xl p-3">
								<Text variant="caption" className="text-center text-red-800">
									{error}
								</Text>
							</View>
						)}
					</View>

					{/* Legal */}
					<Text className="text-xs text-center text-gray-500">
						By continuing, you agree to our{" "}
						<Text className="underline">Terms</Text> &{" "}
						<Text className="underline">Privacy Policy</Text>
					</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
