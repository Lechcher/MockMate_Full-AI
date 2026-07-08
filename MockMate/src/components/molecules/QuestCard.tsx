import { Pressable, View } from "react-native";
import type { Quest, QuestType } from "../../types/quest";
import { Card } from "../atoms/Card";
import { Icon } from "../atoms/Icon";
import { ProgressBar } from "../atoms/ProgressBar";
import { Text } from "../atoms/Text";

interface QuestCardProps {
	quest: Quest;
	onPress?: () => void;
}

const questIcons: Record<QuestType, string> = {
	complete_interviews: "CheckCircle",
	earn_xp: "Star",
	practice_streak: "Flame",
	perfect_score: "Award",
	try_voice_mode: "Mic",
	save_favorites: "Heart",
};

export function QuestCard({ quest, onPress }: QuestCardProps) {
	const isCompleted = quest.completed || quest.current >= quest.target;
	const progressPercentage = Math.min(
		(quest.current / quest.target) * 100,
		100,
	);
	const questIcon = quest.icon || questIcons[quest.type] || "Target";

	return (
		<Pressable onPress={onPress} disabled={!onPress || isCompleted}>
			<Card className={`mb-4 ${isCompleted ? "opacity-60" : ""}`}>
				<View className="flex-row items-start justify-between mb-3">
					<View className="flex-row items-center flex-1">
						<View
							className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
								isCompleted ? "bg-green-100" : "bg-purple-100"
							}`}
						>
							<Icon
								name={isCompleted ? "CheckCircle" : questIcon}
								size={24}
								className={isCompleted ? "text-green-600" : "text-purple-600"}
							/>
						</View>
						<View className="flex-1">
							<Text variant="heading" className="text-base mb-1">
								{quest.title}
							</Text>
							<Text variant="caption" className="text-gray-500">
								{quest.description}
							</Text>
						</View>
					</View>
				</View>

				<View className="mb-3">
					<ProgressBar progress={progressPercentage} />
					<View className="flex-row justify-between items-center mt-2">
						<Text variant="caption" className="text-gray-600">
							{isCompleted
								? "Completed!"
								: `${quest.current} / ${quest.target}`}
						</Text>
						<View className="flex-row items-center">
							<Icon name="Gem" size={14} className="text-blue-500 mr-1" />
							<Text variant="caption" className="text-gray-700 font-semibold">
								+{quest.reward} gems
							</Text>
						</View>
					</View>
				</View>

				{isCompleted && (
					<View className="bg-green-50 rounded-lg p-3 flex-row items-center">
						<Icon
							name="PartyPopper"
							size={16}
							className="text-green-600 mr-2"
						/>
						<Text variant="caption" className="text-green-700 font-medium">
							Quest completed! Gems awarded.
						</Text>
					</View>
				)}
			</Card>
		</Pressable>
	);
}
