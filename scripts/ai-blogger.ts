import { randomUUID } from 'node:crypto';

import { createClient } from '@sanity/client';
import OpenAI from 'openai';
import slugify from 'slugify';
import dotenv from 'dotenv';

dotenv.config();

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID || '92p0tpps';
const SANITY_DATASET = process.env.SANITY_DATASET || 'production';
const SANITY_API_VERSION = process.env.SANITY_API_VERSION || '2023-05-03';
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.2';

if (!SANITY_TOKEN || !OPENAI_API_KEY) {
  console.error('Missing SANITY_API_TOKEN or OPENAI_API_KEY environment variables.');
  process.exit(1);
}

const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  useCdn: false,
  apiVersion: SANITY_API_VERSION,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE,
  defaultQuery: { 'api-version': '2024-05-01-preview' },
  defaultHeaders: { 'api-key': process.env.OPENAI_API_KEY },
});

interface SeoDashboard {
  postingSchedule?: 'daily' | 'weekly' | 'manual';
  dailyRunHourUtc?: number;
  autoPublishGeneratedPosts?: boolean;
  defaultAuthor?: {_ref: string};
  editorialNotes?: string;
  nextScheduledPost?: string;
}

interface ContentCluster {
  title?: string;
  description?: string;
  audience?: string;
  businessGoal?: string;
  primaryServiceSlug?: string;
  pillarKeyword?: string;
  relatedKeywords?: string[];
  internalLinkTargets?: string[];
}

interface ContentTopic {
  _id: string;
  title: string;
  slug?: {current?: string};
  targetKeyword: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  funnelStage?: string;
  desiredCategory?: string;
  priority?: number;
  angle?: string;
  brief?: string;
  internalLinks?: string[];
  cta?: string;
  generatedPost?: {_ref: string};
  cluster?: ContentCluster;
}

interface GeneratedPostPayload {
  title: string;
  seoDescription: string;
  category: string;
  body: string;
}

const DASHBOARD_QUERY = `*[_type == "seoDashboard" && _id == "globalSeoDashboard"][0]{
  postingSchedule,
  dailyRunHourUtc,
  autoPublishGeneratedPosts,
  defaultAuthor,
  editorialNotes,
  nextScheduledPost
}`;

const NEXT_TOPIC_QUERY = `*[
  _type == "contentTopic"
  && status == "approved"
  && !defined(generatedPost->_id)
]|order(priority desc, _createdAt asc)[0]{
  _id,
  title,
  slug,
  targetKeyword,
  secondaryKeywords,
  searchIntent,
  funnelStage,
  desiredCategory,
  priority,
  angle,
  brief,
  internalLinks,
  cta,
  generatedPost,
  "cluster": cluster->{
    title,
    description,
    audience,
    businessGoal,
    primaryServiceSlug,
    pillarKeyword,
    relatedKeywords,
    internalLinkTargets
  }
}`;

const EXISTING_SLUG_QUERY = `count(*[_type == "post" && slug.current == $slug])`;

function calculateNextRun(now: Date, runHourUtc: number): string {
  const nextRun = new Date(now);
  nextRun.setUTCHours(runHourUtc, 0, 0, 0);

  if (nextRun <= now) {
    nextRun.setUTCDate(nextRun.getUTCDate() + 1);
  }

  return nextRun.toISOString();
}

function markdownToPortableText(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      _type: 'block',
      _key: randomUUID().slice(0, 12),
      children: [{_type: 'span', text: paragraph}],
      markDefs: [],
      style: 'normal',
    }));
}

function buildPrompt(topic: ContentTopic, dashboard: SeoDashboard): string {
  const cluster = topic.cluster || {};

  return `
Create a blog post for ZiaFlow using this editorial brief.

Topic title: ${topic.title}
Primary keyword: ${topic.targetKeyword}
Secondary keywords: ${(topic.secondaryKeywords || []).join(', ') || 'None provided'}
Search intent: ${topic.searchIntent || 'informational'}
Funnel stage: ${topic.funnelStage || 'tofu'}
Desired category: ${topic.desiredCategory || 'Use the most appropriate category'}
Editorial angle: ${topic.angle || 'Not specified'}
Content brief: ${topic.brief || 'Not specified'}
CTA: ${topic.cta || 'Invite readers to contact ZiaFlow for help'}

Cluster title: ${cluster.title || 'Not specified'}
Cluster description: ${cluster.description || 'Not specified'}
Audience: ${cluster.audience || 'Not specified'}
Business goal: ${cluster.businessGoal || 'Not specified'}
Primary service slug: ${cluster.primaryServiceSlug || 'Not specified'}
Cluster pillar keyword: ${cluster.pillarKeyword || 'Not specified'}
Cluster keywords: ${(cluster.relatedKeywords || []).join(', ') || 'None provided'}
Suggested internal links: ${[...(cluster.internalLinkTargets || []), ...(topic.internalLinks || [])].join(', ') || 'None provided'}

Global editorial notes: ${dashboard.editorialNotes || 'None provided'}

Requirements:
- Output valid JSON only.
- Provide fields: title, seoDescription, category, body.
- body must be Markdown.
- Write a practical SEO-focused article for business decision-makers.
- Use clear H2 and H3 headings.
- Avoid fabricated statistics unless they are clearly framed as examples or trends.
- Keep the SEO description under 160 characters.
- Include internal-link opportunities naturally using the provided relative URLs when relevant.
- End with a clear CTA that aligns with ZiaFlow services.
`.trim();
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;

  while ((await sanity.fetch<number>(EXISTING_SLUG_QUERY, {slug: candidate})) > 0) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function notifyDeployHook() {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    return;
  }

  const response = await fetch(deployHookUrl, {method: 'POST'});
  if (!response.ok) {
    throw new Error(`Deploy hook failed with status ${response.status}`);
  }
}

