/**
 * Bottom tabs layout
 */

import { Tabs } from "expo-router";
import { Icon } from "../../components/atoms/Icon";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: "#3B82F6",
				tabBarInactiveTintColor: "#9CA3AF",
				tabBarStyle: {
					backgroundColor: "white",
					borderTopWidth: 1,
					borderTopColor: "#E5E7EB",
					paddingTop: 8,
					paddingBottom: 8,
					height: 60,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "600",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Icon name="Home" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: "Explore",
					tabBarIcon: ({ color, size }) => (
						<Icon name="Compass" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="quests"
				options={{
					title: "Quests",
					tabBarIcon: ({ color, size }) => (
						<Icon name="ListChecks" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="shop"
				options={{
					title: "Shop",
					tabBarIcon: ({ color, size }) => (
						<Icon name="ShoppingBag" size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => (
						<Icon name="User" size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
