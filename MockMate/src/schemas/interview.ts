/**
 * Zod schemas for interview types
 */
import { z } from 'zod';

export const IndustrySchema = z.enum([
  'IT',
  'Sales',
  'Finance',
  'Design',
  'Manager',
  'Marketing',
  'Healthcare',
  'Education',
]);

export const DifficultySchema = z.enum(['Easy', 'Medium', 'Hard']);

export const InterviewQuestionSchema = z.object({
  _key: z.string(),
  question: z.string(),
  expectedDuration: z.number(),
  focusAreas: z.array(z.string()),
  evaluationCriteria: z.array(z.string()),
});

export const InterviewSchema = z.object({
  _id: z.string(),
  _type: z.literal('interview'),
  title: z.string(),
  industry: IndustrySchema,
  difficulty: DifficultySchema,
  focusArea: z.string(),
  description: z.string(),
  questionCount: z.number(),
  estimatedDuration: z.number(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number(),
  isPremium: z.boolean(),
  questions: z.array(InterviewQuestionSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const InterviewAnswerSchema = z.object({
  questionKey: z.string(),
  answer: z.string(),
  audioUrl: z.string().optional(),
  duration: z.number(),
  timestamp: z.string(),
});

export const InterviewSessionSchema = z.object({
  interviewId: z.string(),
  mode: z.enum(['text', 'voice']),
  answers: z.array(InterviewAnswerSchema),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  totalDuration: z.number(),
});
