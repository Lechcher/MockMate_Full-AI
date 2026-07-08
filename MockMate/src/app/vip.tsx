/**
 * VIP subscription screen
 *
 * Pulls plans from RevenueCat Offerings, lets the user pick a billing cycle,
 * and triggers purchase via Purchases.purchasePackage. Server-side VIP
 * mirroring happens via /api/vip-status (JWT-guarded) — no client Sanity writes.
 */

import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import Purchases, {
	type PurchasesOfferings,
	type PurchasesPackage,
} from "react-native-purchases";
import { Button } from "../components/atoms/Button";
import { Card } from "../components/atoms/Card";
import { Icon } from "../components/atoms/Icon";
import { Text } from "../components/atoms/Text";
import { useAuth } from "../hooks/useAuth";

type BillingCycle = "monthly" | "yearly";

const VIP_BENEFITS = [
	{
		title: "Unlimited Interviews",
		description: "Practice as much as you want, no limits",
		icon: "Crown",
	},
	{
		title: "Advanced AI Feedback",
		description: "Get detailed insights and improvement tips",
		icon: "Sparkles",
	},
	{
		title: "Priority Support",
		description: "Fast response from our support team",
		icon: "Zap",
	},
	{
		title: "Custom Interview Builder",
		description: "Create your own tailored interview scenarios",
		icon: "Target",
	},
	{
		title: "Performance Analytics",
		description: "Track your progress with detailed stats",
		icon: "TrendingUp",
	},
];

