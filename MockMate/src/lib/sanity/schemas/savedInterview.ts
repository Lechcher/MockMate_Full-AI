/**
 * Sanity schema for savedInterviews document
 */

export default {
	name: "savedInterview",
	title: "Saved Interview",
	type: "document",
	fields: [
		{
			name: "userId",
			title: "User ID",
			type: "string",
			description: "Auth0 sub",
			validation: (Rule: any) => Rule.required(),
		},
		{
			name: "interviewId",
			title: "Interview ID",
			type: "string",
			description: "Reference to interview document",
			validation: (Rule: any) => Rule.required(),
		},
		{
			name: "savedAt",
			title: "Saved At",
			type: "datetime",
			initialValue: () => new Date().toISOString(),
		},
	],
};
