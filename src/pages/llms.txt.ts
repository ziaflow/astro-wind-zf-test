import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { cleanSlug, getPermalink } from '~/utils/permalinks';

export const GET: APIRoute = async () => {
  const posts = await getCollection('post', ({ data }) => !data.draft);
  const stories = await getCollection('customers');

  const services = [
    {
      title: 'Lead Capture & Marketing Automation (Flagship Sprint)',
      slug: 'automation',
      description:
        'Audit inquiry paths, repair silent form drops, automate <60s SMS/email acknowledgement, and dispatch to CRM with a documented operator runbook.',
    },
    {
      title: 'Phoenix Technical SEO & AI Visibility (GEO/AEO)',
      slug: 'seo',
      description:
        'Striking-distance Search Console optimization, LocalBusiness/Service/FAQPage JSON-LD schema, and Answer Engine Optimization.',
    },
    {
      title: 'High-Speed Astro Web Development',
      slug: 'web-development',
      description:
        'Sub-second websites built on Astro, Tailwind CSS, and Supabase with server-verified lead capture.',
    },
    {
      title: 'Google Local Service Ads (LSA) Management',
      slug: 'local-service-ads',
      description:
        'Google Guaranteed onboarding, territory bidding, credit dispute protection, and rapid lead routing for Arizona contractors.',
    },
    {
      title: 'Google Business Profile (GBP) Optimization',
      slug: 'gmb-optimization',
      description: 'Local Map Pack ranking engineering, category alignment, UTM attribution, and review velocity.',
    },
    {
      title: 'Conversion Rate Optimization (CRO)',
      slug: 'cro',
      description:
        'Microsoft Clarity behavioral heatmap analysis, mobile CTA repair, and interactive ROI & audit lead funnels.',
    },
    {
      title: 'High-Intent PPC & Google Ads Management',
      slug: 'ppc',
      description:
        'Exact-intent paid search paired with dedicated Astro landing pages and offline database conversion tracking.',
    },
    {
      title: 'Review & Reputation Management',
      slug: 'review-management',
      description: 'Automated post-service SMS and email review requests to build 5-star Google & Yelp authority.',
    },
    {
      title: 'Performance Tracking & Supabase Telemetry',
      slug: 'performance-tracking',
      description:
        'Unified database ledger combining Google Search Console, Microsoft Clarity, CallRail, and verified form receipts.',
    },
    {
      title: 'Custom Software & AI Agent Systems',
      slug: 'software',
      description: 'Bespoke full-stack web apps, portals, and grounded AI workflows on Astro, Next.js, and Supabase.',
    },
    {
      title: 'High-Converting E-Commerce Platforms',
      slug: 'ecommerce',
      description: 'Shopify and headless storefront speed optimization with Customer.io retention automation.',
    },
    {
      title: 'Cloud Architecture & Edge Security',
      slug: 'cloud',
      description: 'Supabase RLS security hardening, HMAC webhook verification, and zero-downtime edge deployments.',
    },
    {
      title: 'Social Media Lead Systems',
      slug: 'social-media',
      description: 'Paid social lead funnels wired directly into <60s SMS confirmation and CRM dispatch.',
    },
  ];

  const siteSummary = `
# ZiaFlow — Phoenix Web Engineering, SEO & Lead Automation Agency
> ZiaFlow fixes the gap between a new customer inquiry and a booked job for Arizona service businesses and growth brands. We engineer sub-second Astro websites, execute Fixed-Scope Lead Capture & Follow-Up Sprints, and deploy technical local SEO and Google Local Service Ads.

## Defensible Operating Contract
For every agreed inquiry source, each accepted inquiry is recorded in a verified database ledger, assigned an accountable owner, given a next action, and tracked to a known status.

## Key Funnel & Commercial Pages
- [Homepage](https://ziaflow.com/): Overview of the Lead Capture & Follow-Up Sprint, interactive ROI calculator, and operator proof.
- [Services Hub](https://ziaflow.com/services): All 13 engineering, automation, and search disciplines.
- [Interactive Growth & Diagnostic Tools](https://ziaflow.com/growth-tools): 5 self-serve planning and diagnostic tools (Website Project Estimator, Lead Follow-Up Assessment, Software Stack Assessment, Local Visibility Check, Website Conversion Checklist).
- [Pricing & Sprint Scopes](https://ziaflow.com/pricing): Starter Growth ($950/mo), Lead Capture & Automation ($1,950/mo), and Custom Engineering ($3,800/mo).
- [Free 48-Hour Forensic Audit & Readiness Diagnostic](https://ziaflow.com/audit): Interactive 8-point pipeline readiness checklist + complimentary 10-minute engineering video audit.
- [Case Studies & Implementation Blueprints](https://ziaflow.com/case-studies): Real operational architectures across HVAC, Home Services, Commercial Contracting, and Advisory.
- [About ZiaFlow](https://ziaflow.com/about): Founded in Phoenix, AZ (2021).
- [Contact & Direct Intake](https://ziaflow.com/contact): Direct Phoenix phone, live Microsoft Bookings calendar, and project scope intake.

## Core Services
${services.map((s) => `- [${s.title}](https://ziaflow.com/services/${s.slug}): ${s.description}`).join('\n')}

## Case Studies & Operational Blueprints
${stories.map((c) => `- [${c.data.client} (${c.data.industry})](https://ziaflow.com/customers/${c.id}): ${c.data.summary}`).join('\n')}

## Expertise & Playbooks (Articles)
${posts
  .map((p) => {
    const canonical = p.data.metadata?.canonical || `https://ziaflow.com${getPermalink(cleanSlug(p.id), 'post')}`;
    return `- [${p.data.title}](${canonical}): ${p.data.excerpt || p.data.title}`;
  })
  .join('\n')}

## Contact & Location
- Legal Name: ZiaFlow LLC
- Address: 2822 E Greenway Rd Suite 10 B, Phoenix, AZ 85032
- Phone: +1-602-834-4239
- Email: info@ziaflow.com
- Live Calendar: https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled
  `.trim();

  return new Response(siteSummary, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
