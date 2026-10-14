import 'dotenv/config';
import { createClient } from '@sanity/client';

/**
 * Top Grounding Topics targeting Bing AI Citations, Copilot queries, and Google Search Console intent
 */
export const HIGH_PRIORITY_TOPICS = [
  {
    topic: 'Marketing Automation for Phoenix SMBs: Connecting Leads, CRM, and Client Intake',
    category: 'Marketing Automation',
    targetKeywords: [
      'marketing automation phoenix',
      'marketing automation for smbs arizona',
      'crm automation for small business arizona',
      'marketing automation agency phoenix'
    ],
    rationale: 'Top commercial GSC opportunity: 62 impressions at avg position 11.5 across Valley service intent.',
    sections: [
      {
        heading: 'Why Arizona SMBs Outgrow Manual Lead Management',
        content:
          'Service providers and contractors throughout Phoenix, Scottsdale, and Tucson frequently experience inquiry delays due to manual triage. Research demonstrates responding to an inbound inquiry promptly significantly improves consultation booking rates.\n\nYet many local businesses still rely on unlinked contact forms and manual spreadsheet entries that introduce human error and response friction.'
      },
      {
        heading: 'The 3 Practical Intake Automation Touchpoints',
        content:
          'An effective automation pipeline connects three distinct touchpoints:\n\n1. **Instant Multi-Channel Intake:** Form submissions trigger immediate transactional confirmations via Resend and notification alerts to assigned staff.\n2. **Calendar & Consultation Sync:** Inquiries automatically route into Microsoft Bookings or Outlook schedules with pre-qualification questions answered.\n3. **CRM Sync & Follow-Up Cadence:** New leads are recorded into Supabase/HubSpot with follow-up sequences tailored to their requested service category.'
      },
      {
        heading: 'Implementation Boundaries & Human Review',
        content:
          'Automation should handle intake routing and immediate acknowledgments, while high-value scoping calls and custom quotes remain strictly human-led.'
      }
    ]
  },
  {
    topic: 'Phoenix Conversion Rate Optimization: Finding and Fixing Website Conversion Friction',
    category: 'CRO',
    targetKeywords: [
      'top phoenix cro agencies',
      'phoenix conversion rate optimization agency',
      'phoenix conversion rate optimization services',
      'website conversion checklist'
    ],
    rationale: 'Active GSC cluster with 18+ combined impressions across high-commercial intent Phoenix CRO searches.',
    sections: [
      {
        heading: 'Traffic vs. Conversion: Overcoming Website Friction',
        content:
          'Many businesses in the Phoenix metro area invest in paid search or local SEO, driving qualified visitors to their websites—only to see high bounce rates and low inquiry completion.\n\nConversion Rate Optimization (CRO) focuses on eliminating UX friction, clarifying value propositions, and optimizing mobile tap targets to help visitors take action.'
      },
      {
        heading: 'Actionable CRO Checklist for Local Websites',
        content:
          'Key adjustments that consistently improve on-page conversion include:\n\n- Above-the-fold value propositions with visible contact numbers and direct booking links.\n- Sticky mobile call/schedule buttons that follow scroll progression without obscuring content.\n- Behavioral heatmapping and session recordings using Microsoft Clarity to identify rage clicks and abandoned form fields.\n- Replacing lengthy generic forms with two-step interactive qualifiers.'
      },
      {
        heading: 'Trust Signals and Local Evidence',
        content:
          'Integrating verified Arizona customer reviews, localized project galleries, and clear response-time commitments directly next to conversion forms reduces hesitation and clarifies service scope.'
      }
    ]
  },
  {
    topic: 'Custom Web Applications for Arizona SMBs: When AI Features Make Sense',
    category: 'Web Development',
    targetKeywords: [
      'phoenix ai web agency',
      'custom web application expert in phoenix',
      'fast ai-native builds for small businesses'
    ],
    rationale: 'Specific high-intent conversational query in GSC (22 impressions, position 2.4).',
    sections: [
      {
        heading: 'The Valley SMB Technology Dilemma',
        content:
          'Growing healthcare practices, regional logistics hubs, and specialized contractors in the Phoenix and Scottsdale business corridors often face a common crossroads: off-the-shelf SaaS tools lack custom operational logic, while legacy monolithic platforms are slow, brittle, and difficult to maintain.'
      },
      {
        heading: 'When AI Capabilities Provide Real Value vs. Novelty',
        content:
          'Not every small business needs artificial intelligence. However, embedded AI workflows deliver measurable value when applied to:\n\n- Automated document intake and classification (e.g. PDFs, permits, patient forms).\n- Natural language search over extensive internal technical knowledge bases.\n- Context-preserving customer intake assistants linked directly to operational databases.'
      },
      {
        heading: 'Static-First Architecture and Operational Reliability',
        content:
          'Modern web engineering built on Astro 5, edge deployment (Vercel), and Supabase provides sub-second performance, top security compliance, and zero vulnerability overhead compared to legacy CMS architectures.'
      }
    ]
  },
  {
    topic: 'AI Website Assistants: How to Evaluate Context, Usability, and Lead Quality',
    category: 'AI Automation',
    targetKeywords: [
      'intelligent website assistant reduce visitor bounce',
      'ai bounce rate reduction',
      'context retention chatbot'
    ],
    rationale: 'Evaluation framework for conversational agents and user experience.',
    sections: [
      {
        heading: 'Evaluating Website Concierge Layers',
        content:
          'Traditional static menus and search bars often require visitors to hunt across multiple pages to answer specific operational questions. Contextual website assistants can help visitors quickly locate relevant case studies, service specifications, and pricing qualifiers.'
      },
      {
        heading: 'Stateless Chatbots vs. Session Context Retention',
        content:
          'Stateless pop-up widgets reset every time a visitor navigates between pages, causing visitor frustration. In contrast, modern assistants maintain session memory so when a prospect moves from an overview page to a service tier, the assistant preserves context and offers relevant next steps.'
      },
      {
        heading: 'Evaluation Criteria Before Production Deployment',
        content:
          'Before deploying any AI assistant, verify:\n\n1. **Hallucination boundaries:** Strict retrieval-augmented grounding on approved documentation only.\n2. **Escalation paths:** Seamless fallback to direct consultation scheduling when confidence thresholds are unmet.\n3. **Privacy and compliance:** Ensuring no sensitive personal data is stored without explicit consent.'
      }
    ]
  },
  {
    topic: 'Microsoft Advertising for B2B Businesses: A Practical Evaluation Framework',
    category: 'Paid Search',
    targetKeywords: [
      'Microsoft Ads app advertising evaluation',
      'Microsoft Ads for Apple Business',
      'bing ads 2026 strategy'
    ],
    rationale: 'Framework for evaluating B2B paid search channels beyond single-engine allocation.',
    sections: [
      {
        heading: 'Evaluating the B2B Paid Search Mix',
        content:
          'While Google Ads typically represents the largest share of search volume, Microsoft Advertising provides distinct demographic attributes in B2B markets due to enterprise Windows installations and default Edge usage in corporate environments.'
      },
      {
        heading: 'Key Comparison Metrics to Measure',
        content:
          'When evaluating Microsoft Ads against existing paid search allocations, track:\n\n- Cost-Per-Acquisition (CPA) on high-intent decision-maker search queries.\n- Engagement time and bounce rates from desktop vs. mobile corporate traffic.\n- Session friction and intent quality through native Microsoft Clarity integration.'
      }
    ]
  }
];

