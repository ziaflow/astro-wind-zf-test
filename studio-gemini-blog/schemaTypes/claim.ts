import {defineField, defineType} from 'sanity'

export const claimType = defineType({
  name: 'claim',
  title: 'Evidence & Claim Register',
  type: 'document',
  fields: [
    defineField({
      name: 'claimStatement',
      title: 'Claim Statement',
      type: 'text',
      rows: 2,
      description: 'The specific factual assertion to be used in marketing or blog copy.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Verification Status',
      type: 'string',
      options: {
        list: [
          {title: 'Verified (Evidence Backed)', value: 'verified'},
          {title: 'Unverified (Draft / Needs Review)', value: 'unverified'},
          {title: 'Historical (Archive Only)', value: 'historical'},
          {title: 'Rejected (Do Not Publish)', value: 'rejected'},
        ],
      },
      initialValue: 'unverified',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'evidenceSource',
      title: 'Supporting Evidence / Source Documentation',
      type: 'text',
      rows: 3,
      description: 'Link or citation of actual data (e.g., GSC metrics, benchmark report, client analytics).',
    }),
    defineField({
      name: 'approvedWording',
      title: 'Approved Public Copy',
      type: 'text',
      rows: 2,
      description: 'The exact vetted wording allowed in public articles and service pages.',
    }),
    defineField({
      name: 'relatedService',
      title: 'Related Service Offering',
      type: 'reference',
      to: [{type: 'servicePage'}],
    }),
    defineField({
      name: 'lastReviewedAt',
      title: 'Last Reviewed Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
