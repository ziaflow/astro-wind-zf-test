import { site } from '@/data/site';

export const customersPage = {
  meta: {
    title: 'Case Studies',
    description: `How Arizona businesses, service operators, and modern brands use ${site.name} to capture leads, streamline operations, and drive growth.`,
  },
  hero: {
    lines: ['Case studies from', 'teams that moved first.'],
    intro:
      'Real operators on what changed when their lead capture was instrumented, follow-up was automated, and every inquiry had a clear owner.',
  },
  grid: {
    filterLabel: 'Filter stories by industry',
    one: 'story',
    many: 'stories',
    empty: 'No stories in this industry yet.',
  },
  results: {
    title: 'What changes with documented follow-up.',
    items: [
      { value: 100, suffix: '%', label: 'accepted inquiries recorded and attributed' },
      { value: 1, suffix: ' min', label: 'automated acknowledgement sent to new inquiries' },
      { value: 0, suffix: '', label: 'unassigned leads left sitting in inboxes' },
    ],
  },
  cta: {
    title: 'Discuss your operation.',
    body: 'Schedule a discovery session to audit your inquiry path and plan your Lead Capture & Follow-Up Sprint.',
  },
};

export const storyPage = {
  metaSuffix: 'case study',
  labels: { industry: 'Industry', team: 'Team', since: 'Client since', next: 'Next case study' },
};

export const pricingPage = {
  meta: {
    title: 'Engagement & Pricing',
    description: `Transparent Sprint scopes and managed service retainers for custom web engineering, automation, and lead capture.`,
  },
  hero: {
    lines: ['Transparent scope.', 'Documented deliverables.'],
    accent: 1,
    intro:
      'Fixed-scope Sprints to repair lead capture and establish rapid follow-up, followed by optional managed optimization and technical SEO.',
  },
  plans: {
    monthly: 'Monthly',
    yearly: 'Yearly',
    yearlyBadge: '-20%',
    note: 'Custom scoped scopes available for enterprise multi-location operators.',
    featuredLabel: 'Recommended Sprint',
    free: 'Sprint scope',
    perMonth: '/ sprint',
    noCard: 'Documented deliverables',
    billedMonthly: 'One-time Sprint',
    billedYearly: 'Annual partnership',
    enterprise: { prompt: 'Running multi-location operations?', link: 'Talk to us about Enterprise' },
  },
  compare: {
    title: 'Compare engagement models.',
    caption: 'Deliverable comparison across scopes',
    feature: 'Deliverable',
    yes: 'Included',
    no: 'Available add-on',
  },
  faq: { title: 'Questions, answered.' },
  sales: {
    title: 'Discuss Your Project.',
    body: `Schedule thirty minutes with our Phoenix engineering team to review your inquiry path, audit form performance, and scope a Lead Capture & Follow-Up Sprint.`,
    image: '/images/gallery-window.jpg',
    imageAlt: 'A laptop on a desk showing lead attribution and pipeline status',
    intentLegend: 'I want to',
    intents: { free: 'Book Consultation', demo: 'Request Proposal' },
    fields: {
      name: { label: 'Full name', placeholder: 'Alex Morgan', error: 'Tell us what to call you.' },
      email: {
        label: 'Work email',
        placeholder: 'alex@company.com',
        error: 'Use a valid work email address.',
      },
      company: { label: 'Company / Business', placeholder: 'Phoenix Service Co.', error: 'Add your business name.' },
      size: { label: 'Company size', help: 'Helps us scope lead intake volume.' },
      message: {
        label: `What would you like ${site.name} to address?`,
        placeholder: 'Describe your website, lead intake, or automation requirements',
      },
    },
    sizes: ['1-10 people', '11-50 people', '51-200 people', '201-1,000 people', 'More than 1,000'],
    submit: { free: 'Schedule Consultation', demo: 'Submit Project Details' },
    consent: `By continuing you agree to be contacted by ${site.name} regarding your inquiry. No spam.`,
    sending: 'Sending...',
    success: {
      demo: 'Thank you, {name}. Your inquiry is recorded. We will contact {email} within one business day.',
      free: 'Thank you, {name}. Your meeting request is received. Check {email} for the confirmation link.',
    },
  },
};

export const journalPage = {
  meta: {
    title: 'Journal',
    description: `Writing from the ${site.name} team on web engineering, lead intake automation, and conversion architecture.`,
  },
  hero: {
    lines: ['Notes on', 'systems & conversion.'],
    intro: `Essays and research from the team building ${site.name}, on web performance, lead pipeline engineering, and actionable SEO.`,
  },
  list: { title: 'All writing', filterLabel: 'Filter articles by topic', empty: 'Nothing in this topic yet.' },
  post: { related: 'Keep reading.', back: 'Journal' },
};

export const aboutPage = {
  meta: {
    title: 'About ZiaFlow',
    description: `${site.name} is a Phoenix-based digital engineering and transformation agency specializing in web performance, lead intake automation, and conversion systems.`,
  },
  hero: {
    lines: ['Engineering systems', 'for businesses', 'that convert.'],
    accent: 2,
    intro: `Based in Phoenix, Arizona, ${site.name} helps service businesses, e-commerce brands, and local operators unlock their potential through custom web engineering, marketing automation, and conversion systems.`,
    image: '/images/about-hero.jpg',
    imageAlt: 'ZiaFlow digital systems and web development in Phoenix, Arizona',
    facts: [
      { value: 2021, from: 2001, grouping: false, label: 'Founded in Phoenix' },
      { value: 100, suffix: '+', label: 'Projects Delivered' },
      { value: 10, suffix: 'K+ hrs', label: 'Hours Saved via Automation' },
    ] as { value: number; from?: number; suffix?: string; grouping?: boolean; label: string }[],
  },
  timeline: {
    title: 'How we got here.',
    body: 'Founded in Arizona with a focused mission: engineer websites that load fast, forms that never fail, and follow-up workflows that convert.',
  },
  values: { title: 'What we hold ourselves to.' },
  team: { title: 'The people behind the systems.' },
  roles: {
    title: 'Collaborate with ZiaFlow.',
    body: 'Based in Phoenix, Arizona. We partner with forward-thinking operators, contractors, and agencies.',
  },
};

export const notFoundPage = {
  meta: { title: 'Page not found', description: 'This page slipped past us.' },
  eyebrow: 'Error 404',
  lines: [{ text: 'This page' }, { text: 'slipped', accent: 'past us.' }],
  body: 'The page you are looking for does not exist or has been moved.',
  cta: { label: 'Back to home', href: '/' },
};
