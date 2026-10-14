import {defineField, defineType} from 'sanity'

export const topicClusterType = defineType({
  name: 'topicCluster',
  title: 'SEO Topic Cluster',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Cluster Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryService',
      title: 'Commercial Anchor Service',
      type: 'reference',
      to: [{type: 'servicePage'}],
      description: 'The revenue-producing service page this cluster supports.',
    }),
    defineField({
      name: 'buyerProblem',
      title: 'Core Buyer Problem & Intent',
      type: 'text',
      rows: 3,
      description: 'The real-world problem prospects are experiencing when searching these terms.',
    }),
    defineField({
      name: 'targetQueries',
      title: 'Verified GSC / Search Queries',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Specific queries validated from Google Search Console or AI citation share.',
    }),
    defineField({
      name: 'supportingArticles',
      title: 'Supporting Articles & Guides',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'post'}]}],
    }),
  ],
})
