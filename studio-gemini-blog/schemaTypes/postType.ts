import {defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
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
      // Drafts have no publication date. Require one only when the editor marks a post approved.
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.editorialStatus === 'approved' && !value) {
            return 'Set the publication date before approving this post.'
          }
          return true
        }),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [{type: 'reference', to: {type: 'author'}}],
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
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Meta Description (Excerpt)',
      type: 'text',
      description: 'A brief summary for search engine results. Matches your MDX excerpt.',
      rows: 3,
      validation: (rule) => rule.max(160).warning('Keep under 160 characters'),
    }),
    defineField({
      name: 'editorialStatus',
      title: 'Editorial Review Status',
      type: 'string',
      options: {
        list: [
          {title: '🤖 Drafted by AI Agent', value: 'ai_drafted'},
          {title: '🔍 In Editorial Fact-Check', value: 'in_editor_review'},
          {title: '✅ Ready for Jeremy Review', value: 'ready_for_human_review'},
          {title: '🚀 Approved for Publication', value: 'approved'},
        ],
        layout: 'radio',
      },
      initialValue: 'ai_drafted',
    }),
    defineField({
      name: 'editorNotes',
      title: 'Editor Agent Critique & Verification Notes',
      type: 'text',
      rows: 4,
      description: 'Automated fact-checking notes, claim verification results, and recommended tweaks.',
    }),
    defineField({
      name: 'targetKeywords',
      title: 'Target Search Keywords',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Search queries targeted for Google Search Console & Copilot citations.',
    }),
  ],
})
