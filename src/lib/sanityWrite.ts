import { createClient, type SanityClient } from '@sanity/client';

const projectId = '92p0tpps';
const dataset = 'production';
const apiVersion = '2024-01-01';

const token = process.env.SANITY_API_TOKEN || import.meta.env.SANITY_API_TOKEN || process.env.SANITY_SECRET_TOKEN;

/**
 * Server-only authenticated Sanity Client for AI Agents and automated content syndication
 */
export const sanityWriteClient: SanityClient | null = token
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
  : null;

/**
 * Convert plain markdown text into simple PortableText blocks acceptable by Sanity
 */
export function markdownToPortableText(markdown: string): Array<{
  _type: 'block';
  style: 'normal';
  markDefs: unknown[];
  children: Array<{ _type: 'span'; text: string; marks: string[] }>;
}> {
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((para) => ({
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        text: para,
        marks: [],
      },
    ],
  }));
}

export interface PublishToSanityOptions {
  title: string;
  slug?: string;
  bodyMarkdown: string;
  category?: string;
  seoDescription?: string;
  publishedAt?: string;
}

/**
 * Helper to draft or publish a blog post directly into Sanity CMS
 */
export async function createSanityPost(options: PublishToSanityOptions) {
  if (!sanityWriteClient) {
    throw new Error('Sanity write client unavailable. SANITY_API_TOKEN is missing.');
  }

  const slug =
    options.slug ||
    options.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const doc = {
    _type: 'post',
    title: options.title,
    slug: { _type: 'slug', current: slug },
    publishedAt: options.publishedAt || new Date().toISOString(),
    category: options.category || 'General',
    seoDescription: options.seoDescription || options.title,
    body: markdownToPortableText(options.bodyMarkdown),
  };

  const created = await sanityWriteClient.create(doc);
  return created;
}

/**
 * Updates the AI SEO Automation Dashboard singleton in Sanity Studio
 */
export async function updateSeoDashboard(data: {
  status?: string;
  topicsQueue?: string[];
  keywordGaps?: Array<{ keyword: string; priority: number }>;
}) {
  if (!sanityWriteClient) return null;

  try {
    const patches: Record<string, unknown> = {
      lastRunTimestamp: new Date().toISOString(),
    };

    if (data.status) patches.status = data.status;
    if (data.topicsQueue) patches.topicsQueue = data.topicsQueue;
    if (data.keywordGaps) patches.keywordGaps = data.keywordGaps;

    const updated = await sanityWriteClient
      .patch('globalSeoDashboard')
      .set(patches)
      .commit({ autoGenerateArrayKeys: true });

    return updated;
  } catch (err) {
    console.warn('Non-blocking SEO Dashboard update error:', err);
    return null;
  }
}
