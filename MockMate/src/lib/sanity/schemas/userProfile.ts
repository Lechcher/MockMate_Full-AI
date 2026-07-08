/**
 * Sanity schema for userProfile document
 */

export default {
	name: "userProfile",
	title: "User Profile",
	type: "document",
	fields: [
		{
			name: "userId",
			title: "User ID",
			type: "string",
			description: "Auth0 sub (e.g., google-oauth2|123456789)",
			validation: (Rule: any) => Rule.required(),
		},
		{
			name: "email",
			title: "Email",
			type: "string",
			validation: (Rule: any) => Rule.required().email(),
		},
		{
			name: "name",
			title: "Name",
			type: "string",
			validation: (Rule: any) => Rule.required(),
		},
		{
			name: "picture",
			title: "Picture URL",
			type: "url",
			description: "Google avatar URL",
		},
		{
			name: "gamification",
			title: "Gamification State",
			type: "object",
			fields: [
				{
					name: "streak",
					title: "Streak",
					type: "number",
					initialValue: 0,
					validation: (Rule: any) => Rule.required().min(0),
				},
				{
					name: "streakLastUpdated",
					title: "Streak Last Updated",
					type: "datetime",
				},
				{
					name: "streakFreezeActive",
					title: "Streak Freeze Active",
					type: "boolean",
					initialValue: false,
				},
				{
					name: "xp",
					title: "XP",
					type: "number",
					initialValue: 0,
					validation: (Rule: any) => Rule.required().min(0),
				},
				{
					name: "level",
					title: "Level",
					type: "number",
					initialValue: 1,
					validation: (Rule: any) => Rule.required().min(1),
				},
				{
					name: "gems",
					title: "Gems",
					type: "number",
					initialValue: 0,
					validation: (Rule: any) => Rule.required().min(0),
				},
				{
					name: "totalGemsEarned",
					title: "Total Gems Earned",
					type: "number",
					initialValue: 0,
					validation: (Rule: any) => Rule.required().min(0),
				},
				{
					name: "doubleXpActive",
					title: "Double XP Active",
					type: "boolean",
					initialValue: false,
				},
				{
					name: "doubleXpExpiresAt",
					title: "Double XP Expires At",
					type: "datetime",
				},
				{
					name: "completedInterviewsToday",
					title: "Completed Interviews Today",
					type: "number",
					initialValue: 0,
					validation: (Rule: any) => Rule.required().min(0),
				},
				{
					name: "lastInterviewDate",
					title: "Last Interview Date",
					type: "date",
				},
			],
		},
		{
			name: "createdAt",
			title: "Created At",
			type: "datetime",
			initialValue: () => new Date().toISOString(),
		},
		{
			name: "updatedAt",
			title: "Updated At",
			type: "datetime",
			initialValue: () => new Date().toISOString(),
		},
	],
};
