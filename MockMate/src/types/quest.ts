/**
 * Quest-related types
 */

export type QuestType =
	| "complete_interviews"
	| "earn_xp"
	| "practice_streak"
	| "perfect_score"
	| "try_voice_mode"
	| "save_favorites";

export interface Quest {
	id: string;
	type: QuestType;
	title: string;
	description: string;
	target: number;
	current: number;
	reward: number; // gems
	completed: boolean;
	icon: string; // Lucide icon name
}

export interface DailyQuestSet {
	date: string; // ISO date
	quests: Quest[];
	resetAt: string; // ISO date for next reset
}
