import {defineField, defineType} from 'sanity'

export const redirectType = defineType({
  name: 'redirect',
  title: 'Redirect',
  type: 'document',
  fields: [
    defineField({
      name: 'from',
      title: 'From Path (Source)',
      type: 'string',
      description: 'Incoming path, e.g. /old-blog-post or /promo',
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true
          return value.startsWith('/') ? true : 'Path must start with a slash (/)'
        }),
    }),
    defineField({
      name: 'to',
      title: 'To Path or URL (Destination)',
      type: 'string',
      description: 'Destination internal path (/posts/my-post) or external URL (https://...)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isPermanent',
      title: 'Permanent Redirect (301)',
      type: 'boolean',
      description: 'Checked = 301 Permanent (SEO Link Equity), Unchecked = 302 Temporary',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      from: 'from',
      to: 'to',
      isPermanent: 'isPermanent',
    },
    prepare({from, to, isPermanent}) {
      return {
        title: `${from} ➔ ${to}`,
        subtitle: isPermanent ? '301 Permanent' : '302 Temporary',
      }
    },
  },
})
