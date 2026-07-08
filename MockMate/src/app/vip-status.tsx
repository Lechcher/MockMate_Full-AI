/**
 * VIP status screen
 *
 * Shows the active VIP plan and a "Manage Subscription"
 * deep link to the App Store / Play Store. Reached from
 * the VIP crown badge on the Profile tab.
 */

import { Stack, useRouter } from "expo-router";
import { useCallback } from "react";
import { Linking, Platform, ScrollView, View } from "react-native";
import { Button } from "../components/atoms/Button";
import { Card } from "../components/atoms/Card";
import { Icon } from "../components/atoms/Icon";
import { Text } from "../components/atoms/Text";
import { useVIPStatus } from "../hooks/useVIPStatus";

const MANAGE_URLS = {
	ios: "https://apps.apple.com/account/subscriptions",
	android: "https://play.google.com/store/account/subscriptions",
	default: "https://play.google.com/store/account/subscriptions",
};

export default function VIPStatusScreen() {
	const router = useRouter();
	const { isVIP, expiryDate } = useVIPStatus();

	const handleManage = useCallback(() => {
		const url = Platform.OS === "ios" ? MANAGE_URLS.ios : MANAGE_URLS.default;
		void Linking.openURL(url);
	}, []);

	const handleUpgrade = useCallback(() => {
		router.push("/vip");
	}, [router]);

	const expiryLabel = expiryDate
		? new Date(expiryDate).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: null;

	return (
		<>
			<Stack.Screen
				options={{
					title: "VIP Status",
					headerBackTitle: "Back",
				}}
			/>
			<View className="flex-1 bg-gray-50">
				<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
					{!isVIP ? (
						<View className="px-6 py-16 items-center">
							<View className="w-20 h-20 bg-yellow-100 rounded-full items-center justify-center mb-4">
								<Icon name="Crown" size={40} className="text-yellow-600" />
							</View>
							<Text variant="heading" className="text-2xl mb-2 text-center">
								No Active Subscription
							</Text>
							<Text variant="body" className="text-gray-600 text-center mb-6">
								You're on the free plan. Upgrade to unlock premium features.
							</Text>
							<Button onPress={handleUpgrade} variant="primary">
								<Text variant="body" className="text-white font-semibold">
									Upgrade Now
								</Text>
							</Button>
						</View>
					) : (
						<View className="px-4 pt-6">
							<Card>
								<View className="items-center py-4">
									<View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center mb-3">
										<Icon name="Crown" size={32} className="text-yellow-600" />
									</View>
									<Text variant="heading" className="text-xl mb-1">
										VIP Member
									</Text>
									<Text variant="caption" className="text-gray-500">
										Your subscription is active
									</Text>
								</View>
							</Card>

							<Card className="mt-3">
								<View className="flex-row items-center justify-between mb-3">
									<Text variant="body" className="text-gray-600">
										Plan
									</Text>
									<Text variant="body" className="font-medium text-gray-900">
										MockMate VIP
									</Text>
								</View>
								<View className="border-t border-gray-100 my-2" />
								<View className="flex-row items-center justify-between">
									<Text variant="body" className="text-gray-600">
										{expiryLabel ? "Renews on" : "Expires on"}
									</Text>
									<Text variant="body" className="font-medium text-gray-900">
										{expiryLabel ?? "Unknown"}
									</Text>
								</View>
							</Card>

							<View className="mt-6">
								<Button
									onPress={handleManage}
									variant="outline"
									className="w-full"
								>
									<Text variant="body" className="text-blue-600 font-semibold">
										Manage Subscription
									</Text>
								</Button>
							</View>

							<Text
								variant="caption"
								className="text-gray-400 text-center mt-6 px-4"
							>
								Subscription auto-renews unless cancelled at least 24 hours
								before the current period ends.
							</Text>
						</View>
					)}
				</ScrollView>
			</View>
		</>
	);
}
