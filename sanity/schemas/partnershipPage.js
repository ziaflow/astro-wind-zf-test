import { defineField, defineType } from 'sanity';

export const partnershipPageType = defineType({
  name: 'partnershipPage',
  title: 'Partnership Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page Title',
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
      name: 'partnerName',
      title: 'Partner Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'partnerLogo',
      title: 'Partner Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroTagline',
      title: 'Hero Tagline',
      type: 'string',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'overview',
      title: 'Partnership Overview',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text description of the partnership and its benefits.',
    }),
    defineField({
      name: 'benefits',
      title: 'Key Benefits',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'description', type: 'text', rows: 2 }),
            defineField({ name: 'icon', type: 'string', description: 'Tabler icon name, e.g. tabler:rocket' }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
    }),
    defineField({
      name: 'callToAction',
      title: 'Call To Action',
      type: 'object',
      fields: [
        defineField({ name: 'text', type: 'string', title: 'Button Text' }),
        defineField({ name: 'href', type: 'url', title: 'Button URL' }),
      ],
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description (Meta Tag)',
      type: 'text',
      description: 'A brief summary for search engine results. Max 160 characters.',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('Keep under 160 characters'),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'partnerName', media: 'partnerLogo' },
  },
});
