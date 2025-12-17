import {defineField, defineType} from 'sanity'

export const servicePageType = defineType({
  name: 'servicePage',
  title: 'Service Page',
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
      name: 'geographicFocus',
      title: 'Geographic Focus',
      type: 'string',
      description: 'e.g., Phoenix, Scottsdale, Arizona',
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'keywords',
          title: 'Target Keywords',
          type: 'array',
          of: [{type: 'string'}],
        }),
        defineField({
          name: 'seoDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'lastAuditDate',
          title: 'Last Audit Date',
          type: 'datetime',
          readOnly: true, // Intended to be updated by AI Agents
        }),
      ],
    }),
    defineField({
      name: 'content',
      title: 'Main Content',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'question', title: 'Question', type: 'string'}),
            defineField({name: 'answer', title: 'Answer', type: 'text', rows: 3}),
          ],
        },
      ],
    }),
  ],
})
