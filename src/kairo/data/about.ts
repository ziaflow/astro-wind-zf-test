import { site } from '@/data/site';
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
  { name: 'Jeremy', role: 'Principal & Lead Systems Engineer', image: '/images/team-amara.jpg' },
  { name: 'Systems & Architecture', role: 'Full-Stack Engineering & Astro', image: '/images/team-jonas.jpg' },
  { name: 'Data & Automation', role: 'Supabase, Webhooks & Pipeline Integration', image: '/images/team-lin.jpg' },
  { name: 'Search & CRO', role: 'Technical SEO & Conversion Architecture', image: '/images/team-rafael.jpg' },
  { name: 'Client Operations', role: 'Intake Runbooks & Quality Assurance', image: '/images/team-sade.jpg' },
  { name: 'Advisory', role: 'Commercial Growth & Strategy', image: '/images/team-viktor.jpg' },
];

export const roles: Role[] = [
  { title: 'Full-Stack Engineer', team: 'Engineering', location: 'Phoenix, AZ or Remote' },
  { title: 'Automation Engineer', team: 'Integrations', location: 'Phoenix, AZ or Remote' },
  { title: 'Technical SEO Specialist', team: 'Growth', location: 'Phoenix, AZ or Remote' },
];
