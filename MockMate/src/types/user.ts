/**
 * User-related types
 */

/**
 * Auth0 User from ID token (now mapped from Appwrite user or Clerk user).
 * `id` is the canonical user identifier (Appwrite $id or Clerk user ID).
 * `sub` is kept for backward compatibility with Sanity userId field.
 */
export interface Auth0User {
	id: string; // appwrite $id or clerk user.id
	sub: string; // same as id — sanity userId compat
	email: string;
	email_verified: boolean;
	name: string;
	picture: string;
	given_name?: string;
	family_name?: string;
	locale?: string;
	updated_at: string;
}

/**
 * Sanity UserProfile document
 */
export interface UserProfile {
	_id: string;
	_type: "userProfile";
	userId: string; // Auth0 sub
	email: string;
	name: string;
	picture: string;
	gamification: GamificationState;
	createdAt: string;
	updatedAt: string;
}

/**
 * Gamification state
 */
export interface GamificationState {
	streak: number;
	streakLastUpdated: string; // ISO date
	streakFreezeActive: boolean;
	xp: number;
	level: number;
	gems: number;
	totalGemsEarned: number;
	doubleXpActive: boolean;
	doubleXpExpiresAt?: string; // ISO date
	completedInterviewsToday: number;
	lastInterviewDate?: string; // ISO date
}

/**
 * Client-side user context
 */
export interface UserContext {
	auth0User: Auth0User;
	profile: UserProfile;
	isVIP: boolean;
	vipExpiryDate?: string;
}
