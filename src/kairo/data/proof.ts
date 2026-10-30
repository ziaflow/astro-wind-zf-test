import type { Testimonial } from '@/interface';

export const testimonials: Testimonial[] = [
  {
    quote:
      'ZiaFlow transformed our business operations with their automation solutions. Their tailored approach and technical expertise streamlined our lead intake, saving us hours each week and boosting our follow-up velocity.',
    name: 'K. B.',
    role: 'Chief Operating Officer',
    company: 'Operations Group',
    image: '/images/portrait-maren.jpg',
    metric: { value: 100, suffix: '%', label: 'intake workflow automation' },
  },
  {
    quote:
      'ZiaFlow is a top-notch engineering partner with reliable service, deep technical knowledge, and direct communication. They do not over-promise; they deliver exactly what was scoped.',
    name: 'J. M.',
    role: 'Commercial Investor',
    company: 'Capital & Real Estate',
    image: '/images/story-halden.jpg',
    metric: { value: 24, suffix: 'hr', label: 'deployment turnaround' },
  },
  {
    quote:
      'When it comes to web performance, form tracking, and SEO architecture, ZiaFlow is remarkably knowledgeable and efficient. They gave our team clear visibility into our lead attribution.',
    name: 'S. K.',
    role: 'Comptroller',
    company: 'Financial & Advisory Services',
    image: '/images/portrait-ines.jpg',
    metric: { value: 100, suffix: '%', label: 'attributed lead sources' },
  },
  {
    quote:
      'Our dispatch used to chase voicemail and unassigned email notifications. Now every inquiry is recorded in Supabase and alerted to staff immediately.',
    name: 'R. T.',
    role: 'Service Operations Manager',
    company: 'Arizona Contracting',
    image: '/images/story-solvane.jpg',
    metric: { value: 0, suffix: '', label: 'unassigned inquiries' },
  },
  {
    quote:
      'The forensic audit identified broken form endpoints on mobile that had been costing us inquiries for months. The fixes were implemented and verified on the same week.',
    name: 'M. D.',
    role: 'Managing Partner',
    company: 'Regional Services',
    image: '/images/portrait-tobi.jpg',
    metric: { value: 1, suffix: ' wk', label: 'from audit to repair' },
  },
  {
    quote:
      'Transparent reporting, fast Astro builds, and no fluff. Having an operational runbook for inquiry follow-up completely removed the guesswork for our front office.',
    name: 'D. L.',
    role: 'Executive Director',
    company: 'Commercial Facility Services',
    image: '/images/story-corvid.jpg',
    metric: { value: 100, suffix: '%', label: 'documented process' },
  },
];
