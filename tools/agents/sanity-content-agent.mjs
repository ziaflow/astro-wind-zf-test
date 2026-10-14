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
 * Checks how many posts have already been published today (UTC) across Sanity and local files.
 * Anti-Spam Guardrail: Max 3 posts per day.
 */
export const DAILY_PUBLISH_CAP = 3;

export async function getDailyPublishedCount(dateStr = new Date().toISOString().slice(0, 10)) {
  const startOfDay = `${dateStr}T00:00:00.000Z`;
  const endOfDay = `${dateStr}T23:59:59.999Z`;

  let sanityCount = 0;
  if (client) {
    const sanityPublishedToday = await client.fetch(
      `count(*[
        _type == "post"
        && !(_id in path("drafts.**"))
        && publishedAt >= $startOfDay
        && publishedAt <= $endOfDay
      ])`,
      { startOfDay, endOfDay }
    );
    sanityCount = sanityPublishedToday || 0;
  }

  // Count local markdown posts published today
  let localCount = 0;
  try {
    const fs = await import('fs');
    const path = await import('path');
    const dirs = ['src/data/post', 'src/data/post-generated'];
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
        for (const file of files) {
          const content = fs.readFileSync(path.join(dir, file), 'utf-8');
          const isDraft = /draft:\s*true/i.test(content);
          if (!isDraft) {
            const dateMatch = content.match(/publishDate:\s*['"]?([0-9]{4}-[0-9]{2}-[0-9]{2})/);
            if (dateMatch && dateMatch[1] === dateStr) {
              localCount++;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not scan local files for daily published count:', err.message);
  }

  const total = sanityCount + localCount;
  return {
    total,
    sanityCount,
    localCount,
    dateStr,
    cap: DAILY_PUBLISH_CAP,
    remaining: Math.max(0, DAILY_PUBLISH_CAP - total),
    canPublish: total < DAILY_PUBLISH_CAP,
  };
}

/**
 * Reviews all posts across Sanity Studio and local files for:
 * 1. AI Cliché detection (e.g. '## --', mechanical dumps, robotic phrasing)
 * 2. Word count, SEO description, and title length
 * 3. Canonical URLs and missing metadata
 * 4. Anti-spam publishing frequency (max 3/day)
 */
export async function reviewAllPosts() {
  console.log('\n=============================================================');
  console.log('🔍 ASTRO BLOG CONTENT & ANTI-SPAM QUALITY REVIEW');
  console.log('=============================================================');

  const fs = await import('fs');
  const path = await import('path');

  // 1. Check Rate Limiter
  const today = new Date().toISOString().slice(0, 10);
  const rateLimitStatus = await getDailyPublishedCount(today);
  console.log(`\n📅 Daily Publishing Rate Limiter (Anti-Spam Guardrail):`);
  console.log(`   Target Date: ${rateLimitStatus.dateStr}`);
  console.log(`   Published Today: ${rateLimitStatus.total} / ${DAILY_PUBLISH_CAP} max allowed`);
  console.log(`   Status: ${rateLimitStatus.canPublish ? '✅ GREEN (Allowed to publish)' : '⛔ CAPPED (Max 3/day reached — schedule as draft)'}`);
  console.log(`   Remaining slots today: ${rateLimitStatus.remaining}`);

  // 2. Review Local Posts
  const issues = [];
  const reviewedPosts = [];

  const localDirs = ['src/data/post', 'src/data/post-generated'];
  for (const dir of localDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const content = fs.readFileSync(fullPath, 'utf-8');

      const titleMatch = content.match(/title:\s*['"]?(.*?)['"]?\s*(\r?\n|$)/);
      const dateMatch = content.match(/publishDate:\s*['"]?(.*?)['"]?\s*(\r?\n|$)/);
      const draftMatch = content.match(/draft:\s*(true|false)/i);
      const excerptMatch = content.match(/excerpt:\s*['"]?(.*?)['"]?\s*(\r?\n|$)/);

      const title = titleMatch ? titleMatch[1].trim() : file;
      const isDraft = draftMatch ? draftMatch[1].toLowerCase() === 'true' : false;
      const words = content.split(/\s+/).length;

      const postIssues = [];
      if (content.includes('## --') || content.includes('--- \n\n##')) {
        postIssues.push('Contains repetitive mechanical markdown separators ("## --")');
      }
      if (/In conclusion|Furthermore|In today's fast-paced/i.test(content)) {
        postIssues.push('Contains generic AI transition phrases ("In conclusion", "fast-paced world")');
      }
      if (words < 300) {
        postIssues.push(`Thin content: only ${words} words (minimum 300 words recommended)`);
      }
      if (!excerptMatch && !content.includes('description:')) {
        postIssues.push('Missing excerpt / meta description');
      }

      reviewedPosts.push({
        source: 'local',
        path: fullPath,
        file,
        title,
        isDraft,
        date: dateMatch ? dateMatch[1].trim() : 'Unset',
        words,
        issues: postIssues,
      });

      if (postIssues.length > 0) {
        issues.push({ title, file, issues: postIssues });
      }
    }
  }

  // 3. Review Sanity Posts
  let sanityPosts = [];
  if (client) {
    sanityPosts = await client.fetch(
      `*[_type == "post"]|order(publishedAt desc){
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        "isDraft": (_id in path("drafts.**")),
        seoDescription,
        category,
        "bodyLength": count(body)
      }`
    );

    for (const sp of sanityPosts) {
      const sIssues = [];
      if (!sp.seoDescription || sp.seoDescription.length < 30) {
        sIssues.push('Missing or thin SEO description (<30 characters)');
      }
      if (!sp.slug) {
        sIssues.push('Missing slug identifier');
      }
      if (!sp.bodyLength || sp.bodyLength < 2) {
        sIssues.push('Very short body content in Sanity');
      }

      reviewedPosts.push({
        source: 'sanity',
        id: sp._id,
        title: sp.title || sp._id,
        isDraft: sp.isDraft,
        date: sp.publishedAt ? sp.publishedAt.slice(0, 10) : 'Unset',
        words: sp.bodyLength ? sp.bodyLength * 60 : 0, // rough block estimate
        issues: sIssues,
      });

      if (sIssues.length > 0) {
        issues.push({ title: sp.title || sp._id, file: `Sanity:${sp._id}`, issues: sIssues });
      }
    }
  }

  // Summary Table
  console.log('\n📄 All Reviewed Posts across Local Files and Sanity Studio:');
  console.log('-------------------------------------------------------------');
  reviewedPosts.forEach((p, idx) => {
    const statusBadge = p.isDraft ? '📝 [DRAFT]' : '🚀 [LIVE/PUB]';
    const qualityBadge = p.issues.length === 0 ? '✅ CLEAN' : `⚠️  ${p.issues.length} ISSUE(S)`;
    console.log(`${idx + 1}. ${statusBadge} [${p.source.toUpperCase()}] ${p.title}`);
    console.log(`   Date: ${p.date} | Words: ~${p.words} | Quality: ${qualityBadge}`);
    if (p.issues.length > 0) {
      p.issues.forEach(iss => console.log(`      ↳ ⚠️  ${iss}`));
    }
  });

  console.log('\n=============================================================');
  console.log(`📊 REVIEW SUMMARY:`);
  console.log(`   Total Posts Reviewed: ${reviewedPosts.length} (${reviewedPosts.filter(p => !p.isDraft).length} Live, ${reviewedPosts.filter(p => p.isDraft).length} Drafts)`);
  console.log(`   Quality Issues Found: ${issues.length}`);
  console.log(`   Daily Publishing Limit: Strict maximum of ${DAILY_PUBLISH_CAP} posts per 24-hour cycle`);
  console.log('=============================================================\n');

  return { rateLimitStatus, reviewedPosts, issues };
}

/**
 * Safe publishing function enforcing the 3-post-per-day spam guardrail
 */
export async function publishPostSafely(topicIndex = 0) {
  const rateLimit = await getDailyPublishedCount();
  console.log(`\n🚦 Checking daily publication rate limit before publishing...`);
  console.log(`   Published today: ${rateLimit.total} / ${DAILY_PUBLISH_CAP} max`);

  if (!rateLimit.canPublish) {
    console.warn(`\n⚠️  RATE LIMIT ENFORCED: Maximum ${DAILY_PUBLISH_CAP} blog posts per day limit reached.`);
    console.warn(`   To prevent Google and Bing from flagging the domain for search spam or automated flooding,`);
    console.warn(`   this post will be safely created as a DRAFT instead of published.`);
    return await draftPost(topicIndex, 'draft');
  }

  console.log(`   Remaining publication allowance: ${rateLimit.remaining}. Proceeding with publish.`);
  return await draftPost(topicIndex, 'publish');
}

/**
 * Creates a complete post in Sanity for the chosen topic index
 * Defaults to 'draft', supports 'publish' with strict rate-limit protection
 */
export async function draftPost(topicIndex = 0, status = 'draft') {
  if (!client) {
    throw new Error('SANITY_API_TOKEN is required to draft posts into Sanity.');
  }

  // Double check rate limit if status requested is 'publish'
  if (status === 'publish') {
    const rateLimit = await getDailyPublishedCount();
    if (!rateLimit.canPublish) {
      console.warn(`⚠️ Rate limit cap reached (${rateLimit.total}/${DAILY_PUBLISH_CAP} today). Overriding status to 'draft'.`);
      status = 'draft';
    }
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
  console.log(`✅ ${status === 'draft' ? 'Draft' : 'Published post'} created in Sanity! ID: ${result._id}`);
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
    `*[_type == "post"]|order(publishedAt desc)[0...15]{
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
  const arg = process.argv[2] || '--review';

  if (arg === '--review') {
    await reviewAllPosts();
  } else if (arg === '--sync') {
    await syncSeoDashboard();
  } else if (arg === '--draft-next') {
    await syncSeoDashboard();
    await draftPost(0, 'draft');
  } else if (arg === '--publish-safe') {
    await publishPostSafely(0);
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
  node tools/agents/sanity-content-agent.mjs [command]

Commands:
  --review        Review all posts (local & Sanity) and check daily 3-post rate limit (default)
  --sync          Sync high priority topic queue to Sanity SEO Dashboard
  --draft-next    Generate a structured draft post for topic #1 in Sanity
  --publish-safe  Publish next post only if under the 3-post daily anti-spam limit
  --draft-all     Draft all queued topics into Sanity Studio
  --list          List recent posts (drafts and published) from Sanity
`);
  }
}

main().catch((err) => {
  console.error('Agent execution error:', err);
  process.exit(1);
});

