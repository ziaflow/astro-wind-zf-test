import type { SiteConfig } from '@/interface';

export const site: SiteConfig = {
  name: 'ZiaFlow',
  legalName: 'ZiaFlow LLC',
  url: 'https://ziaflow.com',
  title: 'Custom Web Development & SEO | ZiaFlow',
  description:
    'ZiaFlow fixes the gap between customer inquiries and booked jobs for Arizona service businesses with documented lead capture, instant routing, and accountable follow-up.',
  email: 'info@ziaflow.com',
  careersEmail: 'info@ziaflow.com',
  accent: '#A22A36',
  cta: {
    primary: { label: 'Book Consultation', href: 'https://calendly.com/jeremy-sanchez-ziaflow' },
    secondary: { label: 'Contact', href: '/contact' },
  },
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ziaflow', icon: 'linkedin' },
    { label: 'GitHub', href: 'https://github.com/ziaflow', icon: 'github' },
  ],
};
