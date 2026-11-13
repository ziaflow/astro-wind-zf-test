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
      initialValue: 'gsc',
      options: {
        list: [
          {title: 'Google Search Console', value: 'gsc'},
          {title: 'Google Sheets Export', value: 'sheets'},
          {title: 'Supabase Data Pipeline', value: 'supabase'},
          {title: 'Manual Research', value: 'manual'},
        ],
      },
    }),
    defineField({
      name: 'landingPage',
      title: 'Ranking Landing Page / URL',
      type: 'url',
    }),
    defineField({
      name: 'impressions',
      title: 'Impressions',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'clicks',
      title: 'Clicks',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'averagePosition',
      title: 'Search Console Average Position',
      type: 'number',
      description:
        'Search Console average position across impressions in the report window. This is not a fixed rank or Google PageRank score.',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'ctr',
      title: 'Click-Through Rate (%)',
      type: 'number',
      description:
        'Store percentage points (5.2 means 5.2%, not 0.052). Match the source report and date range.',
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: 'reportDateRange',
      title: 'Report Date Range',
      type: 'string',
      description: 'e.g., 2026-07-12 to 2026-10-11',
    }),
    defineField({
      name: 'reportStartDate',
      title: 'Report Start Date',
      type: 'date',
      description: 'Inclusive start date for this Search Console observation.',
    }),
    defineField({
      name: 'reportEndDate',
      title: 'Report End Date',
      type: 'date',
      description: 'Inclusive end date for this Search Console observation.',
    }),
    defineField({
      name: 'capturedAt',
      title: 'Captured At',
      type: 'datetime',
      description: 'When this snapshot was copied from its source. Refresh instead of presenting stale rankings as current.',
    }),
    defineField({
      name: 'recommendedAction',
      title: 'Recommended Action',
      type: 'string',
      options: {
        list: [
          {title: 'Optimize Existing Service Page', value: 'optimize_existing'},
          {title: 'Publish Supporting Guide / Blog Post', value: 'publish_guide'},
          {title: 'Investigate Search Intent', value: 'hold_investigate'},
          {title: 'Target in PPC / Local Service Ads', value: 'target_ads'},
        ],
      },
      initialValue: 'publish_guide',
    }),
  ],
  preview: {
    select: {
      title: 'query',
      impressions: 'impressions',
      clicks: 'clicks',
      position: 'averagePosition',
      action: 'recommendedAction',
    },
    prepare({title, impressions, clicks, position, action}) {
      const pos = position ? `Pos: ${Number(position).toFixed(1)}` : ''
      const stats = `Clicks: ${clicks || 0} | Imp: ${impressions || 0} | ${pos}`
      return {
        title,
        subtitle: `${action ? `[${action}] ` : ''}${stats}`,
      }
    },
  },
})
