import { View } from "react-native";
import { Card } from "../atoms/Card";
import { Icon } from "../atoms/Icon";
import { Text } from "../atoms/Text";

interface StatCardProps {
	icon: string;
	label: string;
	value: string | number;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	color?: "blue" | "green" | "purple" | "orange" | "red";
}

const colorConfig = {
	blue: {
		bg: "bg-blue-100",
		icon: "text-blue-600",
		text: "text-blue-700",
	},
	green: {
		bg: "bg-green-100",
		icon: "text-green-600",
		text: "text-green-700",
	},
	purple: {
		bg: "bg-purple-100",
		icon: "text-purple-600",
		text: "text-purple-700",
	},
	orange: {
		bg: "bg-orange-100",
		icon: "text-orange-600",
		text: "text-orange-700",
	},
	red: {
		bg: "bg-red-100",
		icon: "text-red-600",
		text: "text-red-700",
	},
};

export function StatCard({
	icon,
	label,
	value,
	trend,
	color = "blue",
}: StatCardProps) {
	const colors = colorConfig[color];

	return (
		<Card className="flex-1 min-w-0">
			<View className="items-center">
				<View
					className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${colors.bg}`}
				>
					<Icon name={icon} size={24} className={colors.icon} />
				</View>

				<Text variant="heading" className="text-2xl mb-1">
					{value}
				</Text>

				<Text variant="caption" className="text-gray-500 text-center mb-2">
					{label}
				</Text>

				{trend && (
					<View className="flex-row items-center">
						<Icon
							name={trend.isPositive ? "TrendingUp" : "TrendingDown"}
							size={12}
							className={trend.isPositive ? "text-green-500" : "text-red-500"}
						/>
						<Text
							variant="caption"
							className={`ml-1 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
						>
							{trend.isPositive ? "+" : ""}
							{trend.value}%
						</Text>
					</View>
				)}
			</View>
		</Card>
	);
}
