/**
 * Zod schemas for user types
 */
import { z } from 'zod';

export const Auth0UserSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  email_verified: z.boolean(),
  name: z.string(),
  picture: z.string().url(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  locale: z.string().optional(),
  updated_at: z.string(),
});

export const GamificationStateSchema = z.object({
  streak: z.number().min(0),
  streakLastUpdated: z.string(),
  streakFreezeActive: z.boolean(),
  xp: z.number().min(0),
  level: z.number().min(1),
  gems: z.number().min(0),
  totalGemsEarned: z.number().min(0),
  doubleXpActive: z.boolean(),
  doubleXpExpiresAt: z.string().optional(),
  completedInterviewsToday: z.number().min(0),
  lastInterviewDate: z.string().optional(),
});

export const UserProfileSchema = z.object({
  _id: z.string(),
  _type: z.literal('userProfile'),
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  picture: z.string().url(),
  gamification: GamificationStateSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserContextSchema = z.object({
  auth0User: Auth0UserSchema,
  profile: UserProfileSchema,
  isVIP: z.boolean(),
  vipExpiryDate: z.string().optional(),
});
