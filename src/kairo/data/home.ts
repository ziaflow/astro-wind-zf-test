import { site } from '@/data/site';
import type { Faq } from '@/interface';

export const hero = {
  lines: [
    { text: 'Custom Web Development & SEO' },
    { text: 'for', accent: 'Arizona service businesses.' },
  ],
  intro:
    'Custom Web Development & SEO is the engineering of high-performance websites and local search visibility built to turn search traffic into booked clients. ZiaFlow builds fast digital platforms with automated inquiry capture, CRM routing, and accountable lead follow-up for Arizona service businesses.',
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

export const homeFaqs: Faq[] = [
  {
    question: 'What does Custom Web Development & SEO include for Phoenix businesses?',
    answer:
      'Custom Web Development & SEO combines bespoke, high-performance web engineering with technical and local search optimization. ZiaFlow designs lightweight Astro websites, implements structured data schema, repairs intake points, and optimizes for Google Maps and striking-distance search rankings to drive qualified local leads.',
  },
  {
    question: 'How does ZiaFlow connect website inquiries to CRM and lead follow-up?',
    answer:
      'Through our Lead Capture & Follow-Up Sprint, we audit your inquiry endpoints (such as web forms, call tracking, and Google Local Service Ads), connect automated prospect notifications, route lead details directly into your CRM, and provide a documented operating runbook so every inquiry has an accountable owner and a next step.',
  },
  {
    question: 'How fast can ZiaFlow design, build, and launch a custom website?',
    answer:
      'Most custom web development projects and lead capture implementations launch within 2 to 4 weeks. We work in fixed-scope sprints with transparent milestone reviews, ensuring rapid delivery without bloated agency retainers or deferred handoffs.',
  },
  {
    question: 'Why should Arizona service companies choose custom web development over generic templates?',
    answer:
      'Generic templates often suffer from sluggish loading speeds, code bloat, and poor mobile conversion rates. Custom web development built on modern web standards delivers sub-second load times, flawless Core Web Vitals, enterprise security, and tailor-made lead capture workflows engineered specifically for local conversion.',
  },
  {
    question: 'How do we get started with a consultation or website audit?',
    answer:
      'You can book a consultation call directly through our online scheduler or call our Phoenix team at (602) 834-4239. We review how inquiries enter your business today, identify dropped opportunities, and outline a fixed-scope plan to modernize your web presence and intake pipeline.',
  },
];
