/**
 * ProgressBar component with percentage fill
 */

import { View } from "react-native";
import { twMerge as cn } from "tailwind-merge";

interface ProgressBarProps {
	progress: number; // 0-100
	color?: "blue" | "green" | "yellow" | "red" | "purple";
	height?: "sm" | "md" | "lg";
	className?: string;
}

export function ProgressBar({
	progress,
	color = "blue",
	height = "md",
	className,
}: ProgressBarProps) {
	const clampedProgress = Math.max(0, Math.min(100, progress));

	const colorStyles = {
		blue: "bg-blue-600",
		green: "bg-green-600",
		yellow: "bg-yellow-600",
		red: "bg-red-600",
		purple: "bg-purple-600",
	};

	const heightStyles = {
		sm: "h-1",
		md: "h-2",
		lg: "h-3",
	};

	return (
		<View
			className={cn(
				"w-full bg-gray-200 rounded-full overflow-hidden",
				heightStyles[height],
				className,
			)}
		>
			<View
				className={cn("rounded-full", colorStyles[color], heightStyles[height])}
				style={{ width: `${clampedProgress}%` }}
			/>
		</View>
	);
}