export default function VIPScreen() {
	const { getAccessToken } = useAuth();
	const [selectedPlan, setSelectedPlan] = useState<BillingCycle>("yearly");
	const [isProcessing, setIsProcessing] = useState(false);
	const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchOfferings = useCallback(async () => {
		try {
			setIsLoading(true);
			const offs = await Purchases.getOfferings();
			if (offs.current) {
				setOfferings(offs);
			} else {
				Alert.alert(
					"No Plans Available",
					"Unable to load subscription plans. Please try again later.",
				);
			}
		} catch (err) {
			console.error("Error fetching offerings:", err);
			Alert.alert(
				"Error",
				"Failed to load subscription plans. Please check your connection and try again.",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void fetchOfferings();
	}, [fetchOfferings]);

	const getSelectedPackage = (): PurchasesPackage | null => {
		if (!offerings?.current) return null;
		return selectedPlan === "yearly"
			? (offerings.current.annual ?? null)
			: (offerings.current.monthly ?? null);
	};

	const formatPrice = (pkg: PurchasesPackage | null | undefined): string => {
		if (!pkg) return "Loading...";
		return pkg.product.priceString;
	};

	const calculateSavings = (): string | null => {
		const annual = offerings?.current?.annual;
		const monthly = offerings?.current?.monthly;
		if (!annual || !monthly) return null;
		const yearlyMonthlyEquivalent = annual.product.price / 12;
		const savingsPercent = Math.round(
			((monthly.product.price - yearlyMonthlyEquivalent) /
				monthly.product.price) *
				100,
		);
		return savingsPercent > 0 ? `Save ${savingsPercent}%` : null;
	};

	const mirrorVipToServer = useCallback(async (): Promise<void> => {
		try {
			const token = await getAccessToken();
			await fetch("/api/vip-status", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ active: true }),
			});
		} catch (err) {
			console.warn("Server VIP mirror failed (non-blocking):", err);
		}
	}, [getAccessToken]);

	const handleSubscribe = useCallback(async () => {
		const pkg = getSelectedPackage();
		if (!pkg) {
			Alert.alert("Unavailable", "No plan selected. Try again later.");
			return;
		}

		setIsProcessing(true);
		try {
			const { customerInfo } = await Purchases.purchasePackage(pkg);
			const gotVip =
				typeof customerInfo.entitlements.active.vip !== "undefined";

			if (gotVip) {
				void mirrorVipToServer();
				Alert.alert("Success!", "Welcome to VIP!", [
					{
						text: "Start Practicing",
						onPress: () => router.replace("/(tabs)"),
					},
				]);
			} else {
				Alert.alert(
					"Purchase incomplete",
					"Completed purchase but VIP entitlement missing. Contact support.",
				);
			}
		} catch (err: unknown) {
			const isCancelled =
				!!err &&
				typeof err === "object" &&
				"userCancelled" in err &&
				(err as { userCancelled?: boolean }).userCancelled;
			if (!isCancelled) {
				const message =
					err && typeof err === "object" && "message" in err
						? String((err as { message?: unknown }).message)
						: "Something went wrong. Please try again.";
				Alert.alert("Purchase Failed", message);
			}
		} finally {
			setIsProcessing(false);
		}
	}, [getSelectedPackage, mirrorVipToServer]);

	const handleRestore = useCallback(async () => {
		setIsProcessing(true);
		try {
			const info = await Purchases.restorePurchases();
			const gotVip = typeof info.entitlements.active.vip !== "undefined";
			if (gotVip) {
				void mirrorVipToServer();
				Alert.alert(
					"Restore Complete",
					"Your VIP subscription has been restored!",
				);
				await fetchOfferings();
			} else {
				Alert.alert(
					"No Purchases Found",
					"We couldn't find any previous purchases to restore.",
				);
			}
		} catch (err: unknown) {
			const message =
				err && typeof err === "object" && "message" in err
					? String((err as { message?: unknown }).message)
					: "Unable to restore purchases.";
			Alert.alert("Restore Failed", message);
		} finally {
			setIsProcessing(false);
		}
	}, [fetchOfferings, mirrorVipToServer]);

	const yearlyPkg = offerings?.current?.annual;
	const monthlyPkg = offerings?.current?.monthly;

	return (
		<View className="flex-1 bg-gray-50">
			<Stack.Screen
				options={{
					title: "Upgrade to VIP",
					headerBackTitle: "Back",
				}}
			/>

			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<Text variant="body" className="text-gray-600">
						Loading plans...
					</Text>
				</View>
			) : (
				<ScrollView className="flex-1">
					<View className="bg-gradient-to-b from-amber-50 to-white px-6 py-8 items-center border-b border-gray-200">
						<View className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center mb-4">
							<Icon name="Crown" size={40} className="text-amber-500" />
						</View>
						<Text variant="heading" className="text-2xl mb-2">
							Unlock VIP Access
						</Text>
						<Text variant="body" className="text-gray-600 text-center">
							Get unlimited interviews and premium features
						</Text>
					</View>

					<View className="px-4 pt-6">
						<Text variant="heading" className="text-lg mb-4">
							What's Included
						</Text>
						{VIP_BENEFITS.map((benefit) => (
							<View
								key={benefit.title}
								className="flex-row items-start gap-3 mb-4 bg-white p-4 rounded-xl border border-gray-200"
							>
								<View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
									<Icon
										name={benefit.icon}
										size={20}
										className="text-blue-600"
									/>
								</View>
								<View className="flex-1">
									<Text
										variant="body"
										className="font-semibold text-gray-900 mb-1"
									>
										{benefit.title}
									</Text>
									<Text variant="caption" className="text-gray-600">
										{benefit.description}
									</Text>
								</View>
							</View>
						))}
					</View>

					<View className="px-4 pt-6">
						<Text variant="heading" className="text-lg mb-4">
							Choose Your Plan
						</Text>

						{yearlyPkg && (
							<Pressable
								className={`p-4 rounded-xl border-2 mb-3 ${
									selectedPlan === "yearly"
										? "border-blue-500 bg-blue-50"
										: "border-gray-200 bg-white"
								}`}
								onPress={() => setSelectedPlan("yearly")}
							>
								<View className="flex-row items-center justify-between">
									<View className="flex-row items-center gap-3 flex-1">
										<View
											className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
												selectedPlan === "yearly"
													? "border-blue-500 bg-blue-500"
													: "border-gray-300"
											}`}
										>
											{selectedPlan === "yearly" && (
												<Icon name="Check" size={16} className="text-white" />
											)}
										</View>
										<View className="flex-1">
											<Text
												variant="body"
												className="font-semibold text-gray-900"
											>
												Yearly Plan
											</Text>
											<Text variant="caption" className="text-gray-600">
												Billed annually
											</Text>
										</View>
									</View>
									<View className="items-end">
										<Text variant="heading" className="text-xl text-gray-900">
											{formatPrice(yearlyPkg)}
										</Text>
										{calculateSavings() && (
											<Text
												variant="caption"
												className="text-green-600 font-medium"
											>
												{calculateSavings()}
											</Text>
										)}
									</View>
								</View>
							</Pressable>
						)}

						{monthlyPkg && (
							<Pressable
								className={`p-4 rounded-xl border-2 ${
									selectedPlan === "monthly"
										? "border-blue-500 bg-blue-50"
										: "border-gray-200 bg-white"
								}`}
								onPress={() => setSelectedPlan("monthly")}
							>
								<View className="flex-row items-center justify-between">
									<View className="flex-row items-center gap-3">
										<View
											className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
												selectedPlan === "monthly"
													? "border-blue-500 bg-blue-500"
													: "border-gray-300"
											}`}
										>
											{selectedPlan === "monthly" && (
												<Icon name="Check" size={16} className="text-white" />
											)}
										</View>
										<View>
											<Text
												variant="body"
												className="font-semibold text-gray-900"
											>
												Monthly Plan
											</Text>
											<Text variant="caption" className="text-gray-600">
												Billed monthly
											</Text>
										</View>
									</View>
									<Text variant="heading" className="text-xl text-gray-900">
										{formatPrice(monthlyPkg)}
									</Text>
								</View>
							</Pressable>
						)}
					</View>

					<View className="px-4 pt-6 pb-4">
						<Button
							onPress={handleSubscribe}
							variant="primary"
							disabled={isProcessing || !offerings}
							className="w-full"
						>
							<Text variant="body" className="text-white font-semibold">
								{isProcessing
									? "Processing..."
									: Platform.OS === "ios"
										? "Subscribe via App Store"
										: "Subscribe via Play Store"}
							</Text>
						</Button>
					</View>

					<View className="px-4 pb-4">
						<Pressable
							className="py-3 items-center"
							onPress={handleRestore}
							disabled={isProcessing}
						>
							<Text variant="body" className="text-blue-600 font-medium">
								Restore Purchases
							</Text>
						</Pressable>
					</View>

					<Card className="mx-4 mb-8">
						<Text
							variant="caption"
							className="text-gray-500 text-center leading-5"
						>
							Subscription renews automatically unless auto-renew is turned off
							at least 24 hours before the end of the current period.
						</Text>
					</Card>
				</ScrollView>
			)}
		</View>
	);
}
