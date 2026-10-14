import {defineField, defineType} from 'sanity'

export const keywordOpportunityType = defineType({
  name: 'keywordOpportunity',
  title: 'Keyword Opportunity (Evidence Register)',
  type: 'document',
  fields: [
    defineField({
      name: 'query',
      title: 'Search Query Phrase',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sourcePlatform',
      title: 'Source Platform',
      type: 'string',
      options: {
        list: [
          {title: 'Google Search Console', value: 'gsc'},
          {title: 'Bing / Copilot AI Citations', value: 'bing_copilot'},
          {title: 'Google Analytics 4', value: 'ga4'},
          {title: 'Manual Research', value: 'manual'},
        ],
      },
      initialValue: 'gsc',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'landingPage',
      title: 'Current Ranking URL / Landing Page',
      type: 'url',
      description: 'The specific URL on ziaflow.com currently receiving these impressions.',
    }),
    defineField({
      name: 'impressions',
      title: 'Reported Impressions',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'clicks',
      title: 'Reported Clicks',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'averagePosition',
      title: 'Search Console Average Position',
      type: 'number',
      description: 'Average position across impressions (not a fixed rank).',
    }),
    defineField({
      name: 'ctr',
      title: 'Click-Through Rate (%)',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'reportDateRange',
      title: 'Report Date Range',
      type: 'string',
      description: 'e.g., 2026-07-12 to 2026-10-11',
    }),
    defineField({
      name: 'targetCluster',
      title: 'Assigned Topic Cluster',
      type: 'reference',
      to: [{type: 'topicCluster'}],
    }),
    defineField({
      name: 'recommendedAction',
      title: 'Recommended Action',
      type: 'string',
      options: {
        list: [
          {title: 'Optimize Existing Service Page', value: 'optimize_service'},
          {title: 'Publish Supporting Guide', value: 'supporting_guide'},
          {title: 'Investigate Intent (Hold)', value: 'hold_investigate'},
        ],
      },
      initialValue: 'hold_investigate',
    }),
  ],
})
