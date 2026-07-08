/**
 * Profile tab screen
 */

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Modal, Pressable, ScrollView, View } from "react-native";
import { Badge } from "../../components/atoms/Badge";
import { Button } from "../../components/atoms/Button";
import { Card } from "../../components/atoms/Card";
import { Icon } from "../../components/atoms/Icon";
import { Text } from "../../components/atoms/Text";
import { StatCard } from "../../components/molecules/StatCard";
import { useAuth } from "../../hooks/useAuth";
import { useGamificationState } from "../../hooks/useGamificationState";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useVIPStatus } from "../../hooks/useVIPStatus";

interface MenuItemProps {
	icon: string;
	label: string;
	onPress: () => void;
	showChevron?: boolean;
	badge?: string;
}

function MenuItem({
	icon,
	label,
	onPress,
	showChevron = true,
	badge,
}: MenuItemProps) {
	return (
		<Pressable
			onPress={onPress}
			className="flex-row items-center justify-between py-4 border-b border-gray-200"
		>
			<View className="flex-row items-center flex-1">
				<View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
					<Icon name={icon} size={20} className="text-gray-700" />
				</View>
				<Text variant="body" className="text-gray-900 flex-1">
					{label}
				</Text>
				{badge && <Badge variant="primary">{badge}</Badge>}
			</View>
			{showChevron && (
				<Icon name="ChevronRight" size={20} className="text-gray-400" />
			)}
		</Pressable>
	);
}

