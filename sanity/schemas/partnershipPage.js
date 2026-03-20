import { defineField, defineType } from 'sanity';

export const partnershipPageType = defineType({
  name: 'partnershipPage',
  title: 'Partnership Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Partner Name / Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'partnerType',
      title: 'Partnership Type',
      type: 'string',
      options: {
        list: [
          { title: 'Agency Partner', value: 'agency' },
          { title: 'Technology Partner', value: 'technology' },
          { title: 'Referral Partner', value: 'referral' },
          { title: 'Strategic Alliance', value: 'strategic' },
        ],
      },
    }),
    defineField({
      name: 'logo',
      title: 'Partner Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'A short tagline for the partnership.',
    }),
    defineField({
      name: 'summary',
      title: 'Partnership Summary',
      type: 'text',
      rows: 3,
      description: 'A brief overview of the partnership for listings and previews.',
    }),
    defineField({
      name: 'body',
      title: 'Full Partnership Description',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'benefits',
      title: 'Partnership Benefits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Benefit Title', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          ],
        },
      ],
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Button Label',
      type: 'string',
      initialValue: 'Become a Partner',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'CTA Button URL',
      type: 'url',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        defineField({
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          validation: (Rule) => Rule.max(70).warning('Keep under 70 characters'),
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.max(160).warning('Keep under 160 characters'),
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'partnerType', media: 'logo' },
  },
});