const projectId = '92p0tpps';
const dataset = 'production';
const apiVersion = '2024-01-01';
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_SECRET_TOKEN;

export const client = token
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    })
  : null;

/**
 * Converts structured headings and paragraphs into Sanity Portable Text blocks
 */
export function buildPortableText(sections, excerpt) {
  const blocks = [];

  // Excerpt intro block
  if (excerpt) {
    blocks.push({
      _type: 'block',
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', marks: [], text: excerpt }],
    });
  }

  for (const sec of sections) {
    // Heading
    blocks.push({
      _type: 'block',
      style: 'h2',
      markDefs: [],
      children: [{ _type: 'span', marks: [], text: sec.heading }],
    });

    // Content paragraphs
    const paragraphs = sec.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    for (const para of paragraphs) {
      if (para.startsWith('- ') || para.startsWith('1. ') || para.startsWith('2. ') || para.startsWith('3. ')) {
        const listItems = para.split('\n').filter(Boolean);
        for (const item of listItems) {
          const cleanText = item.replace(/^[-*]|\d+\.\s*/, '').trim();
          blocks.push({
            _type: 'block',
            style: 'normal',
            listItem: 'bullet',
            level: 1,
            markDefs: [],
            children: [{ _type: 'span', marks: [], text: cleanText }],
          });
        }
      } else {
        blocks.push({
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', marks: [], text: para }],
        });
      }
    }
  }

  return blocks;
}

