/**
 * Zod schemas for quest types
 */
import { z } from "zod";

export const QuestTypeSchema = z.enum([
	"complete_interviews",
	"earn_xp",
	"practice_streak",
	"perfect_score",
	"try_voice_mode",
	"save_favorites",
]);

export const QuestSchema = z.object({
	id: z.string(),
	type: QuestTypeSchema,
	title: z.string(),
	description: z.string(),
	target: z.number().min(1),
	current: z.number().min(0),
	reward: z.number().min(0),
	completed: z.boolean(),
	icon: z.string(),
});

export const DailyQuestSetSchema = z.object({
	date: z.string(),
	quests: z.array(QuestSchema),
	resetAt: z.string(),
});
