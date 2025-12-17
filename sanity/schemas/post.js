import { defineField, defineType } from 'sanity';

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: { hotspot: true },
    }),
    // 💡 Add Author reference for agency credit
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'author' } }], // References the 'author' schema
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    // 💡 CRITICAL: Add SEO Meta Description field
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
