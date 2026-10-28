import { site } from '@/data/site';
import type { FooterGroup } from '@/interface';

export const footerGroups: FooterGroup[] = [
  {
    title: 'Services',
    links: [
      { label: 'Automation & Lead Sprints', href: '/services/automation' },
      { label: 'Technical SEO', href: '/services/seo' },
      { label: 'PPC & Local Service Ads', href: '/services/ppc' },
      { label: 'Web Development & CRO', href: '/services/web-development' },
      { label: 'Ecommerce Platforms', href: '/services/ecommerce' },
    ],
  },
  {
    title: 'Articles & Guides',
    links: [
      { label: 'All Articles', href: '/blog' },
      { label: 'Marketing Automation for Arizona Service Businesses', href: '/marketing-automation-for-arizona-service-businesses-save-time-increase-bookings' },
      { label: 'Website Conversion Checklist for Phoenix Businesses', href: '/website-conversion-checklist-for-phoenix-businesses' },
      { label: 'Google Local Service Ads: SEO & Quality Playbook', href: '/google-local-service-ads-in-2025' },
      { label: 'How to Tackle Website Analysis Tasks', href: '/website-analysis-tasks' },
      { label: 'Reduce Bounce Rate with AI: Practical Guide', href: '/reduce-bounce-rate-with-ai' },
    ],
  },
  {
    title: 'ZiaFlow',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
      { label: 'Contact ZiaFlow', href: '/contact' },
    ],
  },
];

export const footerContact = {
  title: 'Contact ZiaFlow',
  subtitle: 'Direct Phoenix contact channels for inquiries and support',
  methods: [
    {
      label: 'Direct Phone',
      value: '(602) 834-4239',
      href: 'tel:6028344239',
    },
    {
      label: 'Inquiry Email',
      value: 'info@ziaflow.com',
      href: 'mailto:info@ziaflow.com',
    },
    {
      label: 'Consultation',
      value: 'Book Meeting',
      href: 'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled',
    },
  ],
};

export const footerLegalLinks = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export const footerCopy = {
  followTitle: 'Connect',
  backToTop: 'Back to top',
  legal: `© ${new Date().getFullYear()} ${site.name}`,
};
