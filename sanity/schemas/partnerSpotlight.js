import { defineField, defineType } from 'sanity';

export const partnerSpotlightType = defineType({
  name: 'partnerSpotlight',
  title: 'Partner Spotlight',
  type: 'document',
  fields: [
    defineField({
      name: 'partnerName',
      title: 'Partner Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'partnerName' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Partner Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      description: 'The industry or sector this partner operates in.',
    }),
    defineField({
      name: 'partnerSince',
      title: 'Partner Since',
      type: 'date',
      description: 'The date this partnership began.',
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
      description: "URL to the partner's website.",
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'A short tagline or value proposition for this partner.',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      description: 'A brief description of the partnership and the value delivered.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Mark this partner as featured to highlight it on the page.',
      initialValue: false,
    }),
    defineField({
      name: 'stats',
      title: 'Key Results / Stats',
      type: 'array',
      description: 'Highlight up to three measurable results from this partnership.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'amount', title: 'Amount', type: 'string' }),
            defineField({ name: 'label', title: 'Label', type: 'string' }),
          ],
          preview: {
            select: { title: 'amount', subtitle: 'label' },
          },
        },
      ],
      validation: (rule) => rule.max(3),
    }),
  ],
  preview: {
    select: {
      title: 'partnerName',
      subtitle: 'industry',
      media: 'logo',
    },
  },
});
