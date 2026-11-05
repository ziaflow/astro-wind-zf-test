import {defineArrayMember, defineField, defineType} from 'sanity'

export const authorType = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'bio',
      type: 'text',
      rows: 3,
      description:
        'A short, factual biography shown beside authored posts. Do not invent experience.',
    }),
    defineField({
      name: 'role',
      type: 'string',
      description: 'Current, accurate role shown with the byline and in Person jobTitle.',
    }),
    defineField({
      name: 'credentials',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      description:
        'Optional, verifiable qualifications or credentials. These are displayed publicly; do not invent or require them.',
    }),
    defineField({
      name: 'profileUrl',
      type: 'url',
      description: 'An existing public author profile or website; no generated profile route.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'socialUrls',
      title: 'Profile/social URLs',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'url',
          validation: (rule) => rule.uri({scheme: ['http', 'https']}),
        }),
      ],
      description: 'Verified public profiles, shown on posts and used for Person sameAs.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
    }),
  ],
})
