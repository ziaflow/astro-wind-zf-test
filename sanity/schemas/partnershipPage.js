import { defineField, defineType } from 'sanity';

export const partnershipPageType = defineType({
  name: 'partnershipPage',
  title: 'Partnership Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Partner Name / Page Title',
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
      name: 'partnerLogo',
      title: 'Partner Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      description: 'Main headline displayed in the partnership page hero section.',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'partnerType',
      title: 'Partner Type',
      type: 'string',
      options: {
        list: [
          { title: 'Technology Partner', value: 'technology' },
          { title: 'Reseller / Agency Partner', value: 'reseller' },
          { title: 'Integration Partner', value: 'integration' },
          { title: 'Referral Partner', value: 'referral' },
          { title: 'Strategic Alliance', value: 'strategic' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'benefits',
      title: 'Partnership Benefits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'icon', title: 'Icon (tabler name)', type: 'string' }),
            defineField({ name: 'title', title: 'Benefit Title', type: 'string' }),
            defineField({ name: 'description', title: 'Benefit Description', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Page Body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'ctaText',
      title: 'CTA Button Text',
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
      name: 'seoDescription',
      title: 'SEO Description (Meta Tag)',
      type: 'text',
      description: 'A brief summary for search engine results. Max 160 characters.',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('Keep under 160 characters'),
    }),
  ],
});
