import type { SiteConfig } from '@/interface';

export const site: SiteConfig = {
  name: 'ZiaFlow',
  legalName: 'ZiaFlow LLC',
  url: 'https://ziaflow.com',
  title: 'ZiaFlow | Web Engineering, Lead Capture & Follow-Up Automation',
  description:
    'ZiaFlow fixes the gap between customer inquiries and booked jobs for Arizona service businesses with documented lead capture, instant routing, and accountable follow-up.',
  email: 'info@ziaflow.com',
  careersEmail: 'info@ziaflow.com',
  accent: '#A22A36',
  cta: {
    primary: { label: 'Book Consultation', href: 'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled' },
    secondary: { label: 'Contact', href: '/contact' },
  },
  socials: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/ziaflow', icon: 'linkedin' },
    { label: 'GitHub', href: 'https://github.com/ziaflow', icon: 'github' },
  ],
};