export default function ProfileScreen() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { logout } = useAuth();
	const { data: profile } = useUserProfile();
	const { data: gamification } = useGamificationState();
	const { isVIP } = useVIPStatus();

	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const handleLogout = async () => {
		await logout();
		queryClient.clear(); // Clear all cached data
		setShowLogoutModal(false);
		// Navigation to auth screen handled by RequireAuth
	};

	const handleUpgradeToVIP = () => {
		router.push("/vip");
	};

	const handleInterviewHistory = () => {
		router.push("/history");
	};

	const handleSavedInterviews = () => {
		router.push("/saved");
	};

	const handleVIPStatus = () => {
		router.push("/vip-status" as never);
	};

	// Calculate level from XP (1000 XP per level)
	const level = gamification ? Math.floor(gamification.xp / 1000) + 1 : 1;

	return (
		<View className="flex-1 bg-gray-50">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				{/* Profile Header */}
				<View className="bg-white px-4 pt-6 pb-4">
					<View className="flex-row items-center mb-4">
						{/* Avatar */}
						<View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mr-4">
							{profile?.picture ? (
								<Image
									source={{ uri: profile.picture }}
									className="w-20 h-20 rounded-full"
								/>
							) : (
								<Text variant="heading" className="text-3xl text-blue-600">
									{profile?.name?.charAt(0).toUpperCase() || "U"}
								</Text>
							)}
						</View>

						{/* User Info */}
						<View className="flex-1">
							<View className="flex-row items-center mb-1">
								<Text variant="heading" className="text-xl mr-2">
									{profile?.name || "User"}
								</Text>
								{isVIP && (
									<Pressable onPress={handleVIPStatus}>
										<Badge variant="warning">VIP</Badge>
									</Pressable>
								)}
							</View>
							<Text variant="body" className="text-gray-600 mb-1">
								{profile?.email || "email@example.com"}
							</Text>
							<View className="flex-row items-center">
								<Icon name="Star" size={14} className="text-purple-500 mr-1" />
								<Text variant="caption" className="text-purple-600 font-medium">
									Level {level}
								</Text>
							</View>
						</View>
					</View>

					{/* Stats Grid */}
					<View className="flex-row gap-3">
						<StatCard
							icon="Zap"
							label="XP"
							value={gamification?.xp.toLocaleString() || "0"}
							color="purple"
						/>
						<StatCard
							icon="Gem"
							label="Gems"
							value={gamification?.gems.toLocaleString() || "0"}
							color="blue"
						/>
						<StatCard
							icon="Flame"
							label="Streak"
							value={`${gamification?.streak || 0}d`}
							color="orange"
						/>
					</View>
				</View>

				{/* VIP Upgrade Banner (for non-VIP users) */}
				{!isVIP && (
					<View className="px-4 pt-4">
						<Pressable onPress={handleUpgradeToVIP}>
							<Card className="bg-gradient-to-r from-yellow-400 to-orange-500">
								<View className="flex-row items-center">
									<View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
										<Icon name="Crown" size={24} className="text-white" />
									</View>
									<View className="flex-1">
										<Text variant="heading" className="text-white mb-1">
											Upgrade to VIP
										</Text>
										<Text variant="caption" className="text-white/90">
											Unlock all premium features
										</Text>
									</View>
									<Icon name="ChevronRight" size={24} className="text-white" />
								</View>
							</Card>
						</Pressable>
					</View>
				)}

				{/* Career Section */}
				<View className="bg-white mt-4 px-4 py-2">
					<Text
						variant="heading"
						className="text-base text-gray-500 uppercase mb-2 mt-2"
					>
						Career
					</Text>
					<MenuItem
						icon="History"
						label="Interview History"
						onPress={handleInterviewHistory}
					/>
					<MenuItem
						icon="Heart"
						label="Saved Interviews"
						onPress={handleSavedInterviews}
					/>
				</View>

				{/* App Settings Section */}
				<View className="bg-white mt-4 px-4 py-2">
					<Text
						variant="heading"
						className="text-base text-gray-500 uppercase mb-2 mt-2"
					>
						App Settings
					</Text>
					<MenuItem
						icon="Settings"
						label="General Settings"
						onPress={() => {}}
					/>
					<MenuItem icon="Shield" label="Security" onPress={() => {}} />
					<MenuItem
						icon="Globe"
						label="Language"
						onPress={() => {}}
						badge="English"
					/>
				</View>

				{/* Support Section */}
				<View className="bg-white mt-4 px-4 py-2 mb-6">
					<Text
						variant="heading"
						className="text-base text-gray-500 uppercase mb-2 mt-2"
					>
						Support
					</Text>
					<MenuItem icon="HelpCircle" label="Help Center" onPress={() => {}} />
					<MenuItem
						icon="LogOut"
						label="Log Out"
						onPress={() => setShowLogoutModal(true)}
						showChevron={false}
					/>
				</View>

				{/* App Version */}
				<View className="items-center pb-8">
					<Text variant="caption" className="text-gray-400">
						MockMate v1.0.0
					</Text>
				</View>
			</ScrollView>

			{/* Logout Confirmation Modal */}
			<Modal
				visible={showLogoutModal}
				transparent
				animationType="fade"
				onRequestClose={() => setShowLogoutModal(false)}
			>
				<Pressable
					className="flex-1 bg-black/50 items-center justify-center"
					onPress={() => setShowLogoutModal(false)}
				>
					<Pressable className="bg-white rounded-3xl p-6 mx-6 w-11/12">
						<View className="items-center mb-4">
							<View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
								<Icon name="LogOut" size={32} className="text-red-500" />
							</View>
							<Text variant="heading" className="text-xl mb-2 text-center">
								Log Out
							</Text>
							<Text variant="body" className="text-gray-600 text-center">
								Are you sure you want to log out? Your progress is saved.
							</Text>
						</View>

						<View className="flex-row gap-3">
							<Button
								onPress={() => setShowLogoutModal(false)}
								variant="outline"
								className="flex-1"
							>
								<Text variant="body" className="text-gray-700 font-semibold">
									Cancel
								</Text>
							</Button>
							<Button
								onPress={handleLogout}
								variant="primary"
								className="flex-1 bg-red-500"
							>
								<Text variant="body" className="text-white font-semibold">
									Log Out
								</Text>
							</Button>
						</View>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}
