import {defineField, defineType} from 'sanity'

export const contentClusterType = defineType({
  name: 'contentCluster',
  title: 'Content Cluster',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'audience',
      title: 'Audience',
      type: 'string',
      description: 'Who this cluster is primarily written for.',
    }),
    defineField({
      name: 'businessGoal',
      title: 'Business Goal',
      type: 'string',
      description: 'What business outcome this cluster should support.',
    }),
    defineField({
      name: 'primaryServiceSlug',
      title: 'Primary Service Slug',
      type: 'string',
      description: 'Service page slug this cluster should reinforce, e.g. seo or web-development.',
    }),
    defineField({
      name: 'pillarKeyword',
      title: 'Pillar Keyword',
      type: 'string',
    }),
    defineField({
      name: 'relatedKeywords',
      title: 'Related Keywords',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'internalLinkTargets',
      title: 'Internal Link Targets',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Relative internal URLs the AI should consider linking to.',
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'number',
      initialValue: 5,
      validation: (rule) => rule.min(1).max(10),
    }),
  ],
})
