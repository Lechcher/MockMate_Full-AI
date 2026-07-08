import { View } from "react-native";
import { Icon } from "../atoms/Icon";
import { Text } from "../atoms/Text";

interface StreakBadgeProps {
	streak: number;
	size?: "small" | "medium" | "large";
	showLabel?: boolean;
}

export function StreakBadge({
	streak,
	size = "medium",
	showLabel = true,
}: StreakBadgeProps) {
	const sizeConfig = {
		small: {
			container: "px-2 py-1",
			icon: 16,
			text: "text-sm",
		},
		medium: {
			container: "px-3 py-2",
			icon: 20,
			text: "text-base",
		},
		large: {
			container: "px-4 py-3",
			icon: 24,
			text: "text-lg",
		},
	};

	const config = sizeConfig[size];

	return (
		<View
			className={`flex-row items-center bg-orange-100 rounded-full ${config.container}`}
		>
			<Icon name="Flame" size={config.icon} className="text-orange-500 mr-1" />
			<Text
				variant="body"
				className={`text-orange-700 font-bold ${config.text}`}
			>
				{streak}
			</Text>
			{showLabel && size !== "small" && (
				<Text variant="caption" className="text-orange-600 ml-1">
					day{streak !== 1 ? "s" : ""}
				</Text>
			)}
		</View>
	);
}
