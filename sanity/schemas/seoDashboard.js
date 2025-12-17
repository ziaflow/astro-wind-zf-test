import { defineField, defineType } from 'sanity';

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
      name: 'keywordGaps',
      title: 'AI Content Opportunities',
      type: 'array',
      description: 'New high-potential keyword ideas identified by the AI Agent for the content team.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'keyword', title: 'Keyword Phrase', type: 'string' }),
            defineField({ name: 'priority', title: 'Priority Score (1-10)', type: 'number' }),
          ],
        },
      ],
    }),
  ],
});