/**
 * Sync the global SEO Dashboard singleton
 */
export async function syncSeoDashboard() {
  if (!client) {
    console.warn('⚠️ SANITY_API_TOKEN missing. Skipping dashboard update.');
    return;
  }

  console.log('📊 Updating Sanity SEO Automation Dashboard (globalSeoDashboard)...');
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

  console.log('✅ Successfully synced SEO Automation Dashboard!');
}

/**
 * Creates a complete draft post in Sanity for the chosen topic index
 */
export async function draftPost(topicIndex = 0, status = 'draft') {
  if (!client) {
    throw new Error('SANITY_API_TOKEN is required to draft posts into Sanity.');
  }

  const topicData = HIGH_PRIORITY_TOPICS[topicIndex];
  if (!topicData) {
    throw new Error(`Topic index ${topicIndex} not found in HIGH_PRIORITY_TOPICS.`);
  }

  const slugText = topicData.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  console.log(`\n✍️ Creating ${status.toUpperCase()} post in Sanity:`);
  console.log(`   Title: ${topicData.topic}`);
  console.log(`   Slug: ${slugText}`);
  console.log(`   Category: ${topicData.category}`);

  // Fetch author if available
  const author = await client.fetch('*[_type == "author"][0]{_id}');

  const excerpt = `${topicData.topic}. Written with actionable benchmarks and implementation strategy for 2026.`;
  const bodyBlocks = buildPortableText(topicData.sections, excerpt);

  const documentId = status === 'draft' ? `drafts.${slugText}` : slugText;

  // Safeguard: Check if published document or active draft already exists
  const existing = await client.fetch(
    `*[_id == $docId || _id == $slugText][0]{_id, title}`,
    { docId: documentId, slugText }
  );

  if (existing) {
    console.log(`ℹ️ Document already exists (ID: ${existing._id}). Skipping to preserve human edits and prevent silent overwrite.`);
    return existing;
  }

  const doc = {
    _id: documentId,
    _type: 'post',
    title: topicData.topic,
    slug: {
      _type: 'slug',
      current: slugText,
    },
    publishedAt: new Date().toISOString(),
    category: topicData.category,
    seoDescription: excerpt,
    body: bodyBlocks,
    ...(author ? { authors: [{ _type: 'reference', _ref: author._id, _key: 'author-ref-1' }] } : {}),
  };

  const result = await client.createIfNotExists(doc);
  console.log(`✅ Draft created in Sanity! ID: ${result._id}`);
  console.log(`   Preview in Studio: https://ziaflow.sanity.studio/structure/post;${result._id}`);
  return result;
}

/**
 * Lists published and draft posts in Sanity
 */
export async function listPosts() {
  if (!client) {
    throw new Error('SANITY_API_TOKEN is required.');
  }
  const posts = await client.fetch(
    `*[_type == "post"]|order(publishedAt desc)[0...10]{
      _id,
      title,
      "slug": slug.current,
      publishedAt,
      "isDraft": (_id in path("drafts.**"))
    }`
  );
  console.log('\n📚 Recent Posts in Sanity (Drafts & Published):');
  posts.forEach((p, idx) => {
    const badge = p.isDraft ? '[DRAFT]' : '[PUBLISHED]';
    console.log(`${idx + 1}. ${badge} ${p.title} (/ ${p.slug})`);
  });
  return posts;
}

// CLI handler
async function main() {
  const arg = process.argv[2] || '--sync';

  if (arg === '--sync') {
    await syncSeoDashboard();
  } else if (arg === '--draft-next') {
    await syncSeoDashboard();
    await draftPost(0, 'draft');
  } else if (arg === '--draft-all') {
    await syncSeoDashboard();
    for (let i = 0; i < HIGH_PRIORITY_TOPICS.length; i++) {
      await draftPost(i, 'draft');
    }
  } else if (arg === '--list') {
    await listPosts();
  } else {
    console.log(`
Usage:
  node scripts/sanity-content-agent.mjs [command]

Commands:
  --sync         Sync high priority topic queue to Sanity SEO Dashboard (default)
  --draft-next   Generate a structured draft post for topic #1 in Sanity
  --draft-all    Draft all queued topics into Sanity Studio
  --list         List recent posts (drafts and published) from Sanity
`);
  }
}

main().catch((err) => {
  console.error('Agent execution error:', err);
  process.exit(1);
});
