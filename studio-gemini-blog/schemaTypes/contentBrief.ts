import {defineField, defineType} from 'sanity'

export const contentBriefType = defineType({
  name: 'contentBrief',
  title: 'Content Brief (Editorial Specification)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Working Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'targetQuery',
      title: 'Primary Search Query',
      type: 'reference',
      to: [{type: 'keywordOpportunity'}],
    }),
    defineField({
      name: 'primaryService',
      title: 'Commercial Service Anchor',
      type: 'reference',
      to: [{type: 'servicePage'}],
      description: 'The revenue-producing service page this piece connects to.',
    }),
    defineField({
      name: 'buyerIntentProblem',
      title: 'Buyer Problem & Search Intent',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'originalContribution',
      title: 'Concrete Original Contribution',
      type: 'text',
      rows: 3,
      description: 'Specific code snippets, workflow diagrams, or tested implementation examples (no generic fluff).',
    }),
    defineField({
      name: 'editorialStatus',
      title: 'Editorial Approval Status',
      type: 'string',
      options: {
        list: [
          {title: 'Brief Drafted', value: 'brief_drafted'},
          {title: 'Approved for Drafting', value: 'approved_for_drafting'},
          {title: 'Draft In Review', value: 'in_review'},
          {title: 'Approved for Publication', value: 'approved_for_publication'},
          {title: 'Archived / On Hold', value: 'on_hold'},
        ],
      },
      initialValue: 'brief_drafted',
    }),
    defineField({
      name: 'approvedClaims',
      title: 'Vetted Claims to Include',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'claim'}]}],
    }),
  ],
})
