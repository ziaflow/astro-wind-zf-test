import {defineArrayMember, defineField, defineType} from 'sanity'

export const postType = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  description:
    'Editorial checklist: verify real experience, claims and sources, useful internal links, author accuracy, image alt text, metadata and dates. Record evidence or not-applicable decisions in Editor Notes; approval is a human decision.',
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
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          description:
            'Describe what this meaningful image shows in context. Leave decorative images empty. Do not copy the article title unless it really describes the image.',
        }),
      ],
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'author'}]})],
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
      description:
        'The article title supplies H1. Start body sections at H2. Existing blocks are never rewritten automatically.',
      of: [
        defineArrayMember({
          type: 'block',
          // Preserve the deployed link annotation, including existing relative internal links.
          marks: {
            annotations: [
              defineArrayMember({
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'Link',
                    validation: (rule) =>
                      rule.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
                  }),
                ],
              }),
            ],
          },
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading 2', value: 'h2'},
            {title: 'Heading 3', value: 'h3'},
            {title: 'Heading 4', value: 'h4'},
            {title: 'Heading 5', value: 'h5'},
            {title: 'Heading 6', value: 'h6'},
            {title: 'Quote', value: 'blockquote'},
          ],
        }),
      ],
      validation: (rule) =>
        rule.custom(
          (blocks) =>
            !blocks?.some(
              (block) =>
                typeof block === 'object' &&
                block !== null &&
                '_type' in block &&
                block._type === 'block' &&
                'style' in block &&
                block.style === 'h1',
            ) ||
            'The title already supplies H1. Change body H1 blocks to H2 or lower before publishing; review legacy headings manually.',
        ),
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO title (optional)',
      type: 'string',
      description:
        'Used for the HTML title and social metadata. The visible H1 and Article headline remain the article title. Leave empty to use the article title.',
      validation: (rule) =>
        rule
          .max(60)
          .warning(
            'Consider a concise title around 60 characters; display depends on width and Google may rewrite it.',
          ),
    }),
    defineField({
      name: 'lastReviewedAt',
      title: 'Substantive editorial review date (optional)',
      type: 'datetime',
      description:
        'Set manually only after a substantive accuracy/source review. Shown as Updated and used for Article dateModified. Do not change for spelling, formatting or automated saves.',
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!value) return true
          const reviewed = Date.parse(value)
          const published = context.document?.publishedAt
          if (!Number.isFinite(reviewed)) return 'Enter a valid review date.'
          if (reviewed > Date.now()) return 'A completed editorial review cannot be in the future.'
          if (typeof published === 'string' && reviewed < Date.parse(published))
            return 'Review date must not precede publication.'
          return true
        }),
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Meta Description (Excerpt)',
      type: 'text',
      description:
        'A useful, accurate summary used in HTML metadata and Article JSON-LD. Length is editorial guidance; Google may rewrite or truncate snippets.',
      rows: 3,
      validation: (rule) =>
        rule
          .max(160)
          .warning(
            'Consider a concise summary around 160 characters; this is not a guaranteed Google display limit.',
          ),
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
      name: 'experienceNotes',
      title: 'First-hand Experience & Limitations',
      type: 'text',
      rows: 4,
      description:
        'Record relevant first-hand use, project observations, methods and limitations. Distinguish direct experience from sourced facts or hypothetical examples. Do not invent experience or include confidential client details. Leave empty when not applicable.',
    }),
    defineField({
      name: 'evidenceSources',
      title: 'Sources & Claim Evidence (Editorial)',
      type: 'array',
      description:
        'Keep verifiable sources for material claims. Cite useful sources in the article where appropriate. This internal evidence record is not a ranking signal or a substitute for clear, accurate content.',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Source title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Source URL',
              type: 'url',
              validation: (rule) => rule.required().uri({scheme: ['http', 'https']}),
            }),
            defineField({
              name: 'sourceType',
              title: 'Source type',
              type: 'string',
              options: {
                list: [
                  {title: 'Official or primary source', value: 'primary'},
                  {title: 'Research or data source', value: 'research'},
                  {title: 'Other reference', value: 'other'},
                ],
              },
            }),
            defineField({
              name: 'supports',
              title: 'Claim or detail supported',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'checkedAt',
              title: 'Last checked',
              type: 'date',
              description: 'Date this source was checked for the cited claim.',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'editorNotes',
      title: 'Editor Notes & Review Checklist',
      type: 'text',
      rows: 4,
      description:
        'Review first-hand experience and limitations; claim evidence and primary sources; helpful internal links and working destinations; real authors/credentials; image meaning and alt text; title/description; headings; publication/review dates. Record fixes, evidence links or N/A. No fixed link count, authority score, original-visual requirement or all-boxes approval rule.',
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
