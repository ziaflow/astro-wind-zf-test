import type { SiteConfig } from '@/interface';

export const site: SiteConfig = {
  name: 'ZiaFlow',
  legalName: 'ZiaFlow LLC',
  url: 'https://ziaflow.com',
  title: 'ZiaFlow - Modern Web Engineering, Automation & Growth',
  description:
    'ZiaFlow integrates custom web engineering, AI automation, SEO, and modern full-stack systems for high-growth businesses.',
  email: 'info@ziaflow.com',
  careersEmail: 'info@ziaflow.com',
  accent: '#A22A36',
  cta: {
    primary: { label: 'Book Meeting', href: 'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled' },
    secondary: { label: 'Contact', href: 'https://ziaflow.com/contact' },
  },
  socials: [
    { label: 'X', href: 'https://x.com', icon: 'x' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: 'linkedin' },
    { label: 'GitHub', href: 'https://github.com', icon: 'github' },
  ],
};
