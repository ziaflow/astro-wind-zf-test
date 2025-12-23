import { createClient } from '@sanity/client';
import OpenAI from 'openai';
import slugify from 'slugify';
import dotenv from 'dotenv';

// Load environment variables via dotenv if running locally
dotenv.config();

// --- Configuration ---
const SANITY_PROJECT_ID = '92p0tpps';
const SANITY_DATASET = 'production';
const SANITY_API_VERSION = '2023-05-03';
// NOTE: SANITY_API_TOKEN must be a "Editor" or "Admin" token from Sanity Management
const SANITY_TOKEN = process.env.SANITY_API_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SANITY_TOKEN || !OPENAI_API_KEY) {
  console.error('Missing SANITY_API_TOKEN or OPENAI_API_KEY environment variables.');
  process.exit(1);
}

// Initialize Clients
const sanity = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_TOKEN,
  useCdn: false, // We need fresh data for the agent
  apiVersion: SANITY_API_VERSION,
});

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// --- Main Agent Logic ---
async function runAgent() {
  console.log('🤖 AI Blogger Agent Starting...');

  // 1. Fetch Dashboard State
  const dashboard = await sanity.fetch(`*[_type == "seoDashboard" && _id == "globalSeoDashboard"][0]`);

  if (!dashboard) {
    console.error('❌ SEO Dashboard not found. Please create a document with ID "globalSeoDashboard" in Sanity.');
    process.exit(1);
  }

  // 2. Check Schedule
  const { postingSchedule, nextScheduledPost, topicsQueue, keywordGaps } = dashboard;
  const now = new Date();

  console.log(
    `📅 Schedule: ${postingSchedule}, Next Post: ${nextScheduledPost || 'Not set'}, Time: ${now.toISOString()}`
  );

  // If manual, we only run if explicitly triggered? For now, let's assume this script IS the trigger.
  // But if scheduled "daily", we check if we passed the time.
  // For simplicity MVP: If there is a topic in the queue, we write it!
  // The schedule check would be handled by the GitHub Action frequency in a real strict setup,
  // or we verify here. Let's just process the queue if items exist.

  let topic = '';

  // Priority 1: Manual Topics Queue
  if (topicsQueue && topicsQueue.length > 0) {
    topic = topicsQueue[0];
    console.log(`🎯 Found topic in queue: "${topic}"`);
  }
  // Priority 2: AI Keyword Gaps
  else if (keywordGaps && keywordGaps.length > 0) {
    // Pick the highest priority
    interface KeywordGap {
      keyword: string;
      priority?: number;
    }
    const gap = keywordGaps.sort((a: KeywordGap, b: KeywordGap) => (b.priority || 0) - (a.priority || 0))[0];
    topic = gap.keyword;
    console.log(`🎯 Found keyword gap: "${topic}"`);
  } else {
    console.log('💤 No topics found in Queue or Keyword Gaps. Exiting.');
    return;
  }

  // 3. Generate Content
  console.log(`✍️ Generating content for: ${topic}...`);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an expert SEO content writer for ZiaFlow, a digital marketing agency.
        Generate a comprehensive blog post in JSON format with the following fields:
        - title: Catchy, SEO-optimized title (string)
        - seoDescription: A meta description under 160 characters (string)
        - body: The full article content in Markdown format. Use H2 (##) and H3 (###) headers. (string)
        - category: A relevant category (e.g., SEO, Marketing, Automation) (string)
        
        The tone should be professional, authoritative, yet accessible. Focus on actionable insights.`,
      },
      {
        role: 'user',
        content: `Write a blog post about: "${topic}"`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const responseContent = completion.choices[0].message.content;
  if (!responseContent) {
    throw new Error('Failed to get response from OpenAI');
  }

  const generatedPost = JSON.parse(responseContent);

  // 4. Transform Markdown to Portable Text (Simplified for MVP)
  // For a robust solution we'd use a markdown-to-portable-text parser.
  // For now, we will just create a single block with the raw markdown if we don't have a parser,
  // BUT Sanity expects Portable Text blocks.
  // We will split by paragraphs to make it roughly compatible or use a simple block structure.

  // BETTER APPROACH: Just assume the user has a way to render markdown or we treat it as basic blocks.
  // Let's create simple blocks.
  const blocks = generatedPost.body.split('\n\n').map((para: string) => ({
    _type: 'block',
    _key: Math.random().toString(36).substring(7),
    children: [{ _type: 'span', text: para }],
    markDefs: [],
    style: 'normal',
  }));

  // 5. Publish to Sanity
  const slug = slugify(generatedPost.title, { lower: true, strict: true });

  const doc = {
    _type: 'post',
    title: generatedPost.title,
    slug: { _type: 'slug', current: slug },
    publishedAt: new Date().toISOString(),
    seoDescription: generatedPost.seoDescription,
    category: generatedPost.category,
    body: blocks,
    // Add authors if you have a default one, otherwise leave blank or fetch 'me'
  };

  const createdPost = await sanity.create(doc);
  console.log(`✅ Post published: ${createdPost.title} (${createdPost._id})`);

  // 6. Update Dashboard
  // Remove the used topic
  // Update last run time
  const mutations = [];

  if (topicsQueue && topicsQueue.length > 0 && topicsQueue[0] === topic) {
    // Remove first element
    // Sanity array removal can be tricky with unset by index, easiest is to filter
    const newQueue = topicsQueue.slice(1);
    mutations.push({ patch: { id: 'globalSeoDashboard', set: { topicsQueue: newQueue } } });
  }

  // If we used a keyword gap, we might want to remove it too, but let's stick to queue for now logic.

  mutations.push({
    patch: {
      id: 'globalSeoDashboard',
      set: {
        lastRunTimestamp: new Date().toISOString(),
        status: 'READY',
      },
    },
  });

  // Execute patches
  for (const mut of mutations) {
    await sanity.transaction().patch(mut.patch.id, mut.patch).commit();
  }

  console.log('🏁 Dashboard updated.');
}

runAgent().catch((err) => {
  console.error('❌ Agent crashed:', err);
  process.exit(1);
});
