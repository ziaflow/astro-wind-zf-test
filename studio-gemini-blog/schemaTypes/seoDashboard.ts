import {defineField, defineType} from 'sanity'

export const seoDashboardType = defineType({
  name: 'seoDashboard',
  title: 'SEO Automation Dashboard',
  type: 'document',
  // 💡 __experimental_actions limits it to a single, un-deletable document
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'status',
      title: 'AI Agent Status',
      type: 'string',
      readOnly: true,
      description: 'Updated automatically by the Azure AI Agent (e.g., RUNNING, READY, ERROR).',
    }),
    defineField({
      name: 'lastRunTimestamp',
      title: 'Last Successful Agent Run',
      type: 'datetime',
      readOnly: true,
    }),
    // This is the array the AI Agent will populate with new content ideas
    defineField({
      name: 'postingSchedule',
      title: 'Posting Schedule',
      type: 'string',
      options: {
        list: [
          {title: 'Daily', value: 'daily'},
          {title: 'Weekly', value: 'weekly'},
          {title: 'Manual', value: 'manual'},
        ],
      },
      initialValue: 'manual',
    }),
    defineField({
      name: 'nextScheduledPost',
      title: 'Next Scheduled Post',
      type: 'datetime',
      readOnly: true,
      description: 'The automatic time the next post will be generated.',
    }),
    defineField({
      name: 'topicsQueue',
      title: 'Topics Queue',
      type: 'array',
      description: 'List of specific topics to write about next, in order.',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'keywordGaps',
      title: 'AI Content Opportunities',
      type: 'array',
      description:
        'New high-potential keyword ideas identified by the AI Agent for the content team.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'keyword', title: 'Keyword Phrase', type: 'string'}),
            defineField({name: 'priority', title: 'Priority Score (1-10)', type: 'number'}),
          ],
        },
      ],
    }),
  ],
})
