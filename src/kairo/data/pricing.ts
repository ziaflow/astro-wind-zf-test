import { site } from '@/data/site';
import type { CompareGroup, Faq, Plan } from '@/interface';

export const plans: Plan[] = [
  {
    name: 'Starter Growth',
    monthly: 950,
    yearly: 790,
    description: 'For local Phoenix service businesses seeking fast search visibility and reliable lead capture.',
    cta: 'Start Growth Plan',
    href: '/contact#form',
    features: [
      'Local Phoenix SEO & Google Business Profile optimization',
      'Core Web Vitals & mobile speed engineering',
      'Verified form capture & database receipt logging',
      'Automated prospect email confirmation',
      'Monthly search & lead attribution report',
    ],
  },
  {
    name: 'Lead Capture & Automation',
    monthly: 1950,
    yearly: 1650,
    description: 'Our signature Sprint + managed system for service businesses ready to eliminate missed inquiries.',
    cta: site.cta.primary.label,
    href: site.cta.primary.href,
    featured: true,
    features: [
      'Everything in Starter Growth',
      'Full Lead-Path Audit across forms, phone & Google LSAs',
      'Instant SMS & email owner dispatch (<60s acknowledgement)',
      'CRM & calendar booking synchronization',
      'Automated post-service Google review collection flow',
      'Documented operator runbook & weekly optimization sync',
    ],
  },
  {
    name: 'Custom Engineering',
    monthly: 3800,
    yearly: 3200,
    description: 'For multi-location operators and brands needing custom Astro/Next.js apps and AI workflow pipelines.',
    cta: 'Scope Custom Build',
    href: '/contact#form',
    features: [
      'Everything in Lead Capture & Automation',
      'Bespoke web applications & portals (Astro / React / Supabase)',
      'Multi-agent AI triage & custom webhook integrations',
      'Full-funnel Google Local Service Ads (LSA) & PPC management',
      'Dedicated Lead Systems Engineer & priority SLA',
    ],
  },
];

export const compareGroups: CompareGroup[] = [
  {
    title: 'Lead Capture & Follow-Up',
    rows: [
      { feature: 'Connected inquiry sources (Forms, Calls, LSAs)', values: ['Up to 3', 'Unlimited', 'Unlimited + Custom API'] },
      { feature: 'Atomic Supabase lead & receipt persistence', values: [true, true, true] },
      { feature: 'Instant prospect acknowledgement (<60s)', values: [true, true, true] },
      { feature: 'SMS & CRM owner dispatch with escalation', values: [false, true, true] },
      { feature: 'Documented operator follow-up runbook', values: [false, true, true] },
    ],
  },
  {
    title: 'SEO, Ads & Web Performance',
    rows: [
      { feature: 'Technical SEO & Core Web Vitals tuning', values: [true, true, true] },
      { feature: 'Google Business Profile (GBP) management', values: [true, true, true] },
      { feature: 'Automated review request & reputation flow', values: [false, true, true] },
      { feature: 'Custom conversion landing pages & CRO', values: ['1 page / qtr', 'Monthly testing', 'Unlimited custom builds'] },
      { feature: 'Google Local Service Ads (LSA) & PPC management', values: [false, 'Optional add-on', true] },
    ],
  },
  {
    title: 'Engineering, Telemetry & Support',
    rows: [
      { feature: 'Search Console & Clarity behavioral analytics', values: [true, true, true] },
      { feature: 'Custom Supabase / Webhook / ERP integrations', values: [false, true, true] },
      { feature: 'Bespoke software & internal tool development', values: [false, false, true] },
      { feature: 'Dedicated Phoenix engineering support', values: ['Email & monthly call', 'Weekly strategy sync', 'Direct Slack & priority SLA'] },
    ],
  },
];

export const faqs: Faq[] = [
  {
    question: 'What is included in the Lead Capture & Follow-Up Sprint?',
    answer: `We audit every inquiry channel your business uses (website forms, phone tracking numbers, Google Local Service Ads), repair silent capture failures, wire instant prospect acknowledgement and internal staff notifications, and hand over a plain-English operator runbook so every accepted inquiry has an assigned owner and known status.`,
  },
  {
    question: 'How fast can you audit and repair our existing website and lead flow?',
    answer:
      'Our initial forensic audit is delivered within 48 hours. A standard Lead Capture & Follow-Up Sprint is implemented, tested end-to-end with tagged verification payloads, and live within 5 to 10 business days.',
  },
  {
    question: `Do we own the website code, database, and automations ${site.name} builds?`,
    answer: `Yes, 100%. We build on transparent, modern infrastructure (Astro, Tailwind CSS, Supabase, Customer.io, and your chosen CRM). There is zero proprietary black-box lock-in—your business owns the repositories, data, and documented workflows.`,
  },
  {
    question: 'Can we start with a one-time Sprint before committing to a monthly plan?',
    answer:
      'Absolutely. Many Arizona service businesses begin with a fixed-scope Lead Capture & Follow-Up Sprint or a custom website rebuild, then transition into a monthly growth or automation plan once the baseline pipeline is verified.',
  },
  {
    question: 'How do you measure results without inflating lead counts?',
    answer: `We separate raw button clicks and test submissions from verified, deduplicated customer inquiries stored in Supabase. We track accepted inquiries, response velocity, held consultations, and booked jobs—never counting spam or QA tests as business leads.`,
  },
  {
    question: 'What industries do you specialize in?',
    answer:
      'We work heavily with Arizona home and commercial service businesses (HVAC, plumbing, electrical, roofing, solar, commercial contracting, medical/dental practices, and legal/advisory firms) as well as growth-focused B2B and e-commerce brands.',
  },
];
