import { site } from '@/data/site';
import type { Faq } from '@/interface';

export const hero = {
  lines: [
    { text: 'Custom Web Development & SEO' },
    { text: 'for', accent: 'Arizona service businesses.' },
  ],
  intro:
    'Custom Web Development & SEO is the strategic engineering of high-performance websites and local search visibility built to turn search traffic into booked clients. ZiaFlow designs fast digital platforms with automated inquiry capture, CRM routing, and accountable lead follow-up for commercial contractors and healthcare practices.',
};

export const logosSection = {
  label: 'Integrated with your core marketing and operational stack',
};

export const manifesto = {
  eyebrow: `Why ${site.name}`,
  parts: [
    { text: 'Valley contractors and medical clinics lose an estimated 35% of revenue between web inquiry and callback.' },
    { image: '/images/manifesto-face.jpg' },
    { text: 'Submissions stall in spam folders, unmonitored inboxes, and disconnected ad forms when alerts are manual.' },
    { image: '/images/manifesto-city.jpg' },
    { text: `ZiaFlow deploys event-driven webhooks across web forms, CallRail, and Google LSA with sub-minute SMS alerts,` },
    { image: '/images/manifesto-hand.jpg' },
    { text: 'giving estimators and intake staff an immediate customer brief with zero dropped leads.' },
  ] as ({ text: string } | { image: string })[],
  hint: 'Sub-60-second dispatch latency from web click to estimator contact',
};

export const productStory = {
  title: ['A documented path for', 'every inquiry.'],
  heroImage: '/images/journal-face.jpg',
  tiles: [
    'gallery-corridor',
    'journal-noise',
    'gallery-street',
    'manifesto-city',
    'gallery-desk',
    'journal-light',
    'gallery-tower',
    'product-reveal',
    'journal-blur',
    'gallery-road',
    'capability-lights',
    'journal-swirl',
    'about-city',
    'gallery-window',
  ].map((name) => `/images/${name}.jpg`),
  acts: [
    {
      tab: '1. Ingest',
      title: 'Sub-second webhook ingest across digital endpoints.',
      body: 'Website contact forms, Google LSA leads, and CallRail dynamic tracking numbers stream into an encrypted PostgreSQL pipeline with automated error recovery.',
      count: 99.9,
      unit: '% ingestion uptime SLA',
    },
    {
      tab: '2. Dispatch',
      title: 'Instantaneous multi-channel notification.',
      body: 'Prospect details are validated and broadcast via Twilio SMS and email directly to on-call dispatchers with complete UTM attribution.',
      count: 45,
      unit: 'second average alert latency',
    },
    {
      tab: '3. Convert',
      title: 'Structured qualification and CRM synchronization.',
      body: 'Intake teams work from tested cadence runbooks inside HubSpot, ServiceTitan, or Jobber, logging callbacks until an appointment is secured.',
      count: 3.8,
      unit: 'x lift in contact rates',
    },
  ],
};

export const capabilities = {
  title: 'Everything it takes to keep every lead accountable.',
  detect: {
    title: 'Spots the leak',
    body: 'Identifies failed form submissions, broken phone tracking, and slow follow-up before leads go cold.',
    label: 'Form error flagged',
  },
  connect: {
    title: 'Plugs into your tools',
    body: 'Bi-directional webhooks and REST integrations with HubSpot, ServiceTitan, CallRail, Supabase, and Google Analytics 4 without third-party connector lag.',
    image: '/images/capability-lights.jpg',
  },
  rank: {
    title: 'Ranks by urgency',
    body: 'Inquiries are prioritized by urgency and intent so immediate service requests get same-hour attention.',
    items: [
      { title: 'Emergency Service Call', value: 'Immediate dispatch' },
      { title: 'Commercial Website Scope', value: 'Discovery scheduled' },
      { title: 'Local Service Ad Inquiry', value: 'Follow-up sent' },
    ],
  },
  brief: {
    title: 'Writes the dispatch brief',
    body: 'Clear dispatch notification sent directly to your phone or inbox with prospect details, source, and assigned next action.',
    text: 'High-Intent Inbound: Commercial HVAC Replacement (Phoenix, 85032). Source: Google LSA. Estimated value: $14,000. Phone: (602) 834-4239. Action: Dispatched to Senior Estimator.',
  },
  privacy: {
    title: 'Private & verified',
    body: 'SOC-2 compliant database encryption, honeypot bot filtration, and client PII isolation. Zero third-party model training on your proprietary customer data.',
  },
};

export const howItWorks = {
  title: 'A practical three-step inquiry process.',
  watchHint: 'Prompt confirmation & internal notification flow',
};

export const storiesSection = {
  title: 'Operational case studies across Maricopa County.',
  body: 'From Scottsdale specialty practices to Phoenix HVAC and roofing contractors, see how modern web infrastructure and rapid-response intake generate audited double-digit conversion gains.',
  cta: { label: 'View All Case Studies', href: '/case-studies' },
};

export const proofSection = {
  title: 'Verified Client Results & Operator Proof',
};

export const closingCta = {
  title: 'Engineer your digital intake infrastructure.',
  body: 'Schedule a 20-minute architecture review with our Phoenix engineering team. We analyze your website load speed, inspect form webhook integrity, and provide a fixed-price implementation quote starting at $2,500.',
};

export const homeFaqs: Faq[] = [
  {
    question: 'What does Custom Web Development & SEO include for Phoenix businesses?',
    answer:
      'We deliver full-stack Astro architecture paired with local SEO engineering. Deliverables include sub-second Core Web Vitals, JSON-LD Schema.org graphs, automated intake webhooks, and targeted keyword optimization for Phoenix and Scottsdale service queries, starting at $2,500 for a 3-week sprint.',
  },
  {
    question: 'How does ZiaFlow connect website inquiries to CRM and lead follow-up?',
    answer:
      'We implement custom API endpoints and webhooks that validate prospect submissions, filter spam using serverless honeypots, trigger immediate SMS alerts to technicians via Twilio, and sync lead details into HubSpot, ServiceTitan, or Jobber within 60 seconds.',
  },
  {
    question: 'How fast can ZiaFlow design, build, and launch a custom website?',
    answer:
      'Standard bespoke web engineering sprints deliver a production-ready site in 14 to 28 business days. Each sprint operates on milestone-based reviews covering architectural design, component development, mobile QA, and production DNS cutover with zero downtime.',
  },
  {
    question: 'Why should Arizona service companies choose custom web development over generic templates?',
    answer:
      'Off-the-shelf WordPress and Wix templates routinely carry 40+ plugins, resulting in bloated 4-second load times and 50%+ mobile bounce rates. Bespoke Astro static sites eliminate runtime JavaScript overhead, score 95+ on Google Lighthouse, and convert visitors at twice the rate of generic templates.',
  },
  {
    question: 'How do we get started with a consultation or website audit?',
    answer:
      'Book a 20-minute technical discovery session through our direct booking calendar or call our Phoenix office at (602) 834-4239. We perform a live audit of your website speed, test your lead intake forms, and provide a transparent, fixed-scope proposal.',
  },
];
