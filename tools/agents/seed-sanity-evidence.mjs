import 'dotenv/config';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '92p0tpps',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function populateEvidenceAndKeywords() {
  console.log('🚀 Seeding Company Profile, Clusters, and Keyword Opportunities in Sanity...');

  // 1. Company Profile Singleton
  const companyProfileDoc = {
    _id: 'globalCompanyProfile',
    _type: 'companyProfile',
    companyName: 'ZiaFlow',
    legalName: 'ZiaFlow LLC',
    headquarters: 'Phoenix, Arizona',
    zipCode: '85023',
    serviceAreaSummary: 'Phoenix metro area, Scottsdale, Tucson, Glendale, and remote clients nationwide.',
    approvedServices: [
      {
        _key: 'srv-web',
        title: 'Websites & Web Development',
        canonicalPath: '/services/web-development',
        summary:
          'Astro 5 and modern web applications built for fast loading, clean structure, and reliable client intake.',
      },
      {
        _key: 'srv-soft',
        title: 'Custom Software & Internal Tools',
        canonicalPath: '/services/software',
        summary: 'Bespoke business applications, client portals, and internal workflows tailored to operational logic.',
      },
      {
        _key: 'srv-auto',
        title: 'Lead & Workflow Automation',
        canonicalPath: '/services/automation',
        summary: 'Connecting forms, CRMs, scheduling calendars, and notification pipelines with human checkpoints.',
      },
      {
        _key: 'srv-seo',
        title: 'Technical SEO & Website Improvement',
        canonicalPath: '/services/seo',
        summary: 'Grounding search visibility, crawl health, and on-page conversion for Arizona service businesses.',
      },
    ],
  };

  await client.createOrReplace(companyProfileDoc);
  console.log('✅ Created / Updated globalCompanyProfile');

  // 2. Topic Clusters
  const clusterAuto = {
    _id: 'cluster-automation',
    _type: 'topicCluster',
    title: 'Lead & Marketing Automation for Service Businesses',
    slug: { _type: 'slug', current: 'automation' },
    buyerProblem:
      'Manual lead triage, delayed response times to inquiries, and siloed spreadsheets cause dropped leads.',
    commercialAnchor: {
      anchorText: 'Phoenix marketing automation services',
      url: 'https://ziaflow.com/services/automation',
    },
    approvedClaims: [
      'Fast response times to web inquiries significantly improve initial consultation booking rates.',
      'Automation routes and logs inquiries reliably, but custom estimates and scoping calls remain human-led.',
    ],
  };

  const clusterSoftware = {
    _id: 'cluster-software',
    _type: 'topicCluster',
    title: 'Custom Web Applications & Internal Business Tools',
    slug: { _type: 'slug', current: 'custom-software' },
    buyerProblem: 'Off-the-shelf software lacks custom workflow rules; manual processes cause operational friction.',
    commercialAnchor: {
      anchorText: 'custom web applications for Arizona businesses',
      url: 'https://ziaflow.com/services/software',
    },
    approvedClaims: [
      'Modern web apps built with Astro and Supabase provide sub-second load times and lower maintenance overhead.',
    ],
  };

  await client.createOrReplace(clusterAuto);
  await client.createOrReplace(clusterSoftware);
  console.log('✅ Created / Updated Topic Clusters');

  // 3. Keyword Opportunities from GSC
  const keywordDocs = [
    {
      _id: 'kw-marketing-automation-phoenix',
      _type: 'keywordOpportunity',
      query: 'marketing automation phoenix',
      sourcePlatform: 'gsc',
      landingPage: 'https://ziaflow.com/services/automation',
      impressions: 62,
      clicks: 0,
      averagePosition: 11.5,
      ctr: 0.0,
      reportDateRange: '2026-07-12 to 2026-10-11',
      targetCluster: { _type: 'reference', _ref: 'cluster-automation' },
      recommendedAction: 'optimize_service',
    },
    {
      _id: 'kw-marketing-automation-smbs-arizona',
      _type: 'keywordOpportunity',
      query: 'marketing automation for smbs arizona',
      sourcePlatform: 'gsc',
      landingPage: 'https://ziaflow.com/services/automation',
      impressions: 12,
      clicks: 0,
      averagePosition: 8.4,
      ctr: 0.0,
      reportDateRange: '2026-07-12 to 2026-10-11',
      targetCluster: { _type: 'reference', _ref: 'cluster-automation' },
      recommendedAction: 'optimize_service',
    },
    {
      _id: 'kw-crm-automation-small-business-arizona',
      _type: 'keywordOpportunity',
      query: 'crm automation for small business arizona',
      sourcePlatform: 'gsc',
      landingPage: 'https://ziaflow.com/services/software',
      impressions: 0,
      clicks: 0,
      averagePosition: 0,
      ctr: 0.0,
      reportDateRange: '2026-07-12 to 2026-10-11',
      targetCluster: { _type: 'reference', _ref: 'cluster-software' },
      recommendedAction: 'supporting_guide',
    },
    {
      _id: 'kw-small-business-phoenix-website-internal-tool',
      _type: 'keywordOpportunity',
      query:
        'i run a small business in phoenix and need a website and internal tool built with ai. what local development companies in the phoenix area specialize in fast ai-native builds for small businesses?',
      sourcePlatform: 'gsc',
      landingPage: 'https://ziaflow.com/services/software',
      impressions: 22,
      clicks: 0,
      averagePosition: 2.4,
      ctr: 0.0,
      reportDateRange: '2026-07-12 to 2026-10-11',
      targetCluster: { _type: 'reference', _ref: 'cluster-software' },
      recommendedAction: 'optimize_service',
    },
  ];

  for (const kw of keywordDocs) {
    await client.createOrReplace(kw);
    console.log(`✅ Saved keywordOpportunity: "${kw.query.slice(0, 40)}..." -> ${kw.landingPage}`);
  }

  console.log('\n🎉 Finished seeding evidence and keyword opportunities in Sanity Content Lake!');
}

populateEvidenceAndKeywords().catch((err) => {
  console.error('Error populating evidence:', err);
  process.exit(1);
});
