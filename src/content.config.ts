import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.string().url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

const customersCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/kairo/data/customers' }),
  schema: z.object({
    order: z.number(),
    client: z.string(),
    industry: z.string(),
    title: z.string(),
    summary: z.string(),
    cover: z.string(),
    gallery: z.array(z.string()).length(2),
    year: z.string(),
    team: z.string(),
    results: z.array(z.object({ value: z.string(), label: z.string() })).length(3),
    quote: z.object({ text: z.string(), name: z.string(), role: z.string() }),
  }),
});

const journalCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/kairo/data/journal' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    category: z.string(),
    date: z.string(),
    readTime: z.string(),
    cover: z.string(),
    author: z.object({ name: z.string(), role: z.string(), image: z.string() }),
    featured: z.boolean().optional(),
  }),
});

export const collections = {
  post: postCollection,
  customers: customersCollection,
  journal: journalCollection,
};
