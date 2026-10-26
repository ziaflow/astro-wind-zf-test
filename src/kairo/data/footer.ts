import { site } from '@/data/site';
import type { FooterGroup } from '@/interface';

export const footerGroups: FooterGroup[] = [
  {
    title: 'Services',
    links: [
      { label: 'Automation', href: 'https://ziaflow.com/services/automation' },
      { label: 'SEO', href: 'https://ziaflow.com/services/seo' },
      { label: 'PPC Management', href: 'https://ziaflow.com/services/ppc' },
      { label: 'Web Development', href: 'https://ziaflow.com/services/web-development' },
      { label: 'Ecommerce', href: 'https://ziaflow.com/services/ecommerce' },
    ],
  },
  {
    title: 'Blog',
    links: [
      { label: 'All Articles', href: 'https://ziaflow.com/blog' },
      { label: 'How to Tackle Website Analysis Tasks: Pricing, Icons,…', href: 'https://ziaflow.com/website-analysis-tasks' },
      { label: 'Google Local Service Ads in 2025: The SEO…', href: 'https://ziaflow.com/google-local-service-ads-in-2025' },
      { label: 'Marketing Automation for Arizona Service Businesses — Save…', href: 'https://ziaflow.com/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings' },
      { label: 'Website Conversion Checklist for Phoenix Businesses | CRO…', href: 'https://ziaflow.com/website-conversion-checklist-for-phoenix-businesses' },
      { label: 'Reduce Bounce Rate with AI: A How-To Guide…', href: 'https://ziaflow.com/reduce-bounce-rate-with-ai' },
    ],
  },
  {
    title: 'ZiaFlow',
    links: [
      { label: 'ZiaFlow', href: 'https://ziaflow.com/' },
      { label: 'About', href: 'https://ziaflow.com/about' },
      { label: 'Contact ZiaFlow', href: 'https://ziaflow.com/contact' },
    ],
  },
];

export const footerContact = {
  title: 'Contact ZiaFlow',
  subtitle: 'Choose the method that works best for you',
  methods: [
    {
      label: 'Phone',
      value: '(602) 834-4239',
      href: 'tel:6028344239',
    },
    {
      label: 'Email',
      value: 'info@ziaflow.com',
      href: 'mailto:info@ziaflow.com',
    },
    {
      label: 'Schedule',
      value: 'Book Meeting',
      href: 'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled',
    },
  ],
};

export const footerLegalLinks = [
  { label: 'Terms', href: 'https://ziaflow.com/terms' },
  { label: 'Privacy Policy', href: 'https://ziaflow.com/privacy' },
];

export const footerCopy = {
  followTitle: 'Follow',
  backToTop: 'Back to top',
  legal: `© ${new Date().getFullYear()} ${site.name}`,
};

