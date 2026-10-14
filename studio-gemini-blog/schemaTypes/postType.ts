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
      options: {
        ai: {
          prompt:
            'Generate a compelling, high-converting SEO meta description under 155 characters summarizing the article title and body content. Include an actionable takeaway.',
        },
      },
    }),
    // 🛡️ EDITORIAL WORKFLOW & GOVERNANCE FIELDS
    defineField({
      name: 'editorialStatus',
      title: 'Editorial Review Status',
      type: 'string',
      options: {
        list: [
          {title: '🤖 Drafted by AI Agent', value: 'ai_drafted'},
          {title: '🔍 In Editorial Fact-Check', value: 'in_editor_review'},
          {title: '✅ Ready for Jeremy Review', value: 'ready_for_human_review'},
          {title: '🚀 Approved & Published', value: 'approved'},
        ],
        layout: 'radio',
      },
      initialValue: 'ai_drafted',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'editorNotes',
      title: 'Editor Agent Critique & Verification Notes',
      type: 'text',
      description: 'Automated fact-checking notes, claim verification results, and recommended tweaks.',
      rows: 4,
      options: {
        ai: {
          prompt:
            'Review the post body against Ziaflow editorial standards. Summarize key strengths, verify technical accuracy, and suggest improvements.',
        },
      },
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
