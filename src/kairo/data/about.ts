import type { Milestone, Role, TeamMember, Value } from '@/interface';

export const milestones: Milestone[] = [
  {
    year: '2021',
    title: 'Founded in Phoenix, Arizona',
    body: 'ZiaFlow was established in the Greater Phoenix area to deliver custom web engineering, automation, and digital systems for growing businesses.',
    image: '/images/about-city.jpg',
  },
  {
    year: '2023',
    title: 'Full-Stack & Cloud Integration',
    body: 'Expanded into modern edge architectures, database persistence, and automated lead routing pipelines.',
    image: '/images/gallery-desk.jpg',
  },
  {
    year: '2025',
    title: 'Search & Conversion Systems',
    body: 'Integrated Google Local Service Ads management, review automation, and CRM synchronization for Arizona service companies.',
    image: '/images/about-studio.jpg',
  },
  {
    year: '2026',
    title: 'The Follow-Up Sprint',
    body: 'Launched focused Sprint engagements solving the critical gap between customer inquiry and booked job with documented runbooks.',
    image: '/images/gallery-tower.jpg',
  },
];

export const values: Value[] = [
  {
    title: 'Operators first',
    body: 'We build for business outcomes — booked jobs, clean data, and streamlined operations — rather than vanity metrics.',
  },
  {
    title: 'Show the evidence',
    body: 'Every accepted inquiry has a timestamped record, source attribution, and assigned owner. Trust is built on checkable facts.',
  },
  {
    title: 'Fast by default',
    body: 'Sub-second Astro architectures, clean Tailwind CSS, and zero bloated scripts slowing down mobile visitors.',
  },
  {
    title: 'Transparent partnership',
    body: 'No opaque marketing jargon or lock-in contracts. We deliver documented operating workflows your team owns.',
  },
];

export const team: TeamMember[] = [
  { name: 'Jeremy · Principal', role: 'Lead Systems & Full-Stack Engineer', image: '/images/gallery-desk.jpg' },
  { name: 'Web Architecture', role: 'Astro, TypeScript & Edge Performance', image: '/images/step-connect.jpg' },
  { name: 'Intake & Automation', role: 'Supabase, Customer.io & Webhook Routing', image: '/images/gallery-corridor.jpg' },
  { name: 'Search & Local Pack', role: 'Technical SEO, GBP & LSA Operations', image: '/images/step-watch.jpg' },
  { name: 'Conversion Systems', role: 'Interactive Diagnostics, CRO & Attribution', image: '/images/capability-lights.jpg' },
  { name: 'Client Operations', role: 'Documented Runbooks & SLA Verification', image: '/images/gallery-window.jpg' },
];

export const roles: Role[] = [
  { title: 'Lead Capture & Follow-Up Sprint', team: 'Fixed-Scope Implementation', location: 'Phoenix, AZ & Nationwide' },
  { title: 'Custom Astro Website & CRO Rebuild', team: 'Web Engineering', location: 'Sub-Second Edge Delivery' },
  { title: 'Technical SEO, GBP & Local Service Ads', team: 'Search & Growth', location: 'Greater Phoenix & Multi-Location' },
];