async function notifyIndexNow(url: string) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return;
  }

  const payload = {
    host: 'ziaflow.com',
    key,
    keyLocation: `https://ziaflow.com/${key}.txt`,
    urlList: [url],
  };

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {'Content-Type': 'application/json; charset=utf-8'},
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`IndexNow request failed with status ${response.status}`);
  }
}

async function generatePost(topic: ContentTopic, dashboard: SeoDashboard): Promise<GeneratedPostPayload> {
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert SEO content strategist and blog writer for ZiaFlow. Return valid JSON only with title, seoDescription, category, and body.',
      },
      {
        role: 'user',
        content: buildPrompt(topic, dashboard),
      },
    ],
    response_format: {type: 'json_object'},
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('The OpenAI response was empty.');
  }

  const payload = JSON.parse(content) as GeneratedPostPayload;

  if (!payload.title || !payload.seoDescription || !payload.body) {
    throw new Error('The AI response did not include the required fields.');
  }

  return payload;
}

async function updateDashboard(status: string, dashboard: SeoDashboard, now: Date, extra: Record<string, unknown> = {}) {
  const runHour = dashboard.dailyRunHourUtc ?? 9;

  await sanity
    .patch('globalSeoDashboard')
    .set({
      status,
      lastRunTimestamp: now.toISOString(),
      nextScheduledPost: dashboard.postingSchedule === 'daily' ? calculateNextRun(now, runHour) : null,
      ...extra,
    })
    .commit();
}

async function runAgent() {
  console.log('AI Blogger Agent starting...');

  const now = new Date();
  const dashboard = await sanity.fetch<SeoDashboard | null>(DASHBOARD_QUERY);

  if (!dashboard) {
    throw new Error('SEO Dashboard document "globalSeoDashboard" was not found.');
  }

  if (dashboard.postingSchedule === 'manual') {
    console.log('Posting schedule is manual. Exiting without generating a draft.');
    return;
  }

  const topic = await sanity.fetch<ContentTopic | null>(NEXT_TOPIC_QUERY);
  if (!topic) {
    await updateDashboard('READY', dashboard, now, {nextScheduledPost: calculateNextRun(now, dashboard.dailyRunHourUtc ?? 9)});
    console.log('No approved content topics are waiting for drafting.');
    return;
  }

  await updateDashboard('RUNNING', dashboard, now);
  await sanity.patch(topic._id).set({status: 'drafting', lastAttemptAt: now.toISOString()}).commit();

  const generatedPost = await generatePost(topic, dashboard);
  const baseSlug = slugify(generatedPost.title, {lower: true, strict: true}) || slugify(topic.title, {lower: true, strict: true});
  const uniqueSlug = await ensureUniqueSlug(baseSlug);
  const publishedAt = now.toISOString();

  const baseDocument = {
    _type: 'post',
    title: generatedPost.title.trim(),
    slug: {_type: 'slug', current: uniqueSlug},
    publishedAt,
    seoDescription: generatedPost.seoDescription.trim(),
    category: generatedPost.category?.trim() || topic.desiredCategory || 'SEO',
    body: markdownToPortableText(generatedPost.body),
    sourceTopic: {_type: 'reference', _ref: topic._id},
    automationNotes: `Generated from topic "${topic.title}" on ${publishedAt}.`,
    ...(dashboard.defaultAuthor ? {authors: [{_type: 'reference', _ref: dashboard.defaultAuthor._ref}]} : {}),
  };

  const autoPublish = dashboard.autoPublishGeneratedPosts === true;
  const postId = autoPublish ? `post-${randomUUID()}` : `drafts.post-${randomUUID()}`;
  const createdPost = await sanity.create({_id: postId, ...baseDocument});

  await sanity
    .patch(topic._id)
    .set({
      status: autoPublish ? 'published' : 'review',
      generatedPost: {_type: 'reference', _ref: createdPost._id},
      lastAttemptAt: now.toISOString(),
    })
    .commit();

  await updateDashboard('READY', dashboard, now);

  console.log(`${autoPublish ? 'Published' : 'Drafted'} post "${generatedPost.title}" from topic "${topic.title}".`);

  if (autoPublish) {
    const postUrl = `https://ziaflow.com/${uniqueSlug}`;
    await notifyIndexNow(postUrl);
    await notifyDeployHook();
  }
}

runAgent().catch(async (error) => {
  console.error('AI Blogger Agent failed:', error);

  try {
    const dashboard = await sanity.fetch<SeoDashboard | null>(DASHBOARD_QUERY);
    if (dashboard) {
      await sanity.patch('globalSeoDashboard').set({status: 'ERROR'}).commit();
    }
  } catch (dashboardError) {
    console.error('Failed to update dashboard status after error:', dashboardError);
  }

  process.exit(1);
});
