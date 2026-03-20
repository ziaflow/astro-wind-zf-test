import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post', // Title change for clarity
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
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mainImage', // Renamed from 'image' to 'mainImage' for clarity
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [{type: 'reference', to: {type: 'author'}}], // References the 'author' schema
    }),
    defineField({
      name: 'sourceTopic',
      title: 'Source Topic',
      type: 'reference',
      to: [{type: 'contentTopic'}],
      readOnly: true,
      description: 'Tracks the editorial topic this post was generated from.',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'e.g., Marketing Automation, SEO, Web Development',
    }),
    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'array',
      of: [{type: 'block'}], // This will be the main editor
    }),
    // 💡 CRITICAL SEO FIELD
    defineField({
      name: 'seoDescription',
      title: 'SEO Meta Description (Excerpt)',
      type: 'text',
      description: 'A brief summary for search engine results. Matches your MDX excerpt.',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('Keep under 160 characters'),
    }),
    defineField({
      name: 'automationNotes',
      title: 'Automation Notes',
      type: 'text',
      rows: 3,
      readOnly: true,
      description: 'Metadata written by the AI drafting workflow.',
    }),
  ],
})
