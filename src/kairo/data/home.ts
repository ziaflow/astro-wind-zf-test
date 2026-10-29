import { site } from '@/data/site';

export const hero = {
  lines: [
    { text: 'Turn More Inquiries' },
    { text: 'Into', accent: 'Booked Work.' },
  ],
  intro:
    'ZiaFlow helps service businesses capture every inquiry, respond in seconds, and follow through until the job is booked.',
};

export const logosSection = {
  label: 'Connected across your website, phones, and scheduling tools',
};

export const manifesto = {
  eyebrow: `Why ${site.name}`,
  parts: [
    { text: 'Most service businesses lose revenue between the first click and the callback.' },
    { image: '/images/manifesto-face.jpg' },
    { text: 'Inquiries slip through unmonitored forms, missed voicemails, and slow replies.' },
    { image: '/images/manifesto-city.jpg' },
    { text: `ZiaFlow captures every inquiry, sends an immediate reply, assigns an owner,` },
    { image: '/images/manifesto-hand.jpg' },
    { text: 'and tracks every lead to booked work.' },
  ] as ({ text: string } | { image: string })[],
  hint: 'ZiaFlow brings measurable operational change — from first inquiry to booked work',
};

export const productStory = {
  title: ['Three steps to', 'booked work.'],
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
      tab: '1. Capture',
      title: 'Every inquiry, recorded.',
      body: 'Website forms, phone calls, and Google Local Service Ads route directly into one verified lead log so nothing gets lost.',
      count: 100,
      unit: '% inquiries logged',
    },
    {
      tab: '2. Respond',
      title: 'Replied & assigned in seconds.',
      body: 'Prospects receive an immediate confirmation while your team gets an instant text and email alert with clear ownership.',
      count: 60,
      unit: 'sec response target',
    },
    {
      tab: '3. Book',
      title: 'Tracked to booked work.',
      body: 'Structured follow-up keeps every inquiry moving from initial contact to a scheduled appointment or clear quote.',
      count: 1,
      unit: 'clear pipeline view',
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
  title: 'A concrete three-step service process.',
  watchHint: 'Instant response & real-time pipeline tracking',
};

export const storiesSection = {
  title: 'Documented results from real operations.',
  body: 'Arizona service businesses use ZiaFlow to make sure every inquiry is captured, answered fast, and followed through to booked work.',
  cta: { label: 'View All Case Studies', href: '/case-studies' },
};

export const proofSection = {
  title: 'What business operators say.',
};

export const closingCta = {
  title: 'Turn More Inquiries Into Booked Work.',
  body: 'Book a 30-minute consultation with our Phoenix team. We will review how inquiries enter your business today and map a clear 3-step plan to capture and book more work.',
};
