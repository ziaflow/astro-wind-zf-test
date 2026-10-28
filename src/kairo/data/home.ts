import { site } from '@/data/site';

export const hero = {
  lines: [
    { text: 'Turn inbound inquiries into' },
    { text: 'booked jobs with', accent: 'ZiaFlow.' },
  ],
  intro:
    'ZiaFlow fixes the gap between customer contact and booked revenue for Arizona service businesses with documented lead capture, instant routing, and accountable follow-up.',
};

export const logosSection = {
  label: 'Integrated across your operational tools and CRM stack',
};

export const manifesto = {
  eyebrow: `Why ${site.name}`,
  parts: [
    { text: 'Most service businesses lose revenue between the click and the first phone call.' },
    { image: '/images/manifesto-face.jpg' },
    { text: 'Leads slip through unmonitored forms, missed voicemail, and delayed replies.' },
    { image: '/images/manifesto-city.jpg' },
    { text: `ZiaFlow captures every accepted inquiry, assigns an owner, triggers instant response,` },
    { image: '/images/manifesto-hand.jpg' },
    { text: 'and tracks every prospect to a known status.' },
  ] as ({ text: string } | { image: string })[],
  hint: 'Drag across the line, or tap it',
};

export const productStory = {
  title: ['Inquiry to', 'booked job.'],
  heroImage: '/images/journal-face.jpg',
  tiles: [
    'gallery-corridor',
    'gallery-desk',
    'gallery-street',
    'gallery-window',
  ].map((name) => `/images/${name}.jpg`),
  acts: [
    {
      tab: 'Capture',
      title: 'Every inquiry, recorded.',
      body: 'Website forms, phone calls, Google LSAs, and chat route directly into a unified database.',
      count: 24,
      unit: 'inquiries logged',
    },
    {
      tab: 'Route',
      title: 'Assigned in seconds.',
      body: 'Instant notifications alert the accountable owner with source attribution so no lead sits idle.',
      count: 100,
      unit: '% assigned',
    },
    {
      tab: 'Convert',
      title: 'Tracked to a known status.',
      body: 'Structured follow-up keeps every accepted inquiry moving toward a booked consultation or clear quote.',
      count: 1,
      unit: 'pipeline view',
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
    body: 'Web forms, call tracking, CRM, and email. Read-only connectors and webhooks set up without code disruption.',
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
    text: 'New inquiry from Phoenix via Google LSA. Service: Lead Capture Sprint. Contact: (602) 834-4239. Assigned owner: Intake. Next action: Schedule discovery call.',
  },
  privacy: {
    title: 'Private & verified',
    body: 'Field-level validation, encrypted database storage, and spam protection. Client data is never shared or used to train external models.',
  },
};

export const howItWorks = {
  title: 'The Lead Capture & Follow-Up Sprint.',
  watchHint: 'Drag the line',
};

export const storiesSection = {
  title: 'Documented results from real operations.',
  body: 'Arizona service businesses and growth operators use ZiaFlow to ensure no inquiry slips through the cracks.',
  cta: { label: 'Explore Services', href: '/services' },
};

export const proofSection = {
  title: 'What business operators say.',
};

export const closingCta = {
  title: 'Stop Losing Inquiries Between Click and Call.',
  body: 'Schedule a 30-minute discovery session with our Phoenix team. We will review your lead path and scope a Lead Capture & Follow-Up Sprint.',
};
