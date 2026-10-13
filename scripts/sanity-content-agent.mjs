import 'dotenv/config';
import { createClient } from '@sanity/client';

/**
 * Top Grounding Topics identified from Bing AI Citations & Search Console
 */
const HIGH_PRIORITY_TOPICS = [
  {
    topic: 'Intelligent Website Assistants: How AI Decreases Bounce Rate & Retains Context',
    category: 'AI & Performance',
    targetKeywords: ['intelligent website assistant reduce visitor bounce', 'ai bounce rate reduction', 'context retention chatbot'],
    rationale: '180+ Bing Copilot AI citations; strong demand for AI assistants solving site abandonment.'
  },
  {
    topic: 'Microsoft Advertising Evaluation: Why B2B & App Marketers Are Shifting Budgets in 2026',
    category: 'Paid Search',
    targetKeywords: ['Microsoft Ads app advertising evaluation', 'Microsoft Ads for Apple Business', 'bing ads 2026 strategy'],
    rationale: '39% citation share on Copilot queries evaluating Microsoft Ads vs Google Ads.'
  },
  {
    topic: 'Phoenix AI Web Engineering: Building Custom High-Performance Web Apps for Arizona SMBs',
    category: 'Web Development',
    targetKeywords: ['phoenix ai web agency', 'custom web application expert in phoenix', 'fast ai-native builds for small businesses'],
    rationale: 'Google Search Console rank #2.4 on local conversational queries; high commercial intent in Phoenix.'
  }
];

const projectId = '92p0tpps';
const dataset = 'production';
const apiVersion = '2024-01-01';
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_SECRET_TOKEN;

const client = token
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
  : null;

async function run() {
  console.log('🤖 Running Sanity Content & SEO Orchestrator...');

  if (!token) {
    console.warn('⚠️ Warning: SANITY_API_TOKEN not found in environment.');
  }

  // 1. Sync Topics Queue & Keyword Gaps to the Singleton Dashboard in Sanity
  console.log('📊 Updating Sanity SEO Automation Dashboard (globalSeoDashboard)...');
  
  if (client) {
    try {
      await client
        .patch('globalSeoDashboard')
        .set({
          status: 'ACTIVE',
          lastRunTimestamp: new Date().toISOString(),
          topicsQueue: HIGH_PRIORITY_TOPICS.map((t) => t.topic),
          keywordGaps: HIGH_PRIORITY_TOPICS.flatMap((t, idx) =>
            t.targetKeywords.map((kw) => ({
              _type: 'object',
              keyword: kw,
              priority: 10 - idx * 2,
            }))
          ),
        })
        .commit({ autoGenerateArrayKeys: true });
      console.log('✅ Successfully synced AI topics queue and keyword opportunities to Sanity Studio!');
    } catch (err) {
      console.warn('⚠️ Could not patch globalSeoDashboard document:', err.message);
    }
  } else {
    console.log('ℹ️ Client initialized in read-only / simulation mode (set SANITY_API_TOKEN in .env to persist directly to Studio).');
  }

  console.log('\n📌 High Priority Topics Ready for Drafting:');
  HIGH_PRIORITY_TOPICS.forEach((item, index) => {
    console.log(`\n[${index + 1}] ${item.topic}`);
    console.log(`    Category: ${item.category}`);
    console.log(`    Keywords: ${item.targetKeywords.join(', ')}`);
    console.log(`    Why: ${item.rationale}`);
  });
}

run().catch((err) => {
  console.error('Agent run error:', err);
  process.exit(1);
});
