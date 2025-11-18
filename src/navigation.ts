import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: getPermalink('/', 'home'),
    },
    {
      text: 'About Us',
      href: getPermalink('/about'),
    },
    {
      text: 'Contact Us',
      href: getPermalink('/contact'),
    },
    {
      text: 'Blog',
      href: getBlogPermalink(),
    },
    {
      text: 'Services',
      href: getPermalink('/services'),
    },
  ],
  actions: [{ text: 'Book Audit', href: 'https://outlook.office.com/book/ZiaFlowIntake@ziaflow.com/?ismsaljsauthenabled', target: '_blank' }],
};

export const footerData = {
  links: [
    {
      title: 'Services',
      links: [
        { text: 'SEO Audits', href: '#' },
        { text: 'Content Strategy', href: '#' },
        { text: 'Conversion Optimization', href: '#' },
        { text: 'Technical SEO', href: '#' },
        { text: 'Growth Strategy', href: '#' },
      ],
    },
    {
      title: 'Blog',
      links: [
        { text: 'Docs', href: '#' },
        { text: 'Community Forum', href: '#' },
        { text: 'Professional Services', href: '#' },
        { text: 'Skills', href: '#' },
        { text: 'Status', href: '#' },
      ],
    },
    {
      title: 'ZiaFlow',
      links: [
        { text: 'About', href: '#' },
        { text: 'Blog', href: '#' },
        { text: 'Careers', href: '#' },
        ],
    },
  ],
  secondaryLinks: [
    { text: 'Terms', href: getPermalink('/terms') },
    { text: 'Privacy Policy', href: getPermalink('/privacy') },
  ],
  socialLinks: [
    { ariaLabel: 'Google', icon: 'tabler:brand-google', href: 'https://share.google/BE2Y4QPhcqrfZdnvi' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/company/ziaflow/' },
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/ziaflowaz/' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/ZiaFlowAZ/' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    © 2025 ZiaFlow. All rights reserved. Contact us
  `,
};
