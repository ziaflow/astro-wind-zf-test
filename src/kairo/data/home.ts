import { site } from '@/data/site';

export const hero = {
  lines: [
    { text: 'Websites and lead follow-up' },
    { text: 'for', accent: 'Arizona service businesses.' },
  ],
  intro:
    'ZiaFlow builds websites and connects inquiry capture, CRM routing, and follow-up. Our Lead Capture & Follow-Up Sprint repairs agreed handoffs and gives your team a documented process for managing new inquiries.',
};

export const logosSection = {
  label: 'Connected across your agreed website, phone, and intake tools',
};

export const manifesto = {
  eyebrow: `Why ${site.name}`,
  parts: [
    { text: 'Most service businesses lose revenue between the first inquiry and the callback.' },
    { image: '/images/manifesto-face.jpg' },
    { text: 'Inquiries slip through unmonitored forms, missed voicemails, and delayed handoffs.' },
    { image: '/images/manifesto-city.jpg' },
    { text: `ZiaFlow captures inquiries from agreed sources, sends prompt confirmation, assigns an owner,` },
    { image: '/images/manifesto-hand.jpg' },
    { text: 'and gives your team a clear next step for every lead.' },
  ] as ({ text: string } | { image: string })[],
  hint: 'Give every accepted inquiry an owner and a next step',
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
      tab: '1. Capture',
      title: 'Tested capture for agreed sources.',
      body: 'Website forms, phone tracking, and ad endpoints route into verified storage with failure monitoring and recovery procedures.',
      count: 100,
      unit: '% agreed sources mapped',
    },
    {
      tab: '2. Route',
      title: 'Assigned with a clear next step.',
      body: 'Prospects receive clear confirmation while internal alerts notify the accountable staff member with source context.',
      count: 1,
      unit: 'assigned owner per lead',
    },
    {
      tab: '3. Follow Up',
      title: 'Documented triage to final disposition.',
      body: 'Your team follows a tested runbook to contact, quote, and track prospects to an agreed outcome.',
      count: 1,
      unit: 'operating runbook',
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
  title: 'A practical three-step inquiry process.',
  watchHint: 'Prompt confirmation & internal notification flow',
};

export const storiesSection = {
  title: 'Documented results from real operations.',
  body: 'Arizona service businesses use ZiaFlow to ensure inquiries from agreed sources are captured reliably, assigned quickly, and followed through.',
  cta: { label: 'View All Case Studies', href: '/case-studies' },
};

export const proofSection = {
  title: 'What business operators say.',
};

export const closingCta = {
  title: 'Discuss your website and follow-up.',
  body: 'Book a consultation with our Phoenix team. We will review how inquiries enter your business today, identify broken handoffs, and scope a practical Sprint.',
};
