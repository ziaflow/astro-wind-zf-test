import {defineField, defineType} from 'sanity'

export const contentTopicType = defineType({
  name: 'contentTopic',
  title: 'Content Topic',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Working Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cluster',
      title: 'Content Cluster',
      type: 'reference',
      to: [{type: 'contentCluster'}],
    }),
    defineField({
      name: 'targetKeyword',
      title: 'Target Keyword',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondaryKeywords',
      title: 'Secondary Keywords',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'searchIntent',
      title: 'Search Intent',
      type: 'string',
      options: {
        list: [
          {title: 'Informational', value: 'informational'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Transactional', value: 'transactional'},
          {title: 'Navigational', value: 'navigational'},
        ],
      },
      initialValue: 'informational',
    }),
    defineField({
      name: 'funnelStage',
      title: 'Funnel Stage',
      type: 'string',
      options: {
        list: [
          {title: 'Top of Funnel', value: 'tofu'},
          {title: 'Middle of Funnel', value: 'mofu'},
          {title: 'Bottom of Funnel', value: 'bofu'},
        ],
      },
      initialValue: 'tofu',
    }),
    defineField({
      name: 'desiredCategory',
      title: 'Desired Blog Category',
      type: 'string',
      description: 'Used to set the post category when the AI drafts the article.',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.min(1).max(10),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Backlog', value: 'backlog'},
          {title: 'Approved', value: 'approved'},
          {title: 'Drafting', value: 'drafting'},
          {title: 'In Review', value: 'review'},
          {title: 'Published', value: 'published'},
          {title: 'Skipped', value: 'skipped'},
        ],
      },
      initialValue: 'backlog',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'angle',
      title: 'Editorial Angle',
      type: 'text',
      rows: 3,
      description: 'What specific perspective should the post take?',
    }),
    defineField({
      name: 'brief',
      title: 'Content Brief',
      type: 'text',
      rows: 6,
    }),
    defineField({
      name: 'internalLinks',
      title: 'Internal Links',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Relative internal URLs to include where relevant.',
    }),
    defineField({
      name: 'cta',
      title: 'Call to Action',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'generatedPost',
      title: 'Generated Post',
      type: 'reference',
      to: [{type: 'post'}],
      weak: true,
      readOnly: true,
    }),
    defineField({
      name: 'lastAttemptAt',
      title: 'Last Attempt At',
      type: 'datetime',
      readOnly: true,
    }),
  ],
})
