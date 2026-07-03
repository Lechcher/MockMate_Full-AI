export default {
  name: 'interviewCompletion',
  title: 'Interview Completion',
  type: 'document',
  fields: [
    {
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'interview',
      title: 'Interview',
      type: 'reference',
      to: [{ type: 'interview' }],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'score',
      title: 'Overall Score',
      type: 'number',
      description: 'Percentage 0-100',
      validation: (Rule: any) => Rule.required().min(0).max(100),
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'string',
      description: 'Excellent, Good, Fair, etc.',
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
              name: 'question',
              title: 'Question',
              type: 'string',
            },
            {
              name: 'answer',
              title: 'Answer',
              type: 'text',
            },
          ],
        },
      ],
    },
    {
      name: 'feedback',
      title: 'AI Feedback',
      type: 'object',
      fields: [
        {
          name: 'overallScore',
          title: 'Overall Score',
          type: 'number',
        },
        {
          name: 'rating',
          title: 'Rating',
          type: 'string',
        },
        {
          name: 'strengths',
          title: 'Strengths',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'improvements',
          title: 'Improvements',
          type: 'array',
          of: [{ type: 'string' }],
        },
        {
          name: 'questionFeedback',
          title: 'Question Feedback',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'question',
                  title: 'Question',
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
              ],
            },
          ],
        },
      ],
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
  ],
};
