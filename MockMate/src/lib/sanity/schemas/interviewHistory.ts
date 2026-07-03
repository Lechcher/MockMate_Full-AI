/**
 * Sanity schema for interviewHistory document
 */

export default {
  name: 'interviewHistory',
  title: 'Interview History',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Auth0 sub',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'interviewId',
      title: 'Interview ID',
      type: 'string',
      description: 'Reference to interview document',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'interviewTitle',
      title: 'Interview Title',
      type: 'string',
      description: 'Cached title for display',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'mode',
      title: 'Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Text', value: 'text' },
          { title: 'Voice', value: 'voice' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'answers',
      title: 'Answers',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'questionKey',
              title: 'Question Key',
              type: 'string',
            },
            {
              name: 'answer',
              title: 'Answer',
              type: 'text',
            },
            {
              name: 'audioUrl',
              title: 'Audio URL',
              type: 'url',
              description: 'For voice mode answers',
            },
            {
              name: 'duration',
              title: 'Duration',
              type: 'number',
              description: 'Seconds spent answering',
            },
            {
              name: 'timestamp',
              title: 'Timestamp',
              type: 'datetime',
            },
          ],
        },
      ],
    },
    {
      name: 'score',
      title: 'Overall Score',
      type: 'number',
      description: 'Percentage 0-100',
      validation: (Rule: any) => Rule.min(0).max(100),
    },
    {
      name: 'metrics',
      title: 'Performance Metrics',
      type: 'object',
      fields: [
        {
          name: 'communication',
          title: 'Communication',
          type: 'number',
          validation: (Rule: any) => Rule.min(0).max(100),
        },
        {
          name: 'technicalKnowledge',
          title: 'Technical Knowledge',
          type: 'number',
          validation: (Rule: any) => Rule.min(0).max(100),
        },
        {
          name: 'problemSolving',
          title: 'Problem Solving',
          type: 'number',
          validation: (Rule: any) => Rule.min(0).max(100),
        },
        {
          name: 'confidence',
          title: 'Confidence',
          type: 'number',
          validation: (Rule: any) => Rule.min(0).max(100),
        },
      ],
    },
    {
      name: 'feedback',
      title: 'Feedback',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'questionKey',
              title: 'Question Key',
              type: 'string',
            },
            {
              name: 'score',
              title: 'Score',
              type: 'number',
            },
            {
              name: 'feedback',
              title: 'Feedback',
              type: 'text',
            },
            {
              name: 'strengths',
              title: 'Strengths',
              type: 'array',
              of: [{ type: 'string' }],
            },
            {
              name: 'improvements',
              title: 'Areas for Improvement',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
        },
      ],
    },
    {
      name: 'totalDuration',
      title: 'Total Duration',
      type: 'number',
      description: 'Total seconds taken',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'xpEarned',
      title: 'XP Earned',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'gemsEarned',
      title: 'Gems Earned',
      type: 'number',
      validation: (Rule: any) => Rule.min(0),
    },
    {
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    },
  ],
};
