import { site } from '@/data/site';
import type { FooterGroup } from '@/interface';

export const footerGroups: FooterGroup[] = [
  {
    title: 'Core Services',
    links: [
      { label: 'All Services Hub', href: '/services' },
      { label: 'Lead Capture & Automation', href: '/services/automation' },
      { label: 'Phoenix Technical SEO', href: '/services/seo' },
      { label: 'Google Local Service Ads (LSA)', href: '/services/local-service-ads' },
      { label: 'Google Business Profile (GBP)', href: '/services/gmb-optimization' },
      { label: 'Web Development & Astro', href: '/services/web-development' },
      { label: 'Conversion Optimization (CRO)', href: '/services/cro' },
      { label: 'Review & Reputation Systems', href: '/services/review-management' },
    ],
  },
  {
    title: 'Interactive Tools & Playbooks',
    links: [
      { label: 'All Interactive Business Tools', href: '/growth-tools' },
      { label: 'Website Project Estimator', href: '/growth-tools/website-project-estimator' },
      { label: 'Lead Follow-Up Assessment', href: '/growth-tools/lead-follow-up-assessment' },
      { label: 'Software Stack Assessment', href: '/growth-tools/software-stack-assessment' },
      { label: 'Local Visibility Check', href: '/growth-tools/local-visibility-check' },
      { label: 'Website Conversion Checklist', href: '/growth-tools/website-conversion-checklist' },
      { label: 'All Articles & Insights', href: '/blog' },
    ],
  },
  {
    title: 'ZiaFlow & Funnel',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Pricing & Sprint Scopes', href: '/pricing' },
      { label: 'Case Studies & Blueprints', href: '/case-studies' },
      { label: 'Free 48-Hr Forensic Audit', href: '/audit' },
      { label: 'About ZiaFlow', href: '/about' },
      { label: 'Contact & Intake Form', href: '/contact#form' },
    ],
  },
];

export const footerContact = {
  title: 'Contact ZiaFlow',
  subtitle: 'Direct Phoenix engineering & intake channels',
  methods: [
    {
      label: 'Direct Phone',
      value: '(602) 834-4239',
      href: 'tel:+16028344239',
    },
    {
      label: 'Inquiry Email',
      value: 'info@ziaflow.com',
      href: 'mailto:info@ziaflow.com',
    },
    {
      label: 'Consultation',
      value: 'Book Strategy Call',
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
  legal: `© ${new Date().getFullYear()} ${site.name} LLC · Phoenix, Arizona`,
};
